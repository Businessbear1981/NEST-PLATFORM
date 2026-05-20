/**
 * Circular readiness gauge — gold fill on dark ring.
 * 0–100 score; the gold arc length = score%.
 */
export default function ReadinessRing({
  score,
  size = 160,
  stroke = 12,
  label = "Readiness",
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * c;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${clamped}%`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(201,168,76,0.15)"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#c9a84c"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 600ms cubic-bezier(.2,.7,.2,1)" }}
      />
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e8e6df"
        fontSize={size * 0.28}
        fontWeight={600}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {clamped}
      </text>
      <text
        x="50%"
        y="64%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(232,230,223,0.55)"
        fontSize={size * 0.085}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing="0.18em"
      >
        {label.toUpperCase()}
      </text>
    </svg>
  );
}
