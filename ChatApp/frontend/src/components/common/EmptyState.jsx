const EmptyState = ({ icon: Icon, title, text, children }) => (
  <div className="empty">
    {Icon && (
      <span className="empty__icon">
        <Icon size={26} strokeWidth={1.75} />
      </span>
    )}
    {title && <h3 className="empty__title">{title}</h3>}
    {text && <p className="empty__text">{text}</p>}
    {children}
  </div>
);

export default EmptyState;
