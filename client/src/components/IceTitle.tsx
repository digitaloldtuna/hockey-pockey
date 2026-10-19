import { Box, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const font = new FontLoader().parse(fontData as unknown as Parameters<FontLoader['parse']>[0]);

const DEFAULT_LINES = ['HOCKEY', 'POCKEY'];
const FOV = 32;
const LINE_GAP = 1.3;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const LETTER_GAP = 0.17;

const makeCanvas = (size: number, fill: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = fill;
  g.fillRect(0, 0, size, size);
  return { canvas, g };
};

const toTexture = (canvas: HTMLCanvasElement, repeat: number) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // text UVs are in world units, so repeat gently across the letters
  texture.repeat.set(repeat, repeat);
  return texture;
};

// mostly polished ice (dark = glossy) with uneven frosted patches, cracks and scuffs (bright = rough)
const makeRoughnessTexture = () => {
  const size = 1024;
  const { canvas, g } = makeCanvas(size, '#303030');

  // large, irregular cloudy patches where the surface is frosted
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rx = 40 + Math.random() * 190;
    const ry = rx * (0.3 + Math.random() * 0.7);
    g.save();
    g.translate(x, y);
    g.rotate(Math.random() * Math.PI);
    g.scale(1, ry / rx);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0, `rgba(255,255,255,${0.15 + Math.random() * 0.45})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(-rx, -rx, rx * 2, rx * 2);
    g.restore();
  }

  // thin fracture lines
  g.lineCap = 'round';
  for (let i = 0; i < 40; i++) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    let angle = Math.random() * Math.PI * 2;
    g.strokeStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.4})`;
    g.lineWidth = 0.5 + Math.random() * 0.9;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      angle += (Math.random() - 0.5) * 1.1;
      x += Math.cos(angle) * (15 + Math.random() * 40);
      y += Math.sin(angle) * (15 + Math.random() * 40);
      g.lineTo(x, y);
    }
    g.stroke();
  }

  // skate scuffs, mostly one direction
  for (let i = 0; i < 110; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const angle = Math.random() < 0.75 ? (Math.random() - 0.5) * 0.6 : Math.random() * Math.PI;
    const length = 40 + Math.random() * 260;
    g.strokeStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.35})`;
    g.lineWidth = 0.4 + Math.random() * 1.1;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    g.stroke();
  }

  // sparse tiny chips
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
    g.beginPath();
    g.arc(Math.random() * size, Math.random() * size, 0.5 + Math.random() * 1.3, 0, Math.PI * 2);
    g.fill();
  }

  // frosty grain across the whole surface
  for (let i = 0; i < 6000; i++) {
    g.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.3})`;
    g.beginPath();
    g.arc(Math.random() * size, Math.random() * size, 1.5 + Math.random() * 3.5, 0, Math.PI * 2);
    g.fill();
  }

  return toTexture(canvas, 0.4);
};

