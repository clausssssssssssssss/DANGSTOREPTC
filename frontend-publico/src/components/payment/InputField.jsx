// Componentes reutilizables mejorados
const InputField = ({
  id,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  label,
  required = false,
  min,
  max,
  step,
  icon,
}) => (
  <div className="input-field">
    <label htmlFor={id} className="input-label">
      {label} {required && <span className="required">*</span>}
    </label>
    <div className="input-container">
      {icon && (
        <div className="input-icon">
          <span>{icon}</span>
        </div>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        className={`input ${icon ? "with-icon" : ""}`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default InputField;
