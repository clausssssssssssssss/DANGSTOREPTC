const Button = ({
  onClick,
  variant = "primary",
  className = "",
  text,
  disabled = false,
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
        variants[variant]
      } ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {text}
    </button>
  );
};

export default Button;
