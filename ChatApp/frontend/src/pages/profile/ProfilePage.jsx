import { useState } from "react";
import { LogOut, Moon, Sun, User } from "lucide-react";
import toast from "react-hot-toast";

import Avatar from "../../components/common/Avatar";
import Field from "../../components/common/Field";
import Spinner from "../../components/common/Spinner";
import { updateProfile } from "../../api/userApi";
import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useTheme } from "../../hooks/useTheme";
import { formatMemberSince } from "../../utils/format";

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { chats } = useChat();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);

  const groups = chats.filter((chat) => chat.isGroupChat).length;
  const direct = chats.length - groups;
  const canSave = name.trim() !== "" && name.trim() !== user.name;

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile({ name: name.trim() });
      updateUser(data);
      setName(data.name);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update your profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page__inner">
        <header className="profile-hero">
          <Avatar name={user.name} size="xl" />
          <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <p>Member since {formatMemberSince(user.createdAt)}</p>
          </div>
        </header>

        <section className="card">
          <h2 className="card__title">Account</h2>
          <form className="stack" onSubmit={handleSave}>
            <Field
              id="profile-name"
              label="Display name"
              icon={User}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
            />
            <div>
              <button type="submit" className="btn btn--primary" disabled={!canSave || saving}>
                {saving && <Spinner size={16} />}
                Save changes
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2 className="card__title">Activity</h2>
          <div className="stats">
            <div className="stat">
              <strong>{direct}</strong>
              <span>Direct chats</span>
            </div>
            <div className="stat">
              <strong>{groups}</strong>
              <span>Groups</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Appearance</h2>
          <div className="segmented" role="radiogroup" aria-label="Theme">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={theme === id}
                className={`segmented__item ${theme === id ? "is-active" : ""}`}
                onClick={() => setTheme(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Session</h2>
          <button type="button" className="btn btn--outline" onClick={logout}>
            <LogOut size={16} />
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
