import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { useSocket } from "../../hooks/useSocket";

const MAX_LENGTH = 4000;
const TYPING_TIMEOUT = 2000;

const MessageInput = ({ chatId, onSend }) => {
  const { socket } = useSocket();
  const [text, setText] = useState("");

  const inputRef = useRef(null);
  const isTyping = useRef(false);
  const timer = useRef(null);

  const stopTyping = useCallback(() => {
    clearTimeout(timer.current);
    if (isTyping.current) {
      isTyping.current = false;
      socket.emit("stop-typing", chatId);
    }
  }, [socket, chatId]);

  // Tell others we stopped typing when leaving the chat
  useEffect(() => stopTyping, [stopTyping]);

  // Focus on desktop only: on touch devices it would pop the keyboard open
  useEffect(() => {
    if (matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, [chatId]);

  const resize = () => {
    const el = inputRef.current;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleChange = (event) => {
    setText(event.target.value);
    resize();

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing", chatId);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(stopTyping, TYPING_TIMEOUT);
  };

  const submit = async () => {
    const content = text.trim();
    if (!content) return;

    setText("");
    inputRef.current.style.height = "auto";
    stopTyping();

    try {
      await onSend(content);
    } catch {
      setText((current) => current || content); // restore so nothing is lost
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={inputRef}
        className="composer__input"
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Write a message…"
        maxLength={MAX_LENGTH}
        aria-label="Message"
      />
      <button
        type="submit"
        className="btn btn--primary btn--icon"
        disabled={!text.trim()}
        aria-label="Send message"
        title="Send (Enter)"
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default MessageInput;
