interface PriceChartProps {
  history: number[];  // prices in cents
  height?: number;
  showLabels?: boolean;
}

export function PriceChart({ history, height = 80, showLabels = false }: PriceChartProps) {
  if (history.length < 2) return null;

  const W = 320;
  const H = height;
  const PAD = showLabels ? 24 : 4;

  const min = Math.max(0, Math.min(...history) - 5);
  const max = Math.min(100, Math.max(...history) + 5);
  const range = max - min || 1;

  const pts = history.map((v, i) => {
    const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return [x, y] as [number, number];
  });

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = [
    `M${pts[0][0]},${H - PAD}`,
    ...pts.map(([x, y]) => `L${x},${y}`),
    `L${pts[pts.length - 1][0]},${H - PAD}`,
    'Z',
  ].join(' ');

  const last = history[history.length - 1];
  const first = history[0];
  const up = last >= first;
  const stroke = up ? '#16a34a' : '#dc2626';
  const fill = up ? '#16a34a' : '#dc2626';
  const lastPt = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`grad-${up ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.15" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={area} fill={`url(#grad-${up ? 'up' : 'dn'})`} />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Current price dot */}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={stroke} />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="8" fill={stroke} fillOpacity="0.15" />

      {showLabels && (
        <>
          <text x={PAD} y={H - 4} fontSize="10" fill="#9ca3af">{first}¢</text>
          <text x={W - PAD} y={H - 4} fontSize="10" fill={stroke} textAnchor="end" fontWeight="600">
            {last}¢
          </text>
        </>
      )}
    </svg>
  );
}

// Mini sparkline variant for cards
export function Sparkline({ history, up }: { history: number[]; up: boolean }) {
  if (history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const W = 80, H = 30;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');
  const color = up ? '#16a34a' : '#dc2626';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="80" height="30" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
