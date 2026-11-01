import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { searchUsers } from "../api/userApi";
import { getErrorMessage } from "../api/axios";
import { useDebounce } from "./useDebounce";

// Debounced user search. Previous results stay visible while the next ones load.
export const useUserSearch = (query) => {
  const active = query.trim();
  const debounced = useDebounce(active, 300);
  const [state, setState] = useState({ term: "", results: [] });

  useEffect(() => {
    if (!debounced) return;

    let ignore = false;
    searchUsers(debounced)
      .then(({ data }) => !ignore && setState({ term: debounced, results: data }))
      .catch((error) => {
        if (ignore) return;
        setState({ term: debounced, results: [] });
        toast.error(getErrorMessage(error, "Search failed"));
      });

    return () => {
      ignore = true;
    };
  }, [debounced]);

  return {
    results: active ? state.results : [],
    loading: Boolean(active) && state.term !== active,
  };
};
