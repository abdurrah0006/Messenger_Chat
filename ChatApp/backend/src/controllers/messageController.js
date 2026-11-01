import Message from "../models/Message.js";
import { httpError } from "../utils/httpError.js";
import { findMemberChat, isId } from "../utils/chat.js";
import { emitToChat } from "../socket/index.js";

const MAX_LENGTH = 4000;
const PAGE_SIZE = 40;

export const sendMessage = async (req, res) => {
  const { chatId, content } = req.body ?? {};

  const text = typeof content === "string" ? content.trim() : "";
  if (!text) throw httpError(400, "Message cannot be empty");
  if (text.length > MAX_LENGTH) {
    throw httpError(400, `Message is too long (max ${MAX_LENGTH} characters)`);
  }

  const chat = await findMemberChat(chatId, req.user._id);

  const message = await Message.create({
    chat: chat._id,
    sender: req.user._id,
    content: text,
  });
  await message.populate("sender", "name");

  chat.latestMessage = message._id;
  await chat.save(); // bumps updatedAt so the chat moves to the top

  const payload = message.toJSON();
  emitToChat(chat.id, "message:new", payload);

  res.status(201).json(payload);
};

// Newest-first pagination: pass `before=<messageId>` to load older messages
export const allMessages = async (req, res) => {
  const chat = await findMemberChat(req.params.chatId, req.user._id);

  const { before } = req.query;
  const limit = Math.min(Number(req.query.limit) || PAGE_SIZE, 100);

  const filter = { chat: chat._id };
  if (before) {
    if (!isId(before)) throw httpError(400, "Invalid cursor");
    filter._id = { $lt: before };
  }

  const messages = await Message.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate("sender", "name")
    .lean();

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  res.json({ messages: messages.reverse(), hasMore });
};

export const deleteMessage = async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, "Invalid message id");

  const message = await Message.findById(req.params.id);
  if (!message) throw httpError(404, "Message not found");
  if (!message.sender.equals(req.user._id)) {
    throw httpError(403, "You can only delete your own messages");
  }

  if (!message.isDeleted) {
    message.isDeleted = true;
    message.content = "";
    await message.save();
  }

  const payload = { chatId: message.chat.toString(), messageId: message.id };
  emitToChat(payload.chatId, "message:deleted", payload);

  res.json(payload);
};
