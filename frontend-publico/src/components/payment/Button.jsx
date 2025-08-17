const Button = ({
  onClick,
  variant = "primary",
  className = "",
  text,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className} ${disabled ? "disabled" : ""}`}
    >
      {text}
    </button>
  );
};

export default Button;
