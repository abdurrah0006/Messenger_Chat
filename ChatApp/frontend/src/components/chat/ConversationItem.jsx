import { Link } from "react-router-dom";

import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import { getChatName, getOtherUser, getPreview } from "../../utils/chat";
import { formatListTime } from "../../utils/format";

const ConversationItem = ({ chat, me, active, onlineUsers }) => {
  const name = getChatName(chat, me);
  const other = chat.isGroupChat ? null : getOtherUser(chat, me);
  const online = other ? onlineUsers.includes(other._id) : false;
  const last = chat.latestMessage;
  const hasUnread = chat.unreadCount > 0;

  return (
    <Link
      to={`/chat/${chat._id}`}
      className={`conv-item ${active ? "is-active" : ""} ${hasUnread ? "has-unread" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <Avatar name={name} group={chat.isGroupChat} online={online} />

      <div className="conv-item__body">
        <div className="conv-item__row">
          <span className="conv-item__name">{name}</span>
          {last && <time className="conv-item__time">{formatListTime(last.createdAt)}</time>}
        </div>
        <div className="conv-item__row">
          <span className="conv-item__preview">{getPreview(chat, me)}</span>
          <Badge count={chat.unreadCount} />
        </div>
      </div>
    </Link>
  );
};

export default ConversationItem;
