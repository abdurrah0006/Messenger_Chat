const Badge = ({ count = 0, className = "" }) => {
  if (!count || count < 1) return null;

  return (
    <span className={`badge ${className}`} aria-label={`${count} unread`}>
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default Badge;
