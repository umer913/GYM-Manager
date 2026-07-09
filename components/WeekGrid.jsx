// Displays a Mon–Sun attendance grid for the current week
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekGrid({ data }) {
  return (
    <div className="flex gap-2 mt-2">
      {DAYS.map((day, i) => (
        <div key={day} className="flex flex-col items-center gap-1 flex-1">
          <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300
            ${data[i]
              ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-800/60 text-zinc-600 border border-zinc-800"}`}>
            {data[i] ? "✓" : "—"}
          </div>
          <span className="text-[10px] text-zinc-500">{day}</span>
        </div>
      ))}
    </div>
  );
}
