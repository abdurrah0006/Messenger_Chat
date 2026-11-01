import { Navigate } from "react-router-dom";

import AppShell from "../layouts/AppShell";
import { SocketProvider } from "../context/SocketContext";
import { ChatProvider } from "../context/ChatContext";
import { useAuth } from "../hooks/useAuth";

// Everything behind the login. The socket and chat state only exist while
// signed in, so signing out (or in as someone else) always starts clean.
const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <SocketProvider>
      <ChatProvider>
        <AppShell />
      </ChatProvider>
    </SocketProvider>
  );
};

export default ProtectedRoute;
