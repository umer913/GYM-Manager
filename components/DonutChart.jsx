// SVG donut chart with legend
export default function DonutChart({ segments }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 40, cx = 50, cy = 50, stroke = 14;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const dash = (seg.value / (total || 1)) * circ;
          const offset = circ - cumulative;
          cumulative += dash;
          return (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          );
        })}
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{total}</text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: s.color }} />
            <span className="text-zinc-300">{s.label}</span>
            <span className="text-zinc-500 ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
