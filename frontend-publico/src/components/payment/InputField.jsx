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
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-lg">{icon}</span>
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
        className={`w-full ${
          icon ? "pl-10" : "pl-4"
        } pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200 bg-white shadow-sm`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default InputField;
