// Simple labeled progress bar
export default function ProgressBar({ label, value, max, color = "from-red-500 to-orange-500", unit = "" }) {
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">
          {value}{unit} / {max}{unit}
          <span className="text-zinc-500 ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
