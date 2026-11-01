import { useEffect, useState } from "react";

const isVisible = () => document.visibilityState === "visible";

export const useDocumentVisible = () => {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    const update = () => setVisible(isVisible());
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return visible;
};
