import { Search, X } from "lucide-react";

const SearchInput = ({ value, onChange, placeholder = "Search", ...props }) => (
  <div className="search">
    <Search size={16} className="search__icon" />
    <input
      type="text"
      className="search__input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      {...props}
    />
    {value && (
      <button
        type="button"
        className="icon-btn icon-btn--sm search__clear"
        onClick={() => onChange("")}
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

export default SearchInput;
