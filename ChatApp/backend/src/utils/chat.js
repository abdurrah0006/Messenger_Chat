import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { httpError } from "./httpError.js";

export const USER_FIELDS = "name email lastSeen";

export const isId = (value) => mongoose.isObjectIdOrHexString(value);

/** Populates the relations the client needs to render a chat. */
export const withRelations = (query) =>
  query
    .populate("users", USER_FIELDS)
    .populate("groupAdmin", USER_FIELDS)
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name" },
    });

/** Loads a chat and makes sure the given user belongs to it. */
export const findMemberChat = async (chatId, userId) => {
  if (!isId(chatId)) throw httpError(400, "Invalid chat id");

  const chat = await Chat.findById(chatId);
  if (!chat) throw httpError(404, "Chat not found");
  if (!chat.users.some((id) => id.equals(userId))) {
    throw httpError(403, "You are not a member of this chat");
  }
  return chat;
};

export const isGroupAdmin = (chat, userId) =>
  Boolean(chat.groupAdmin && chat.groupAdmin.equals(userId));

/** Adds a per-user `unreadCount` to each chat (computed from unseen messages). */
export const attachUnread = async (chats, userId) => {
  if (chats.length === 0) return [];

  const counts = await Message.aggregate([
    {
      $match: {
        chat: { $in: chats.map((chat) => chat._id) },
        sender: { $ne: userId },
        seenBy: { $ne: userId },
        isDeleted: { $ne: true }, // also matches messages created before this field existed
      },
    },
    { $group: { _id: "$chat", count: { $sum: 1 } } },
  ]);

  const byChat = new Map(counts.map(({ _id, count }) => [_id.toString(), count]));

  return chats.map((chat) => ({
    ...chat.toJSON(),
    unreadCount: byChat.get(chat.id) ?? 0,
  }));
};
