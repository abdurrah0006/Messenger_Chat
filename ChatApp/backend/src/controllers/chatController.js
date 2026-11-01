import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { httpError } from "../utils/httpError.js";
import {
  attachUnread,
  findMemberChat,
  isGroupAdmin,
  isId,
  withRelations,
} from "../utils/chat.js";
import { emitToChat, emitToUser, joinChat, leaveChat } from "../socket/index.js";

const loadChat = (id) => withRelations(Chat.findById(id));

/** Sends the fresh chat to every current member so their sidebars update. */
const broadcastChat = (chat) => emitToChat(chat.id, "chat:updated", chat.toJSON());

const requireGroupAdmin = async (chatId, user) => {
  const chat = await findMemberChat(chatId, user._id);

  if (!chat.isGroupChat) throw httpError(400, "This is not a group chat");
  if (!isGroupAdmin(chat, user._id)) {
    throw httpError(403, "Only the group admin can do this");
  }
  return chat;
};

// Find or create a one-to-one chat
export const accessChat = async (req, res) => {
  const { userId } = req.body ?? {};

  if (!isId(userId)) throw httpError(400, "A valid userId is required");
  if (userId === req.user.id) throw httpError(400, "You cannot chat with yourself");
  if (!(await User.exists({ _id: userId }))) throw httpError(404, "User not found");

  let chat = await withRelations(
    Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId], $size: 2 },
    })
  );

  if (!chat) {
    const created = await Chat.create({ users: [req.user._id, userId] });
    chat = await loadChat(created._id);
  }

  // Make sure both users' open sockets receive this chat's events
  joinChat([req.user.id, userId], chat.id);

  const [result] = await attachUnread([chat], req.user._id);
  res.json(result);
};

export const fetchChats = async (req, res) => {
  const chats = await withRelations(
    Chat.find({ users: req.user._id }).sort({ updatedAt: -1 })
  );

  res.json(await attachUnread(chats, req.user._id));
};

export const createGroup = async (req, res) => {
  const { name, users } = req.body ?? {};

  const groupName = typeof name === "string" ? name.trim() : "";
  if (!groupName) throw httpError(400, "Group name is required");
  if (groupName.length > 50) throw httpError(400, "Group name is too long");
  if (!Array.isArray(users)) throw httpError(400, "Members must be a list of user ids");

  const memberIds = [...new Set(users.map(String))].filter((id) => id !== req.user.id);

  if (!memberIds.every(isId)) throw httpError(400, "Invalid member id");
  if (memberIds.length < 2) throw httpError(400, "Select at least 2 other members");

  if ((await User.countDocuments({ _id: { $in: memberIds } })) !== memberIds.length) {
    throw httpError(404, "Some of the selected users no longer exist");
  }

  const group = await Chat.create({
    chatName: groupName,
    isGroupChat: true,
    users: [req.user._id, ...memberIds],
    groupAdmin: req.user._id,
  });

  joinChat([req.user.id, ...memberIds], group.id);

  const full = await loadChat(group._id);
  broadcastChat(full);

  res.status(201).json({ ...full.toJSON(), unreadCount: 0 });
};

export const renameGroup = async (req, res) => {
  const name = req.body?.name?.trim();
  if (!name) throw httpError(400, "Group name is required");
  if (name.length > 50) throw httpError(400, "Group name is too long");

  const chat = await requireGroupAdmin(req.params.id, req.user);

  chat.chatName = name;
  await chat.save({ timestamps: false });

  const full = await loadChat(chat._id);
  broadcastChat(full);
  res.json(full);
};

export const addMembers = async (req, res) => {
  const { userIds } = req.body ?? {};
  if (!Array.isArray(userIds) || !userIds.every(isId)) {
    throw httpError(400, "userIds must be a list of valid ids");
  }

  const chat = await requireGroupAdmin(req.params.id, req.user);

  const newIds = [...new Set(userIds.map(String))].filter(
    (id) => !chat.users.some((member) => member.equals(id))
  );
  if (newIds.length === 0) throw httpError(400, "Those users are already in the group");

  if ((await User.countDocuments({ _id: { $in: newIds } })) !== newIds.length) {
    throw httpError(404, "Some of the selected users no longer exist");
  }

  chat.users.push(...newIds);
  await chat.save({ timestamps: false });

  joinChat(newIds, chat.id);

  const full = await loadChat(chat._id);
  broadcastChat(full);
  res.json(full);
};

// Admin removes a member, or any member removes themselves (leave)
export const removeMember = async (req, res) => {
  const { id, userId } = req.params;
  if (!isId(userId)) throw httpError(400, "Invalid user id");

  const chat = await findMemberChat(id, req.user._id);
  if (!chat.isGroupChat) throw httpError(400, "This is not a group chat");

  const isSelf = userId === req.user.id;
  if (!isSelf && !isGroupAdmin(chat, req.user._id)) {
    throw httpError(403, "Only the group admin can remove members");
  }
  if (!chat.users.some((member) => member.equals(userId))) {
    throw httpError(404, "That user is not in this group");
  }

  chat.users.pull(userId);

  if (chat.users.length === 0) {
    await Message.deleteMany({ chat: chat._id });
    await chat.deleteOne();
  } else {
    // Hand the group over if the admin leaves
    if (chat.groupAdmin?.equals(userId)) chat.groupAdmin = chat.users[0];
    await chat.save({ timestamps: false });
  }

  leaveChat(userId, chat.id);
  emitToUser(userId, "chat:removed", { chatId: chat.id });

  if (chat.users.length === 0) return res.json({ chatId: chat.id, removed: true });

  const full = await loadChat(chat._id);
  broadcastChat(full);
  res.json(isSelf ? { chatId: chat.id, removed: true } : full);
};

// Mark every message in a chat as read by the current user
export const markRead = async (req, res) => {
  const chat = await findMemberChat(req.params.id, req.user._id);

  const { modifiedCount } = await Message.updateMany(
    { chat: chat._id, sender: { $ne: req.user._id }, seenBy: { $ne: req.user._id } },
    { $addToSet: { seenBy: req.user._id } }
  );

  if (modifiedCount > 0) {
    emitToChat(chat.id, "messages:seen", { chatId: chat.id, userId: req.user.id });
  }

  res.json({ chatId: chat.id });
};
