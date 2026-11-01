import { Outlet, useMatch } from "react-router-dom";

import ConversationList from "../../components/chat/ConversationList";

// Conversation list on the left, the selected chat (or placeholder) on the right.
// The list stays mounted while you switch between chats, keeping its search and tab.
const ChatPage = () => {
  const match = useMatch("/chat/:chatId");
  const activeId = match?.params.chatId;

  return (
    <div className={`chat-page ${activeId ? "chat-page--open" : ""}`}>
      <ConversationList activeId={activeId} />

      <section className="chat-main">
        <Outlet />
      </section>
    </div>
  );
};

export default ChatPage;
