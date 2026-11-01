import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessagesSquare, SearchX, UsersRound } from "lucide-react";
import toast from "react-hot-toast";

import Avatar from "../common/Avatar";
import EmptyState from "../common/EmptyState";
import SearchInput from "../common/SearchInput";
import Spinner from "../common/Spinner";
import CreateGroupModal from "../group/CreateGroupModal";
import ConversationItem from "./ConversationItem";

import { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useSocket } from "../../hooks/useSocket";
import { useUserSearch } from "../../hooks/useUserSearch";
import { getChatName } from "../../utils/chat";

const TABS = [
  { id: "all", label: "All" },
  { id: "direct", label: "Direct" },
  { id: "groups", label: "Groups" },
];

const ConversationList = ({ activeId }) => {
  const { user } = useAuth();
  const { chats, loading, openDirectChat } = useChat();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const { results: people, loading: searching } = useUserSearch(query);
  const term = query.trim().toLowerCase();

  const visibleChats = useMemo(
    () =>
      chats.filter((chat) => {
        if (tab === "direct" && chat.isGroupChat) return false;
        if (tab === "groups" && !chat.isGroupChat) return false;
        return !term || getChatName(chat, user).toLowerCase().includes(term);
      }),
    [chats, tab, term, user]
  );

  const showPeople = Boolean(term) && tab !== "groups";
  const nothingFound = Boolean(term) && visibleChats.length === 0 && !showPeople;

  const startChat = async (person) => {
    try {
      const chat = await openDirectChat(person._id);
      setQuery("");
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not start the chat"));
    }
  };

  return (
    <aside className="conv" aria-label="Conversations">
      <header className="conv__header">
        <h1 className="conv__title">Chats</h1>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowCreate(true)}
          aria-label="Create group"
          title="Create group"
        >
          <UsersRound size={20} />
        </button>
      </header>

      <div className="conv__tools">
        <SearchInput value={query} onChange={setQuery} placeholder="Search chats or people" />

        <div className="tabs" role="tablist">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`tabs__tab ${tab === id ? "is-active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="conv__scroll">
        {loading ? (
          <div className="conv__loading">
            <Spinner />
          </div>
        ) : (
          <>
            {visibleChats.length > 0 && (
              <div className="conv__list">
                {visibleChats.map((chat) => (
                  <ConversationItem
                    key={chat._id}
                    chat={chat}
                    me={user}
                    active={chat._id === activeId}
                    onlineUsers={onlineUsers}
                  />
                ))}
              </div>
            )}

            {showPeople && (
              <section className="conv__section">
                <h2 className="conv__section-title">People</h2>
                {searching && people.length === 0 && (
                  <div className="conv__loading">
                    <Spinner size={16} />
                  </div>
                )}
                {!searching && people.length === 0 && (
                  <p className="conv__note">No people match “{query.trim()}”.</p>
                )}
                {people.map((person) => (
                  <button
                    key={person._id}
                    type="button"
                    className="person"
                    onClick={() => startChat(person)}
                  >
                    <Avatar name={person.name} online={onlineUsers.includes(person._id)} />
                    <span className="person__text">
                      <strong>{person.name}</strong>
                      <small>{person.email}</small>
                    </span>
                  </button>
                ))}
              </section>
            )}

            {!term && chats.length === 0 && (
              <EmptyState
                icon={MessagesSquare}
                title="No conversations yet"
                text="Search for someone above to start chatting, or create a group."
              />
            )}

            {!term && chats.length > 0 && visibleChats.length === 0 && (
              <EmptyState
                icon={MessagesSquare}
                title={tab === "groups" ? "No groups yet" : "No direct chats yet"}
                text="Nothing to show in this tab."
              />
            )}

            {nothingFound && (
              <EmptyState icon={SearchX} title="No results" text="Try a different search." />
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(chat) => {
            setShowCreate(false);
            navigate(`/chat/${chat._id}`);
          }}
        />
      )}
    </aside>
  );
};

export default ConversationList;
