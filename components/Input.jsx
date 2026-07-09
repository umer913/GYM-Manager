export default function Input({ name, type = "text", value, onChange, placeholder, className = "", ...props }) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition placeholder-zinc-500 ${className}`}
      {...props}
    />
  );
}
