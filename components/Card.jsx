export default function Card({ children, className = "" }) {
  return (
    <div className={`w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-10 border border-zinc-800 ${className}`}>
      {children}
    </div>
  );
}
