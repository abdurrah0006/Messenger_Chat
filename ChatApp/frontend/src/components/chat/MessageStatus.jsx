import { Check, CheckCheck } from "lucide-react";

// ✓ sent · ✓✓ seen by someone · solid ✓✓ seen by everyone
const MessageStatus = ({ message, otherCount }) => {
  const seen = message.seenBy?.length ?? 0;
  const everyone = otherCount > 0 && seen >= otherCount;
  const Icon = seen > 0 ? CheckCheck : Check;

  const label = seen === 0 ? "Sent" : everyone ? "Seen by everyone" : `Seen by ${seen}`;

  return (
    <span className={`status ${everyone ? "status--seen" : ""}`} title={label}>
      <Icon size={14} aria-label={label} />
    </span>
  );
};

export default MessageStatus;
