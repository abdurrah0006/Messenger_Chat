/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from "react";
import { socket } from "../socket/socket";
import { useAuth } from "../hooks/useAuth";

export const SocketContext = createContext(null);

// Mounted only while signed in: connects on mount, disconnects on unmount.
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const token = user?.token;
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    const handleOnline = (ids) => setOnlineUsers(ids);
    const handleDisconnect = () => setOnlineUsers([]);
    const handleError = (error) => {
      if (error.message === "Unauthorized") window.dispatchEvent(new Event("auth:expired"));
    };

    socket.on("online-users", handleOnline);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    socket.auth = { token };
    socket.connect();

    return () => {
      socket.off("online-users", handleOnline);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.disconnect();
    };
  }, [token]);

  const value = useMemo(() => ({ socket, onlineUsers }), [onlineUsers]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
