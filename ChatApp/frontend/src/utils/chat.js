export const getOtherUser = (chat, me) =>
  chat.users.find((user) => user._id !== me._id) ?? chat.users[0];

export const getChatName = (chat, me) =>
  chat.isGroupChat ? chat.chatName : (getOtherUser(chat, me)?.name ?? "Unknown user");

export const getPreview = (chat, me) => {
  const last = chat.latestMessage;

  if (!last) return "No messages yet";
  if (last.isDeleted) return "Message deleted";
  if (last.sender?._id === me._id) return `You: ${last.content}`;
  if (chat.isGroupChat) return `${last.sender?.name ?? "Someone"}: ${last.content}`;
  return last.content;
};