// frost: layered grain and haze, with only faint, soft cracks, bubbles and grainy scuffs
const makeDetailTexture = () => {
  const size = 1024;
  const { canvas, g } = makeCanvas(size, '#000000');

  // cloudy haze patches of many sizes
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 40 + Math.random() * 200;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(215,238,255,${0.08 + Math.random() * 0.26})`);
    grad.addColorStop(1, 'rgba(215,238,255,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // coarse frost grain, big enough to survive being scaled down onto the letters
  const grain = (count: number, minR: number, maxR: number, minA: number, maxA: number) => {
    for (let i = 0; i < count; i++) {
      g.fillStyle = `rgba(235,248,255,${minA + Math.random() * (maxA - minA)})`;
      g.beginPath();
      g.arc(
        Math.random() * size,
        Math.random() * size,
        minR + Math.random() * (maxR - minR),
        0,
        Math.PI * 2
      );
      g.fill();
    }
  };
  grain(7000, 1.5, 4, 0.05, 0.3);
  grain(2200, 4, 10, 0.03, 0.14);

  // faint, soft cracks
  g.save();
  g.filter = 'blur(2px)';
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let i = 0; i < 7; i++) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    let angle = Math.random() * Math.PI * 2;
    g.lineWidth = 3 + Math.random() * 3;
    g.strokeStyle = `rgba(225,243,255,${0.16 + Math.random() * 0.22})`;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      angle += (Math.random() - 0.5) * 0.9;
      x += Math.cos(angle) * (20 + Math.random() * 50);
      y += Math.sin(angle) * (20 + Math.random() * 50);
      g.lineTo(x, y);
    }
    g.stroke();
  }

  // a few dim, blurry air bubbles
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 6 + Math.pow(Math.random(), 2) * 26;
    g.strokeStyle = `rgba(225,243,255,${0.14 + Math.random() * 0.2})`;
    g.lineWidth = Math.max(2, r * 0.2);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();

  // skate scuffs sprayed from grains instead of a solid line
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const angle = (Math.random() - 0.5) * 0.6;
    const length = 80 + Math.random() * 320;
    const spread = 3 + Math.random() * 7;
    const dots = Math.floor(length * 1.6);
    for (let k = 0; k < dots; k++) {
      const t = Math.random();
      const across = (Math.random() + Math.random() + Math.random() - 1.5) * spread;
      const px = x + Math.cos(angle) * length * t - Math.sin(angle) * across;
      const py = y + Math.sin(angle) * length * t + Math.cos(angle) * across;
      g.fillStyle = `rgba(228,244,255,${0.05 + Math.random() * 0.22})`;
      g.beginPath();
      g.arc(px, py, 0.9 + Math.random() * 2.2, 0, Math.PI * 2);
      g.fill();
    }
  }

  return toTexture(canvas, 0.55);
};

// soft, uneven undulation so reflections wobble like a hand-poured surface
const makeBumpTexture = () => {
  const size = 512;
  const { canvas, g } = makeCanvas(size, '#808080');
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 25 + Math.random() * 110;
    const light = Math.random() < 0.5;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, light ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)');
    grad.addColorStop(1, 'rgba(128,128,128,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return toTexture(canvas, 0.3);
};

// smooth pseudo-random field: the same point always gets the same push, so faces stay joined
const makeWobble = () => {
  const p = Array.from({ length: 9 }, () => Math.random() * Math.PI * 2);
  return (x: number, y: number, z: number) => ({
    x: Math.sin(y * 4.3 + p[0]) * Math.cos(z * 3.1 + p[1]) + 0.5 * Math.sin(x * 8.7 + p[2]),
    y: Math.sin(x * 3.7 + p[3]) * Math.cos(z * 4.9 + p[4]) + 0.5 * Math.sin(y * 9.1 + p[5]),
    z: Math.sin(x * 5.3 + p[6]) * Math.cos(y * 4.1 + p[7]) + 0.5 * Math.sin(z * 7.9 + p[8]),
  });
};

// an extruded letter whose outline and bevel are irregular, like hand-chipped ice
const makeLetterGeometry = (char: string, stroke: number) => {
  const wobble = makeWobble();

  // widen every stroke a little by pushing outline points away from the filled area
  const BOLD = 0.05 * stroke;
  const uneven = (path: THREE.Path, count: number, side: number) => {
    const points = path.getSpacedPoints(count);
    return points.map((point, k) => {
      const prev = points[(k - 1 + points.length) % points.length];
      const next = points[(k + 1) % points.length];
      const [dx, dy] = [next.x - prev.x, next.y - prev.y];
      const length = Math.hypot(dx, dy) || 1;
      const w = wobble(point.x, point.y, 0);
      return new THREE.Vector2(
        point.x + (dy / length) * BOLD * side + w.x * 0.01,
        point.y - (dx / length) * BOLD * side + w.y * 0.01
      );
    });
  };

  const shapes = font.generateShapes(char, 1).map((shape) => {
    const outlinePoints = shape.getSpacedPoints(260);
    let area = 0;
    outlinePoints.forEach((point, k) => {
      const next = outlinePoints[(k + 1) % outlinePoints.length];
      area += point.x * next.y - next.x * point.y;
    });
    // right-hand normal points away from the fill for a counter-clockwise outline
    const side = area >= 0 ? 1 : -1;
    const outline = new THREE.Shape(uneven(shape, 260, side));
    outline.holes = shape.holes.map((hole) => new THREE.Path(uneven(hole, 140, side)));
    return outline;
  });

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.22 + Math.random() * 0.16,
    bevelEnabled: true,
    bevelThickness: 0.2 + Math.random() * 0.12,
    bevelSize: (0.08 + Math.random() * 0.04) * stroke,
    bevelOffset: 0,
    bevelSegments: 12,
    curveSegments: 12,
  });

  // push every vertex around so bevels vary in width and the faces are lumpy
  const position = geometry.attributes.position;
  for (let k = 0; k < position.count; k++) {
    const [x, y, z] = [position.getX(k), position.getY(k), position.getZ(k)];
    const w = wobble(x * 1.3, y * 1.3, z * 1.3);
    position.setXYZ(k, x + w.x * 0.02, y + w.y * 0.02, z + w.z * 0.035);
  }
  geometry.computeVertexNormals();
  return geometry;
};

// the two faces of the puck, in grey on the rubber: a smile on one side, a scowl on the other
const makeFaceTexture = (mood: 'happy' | 'angry') => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#14171c';
  g.fillRect(0, 0, size, size);

  const r = size * 0.3; // unit used to size the features
  g.translate(size / 2, size / 2);
  g.fillStyle = '#7d8590';
  g.strokeStyle = '#7d8590';
  g.lineCap = 'round';
  g.lineWidth = r * 0.17;

  const dot = (x: number, y: number, radius: number) => {
    g.beginPath();
    g.arc(x, y, radius, 0, Math.PI * 2);
    g.fill();
  };

  if (mood === 'happy') {
    dot(-r * 0.62, -r * 0.42, r * 0.17);
    dot(r * 0.62, -r * 0.42, r * 0.17);
    g.beginPath();
    g.arc(0, r * 0.08, r * 0.95, Math.PI * 0.15, Math.PI * 0.85);
    g.stroke();
  } else {
    dot(-r * 0.58, -r * 0.1, r * 0.15);
    dot(r * 0.58, -r * 0.1, r * 0.15);
    // brows slanting down toward the nose
    g.beginPath();
    g.moveTo(-r * 1.0, -r * 0.78);
    g.lineTo(-r * 0.28, -r * 0.4);
    g.moveTo(r * 1.0, -r * 0.78);
    g.lineTo(r * 0.28, -r * 0.4);
    g.stroke();
    g.beginPath();
    g.arc(0, r * 1.15, r * 0.75, Math.PI * 1.2, Math.PI * 1.8);
    g.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  // cylinder caps map the texture turned a quarter turn, so turn it back
  texture.center.set(0.5, 0.5);
  texture.rotation = Math.PI / 2;
  return texture;
};

// a jagged lump of ice: a faceted blob with uneven sides
const makeChunkGeometry = (size: number) => {
  const wobble = makeWobble();
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const position = geometry.attributes.position;
  const stretch = [size * rand(0.8, 1.35), size * rand(0.6, 1), size * rand(0.6, 1)];
  const [offsetU, offsetV] = [Math.random() * 4, Math.random() * 4];
  const uv = geometry.attributes.uv;

  for (let k = 0; k < position.count; k++) {
    const [x, y, z] = [position.getX(k), position.getY(k), position.getZ(k)];
    // the same point always gets the same push, so the faces stay joined
    const w = wobble(x * 2, y * 2, z * 2);
    const scale = 1 + THREE.MathUtils.clamp(w.x * 0.22, -0.32, 0.32);
    const [px, py, pz] = [x * scale * stretch[0], y * scale * stretch[1], z * scale * stretch[2]];
    position.setXYZ(k, px, py, pz);
    // same texture scale as the letters, which use world units for UVs
    uv.setXY(k, px + offsetU, py + offsetV);
  }
  geometry.computeVertexNormals();
  return geometry;
};

const advanceOf = (char: string) => {
  const glyph = (fontData.glyphs as Record<string, { ha: number }>)[char];
  return glyph ? glyph.ha / fontData.resolution : 0.4;
};

// width / height of a block of text, so its box can be sized before the 3D scene exists
const iceAspect = (lines: string[]) => {
  const width =
    Math.max(
      ...lines.map(
        (line) =>
          Array.from(line).reduce((sum, char) => sum + advanceOf(char) + LETTER_GAP, 0) - LETTER_GAP
      )
    ) + 0.3;
  // a single line also needs room for the comma and for the bevels
  const height = lines.length === 1 ? 1.45 : (lines.length - 1) * LINE_GAP + 1.15;
  return width / height;
};

type IceTitleProps = {
  lines?: string[];
  chips?: number; // how many small ice chips float around the text
  puck?: boolean; // the hockey puck you can knock around
  bleed?: string; // how far the canvas extends past the text's box, as a CSS inset
  fallbackColor?: string; // colour of the plain text shown if WebGL is unavailable
  align?: 'center' | 'left'; // where the text sits when its box is wider than it needs
  aspect?: number; // width / height of the box; worked out from the text if left out
  stroke?: number; // how heavy the letters are: 1 is the bold login look, lower is thinner
  height?: number; // fixed height in px: the box is then exactly as wide as the text needs
  solid?: boolean; // opaque ice that hides the page behind it, instead of clear glass
  bodyOpacity?: number; // how much of the page behind shows through the clear glass
  light?: number; // scales every light and reflection; below 1 is dimmer
};

const IceTitle = ({
  lines = DEFAULT_LINES,
  chips: chipCount = 14,
  puck: showPuck = true,
  bleed = '-55% -32%',
  fallbackColor = 'white',
  align = 'center',
  aspect,
  stroke = 1,
  height,
  solid = false,
  bodyOpacity = 0.36,
  light = 1,
}: IceTitleProps) => {
  const linesKey = lines.join('\n');
  const mountRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const host = hostRef.current;
    if (!mount || !host) return;
    const lineList = linesKey.split('\n');

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;

    const key = new THREE.DirectionalLight(0xffffff, 3 * light);
    key.position.set(-3, 5, 6);
    const glint = new THREE.DirectionalLight(0xffffff, 2.4 * light);
    glint.position.set(5, 2, 4);
    // light from behind makes the bevelled edges glow
    const back = new THREE.DirectionalLight(0xeaf6ff, 5 * light);
    back.position.set(-2, 1, -4);
    scene.add(key, glint, back);

    const roughnessTexture = makeRoughnessTexture();
    const bumpTexture = makeBumpTexture();
    const detailTexture = makeDetailTexture();

    // clear, wet ice: glossy where polished, hazy where frosted
    const material = new THREE.MeshPhysicalMaterial(
      solid
        ? {
            // opaque frosted ice: hides whatever is drawn behind the letters
            color: 0xb2cde4,
            metalness: 0,
            roughness: 1,
            roughnessMap: roughnessTexture,
            bumpMap: bumpTexture,
            bumpScale: 1.5,
            clearcoat: 0.4,
            clearcoatRoughness: 0.25,
            specularIntensity: 0.4,
            envMapIntensity: 0.6 * light,
            // partly see-through, so the ice reads as glassy but still mostly covers what is behind it
            transparent: bodyOpacity < 1,
            opacity: bodyOpacity,
          }
        : {
            color: 0xf2faff,
            metalness: 0,
            roughness: 1, // scaled down by the roughness map, so most of the surface stays glossy
            roughnessMap: roughnessTexture,
            bumpMap: bumpTexture,
            bumpScale: 1.5,
            transmission: 1,
            thickness: 2,
            ior: 1.31,
            attenuationColor: new THREE.Color(0xa9d6f5),
            attenuationDistance: 3,
            specularIntensity: 0.25,
            envMapIntensity: 0.5 * light,
            // alpha from transmission only reaches the page when blending is on
            transparent: true,
            opacity: bodyOpacity,
          }
    );

    // bright layer on top: glossy glints plus cracks and bubbles, added at full strength
    const sheen = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.14,
      metalness: 0,
      bumpMap: bumpTexture,
      bumpScale: 2.2,
      emissive: new THREE.Color(0xdff1ff),
      emissiveMap: detailTexture,
      emissiveIntensity: 0.2 * light,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      envMapIntensity: 1.1 * light,
      transparent: true,
      // add light only: leave the canvas alpha alone so unlit areas stay transparent
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
      depthWrite: false,
    });

    const geometries: THREE.BufferGeometry[] = [];
    type Letter = {
      mesh: THREE.Mesh;
      x: number;
      y: number;
      phase: number;
      speed: number;
      push: THREE.Vector3; // how far the pointer has shoved this letter
      twist: number;
      halfW: number; // size of the box the puck bounces off
      halfH: number;
      halfD: number;
      centerY: number;
    };
    const letters: Letter[] = [];
    const group = new THREE.Group();

    // one mesh per letter so each can move on its own
    lineList.forEach((line, row) => {
      const placed: { char: string; pen: number }[] = [];
      let pen = 0;
      Array.from(line).forEach((char) => {
        placed.push({ char, pen });
        pen += advanceOf(char) + LETTER_GAP;
      });
      const lineWidth = pen - LETTER_GAP;
      const lineY = ((lineList.length - 1) / 2 - row) * LINE_GAP - 0.36;

      placed.forEach(({ char, pen: penX }) => {
        // spaces, and characters the font lacks, just leave a gap
        if (char === ' ' || !(fontData.glyphs as Record<string, unknown>)[char]) return;
        const geometry = makeLetterGeometry(char, stroke);
        // give each letter its own patch of the detail textures
        const uv = geometry.attributes.uv;
        const [offsetU, offsetV] = [Math.random() * 4, Math.random() * 4];
        for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) + offsetU, uv.getY(k) + offsetV);
        geometry.computeBoundingBox();
        const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
        geometry.translate(-center.x, 0, -center.z);
        geometry.computeBoundingBox();
        const bounds = geometry.boundingBox!;
        const mesh = new THREE.Mesh(geometry, material);
        const overlay = new THREE.Mesh(geometry, sheen);
        overlay.renderOrder = 1;
        mesh.add(overlay);
        const x = penX + center.x - lineWidth / 2;
        mesh.position.set(x, lineY, 0);
        group.add(mesh);
        geometries.push(geometry);
        letters.push({
          mesh,
          x,
          y: lineY,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.5,
          push: new THREE.Vector3(),
          twist: 0,
          halfW: (bounds.max.x - bounds.min.x) / 2,
          halfH: (bounds.max.y - bounds.min.y) / 2,
          halfD: (bounds.max.z - bounds.min.z) / 2,
          centerY: (bounds.max.y + bounds.min.y) / 2,
        });
      });
    });
    scene.add(group);

    const textSize = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());

    // small chips of the same ice drifting around the title
    type Chunk = {
      mesh: THREE.Mesh;
      fx: number; // how far out the orbit reaches, as a share of the room around the text
      fy: number;
      cz: number;
      speed: number;
      phase: number;
      spin: THREE.Vector3;
    };
    const room = { x: 2, y: 2 }; // free space around the text, in scene units
    const chunkGroup = new THREE.Group();
    const chunks: Chunk[] = Array.from({ length: chipCount }, () => {
      const geometry = makeChunkGeometry(Math.pow(Math.random(), 1.5) * 0.07 + 0.03);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      const overlay = new THREE.Mesh(geometry, sheen);
      overlay.renderOrder = 1;
      mesh.add(overlay);
      chunkGroup.add(mesh);
      return {
        mesh,
        fx: rand(-0.1, 0.95),
        fy: rand(0, 0.95),
        cz: rand(-1.6, 1.2),
        speed: rand(0.018, 0.045) * (Math.random() < 0.5 ? -1 : 1),
        phase: rand(0, Math.PI * 2),
        spin: new THREE.Vector3(rand(-0.15, 0.15), rand(-0.2, 0.2), rand(-0.12, 0.12)),
      };
    });
    scene.add(chunkGroup);

    // one hockey puck that drifts like the chips but gets knocked away from the pointer
    const PUCK_RADIUS = 0.45;
    const PUCK_HALF = 0.125;
    // a plain cylinder: square, sharp edges with no bevel
    const puckGeometry = new THREE.CylinderGeometry(PUCK_RADIUS, PUCK_RADIUS, PUCK_HALF * 2, 72);
    const puckMaterial = new THREE.MeshStandardMaterial({
      color: 0x14171c,
      roughness: 0.85,
      metalness: 0,
      envMapIntensity: 0.6,
    });
    const happyTexture = makeFaceTexture('happy');
    const angryTexture = makeFaceTexture('angry');
    const faceMaterial = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0, envMapIntensity: 0.6 });
    const happyMaterial = faceMaterial(happyTexture);
    const angryMaterial = faceMaterial(angryTexture);
    // cylinder groups are: side, top, bottom
    const puckMesh = new THREE.Mesh(puckGeometry, [puckMaterial, happyMaterial, angryMaterial]);
    // the flip group turns the puck over about the vertical axis, showing each face in turn
    const puckFlip = new THREE.Group();
    puckFlip.add(puckMesh);
    const puckGroup = new THREE.Group();
    puckGroup.add(puckFlip);
    scene.add(puckGroup);
    puckGroup.visible = showPuck;

    const puck = {
      rx: textSize.x * 0.5 + 0.5,
      ry: textSize.y * 0.5 + 0.65,
      cz: 0,
      speed: 0.03,
      phase: rand(0, Math.PI * 2),
      offset: new THREE.Vector3(), // how far it has been knocked from its orbit
      velocity: new THREE.Vector3(),
      spin: new THREE.Vector3(),
      spinVelocity: new THREE.Vector3(),
      last: 0,
    };

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

    // the canvas is larger than the title's own box so the chunks have room to circle it
    const resize = () => {
      const hostW = Math.max(host.clientWidth, 1);
      const hostH = Math.max(host.clientHeight, 1);
      renderer.setSize(hostW, hostH, false);
      camera.aspect = hostW / hostH;
      const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      // choose the distance so the title itself fills its own box
      const pxPerUnit =
        Math.min(mount.clientWidth / textSize.x, mount.clientHeight / textSize.y) * 0.98;
      camera.position.set(0, 0, hostH / pxPerUnit / (2 * halfTan) + textSize.z);
      // slide the view so the text hugs the left edge of its box instead of the middle
      camera.position.x =
        align === 'left' ? Math.max(mount.clientWidth / 2 / pxPerUnit - textSize.x / 2, 0) : 0;
      room.x = Math.max((hostW - mount.clientWidth) / 2 / pxPerUnit, 0.3);
      room.y = Math.max((hostH - mount.clientHeight) / 2 / pxPerUnit, 0.3);
      camera.updateProjectionMatrix();
    };

    // pointer, as a point on the plane the title sits in
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    let pointerOver = false;

    const onPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      pointerOver = true;
    };
    const onLeave = () => {
      pointerOver = false;
    };

    // letters sway on their own phase and slide out of the way of the pointer
    const REACH = 0.85;
    const PUCK_REACH = 1.3;
    const MAX_KNOCK = 2.2;
    const PUCK_COLLIDE = 0.52; // how close the puck's centre may get to a letter's box
    const pose = (t: number, easePush: boolean) => {
      let pointer: THREE.Vector3 | null = null;
      if (easePush && pointerOver) {
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(plane, hit)) pointer = hit;
      }

      letters.forEach((letter) => {
        const { mesh, x, y, phase, speed, push } = letter;
        const a = t * speed + phase;

        // where this letter wants to be pushed to, away from the pointer
        let targetX = 0;
        let targetY = 0;
        let targetZ = 0;
        let targetTwist = 0;
        if (pointer) {
          const dx = x - pointer.x;
          const dy = y + 0.36 - pointer.y;
          const distance = Math.hypot(dx, dy) || 0.001;
          if (distance < REACH) {
            const strength = Math.pow(1 - distance / REACH, 1.2);
            targetX = (dx / distance) * strength * 0.5;
            targetY = (dy / distance) * strength * 0.5;
            targetZ = -strength * 0.55;
            targetTwist = (dx / distance) * strength * 0.3;
          }
        }
        push.x += (targetX - push.x) * 0.12;
        push.y += (targetY - push.y) * 0.12;
        push.z += (targetZ - push.z) * 0.12;
        letter.twist += (targetTwist - letter.twist) * 0.12;

        mesh.position.x = x + Math.sin(a * 0.7 + 1.3) * 0.02 + push.x;
        mesh.position.y = y + Math.sin(a) * 0.1 + push.y;
        mesh.position.z = Math.sin(a * 0.6 + 2) * 0.08 + push.z;
        mesh.rotation.x = Math.sin(a * 0.8 + 0.5) * 0.12;
        mesh.rotation.y = Math.sin(a * 0.55) * 0.16 + letter.twist;
        mesh.rotation.z = Math.sin(a * 0.9 + 2.2) * 0.05 - letter.twist * 0.6;
      });

      if (showPuck) {
        // puck: same drift as the chips, plus a springy shove away from the pointer
        const dt = Math.min(Math.max(t - puck.last, 0), 0.05);
        puck.last = t;
        const puckAngle = puck.phase + t * puck.speed;
        // a rounded-rectangle path that hugs the outside of the title
        const [c, sn] = [Math.cos(puckAngle), Math.sin(puckAngle)];
        const baseX = Math.sign(c) * Math.sqrt(Math.abs(c)) * puck.rx;
        const baseY =
          Math.sign(sn) * Math.sqrt(Math.abs(sn)) * puck.ry + Math.sin(t * 0.3 + puck.phase) * 0.08;
        // drifts in front of and behind the title, like the chips
        const baseZ = puck.cz + Math.sin(puckAngle * 2) * 1.3;

        if (easePush) {
          const current = new THREE.Vector3(baseX, baseY, baseZ).add(puck.offset);
          const accel = new THREE.Vector3();
          if (pointerOver) {
            raycaster.setFromCamera(ndc, camera);
            const puckPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -current.z);
            const point = new THREE.Vector3();
            if (raycaster.ray.intersectPlane(puckPlane, point)) {
              const dx = current.x - point.x;
              const dy = current.y - point.y;
              const distance = Math.hypot(dx, dy) || 0.001;
              if (distance < PUCK_REACH) {
                const strength = 1 - distance / PUCK_REACH;
                accel.set((dx / distance) * strength * 34, (dy / distance) * strength * 34, 0);
                // knocked spinning, in the direction it was hit from
                puck.spinVelocity.x += (dy / distance) * strength * 14 * dt * 6;
                puck.spinVelocity.y += (dx / distance) * strength * 14 * dt * 6;
              }
            }
          }
          // underdamped spring back to its orbit, so it overshoots and bounces
          puck.velocity.addScaledVector(accel, dt);
          puck.velocity.addScaledVector(puck.offset, -3.6 * dt);
          puck.velocity.multiplyScalar(Math.max(0, 1 - 1.3 * dt));
          if (puck.velocity.length() > 4.5) puck.velocity.setLength(4.5);
          puck.offset.addScaledVector(puck.velocity, dt);
          // bounces off an invisible wall instead of flying away
          if (puck.offset.length() > MAX_KNOCK) {
            puck.offset.setLength(MAX_KNOCK);
            puck.velocity.multiplyScalar(-0.45);
          }

          // the letters are solid: the puck can pass in front of or behind them, but not through
          letters.forEach(({ mesh, halfW, halfH, halfD, centerY }) => {
            const px = baseX + puck.offset.x;
            const py = baseY + puck.offset.y;
            const pz = baseZ + puck.offset.z;
            const lx = mesh.position.x;
            const ly = mesh.position.y + centerY;
            const lz = mesh.position.z;
            const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
            let nx = px - clamp(px, lx - halfW, lx + halfW);
            let ny = py - clamp(py, ly - halfH, ly + halfH);
            let nz = pz - clamp(pz, lz - halfD, lz + halfD);
            const distance = Math.hypot(nx, ny, nz);
            let depth = PUCK_COLLIDE - distance;
            if (depth <= 0) return;

            if (distance < 0.0001) {
              // centre is inside the box: leave by the nearest face
              const exits = [
                { x: -1, y: 0, z: 0, d: px - (lx - halfW) },
                { x: 1, y: 0, z: 0, d: lx + halfW - px },
                { x: 0, y: -1, z: 0, d: py - (ly - halfH) },
                { x: 0, y: 1, z: 0, d: ly + halfH - py },
                { x: 0, y: 0, z: -1, d: pz - (lz - halfD) },
                { x: 0, y: 0, z: 1, d: lz + halfD - pz },
              ].sort((a, b) => a.d - b.d)[0];
              [nx, ny, nz] = [exits.x, exits.y, exits.z];
              depth = exits.d + PUCK_COLLIDE;
            } else {
              nx /= distance;
              ny /= distance;
              nz /= distance;
            }
            puck.offset.x += nx * depth;
            puck.offset.y += ny * depth;
            puck.offset.z += nz * depth;
            const into = puck.velocity.x * nx + puck.velocity.y * ny + puck.velocity.z * nz;
            if (into < 0) {
              puck.velocity.x -= (1 + 0.55) * into * nx;
              puck.velocity.y -= (1 + 0.55) * into * ny;
              puck.velocity.z -= (1 + 0.55) * into * nz;
              // clipped a letter: give it a little spin
              puck.spinVelocity.z += (nx - ny) * -into * 0.6;
            }
          });

          puck.spin.addScaledVector(puck.spinVelocity, dt);
          puck.spinVelocity.multiplyScalar(Math.max(0, 1 - 1.3 * dt));
          puck.spin.multiplyScalar(Math.max(0, 1 - 0.35 * dt));
        }
        puckGroup.position.set(baseX, baseY, baseZ).add(puck.offset);
        // faces the viewer, slowly turning over so the smile and the scowl each get a turn
        // no spin about its own axis, so the faces stay upright
        puckMesh.rotation.set(
          Math.PI / 2 - 0.2 + Math.sin(t * 0.25 + puck.phase) * 0.25,
          0,
          Math.sin(t * 0.2 + puck.phase) * 0.12
        );
        puckFlip.rotation.set(puck.spin.x, t * 0.35 + puck.spin.y, puck.spin.z);
      }

      chunks.forEach(({ mesh, fx, fy, cz, speed, phase, spin }) => {
        const angle = phase + t * speed;
        const rx = textSize.x * 0.5 + fx * room.x;
        const ry = textSize.y * 0.5 + fy * room.y;
        mesh.position.set(
          Math.cos(angle) * rx,
          Math.sin(angle) * ry + Math.sin(t * 0.3 + phase) * 0.12,
          cz + Math.sin(angle * 2) * 0.7
        );
        mesh.rotation.set(spin.x * t + phase, spin.y * t, spin.z * t);
      });
    };

    let frame = 0;
    const clock = new THREE.Clock();
    const render = () => {
      pose(clock.getElapsedTime(), true);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) renderer.render(scene, camera);
    });
    observer.observe(mount);
    resize();

    if (reduceMotion) {
      pose(0, false);
      renderer.render(scene, camera);
    } else {
      window.addEventListener('pointermove', onPointer);
      document.documentElement.addEventListener('pointerleave', onLeave);
      frame = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      observer.disconnect();
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
      puckGeometry.dispose();
      puckMaterial.dispose();
      happyMaterial.dispose();
      angryMaterial.dispose();
      happyTexture.dispose();
      angryTexture.dispose();
      sheen.dispose();
      detailTexture.dispose();
      roughnessTexture.dispose();
      bumpTexture.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [linesKey, chipCount, showPuck, align, stroke, solid, bodyOpacity, light]);

  const boxAspect = aspect ?? (linesKey === DEFAULT_LINES.join('\n') ? 1.7 : iceAspect(lines));

  if (failed) {
    return (
      <Text
        fontFamily="heading"
        fontWeight="bold"
        fontSize="48px"
        lineHeight="1"
        color={fallbackColor}
      >
        {lines.join(' ')}
      </Text>
    );
  }

  return (
    <Box
      ref={mountRef}
      role="img"
      aria-label={lines.join(' ')}
      w={height ? `${Math.round(boxAspect * height)}px` : 'full'}
      maxW="100%"
      aspectRatio={boxAspect}
      position="relative"
    >
      {/* larger than the title so the ice chunks can drift around it */}
      <Box ref={hostRef} position="absolute" inset={bleed} pointerEvents="none" />
    </Box>
  );
};

export default IceTitle;
