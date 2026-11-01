import { MessageSquare, ShieldCheck, Users, Zap } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Real-time", text: "Messages arrive instantly, with typing indicators and read receipts." },
  { icon: Users, title: "Group chats", text: "Create groups, add people, and manage members as an admin." },
  { icon: ShieldCheck, title: "Secure sign-in", text: "Passwords are hashed and every request is authenticated." },
];

const AuthLayout = ({ children }) => (
  <div className="auth">
    <div className="auth__brand">
      <span className="brand-mark">
        <MessageSquare size={18} />
      </span>
      Chat
    </div>

    <div className="auth__content">
      <aside className="auth__aside">
        <div className="auth__pitch">
          <h2>Conversations, simplified.</h2>
          <p>A focused place to talk with friends and teams.</p>

          <ul className="auth__features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="auth__feature-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth__main">{children}</main>
    </div>
  </div>
);

export default AuthLayout;