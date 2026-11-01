// Labelled text input with an optional leading icon and trailing element
const Field = ({ id, label, icon: Icon, trailing, hint, ...inputProps }) => (
  <div className="field">
    <label className="field__label" htmlFor={id}>
      {label}
    </label>
    <div className="field__control">
      {Icon && <Icon size={16} className="field__icon" />}
      <input id={id} className="field__input" {...inputProps} />
      {trailing}
    </div>
    {hint && <p className="field__hint">{hint}</p>}
  </div>
);

export default Field;
