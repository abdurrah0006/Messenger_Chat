import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, LogOut, Pencil, UserMinus, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";

import Avatar from "../common/Avatar";
import ConfirmDialog from "../common/ConfirmDialog";
import AddMembersModal from "./AddMembersModal";

import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useSocket } from "../../hooks/useSocket";
import { getChatName, getOtherUser } from "../../utils/chat";
import { formatLastSeen } from "../../utils/format";

const ChatInfoPanel = ({ chat, onClose }) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { renameGroup, removeMember, leaveGroup } = useChat();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type: "leave" } | { type: "remove", member }

  const isGroup = chat.isGroupChat;
  const isAdmin = isGroup && chat.groupAdmin?._id === user._id;
  const name = getChatName(chat, user);
  const other = isGroup ? null : getOtherUser(chat, user);
  const otherOnline = other ? onlineUsers.includes(other._id) : false;

  const startEditing = () => {
    setDraftName(chat.chatName);
    setEditing(true);
  };

  const saveName = async (event) => {
    event.preventDefault();
    const next = draftName.trim();

    if (!next || next === chat.chatName) return setEditing(false);

    try {
      await renameGroup(chat._id, next);
      toast.success("Group renamed");
      setEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not rename the group"));
    }
  };

  const handleConfirm = async () => {
    if (confirm.type === "leave") {
      await leaveGroup(chat._id);
      navigate("/");
      return;
    }

    await removeMember(chat._id, confirm.member._id);
    toast.success(`${confirm.member.name} was removed`);
  };

  return (
    <aside className="info" aria-label={isGroup ? "Group info" : "Contact info"}>
      <header className="info__header">
        <h2>{isGroup ? "Group info" : "Contact info"}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>
      </header>

      <div className="info__scroll">
        <section className="info__hero">
          <Avatar name={name} group={isGroup} size="xl" online={otherOnline} />

          {editing ? (
            <form className="info__rename" onSubmit={saveName}>
              <input
                className="info__rename-input"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                maxLength={50}
                aria-label="Group name"
                autoFocus
              />
              <button type="submit" className="icon-btn icon-btn--sm" aria-label="Save name">
                <Check size={16} />
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--sm"
                onClick={() => setEditing(false)}
                aria-label="Cancel rename"
              >
                <X size={16} />
              </button>
            </form>
          ) : (
            <div className="info__title">
              <h3>{name}</h3>
              {isAdmin && (
                <button
                  type="button"
                  className="icon-btn icon-btn--sm"
                  onClick={startEditing}
                  aria-label="Rename group"
                  title="Rename group"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          )}

          {isGroup ? (
            <p className="info__meta">
              Group · {chat.users.length} members
            </p>
          ) : (
            <>
              <p className="info__meta">{other?.email}</p>
              <p className="info__meta">{otherOnline ? "Online" : formatLastSeen(other?.lastSeen)}</p>
            </>
          )}
        </section>

        {isGroup && (
          <>
            <section className="info__section">
              <div className="info__section-head">
                <h4>Members · {chat.users.length}</h4>
                {isAdmin && (
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => setShowAdd(true)}
                  >
                    <UserPlus size={14} />
                    Add
                  </button>
                )}
              </div>

              <ul className="members">
                {chat.users.map((member) => {
                  const isMe = member._id === user._id;
                  const memberIsAdmin = chat.groupAdmin?._id === member._id;

                  return (
                    <li key={member._id} className="member">
                      <Avatar
                        name={member.name}
                        size="sm"
                        online={onlineUsers.includes(member._id)}
                      />
                      <span className="member__text">
                        <strong>
                          {member.name}
                          {isMe && <span className="member__you"> (you)</span>}
                        </strong>
                        <small>{member.email}</small>
                      </span>

                      {memberIsAdmin && <span className="tag">Admin</span>}

                      {isAdmin && !isMe && (
                        <button
                          type="button"
                          className="icon-btn icon-btn--sm"
                          onClick={() => setConfirm({ type: "remove", member })}
                          aria-label={`Remove ${member.name}`}
                          title="Remove from group"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="info__section">
              <button
                type="button"
                className="btn btn--outline btn--block"
                onClick={() => setConfirm({ type: "leave" })}
              >
                <LogOut size={16} />
                Leave group
              </button>
            </section>
          </>
        )}
      </div>

      {showAdd && <AddMembersModal chat={chat} onClose={() => setShowAdd(false)} />}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === "leave" ? "Leave group?" : "Remove member?"}
          message={
            confirm.type === "leave"
              ? `You will stop receiving messages from “${chat.chatName}”.${
                  isAdmin ? " Admin rights will pass to another member." : ""
                }`
              : `${confirm.member.name} will be removed from “${chat.chatName}”.`
          }
          confirmLabel={confirm.type === "leave" ? "Leave" : "Remove"}
          onConfirm={handleConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </aside>
  );
};

export default ChatInfoPanel;
