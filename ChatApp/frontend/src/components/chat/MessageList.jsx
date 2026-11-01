import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ChevronUp, MessageSquareDashed } from "lucide-react";

import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { formatDayLabel, isSameDay } from "../../utils/format";

const RUN_GAP_MS = 5 * 60 * 1000; // messages from one sender within 5 min are grouped

const MessageList = ({
  messages,
  me,
  isGroup,
  memberCount,
  typers,
  hasMore,
  loadingMore,
  onLoadMore,
  onDelete,
}) => {
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);
  const isFirstScroll = useRef(true);
  const [showJump, setShowJump] = useState(false);

  const last = messages.at(-1);
  const lastId = last?._id;
  const lastIsMine = last?.sender._id === me._id;

  // Day dividers + "runs" of consecutive messages by the same sender
  const items = useMemo(() => {
    const list = [];
    let previous = null;

    for (const message of messages) {
      const newDay = !previous || !isSameDay(previous.createdAt, message.createdAt);
      if (newDay) {
        list.push({ type: "day", key: `day-${message._id}`, label: formatDayLabel(message.createdAt) });
      }

      const startsRun =
        newDay ||
        previous.sender._id !== message.sender._id ||
        new Date(message.createdAt) - new Date(previous.createdAt) > RUN_GAP_MS;

      list.push({ type: "message", key: message._id, message, startsRun });
      previous = message;
    }
    return list;
  }, [messages]);

  // Follow new messages, unless the reader has scrolled up (their own messages always scroll)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (stickToBottom.current || lastIsMine) {
      el.scrollTo({ top: el.scrollHeight, behavior: isFirstScroll.current ? "auto" : "smooth" });
    }
    isFirstScroll.current = false;
  }, [lastId, lastIsMine, typers.length]);

  const handleScroll = () => {
    const el = scrollRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stickToBottom.current = nearBottom;
    setShowJump(!nearBottom);
  };

  const jumpToLatest = () =>
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });

  return (
    <div className="messages-wrap">
      <div className="messages" ref={scrollRef} onScroll={handleScroll}>
        <div className="messages__inner">
          {hasMore && (
            <button
              type="button"
              className="btn btn--outline btn--sm messages__more"
              onClick={onLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? <Spinner size={14} /> : <ChevronUp size={14} />}
              Load earlier messages
            </button>
          )}

          {messages.length === 0 && (
            <EmptyState
              icon={MessageSquareDashed}
              title="No messages yet"
              text="Send the first message to start the conversation."
            />
          )}

          {items.map((item) =>
            item.type === "day" ? (
              <div key={item.key} className="day-divider">
                <span>{item.label}</span>
              </div>
            ) : (
              <MessageBubble
                key={item.key}
                message={item.message}
                isMine={item.message.sender._id === me._id}
                isGroup={isGroup}
                startsRun={item.startsRun}
                otherCount={memberCount - 1}
                onDelete={onDelete}
              />
            )
          )}

          {typers.length > 0 && <TypingIndicator names={typers} />}
        </div>
      </div>

      {showJump && (
        <button type="button" className="jump" onClick={jumpToLatest} aria-label="Jump to latest message">
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
};

export default MessageList;
