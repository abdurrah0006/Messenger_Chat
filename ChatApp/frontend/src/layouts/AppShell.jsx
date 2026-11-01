import { NavLink, Outlet, useMatch } from "react-router-dom";
import { LogOut, MessageSquare, MessagesSquare, Moon, Sun } from "lucide-react";

import Avatar from "../components/common/Avatar";
import Badge from "../components/common/Badge";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { useTheme } from "../hooks/useTheme";

// Navigation rail + page area. On phones the rail becomes a bottom bar
// and is hidden while a conversation is open.
const AppShell = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalUnread } = useChat();

  const inChat = Boolean(useMatch("/chat/:chatId"));
  const onChatHome = Boolean(useMatch("/"));
  const chatsActive = inChat || onChatHome;

  return (
    <div className={`shell ${inChat ? "shell--chat-open" : ""}`}>
      <nav className="rail" aria-label="Main navigation">
        <NavLink to="/" className="rail__logo" aria-label="Chat home">
          <MessageSquare size={20} />
        </NavLink>

        <div className="rail__group">
          <NavLink
            to="/"
            className={`rail__btn ${chatsActive ? "is-active" : ""}`}
            aria-label="Chats"
            title="Chats"
          >
            <MessagesSquare size={20} />
            <Badge count={totalUnread} className="rail__badge" />
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `rail__btn ${isActive ? "is-active" : ""}`}
            aria-label="Profile"
            title="Profile"
          >
            <Avatar name={user.name} size="sm" />
          </NavLink>
        </div>

        <div className="rail__group rail__group--end">
          <button
            type="button"
            className="rail__btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            className="rail__btn"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
