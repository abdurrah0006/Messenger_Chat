import { Users } from "lucide-react";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "?";

const Avatar = ({ name, size = "md", group = false, online = false }) => (
  <span className={`avatar avatar--${size} ${group ? "avatar--group" : ""}`} aria-hidden="true">
    {group ? <Users size="1.1em" strokeWidth={2} /> : initials(name)}
    {online && <span className="avatar__dot" />}
  </span>
);

export default Avatar;
