"use client";

type Props = {
  score: number | null;
  size?: "sm" | "md";
};

export default function MatchBadge({ score, size = "sm" }: Props) {
  const dim = size === "md" ? 48 : 36;
  const stroke = size === "md" ? 3 : 2.5;
  const radius = (dim - stroke) / 2;
  const circ = 2 * Math.PI * radius;

  if (score === null) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: dim, height: dim }}
        title="Upload a resume to see match"
        aria-label="No resume loaded"
      >
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
          <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-200 dark:text-gray-700" />
          <text x={dim / 2} y={dim / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={size === "md" ? 9 : 7} fill="currentColor" className="text-gray-300 dark:text-gray-600">&mdash;</text>
        </svg>
      </span>
    );
  }

  let color: string;
  if (score >= 80) color = "text-emerald-500";
  else if (score >= 50) color = "text-amber-500";
  else color = "text-rose-500";

  const dashOffset = circ - (circ * Math.min(score, 100)) / 100;

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: dim, height: dim }}
      title={`${score}% match`}
      aria-label={`${score} percent match`}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
        <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-200 dark:text-gray-700" />
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          className={`${color} transition-all duration-700 ease-out`}
        />
      </svg>
      <span className={`absolute text-[${size === "md" ? 9 : 7}px] font-semibold ${color}`} style={{ fontSize: size === "md" ? 9 : 7 }}>
        {score}%
      </span>
    </span>
  );
}
