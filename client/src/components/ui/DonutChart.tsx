const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export type DonutSegment = { value: number; fill: string };

export const DonutChart = ({
  segments,
  label,
  caption = 'LEAGUE PTS',
}: {
  segments: DonutSegment[];
  label: string;
  caption?: string;
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let acc = 0;

  return (
    <svg width="168" height="168" viewBox="0 0 120 120" role="img" aria-label={label}>
      <circle cx="60" cy="60" r="57" fill="none" stroke="#9FB0C2" strokeWidth="1.5" />
      <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#DCE5EE" strokeWidth="15" />
      <g className="sweep" transform="rotate(-90 60 60)">
        {total > 0 &&
          segments.map((s, i) => {
            const len = (s.value / total) * CIRCUMFERENCE;
            const offset = -acc;
            acc += len;
            return (
              <circle
                key={i}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={s.fill}
                strokeWidth="15"
                strokeDasharray={`${Math.max(len - 2.5, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={offset}
              />
            );
          })}
      </g>
      <circle cx="60" cy="60" r="37" fill="none" stroke="#9FB0C2" strokeWidth="1" />
      <text
        x="60"
        y="63"
        textAnchor="middle"
        fontFamily="Arvo, serif"
        fontWeight="700"
        fontSize="24"
        fill="#16263A"
      >
        {total}
      </text>
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontFamily="Geist Mono, monospace"
        fontWeight="600"
        fontSize="6.5"
        letterSpacing="0.8"
        fill="#4F6378"
      >
        {caption}
      </text>
    </svg>
  );
};
