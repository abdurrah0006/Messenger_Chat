import { Ban, Trash2 } from "lucide-react";

import Avatar from "../common/Avatar";
import MessageStatus from "./MessageStatus";
import { formatTime } from "../../utils/format";

const MessageBubble = ({ message, isMine, isGroup, startsRun, otherCount, onDelete }) => {
  const showSender = isGroup && !isMine;

  return (
    <div
      className={`msg ${isMine ? "msg--mine" : "msg--other"} ${startsRun ? "msg--start" : ""}`}
    >
      {showSender && (
        <div className="msg__avatar">
          {startsRun && <Avatar name={message.sender.name} size="sm" />}
        </div>
      )}

      <div className="msg__stack">
        {showSender && startsRun && <span className="msg__sender">{message.sender.name}</span>}

        <div className="msg__line">
          {isMine && !message.isDeleted && (
            <button
              type="button"
              className="icon-btn icon-btn--sm msg__delete"
              onClick={() => onDelete(message)}
              aria-label="Delete message"
              title="Delete message"
            >
              <Trash2 size={14} />
            </button>
          )}

          {message.isDeleted ? (
            <div className="bubble bubble--deleted">
              <Ban size={14} />
              <span>This message was deleted</span>
            </div>
          ) : (
            <div className="bubble">
              <p className="bubble__text">{message.content}</p>
              <span className="bubble__meta">
                <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
                {isMine && <MessageStatus message={message} otherCount={otherCount} />}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
