import { Box, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const font = new FontLoader().parse(fontData as unknown as Parameters<FontLoader['parse']>[0]);

const LINES = ['HOCKEY', 'POCKEY'];
const FOV = 32;
const LINE_GAP = 1.3;
const LETTER_GAP = 0.27;

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
const makeLetterGeometry = (char: string) => {
  const wobble = makeWobble();

  const uneven = (path: THREE.Path, count: number) =>
    path.getSpacedPoints(count).map((point) => {
      const w = wobble(point.x, point.y, 0);
      return new THREE.Vector2(point.x + w.x * 0.018, point.y + w.y * 0.018);
    });

  const shapes = font.generateShapes(char, 1).map((shape) => {
    const outline = new THREE.Shape(uneven(shape, 260));
    outline.holes = shape.holes.map((hole) => new THREE.Path(uneven(hole, 140)));
    return outline;
  });

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.22 + Math.random() * 0.16,
    bevelEnabled: true,
    bevelThickness: 0.15 + Math.random() * 0.2,
    bevelSize: 0.06 + Math.random() * 0.11,
    bevelOffset: 0,
    bevelSegments: 12,
    curveSegments: 12,
  });

  // push every vertex around so bevels vary in width and the faces are lumpy
  const position = geometry.attributes.position;
  for (let k = 0; k < position.count; k++) {
    const [x, y, z] = [position.getX(k), position.getY(k), position.getZ(k)];
    const w = wobble(x * 1.3, y * 1.3, z * 1.3);
    position.setXYZ(k, x + w.x * 0.035, y + w.y * 0.035, z + w.z * 0.07);
  }
  geometry.computeVertexNormals();
  return geometry;
};

const IceTitle = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;

    const key = new THREE.DirectionalLight(0xffffff, 5);
    key.position.set(-3, 5, 6);
    const glint = new THREE.DirectionalLight(0xffffff, 4);
    glint.position.set(5, 2, 4);
    // light from behind makes the bevelled edges glow
    const back = new THREE.DirectionalLight(0xeaf6ff, 8);
    back.position.set(-2, 1, -4);
    scene.add(key, glint, back);

    const roughnessTexture = makeRoughnessTexture();
    const bumpTexture = makeBumpTexture();
    const detailTexture = makeDetailTexture();

    // clear, wet ice: glossy where polished, hazy where frosted
    const material = new THREE.MeshPhysicalMaterial({
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
      envMapIntensity: 0.5,
      // alpha from transmission only reaches the page when blending is on
      transparent: true,
      opacity: 0.36,
    });

    // bright layer on top: glossy glints plus cracks and bubbles, added at full strength
    const sheen = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.14,
      metalness: 0,
      bumpMap: bumpTexture,
      bumpScale: 2.2,
      emissive: new THREE.Color(0xdff1ff),
      emissiveMap: detailTexture,
      emissiveIntensity: 0.38,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      envMapIntensity: 2,
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

    const glyphScale = 1 / fontData.resolution;
    const geometries: THREE.ExtrudeGeometry[] = [];
    type Letter = { mesh: THREE.Mesh; x: number; y: number; phase: number; speed: number };
    const letters: Letter[] = [];
    const group = new THREE.Group();

    // one mesh per letter so each can move on its own
    LINES.forEach((line, row) => {
      const placed: { char: string; pen: number }[] = [];
      let pen = 0;
      Array.from(line).forEach((char) => {
        placed.push({ char, pen });
        pen +=
          ((fontData.glyphs as Record<string, { ha: number }>)[char]?.ha ?? 0) * glyphScale +
          LETTER_GAP;
      });
      const lineWidth = pen - LETTER_GAP;
      const lineY = (row === 0 ? 1 : -1) * (LINE_GAP / 2) - 0.36;

      placed.forEach(({ char, pen: penX }) => {
        const geometry = makeLetterGeometry(char);
        // give each letter its own patch of the detail textures
        const uv = geometry.attributes.uv;
        const [offsetU, offsetV] = [Math.random() * 4, Math.random() * 4];
        for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) + offsetU, uv.getY(k) + offsetV);
        geometry.computeBoundingBox();
        const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
        geometry.translate(-center.x, 0, -center.z);
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
        });
      });
    });
    scene.add(group);

    const textSize = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const heightPx = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, heightPx, false);
      camera.aspect = width / heightPx;
      const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      const fitHeight = textSize.y / 2 / halfTan;
      const fitWidth = textSize.x / 2 / camera.aspect / halfTan;
      camera.position.set(0, 0, Math.max(fitHeight, fitWidth) * 0.98 + textSize.z);
      camera.updateProjectionMatrix();
    };

    // each letter bobs and sways on its own phase; the pointer is ignored
    const pose = (t: number) => {
      letters.forEach(({ mesh, x, y, phase, speed }) => {
        const a = t * speed + phase;
        mesh.position.x = x + Math.sin(a * 0.7 + 1.3) * 0.02;
        mesh.position.y = y + Math.sin(a) * 0.1;
        mesh.position.z = Math.sin(a * 0.6 + 2) * 0.08;
        mesh.rotation.x = Math.sin(a * 0.8 + 0.5) * 0.12;
        mesh.rotation.y = Math.sin(a * 0.55) * 0.16;
        mesh.rotation.z = Math.sin(a * 0.9 + 2.2) * 0.05;
      });
    };

    let frame = 0;
    const clock = new THREE.Clock();
    const render = () => {
      pose(clock.getElapsedTime());
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
      pose(0);
      renderer.render(scene, camera);
    } else {
      frame = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
      sheen.dispose();
      detailTexture.dispose();
      roughnessTexture.dispose();
      bumpTexture.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  if (failed) {
    return (
      <Text fontFamily="heading" fontWeight="bold" fontSize="48px" lineHeight="1" color="white">
        Hockey Pockey
      </Text>
    );
  }

  return <Box ref={mountRef} role="img" aria-label="Hockey Pockey" w="full" aspectRatio="1.7" />;
};

export default IceTitle;
