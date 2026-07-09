export default function Button({ type = "button", children, className = "", disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-lg shadow-md disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
