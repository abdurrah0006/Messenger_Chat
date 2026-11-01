export const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const formatDayLabel = (value) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== today.getFullYear() && { year: "numeric" }),
  });
};

// "14:20" today, "Mon" this week, "Oct 12" otherwise
export const formatListTime = (value) => {
  const date = new Date(value);
  const now = new Date();

  if (isSameDay(date, now)) return formatTime(date);
  if ((now - date) / 86_400_000 < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatLastSeen = (value) => {
  if (!value) return "Offline";
  const label = formatDayLabel(value);
  const isRelative = label === "Today" || label === "Yesterday";
  return `Last seen ${isRelative ? label.toLowerCase() : label} at ${formatTime(value)}`;
};

export const formatMemberSince = (value) =>
  value ? new Date(value).toLocaleDateString([], { month: "long", year: "numeric" }) : "—";
