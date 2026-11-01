import API from "./axios";

// Chats
export const fetchChats = () => API.get("/chats");
export const accessChat = (userId) => API.post("/chats", { userId });
export const markRead = (chatId) => API.put(`/chats/${chatId}/read`);

// Groups
export const createGroup = (data) => API.post("/chats/group", data);
export const renameGroup = (chatId, name) => API.put(`/chats/${chatId}/rename`, { name });
export const addMembers = (chatId, userIds) => API.put(`/chats/${chatId}/members`, { userIds });
export const removeMember = (chatId, userId) =>
  API.delete(`/chats/${chatId}/members/${userId}`);

// Messages
export const fetchMessages = (chatId, before) =>
  API.get(`/messages/${chatId}`, { params: before ? { before } : {} });
export const sendMessage = (data) => API.post("/messages", data);
export const deleteMessage = (messageId) => API.delete(`/messages/${messageId}`);
