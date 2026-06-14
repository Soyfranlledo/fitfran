export function Sparkline({
  data,
  width = 300,
  height = 80,
  color = 'var(--color-health)',
  fill = true,
}: {
  data: { x: string; y: number }[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  if (data.length < 2) {
    return (
      <div className="grid place-items-center text-faint text-sm" style={{ height }}>
        Aún no hay suficientes datos
      </div>
    );
  }
  const pad = 8;
  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (d.y - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${height - pad} L${pts[0][0].toFixed(1)},${
    height - pad
  } Z`;
  const id = `grad-${color.replace(/[^a-z]/gi, '')}`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.5 : 0} fill={color} />
      ))}
    </svg>
  );
}
