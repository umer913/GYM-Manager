export default function Input({
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-zinc-800 text-white ${className}`}
      {...props}
    />
  );
}
