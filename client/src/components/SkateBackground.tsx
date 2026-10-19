import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

type Skater = {
  x: number;
  y: number;
  heading: number;
  speed: number;
  curve: number;
  curveTarget: number;
  life: number;
  weight: number;
};

// a fresh skate line appears roughly this often (ms)
const NEW_LINE_EVERY = [7000, 13000];
const STEPS_PER_FRAME = 3; // steps per frame while a new line is being drawn

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const gaussian = () => Math.random() + Math.random() + Math.random() - 1.5;

// pale, frosty rink ice that gets scratched up by an occasional skater
const SkateBackground = ({ fixed = false }: { fixed?: boolean }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    const liveCanvas = liveRef.current;
    const liveCtx = liveCanvas?.getContext('2d');
    if (!canvas || !ctx || !liveCanvas || !liveCtx) return;

    // the context the line helpers draw on: the permanent layer, or the fading layer for new lines
    let g: CanvasRenderingContext2D = ctx;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let timer = 0;
    let live: Skater | null = null;

    const newSkater = (): Skater => {
      // enter from a random edge, aimed roughly across the rink
      const edge = Math.floor(Math.random() * 4);
      const x = edge === 0 ? -20 : edge === 1 ? width + 20 : rand(0, width);
      const y = edge === 2 ? -20 : edge === 3 ? height + 20 : rand(0, height);
      const heading = Math.atan2(height / 2 - y, width / 2 - x) + rand(-0.9, 0.9);
      return {
        x,
        y,
        heading,
        speed: rand(2.6, 4.2),
        curve: 0,
        curveTarget: rand(-0.01, 0.01),
        life: rand(380, 900),
        weight: rand(0.45, 1.9),
      };
    };

    // a clump of snow shavings
    const chips = (x: number, y: number, count: number, spread: number) => {
      for (let i = 0; i < count; i++) {
        const px = x + gaussian() * spread;
        const py = y + gaussian() * spread;
        const r = rand(0.5, 2.2);
        g.fillStyle = `rgba(70,92,114,${rand(0.08, 0.2)})`;
        g.beginPath();
        g.arc(px + 0.8, py + 0.8, r, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = `rgba(240,246,251,${rand(0.35, 0.95)})`;
        g.beginPath();
        g.arc(px, py, r, 0, Math.PI * 2);
        g.fill();
      }
    };

    const step = (skater: Skater) => {
      // small curvature that changes slowly: wide, loose arcs
      if (Math.random() < 0.004) skater.curveTarget = rand(-0.014, 0.014);
      if (Math.random() < 0.0012) {
        skater.curveTarget = (Math.random() < 0.5 ? -1 : 1) * rand(0.016, 0.026);
      }
      skater.curve += (skater.curveTarget - skater.curve) * 0.02;
      skater.heading += skater.curve;

      const fromX = skater.x;
      const fromY = skater.y;
      skater.x += Math.cos(skater.heading) * skater.speed;
      skater.y += Math.sin(skater.heading) * skater.speed;
      skater.life -= 1;

      // the blade presses harder in some places than others, so the width drifts along the line
      const bladeWidth =
        skater.weight * (1 + 0.4 * Math.sin(skater.life * 0.045 + skater.weight * 9));

      g.lineCap = 'round';
      // a thin groove: faint shadow on one side, bright shaved edge on the other
      g.strokeStyle = 'rgba(60,84,108,0.16)';
      g.lineWidth = bladeWidth;
      g.beginPath();
      g.moveTo(fromX + 0.7, fromY + 0.7);
      g.lineTo(skater.x + 0.7, skater.y + 0.7);
      g.stroke();
      g.strokeStyle = `rgba(238,245,251,${rand(0.3, 0.55)})`;
      g.lineWidth = bladeWidth * 0.8;
      g.beginPath();
      g.moveTo(fromX, fromY);
      g.lineTo(skater.x, skater.y);
      g.stroke();

      if (Math.random() < 0.05) chips(skater.x, skater.y, 2, 4 + Math.abs(skater.curve) * 60);
    };

    const isDone = (skater: Skater) =>
      skater.life <= 0 ||
      skater.x < -60 ||
      skater.x > width + 60 ||
      skater.y < -60 ||
      skater.y > height + 60;

    // run a whole line instantly (used for the lines that are already there)
    const scratchNow = () => {
      const skater = newSkater();
      let guard = 0;
      while (!isDone(skater) && guard++ < 1400) step(skater);
      if (Math.random() < 0.4) chips(skater.x, skater.y, 30, 10);
    };

    const paintBase = () => {
      const base = ctx.createLinearGradient(0, 0, width, height);
      base.addColorStop(0, '#4d657e');
      base.addColorStop(0.5, '#5b7590');
      base.addColorStop(1, '#486079');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      // uneven light and dark patches across the sheet
      for (let i = 0; i < 70; i++) {
        const x = rand(0, width);
        const y = rand(0, height);
        const r = rand(80, 320);
        const light = Math.random() < 0.55;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(
          0,
          light ? `rgba(225,236,246,${rand(0.06, 0.2)})` : `rgba(70,95,125,${rand(0.05, 0.14)})`
        );
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    };

    const paintFrost = () => {
      const area = width * height;
      // fine frost grain over everything
      const grain = (
        count: number,
        minR: number,
        maxR: number,
        color: string,
        minA: number,
        maxA: number
      ) => {
        for (let i = 0; i < count; i++) {
          ctx.fillStyle = `rgba(${color},${rand(minA, maxA)})`;
          ctx.beginPath();
          ctx.arc(rand(0, width), rand(0, height), rand(minR, maxR), 0, Math.PI * 2);
          ctx.fill();
        }
      };
      grain(Math.floor(area / 45), 0.4, 1.3, '236,244,251', 0.05, 0.3);
      grain(Math.floor(area / 160), 0.4, 1.2, '70,94,120', 0.04, 0.14);
      grain(Math.floor(area / 1400), 1, 2.6, '240,247,252', 0.1, 0.4);
    };

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      liveCanvas.width = canvas.width;
      liveCanvas.height = canvas.height;
      liveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      paintBase();
      // plenty of old scratches and clumps of shavings, as if the rink was just used
      for (let i = 0; i < 26; i++) scratchNow();
      const clumps = Math.floor((width * height) / 45000);
      for (let i = 0; i < clumps; i++)
        chips(rand(0, width), rand(0, height), Math.floor(rand(6, 40)), rand(4, 16));
      paintFrost();
    };

    const loop = () => {
      if (live) {
        g = liveCtx;
        for (let i = 0; i < STEPS_PER_FRAME && live; i++) {
          step(live);
          if (isDone(live)) {
            if (Math.random() < 0.5) chips(live.x, live.y, 24, 8);
            live = null;
          }
        }
        g = ctx;
      }
      // new lines slowly melt away, so the ice never fills up
      liveCtx.globalCompositeOperation = 'destination-out';
      liveCtx.fillStyle = 'rgba(0,0,0,0.0009)';
      liveCtx.fillRect(0, 0, width, height);
      liveCtx.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(loop);
    };

    // one new line every so often
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          live = newSkater();
          schedule();
        },
        rand(NEW_LINE_EVERY[0], NEW_LINE_EVERY[1])
      );
    };

    paint();
    if (!reduceMotion) {
      frame = requestAnimationFrame(loop);
      schedule();
    }

    window.addEventListener('resize', paint);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('resize', paint);
    };
  }, []);

  return (
    <Box
      position={fixed ? 'fixed' : 'absolute'}
      inset="0"
      zIndex={fixed ? 0 : undefined}
      aria-hidden="true"
      pointerEvents="none"
    >
      <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
      <canvas
        ref={liveRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </Box>
  );
};

export default SkateBackground;
