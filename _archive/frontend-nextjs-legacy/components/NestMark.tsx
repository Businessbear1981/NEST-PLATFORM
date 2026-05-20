/**
 * Evergreen chess-board mark. A 4×4 lattice where alternating cells carry
 * a stylized conifer triangle. Uses evergreen + gold, tuned to read well
 * at any size.
 */
export default function NestMark({ size = 32 }: { size?: number }) {
  const cells = 4;
  const vb = 64;
  const cell = vb / cells;
  const squares: { x: number; y: number; tree: boolean }[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      squares.push({ x: c * cell, y: r * cell, tree: (r + c) % 2 === 0 });
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      role="img"
      aria-label="NEST evergreen mark"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="nm-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2a22" />
          <stop offset="100%" stopColor="#071a13" />
        </linearGradient>
        <linearGradient id="nm-tree" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#8e7736" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={vb} height={vb} rx="6" fill="url(#nm-board)" />
      {squares.map((s, i) => (
        <g key={i}>
          {!s.tree && (
            <rect
              x={s.x}
              y={s.y}
              width={cell}
              height={cell}
              fill="#12362a"
              opacity="0.55"
            />
          )}
          {s.tree && (
            <path
              d={`M ${s.x + cell / 2} ${s.y + cell * 0.2}
                 L ${s.x + cell * 0.82} ${s.y + cell * 0.78}
                 L ${s.x + cell * 0.18} ${s.y + cell * 0.78} Z`}
              fill="url(#nm-tree)"
            />
          )}
        </g>
      ))}
      <rect
        x="0.5"
        y="0.5"
        width={vb - 1}
        height={vb - 1}
        rx="6"
        fill="none"
        stroke="rgba(201,168,76,0.35)"
      />
    </svg>
  );
}
