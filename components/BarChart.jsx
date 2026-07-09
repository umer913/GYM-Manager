// Simple vertical bar chart
export default function BarChart({ data, labels, color = "#ef4444" }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-36 mt-2">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs text-zinc-500">{v}k</span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height: `${(v / (max || 1)) * 110}px`,
              background: `linear-gradient(to top, ${color}99, ${color})`
            }}
          />
          <span className="text-xs text-zinc-500 truncate w-full text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
