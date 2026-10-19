const GREY = '#8b939d';

const PuckFace = ({ mood, size }: { mood: 'happy' | 'angry'; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" aria-hidden="true">
    <circle cx="23" cy="23" r="19.5" fill="#1c2026" stroke="#566174" strokeWidth="1.6" />
    {mood === 'happy' ? (
      <>
        <circle cx="16.5" cy="18.5" r="1.9" fill={GREY} />
        <circle cx="29.5" cy="18.5" r="1.9" fill={GREY} />
        <path
          d="M14 26.5Q23 35 32 26.5"
          fill="none"
          stroke={GREY}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <circle cx="16.5" cy="22" r="1.7" fill={GREY} />
        <circle cx="29.5" cy="22" r="1.7" fill={GREY} />
        <path
          d="M11.5 14L20 18.5M34.5 14L26 18.5"
          fill="none"
          stroke={GREY}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M15 33Q23 26 31 33"
          fill="none"
          stroke={GREY}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </>
    )}
  </svg>
);

// the puck from the login page, standing upright: a smile on one side that flips to a scowl on hover
export const PuckMark = ({ size = 38 }: { size?: number }) => (
  <span className="puck-flip" style={{ width: size, height: size }}>
    <span className="puck-flip-inner">
      <span className="puck-face">
        <PuckFace mood="happy" size={size} />
      </span>
      <span className="puck-face puck-face-back">
        <PuckFace mood="angry" size={size} />
      </span>
    </span>
  </span>
);

export const Snowflake = ({ size = 70, opacity = 0.55 }: { size?: number; opacity?: number }) => (
  <svg
    className="drift"
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="-20 -20 40 40"
    style={{ opacity }}
  >
    <defs>
      <g id="snow-arm">
        <path d="M0 0V-16M0 -9L-4.5 -13.5M0 -9L4.5 -13.5M0 -4.5L-3 -7.5M0 -4.5L3 -7.5" />
      </g>
    </defs>
    <g stroke="#DCEAFB" strokeWidth="1.4" strokeLinecap="round" fill="none">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <use key={deg} href="#snow-arm" transform={`rotate(${deg})`} />
      ))}
    </g>
  </svg>
);

// subtle frost grain laid over a relatively positioned parent
export const FrostOverlay = () => (
  <svg
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 0.4,
      mixBlendMode: 'soft-light',
    }}
  >
    <filter id="frost">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.55" />
    </filter>
    <rect width="100%" height="100%" filter="url(#frost)" />
  </svg>
);

// coarse speckled grain, like frost dust on a blue surface
export const GrainOverlay = () => (
  <svg
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 0.55,
      mixBlendMode: 'soft-light',
    }}
  >
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="9" />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.2 -0.9" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);
