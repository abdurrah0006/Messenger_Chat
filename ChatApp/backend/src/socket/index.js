import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

let io;

// userId -> Set of socket ids (a user can have several tabs open)
const online = new Map();

const userRoom = (userId) => `user:${userId}`;
const chatRoom = (chatId) => `chat:${chatId}`;

// ---------------------------------------------------------------------------
// Helpers used by the REST controllers to push real-time updates
// ---------------------------------------------------------------------------
export const emitToChat = (chatId, event, payload) =>
  io?.to(chatRoom(chatId)).emit(event, payload);

export const emitToUser = (userId, event, payload) =>
  io?.to(userRoom(userId)).emit(event, payload);

export const joinChat = (userIds, chatId) =>
  userIds.forEach((id) => io?.in(userRoom(id)).socketsJoin(chatRoom(chatId)));

export const leaveChat = (userId, chatId) =>
  io?.in(userRoom(userId)).socketsLeave(chatRoom(chatId));

// ---------------------------------------------------------------------------
// Socket server
// ---------------------------------------------------------------------------
export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: env.clientOrigins, credentials: true },
  });

  // Authenticate every connection with the same JWT used by the REST API
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error("No token");

      const { id } = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(id).select("name");
      if (!user) throw new Error("User not found");

      socket.data.user = { _id: user.id, name: user.name };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  const broadcastOnline = () => io.emit("online-users", [...online.keys()]);

  io.on("connection", async (socket) => {
    const { _id: userId, name } = socket.data.user;

    // --- presence ---------------------------------------------------------
    const sockets = online.get(userId) ?? new Set();
    sockets.add(socket.id);
    online.set(userId, sockets);

    if (sockets.size === 1) broadcastOnline();
    else socket.emit("online-users", [...online.keys()]);

    // --- typing indicators (only relayed to chats the user belongs to) ----
    const relayTyping = (event) => (chatId) => {
      if (!socket.rooms.has(chatRoom(chatId))) return;
      socket
        .to(chatRoom(chatId))
        .emit(event, { chatId, user: { _id: userId, name } });
    };
    socket.on("typing", relayTyping("typing"));
    socket.on("stop-typing", relayTyping("stop-typing"));

    socket.on("disconnect", async () => {
      sockets.delete(socket.id);
      if (sockets.size > 0) return;

      online.delete(userId);
      broadcastOnline();
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(
        () => {}
      );
    });

    // --- rooms: one personal room + one room per chat ---------------------
    socket.join(userRoom(userId));
    const chats = await Chat.find({ users: userId }).select("_id");
    socket.join(chats.map((chat) => chatRoom(chat.id)));
  });

  return io;
};
