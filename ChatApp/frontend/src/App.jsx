import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChatPage from "./pages/chat/ChatPage";
import ChatRoute, { NoChatSelected } from "./pages/chat/ChatRoute";
import ProfilePage from "./pages/profile/ProfilePage";

const toastOptions = {
  duration: 3500,
  style: {
    background: "var(--accent)",
    color: "var(--on-accent)",
    borderRadius: "10px",
    fontSize: "14px",
    padding: "10px 14px",
  },
  iconTheme: { primary: "var(--on-accent)", secondary: "var(--accent)" },
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatPage />}>
              <Route index element={<NoChatSelected />} />
              <Route path="chat/:chatId" element={<ChatRoute />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-center" toastOptions={toastOptions} />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
