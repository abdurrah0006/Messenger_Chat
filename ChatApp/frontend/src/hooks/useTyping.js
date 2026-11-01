import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

const EXPIRE_AFTER = 4000;

// Names of the people currently typing in a chat
export const useTyping = (chatId) => {
  const { socket } = useSocket();
  const [typers, setTypers] = useState({}); // userId -> name

  useEffect(() => {
    const timers = {};

    const clear = (userId) => {
      clearTimeout(timers[userId]);
      delete timers[userId];
      setTypers((prev) => {
        if (!(userId in prev)) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    const handleTyping = ({ chatId: id, user }) => {
      if (id !== chatId) return;
      setTypers((prev) => ({ ...prev, [user._id]: user.name }));
      clearTimeout(timers[user._id]);
      // safety net in case the "stop typing" event never arrives
      timers[user._id] = setTimeout(() => clear(user._id), EXPIRE_AFTER);
    };

    const handleStop = ({ chatId: id, user }) => {
      if (id === chatId) clear(user._id);
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStop);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStop);
      Object.values(timers).forEach(clearTimeout);
    };
  }, [socket, chatId]);

  return Object.values(typers);
};
