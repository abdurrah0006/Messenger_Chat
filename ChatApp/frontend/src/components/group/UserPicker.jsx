import { useState } from "react";
import { Check, X } from "lucide-react";

import Avatar from "../common/Avatar";
import SearchInput from "../common/SearchInput";
import Spinner from "../common/Spinner";
import { useUserSearch } from "../../hooks/useUserSearch";

// Search for people and toggle them into a selection. `selected` holds user objects.
const UserPicker = ({ selected, onToggle, excludeIds = [] }) => {
  const [query, setQuery] = useState("");
  const { results, loading } = useUserSearch(query);

  const candidates = results.filter((person) => !excludeIds.includes(person._id));
  const hasQuery = Boolean(query.trim());

  return (
    <div className="picker">
      {selected.length > 0 && (
        <ul className="chips" aria-label="Selected people">
          {selected.map((person) => (
            <li key={person._id} className="chip">
              {person.name}
              <button
                type="button"
                onClick={() => onToggle(person)}
                aria-label={`Remove ${person.name}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <SearchInput value={query} onChange={setQuery} placeholder="Search people by name or email" />

      <div className="picker__results">
        {!hasQuery && <p className="picker__note">Type a name or email to find people.</p>}

        {hasQuery && loading && candidates.length === 0 && (
          <div className="picker__note">
            <Spinner size={16} />
          </div>
        )}

        {hasQuery && !loading && candidates.length === 0 && (
          <p className="picker__note">No people found.</p>
        )}

        {candidates.map((person) => {
          const checked = selected.some((item) => item._id === person._id);

          return (
            <button
              key={person._id}
              type="button"
              className={`person ${checked ? "is-selected" : ""}`}
              onClick={() => onToggle(person)}
              aria-pressed={checked}
            >
              <Avatar name={person.name} size="sm" />
              <span className="person__text">
                <strong>{person.name}</strong>
                <small>{person.email}</small>
              </span>
              <span className="person__check">{checked && <Check size={14} />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UserPicker;
