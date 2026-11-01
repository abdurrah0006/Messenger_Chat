import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";

import Avatar from "../common/Avatar";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { getChatName, getOtherUser } from "../../utils/chat";

const ChatHeader = ({ chat, infoOpen, onToggleInfo }) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const name = getChatName(chat, user);
  const other = chat.isGroupChat ? null : getOtherUser(chat, user);
  const online = other ? onlineUsers.includes(other._id) : false;

  const subtitle = chat.isGroupChat
    ? chat.users.map((member) => (member._id === user._id ? "You" : member.name)).join(", ")
    : online
      ? "Online"
      : "Offline";

  return (
    <header className="thread-header">
      <Link to="/" className="icon-btn thread-header__back" aria-label="Back to chats">
        <ArrowLeft size={20} />
      </Link>

      <button type="button" className="thread-header__who" onClick={onToggleInfo}>
        <Avatar name={name} group={chat.isGroupChat} online={online} />
        <span className="thread-header__text">
          <strong>{name}</strong>
          <small className={online ? "is-online" : ""}>{subtitle}</small>
        </span>
      </button>

      <button
        type="button"
        className={`icon-btn ${infoOpen ? "is-active" : ""}`}
        onClick={onToggleInfo}
        aria-label={chat.isGroupChat ? "Group info" : "Contact info"}
        aria-pressed={infoOpen}
        title={chat.isGroupChat ? "Group info" : "Contact info"}
      >
        <Info size={20} />
      </button>
    </header>
  );
};

export default ChatHeader;
