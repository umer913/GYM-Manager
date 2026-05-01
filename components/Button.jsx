export default function Button({
  type = "button",
  children,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={`w-full py-3 bg-red-600 text-white font-bold ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
