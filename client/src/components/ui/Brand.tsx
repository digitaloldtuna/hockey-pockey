export const PuckMark = ({ size = 38 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" aria-hidden="true">
    <path d="M5 19v9c0 5 8 9 18 9s18-4 18-9v-9" fill="#8FA1B5" stroke="#EAF1F8" strokeWidth="1.5" />
    <ellipse cx="23" cy="19" rx="18" ry="9" fill="#C3CED9" stroke="#EAF1F8" strokeWidth="1.5" />
    <ellipse cx="23" cy="18" rx="11" ry="4.5" fill="none" stroke="#EAF1F8" strokeWidth="1.2" />
  </svg>
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
