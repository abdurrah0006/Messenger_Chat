import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { MessagesSquare } from "lucide-react";

import ChatThread from "../../components/chat/ChatThread";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import { useChat } from "../../hooks/useChat";
import { useDocumentVisible } from "../../hooks/useDocumentVisible";

export const NoChatSelected = () => (
  <EmptyState
    icon={MessagesSquare}
    title="Select a conversation"
    text="Choose a chat from the list, or search for someone to start a new one."
  />
);

const ChatRoute = () => {
  const { chatId } = useParams();
  const { chats, loading, markRead } = useChat();
  const visible = useDocumentVisible();

  const chat = chats.find((item) => item._id === chatId);
  const unread = chat?.unreadCount ?? 0;

  // Anything that arrives while this chat is open and visible is read immediately
  useEffect(() => {
    if (unread > 0 && visible) markRead(chatId);
  }, [chatId, unread, visible, markRead]);

  if (loading) {
    return (
      <div className="thread__loading">
        <Spinner size={22} />
      </div>
    );
  }

  // Unknown chat, or one we just left or were removed from
  if (!chat) return <Navigate to="/" replace />;

  return <ChatThread key={chat._id} chat={chat} />;
};

export default ChatRoute;
