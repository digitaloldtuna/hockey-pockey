import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

type Skater = {
  x: number;
  y: number;
  heading: number;
  speed: number;
  speedTarget: number;
  curve: number;
  curveTarget: number;
  life: number;
  width: number;
};

const SKATERS = 2;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const gaussian = () => Math.random() + Math.random() + Math.random() - 1.5;

// a heap of snow: a soft mound with a shaded side and a sprinkle of bright grains
const pile = (
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  strength: number
) => {
  const mound = g.createRadialGradient(x, y, 0, x, y, radius * 1.5);
  mound.addColorStop(0, `rgba(205,222,244,${0.26 * strength})`);
  mound.addColorStop(1, 'rgba(205,222,244,0)');
  g.fillStyle = mound;
  g.fillRect(x - radius * 1.5, y - radius * 1.5, radius * 3, radius * 3);

  const grains = Math.floor(radius * 6 * strength) + 10;
  for (let i = 0; i < grains; i++) {
    const px = x + gaussian() * radius * 1.1;
    const py = y + gaussian() * radius * 0.8;
    const r = rand(0.6, 2.6);
    g.fillStyle = `rgba(15,28,48,${rand(0.1, 0.26)})`;
    g.beginPath();
    g.arc(px + 1, py + 1.4, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = `rgba(222,234,248,${rand(0.15, 0.5)})`;
    g.beginPath();
    g.arc(px, py, r, 0, Math.PI * 2);
    g.fill();
  }
};

// a jagged fracture that forks now and then
const crack = (
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  steps: number,
  width: number
) => {
  const points: [number, number][] = [[x, y]];
  for (let k = 0; k < steps; k++) {
    angle += (Math.random() - 0.5) * 0.85;
    x += Math.cos(angle) * rand(10, 38);
    y += Math.sin(angle) * rand(10, 38);
    points.push([x, y]);
    if (steps > 4 && Math.random() < 0.16) {
      crack(
        g,
        x,
        y,
        angle + (Math.random() < 0.5 ? -1 : 1) * rand(0.4, 1.2),
        Math.floor(steps / 2),
        width * 0.65
      );
    }
  }
  const trace = (dx: number, dy: number) => {
    g.beginPath();
    points.forEach(([px, py], i) =>
      i === 0 ? g.moveTo(px + dx, py + dy) : g.lineTo(px + dx, py + dy)
    );
    g.stroke();
  };
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = 'rgba(4,10,20,0.55)';
  g.lineWidth = width * 1.5;
  trace(1, 1.2);
  g.strokeStyle = `rgba(200,220,244,${rand(0.4, 0.7)})`;
  g.lineWidth = width * 1.3;
  trace(0, 0);
};

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// dark rink ice with wide, lazy skate tracks that read as scuffed haze and grain, never as clean lines
const DarkIceBackground = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    const base = staticRef.current;
    const baseCtx = base?.getContext('2d');
    if (!canvas || !ctx || !base || !baseCtx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let skaters: Skater[] = [];
    let frame = 0;

    const spawn = (): Skater => {
      const edge = Math.floor(Math.random() * 4);
      const x = edge === 0 ? -40 : edge === 1 ? width + 40 : rand(0, width);
      const y = edge === 2 ? -40 : edge === 3 ? height + 40 : rand(0, height);
      const heading = Math.atan2(height / 2 - y, width / 2 - x) + rand(-0.8, 0.8);
      return {
        x,
        y,
        heading,
        speed: rand(1.6, 5),
        speedTarget: rand(1.4, 5.5),
        curve: 0,
        curveTarget: rand(-0.008, 0.008),
        life: rand(700, 1500),
        width: rand(0.8, 1.6),
      };
    };

    // a soft, low-alpha puff of scuffed ice
    const puff = (x: number, y: number, r: number, alpha: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(170,198,232,${alpha})`);
      grad.addColorStop(1, 'rgba(170,198,232,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };

    const step = (skater: Skater) => {
      // gentle, slowly changing curvature: wide arcs and long loose loops
      if (Math.random() < 0.004) skater.curveTarget = rand(-0.02, 0.02);
      if (Math.random() < 0.001) {
        skater.curveTarget = (Math.random() < 0.5 ? -1 : 1) * rand(0.022, 0.032);
      }
      skater.curve += (skater.curveTarget - skater.curve) * 0.02;
      skater.heading += skater.curve;

      // speed surges and fades, so a single line is dense where it was slow and thin where it was fast
      if (Math.random() < 0.006) skater.speedTarget = rand(1.3, 6);
      skater.speed += (skater.speedTarget - skater.speed) * 0.015;

      const fromX = skater.x;
      const fromY = skater.y;
      skater.x += Math.cos(skater.heading) * skater.speed;
      skater.y += Math.sin(skater.heading) * skater.speed;
      skater.life -= 1;

      const carve = Math.abs(skater.curve);
      const slow = Math.min(Math.max(3.4 / skater.speed, 0.5), 2.2);
      const spread = 2.4 * skater.width + carve * 60;

      // light haze under the track
      puff(skater.x, skater.y, 7 + spread, (0.018 + carve * 0.5) * slow);

      // a thin, broken blade line: the clear part of the mark
      if (Math.random() < 0.9) {
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(215,232,252,${rand(0.12, 0.38) * Math.min(slow, 1.4)})`;
        ctx.lineWidth = skater.width * rand(0.6, 1.1);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(skater.x, skater.y);
        ctx.stroke();
      }

      // scuffs either side of the line
      const normalX = -Math.sin(skater.heading);
      const normalY = Math.cos(skater.heading);
      const grains = Math.round(5 * slow);
      for (let i = 0; i < grains; i++) {
        const across = gaussian() * spread;
        const along = rand(-skater.speed, skater.speed);
        const px = skater.x + normalX * across + Math.cos(skater.heading) * along;
        const py = skater.y + normalY * across + Math.sin(skater.heading) * along;
        ctx.fillStyle = `rgba(200,220,245,${rand(0.06, 0.34)})`;
        ctx.beginPath();
        ctx.arc(px, py, rand(0.4, 1.3), 0, Math.PI * 2);
        ctx.fill();
      }

      // snow heaped up beside the line, more often when the skater turns hard or stops
      if (Math.random() < 0.012 + carve * 0.9 + (slow > 1.6 ? 0.01 : 0)) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const offset = side * rand(5, 22);
        pile(
          ctx,
          skater.x + normalX * offset,
          skater.y + normalY * offset,
          rand(4, 13),
          rand(0.5, 1)
        );
      }
    };

    const tick = () => {
      skaters.forEach((skater, i) => {
        step(skater);
        const outside =
          skater.x < -140 || skater.x > width + 140 || skater.y < -140 || skater.y > height + 140;
        if (skater.life <= 0 || (outside && skater.life < 1300)) skaters[i] = spawn();
      });
    };

    // old marks slowly melt away
    const heal = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.0018)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    };

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // permanent texture: cracks and random heaps of snow
      base.width = canvas.width;
      base.height = canvas.height;
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cracks = Math.max(6, Math.floor((width * height) / 120000));
      for (let i = 0; i < cracks; i++) {
        crack(
          baseCtx,
          rand(0, width),
          rand(0, height),
          rand(0, Math.PI * 2),
          Math.floor(rand(6, 14)),
          rand(0.7, 1.3)
        );
      }
      const piles = Math.max(14, Math.floor((width * height) / 38000));
      for (let i = 0; i < piles; i++) {
        pile(baseCtx, rand(0, width), rand(0, height), rand(5, 20), rand(0.4, 1));
      }

      skaters = Array.from({ length: SKATERS + 1 }, spawn);
      // start with the ice already marked up
      for (let i = 0; i < 2200; i++) {
        tick();
        if (i % 2 === 0) heal();
      }
    };

    const loop = () => {
      tick();
      heal();
      frame = requestAnimationFrame(loop);
    };

    setup();
    if (!reduceMotion) frame = requestAnimationFrame(loop);

    window.addEventListener('resize', setup);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', setup);
    };
  }, []);

  return (
    <Box
      position="absolute"
      inset="0"
      overflow="hidden"
      aria-hidden="true"
      pointerEvents="none"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 38% 38%, #16263f 0%, #0c1829 52%, #060b15 100%)',
      }}
    >
      {/* cloudy variation in the ice itself */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.35,
          mixBlendMode: 'screen',
        }}
      >
        <filter id="ice-clouds">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.007" numOctaves="5" seed="12" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.62  0 0 0 0 0.78  0.9 0 0 0 -0.3" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ice-clouds)" />
      </svg>

      {/* permanent cracks and snow heaps */}
      <canvas
        ref={staticRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: 'blur(0.4px)',
        }}
      />

      {/* the skate marks */}
      <canvas
        ref={ref}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: 'blur(0.5px)',
        }}
      />

      {/* grain over everything, jittering like film */}
      <Box
        className="ice-grain"
        position="absolute"
        inset="-20%"
        opacity="0.38"
        style={{ backgroundImage: GRAIN, mixBlendMode: 'overlay' }}
      />
    </Box>
  );
};

export default DarkIceBackground;
