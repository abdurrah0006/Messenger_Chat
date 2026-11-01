const TypingIndicator = ({ names }) => {
  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : "Several people are typing";

  return (
    <div className="typing" aria-live="polite">
      <span className="typing__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{label}</span>
    </div>
  );
};

export default TypingIndicator;
