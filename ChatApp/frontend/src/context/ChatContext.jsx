/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import * as chatApi from "../api/chatApi";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";

export const ChatContext = createContext(null);

// Owns the conversation list and keeps it in sync with the server in real time.
// Messages themselves are loaded per open chat (see ChatThread).
export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const userId = user._id;

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const refreshChats = useCallback(async () => {
    try {
      const { data } = await chatApi.fetchChats();
      setChats(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load your chats"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const upsertChat = useCallback((chat) => {
    setChats((prev) =>
      prev.some((item) => item._id === chat._id)
        ? prev.map((item) => (item._id === chat._id ? { ...item, ...chat } : item))
        : [{ unreadCount: 0, ...chat }, ...prev]
    );
  }, []);

  // A new message updates the preview, bumps the chat to the top and counts as
  // unread unless it is ours. The open chat clears its own unread count.
  const applyMessage = useCallback(
    (message) => {
      if (!chatsRef.current.some((chat) => chat._id === message.chat)) {
        refreshChats(); // a chat we have not seen yet (e.g. someone started a DM)
        return;
      }

      const mine = message.sender._id === userId;

      setChats((prev) => {
        const chat = prev.find((item) => item._id === message.chat);
        if (!chat) return prev;

        const updated = {
          ...chat,
          latestMessage: message,
          unreadCount: mine ? chat.unreadCount : chat.unreadCount + 1,
        };
        return [updated, ...prev.filter((item) => item._id !== message.chat)];
      });
    },
    [userId, refreshChats]
  );

  // ----- real-time events -------------------------------------------------
  useEffect(() => {
    const handleDeleted = ({ chatId, messageId }) =>
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId && chat.latestMessage?._id === messageId
            ? { ...chat, latestMessage: { ...chat.latestMessage, isDeleted: true, content: "" } }
            : chat
        )
      );

    // The server broadcasts the same payload to everyone, so the per-user
    // unread count is always kept from local state.
    const handleUpdated = (incoming) =>
      setChats((prev) => {
        const existing = prev.find((chat) => chat._id === incoming._id);
        const merged = { ...existing, ...incoming, unreadCount: existing?.unreadCount ?? 0 };

        return existing
          ? prev.map((chat) => (chat._id === incoming._id ? merged : chat))
          : [merged, ...prev];
      });

    const handleRemoved = ({ chatId }) =>
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));

    socket.on("message:new", applyMessage);
    socket.on("message:deleted", handleDeleted);
    socket.on("chat:updated", handleUpdated);
    socket.on("chat:removed", handleRemoved);
    socket.io.on("reconnect", refreshChats); // catch up on anything missed while offline

    return () => {
      socket.off("message:new", applyMessage);
      socket.off("message:deleted", handleDeleted);
      socket.off("chat:updated", handleUpdated);
      socket.off("chat:removed", handleRemoved);
      socket.io.off("reconnect", refreshChats);
    };
  }, [socket, applyMessage, refreshChats]);

  // ----- actions (they throw on failure; callers decide how to show it) ----
  const openDirectChat = useCallback(
    async (otherUserId) => {
      const { data } = await chatApi.accessChat(otherUserId);
      upsertChat(data);
      return data;
    },
    [upsertChat]
  );

  const createGroup = useCallback(
    async (name, memberIds) => {
      const { data } = await chatApi.createGroup({ name, users: memberIds });
      upsertChat(data);
      return data;
    },
    [upsertChat]
  );

  const renameGroup = useCallback(
    async (chatId, name) => {
      const { data } = await chatApi.renameGroup(chatId, name);
      upsertChat(data);
    },
    [upsertChat]
  );

  const addMembers = useCallback(
    async (chatId, userIds) => {
      const { data } = await chatApi.addMembers(chatId, userIds);
      upsertChat(data);
    },
    [upsertChat]
  );

  const removeMember = useCallback(
    async (chatId, memberId) => {
      const { data } = await chatApi.removeMember(chatId, memberId);
      upsertChat(data);
    },
    [upsertChat]
  );

  const leaveGroup = useCallback(
    async (chatId) => {
      await chatApi.removeMember(chatId, userId);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
    },
    [userId]
  );

  const markRead = useCallback(async (chatId) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId && chat.unreadCount > 0 ? { ...chat, unreadCount: 0 } : chat
      )
    );
    try {
      await chatApi.markRead(chatId);
    } catch {
      // not critical: it is retried the next time the chat is opened
    }
  }, []);

  const totalUnread = useMemo(
    () => chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
    [chats]
  );

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) Chat` : "Chat";
  }, [totalUnread]);

  const value = useMemo(
    () => ({
      chats,
      loading,
      totalUnread,
      applyMessage,
      openDirectChat,
      createGroup,
      renameGroup,
      addMembers,
      removeMember,
      leaveGroup,
      markRead,
    }),
    [
      chats,
      loading,
      totalUnread,
      applyMessage,
      openDirectChat,
      createGroup,
      renameGroup,
      addMembers,
      removeMember,
      leaveGroup,
      markRead,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
