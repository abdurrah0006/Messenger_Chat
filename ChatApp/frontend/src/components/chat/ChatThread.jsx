import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatInfoPanel from "../group/ChatInfoPanel";
import ConfirmDialog from "../common/ConfirmDialog";
import Spinner from "../common/Spinner";

import { deleteMessage, fetchMessages, sendMessage } from "../../api/chatApi";
import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useSocket } from "../../hooks/useSocket";
import { useTyping } from "../../hooks/useTyping";

const markDeleted = (messages, messageId) =>
  messages.map((message) =>
    message._id === messageId ? { ...message, isDeleted: true, content: "" } : message
  );

const appendOnce = (messages, message) =>
  messages.some((item) => item._id === message._id) ? messages : [...messages, message];

// One open conversation. It is keyed by chat id, so every chat starts with fresh state.
const ChatThread = ({ chat }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { applyMessage } = useChat();
  const typers = useTyping(chat._id);

  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchMessages(chat._id)
      .then(({ data }) => {
        if (ignore) return;
        setMessages(data.messages);
        setHasMore(data.hasMore);
      })
      .catch((error) => !ignore && toast.error(getErrorMessage(error, "Could not load messages")))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [chat._id]);

  useEffect(() => {
    const handleNew = (message) => {
      if (message.chat === chat._id) setMessages((prev) => appendOnce(prev, message));
    };

    const handleDeleted = ({ chatId, messageId }) => {
      if (chatId === chat._id) setMessages((prev) => markDeleted(prev, messageId));
    };

    // Someone opened the chat: everything they did not send is now seen by them
    const handleSeen = ({ chatId, userId }) => {
      if (chatId !== chat._id) return;
      setMessages((prev) =>
        prev.map((message) =>
          message.sender._id === userId || message.seenBy?.includes(userId)
            ? message
            : { ...message, seenBy: [...(message.seenBy ?? []), userId] }
        )
      );
    };

    socket.on("message:new", handleNew);
    socket.on("message:deleted", handleDeleted);
    socket.on("messages:seen", handleSeen);

    return () => {
      socket.off("message:new", handleNew);
      socket.off("message:deleted", handleDeleted);
      socket.off("messages:seen", handleSeen);
    };
  }, [socket, chat._id]);

  const handleSend = useCallback(
    async (content) => {
      try {
        const { data } = await sendMessage({ chatId: chat._id, content });
        setMessages((prev) => appendOnce(prev, data));
        applyMessage(data);
      } catch (error) {
        toast.error(getErrorMessage(error, "Message not sent"));
        throw error; // lets the composer restore the text
      }
    },
    [chat._id, applyMessage]
  );

  const handleLoadMore = async () => {
    if (loadingMore || messages.length === 0) return;

    setLoadingMore(true);
    try {
      const { data } = await fetchMessages(chat._id, messages[0]._id);
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load earlier messages"));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async () => {
    await deleteMessage(toDelete._id);
    setMessages((prev) => markDeleted(prev, toDelete._id));
  };

  return (
    <div className="thread">
      <div className="thread__main">
        <ChatHeader
          chat={chat}
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((open) => !open)}
        />

        {loading ? (
          <div className="thread__loading">
            <Spinner size={22} />
          </div>
        ) : (
          <MessageList
            messages={messages}
            me={user}
            isGroup={chat.isGroupChat}
            memberCount={chat.users.length}
            typers={typers}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
            onDelete={setToDelete}
          />
        )}

        <MessageInput chatId={chat._id} onSend={handleSend} />
      </div>

      {infoOpen && (
        <>
          <div className="info-backdrop" onClick={() => setInfoOpen(false)} />
          <ChatInfoPanel chat={chat} onClose={() => setInfoOpen(false)} />
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete message?"
          message="This message will be removed for everyone in the chat."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
};

export default ChatThread;
