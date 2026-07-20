import { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { AdvancedWebShooter } from './AdvancedWebShooter';
import type { HandData, GestureResult } from '../types';
import './CityScene.css';

interface CitySceneProps {
  handData: HandData | null;
  gestureResult: GestureResult | null;
}

// ─── Building definition ────────────────────────────────────────────────────
interface BuildingDef {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  seed: number;
}

// ─── Seeded pseudo-random ────────────────────────────────────────────────────
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Window texture factory ──────────────────────────────────────────────────
function makeWindowTexture(
  cols: number,
  rows: number,
  seed: number,
  accentColor: 'red' | 'blue'
): THREE.CanvasTexture {
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRand(seed);

  // Building face base
  ctx.fillStyle = '#080910';
  ctx.fillRect(0, 0, W, H);

  // Subtle concrete panel lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let r = 0; r <= rows; r++) {
    const y = (H / rows) * r;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    const x = (W / cols) * c;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }

  const winW = (W / cols) * 0.6;
  const winH = (H / rows) * 0.55;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (W / cols) * (c + 0.5) - winW / 2;
      const cy = (H / rows) * (r + 0.5) - winH / 2;
      const v = rand();

      if (v < 0.06) {
        // Bright red window
        ctx.fillStyle = 'rgba(231,32,32,0.95)';
        ctx.fillRect(cx, cy, winW, winH);
        const g = ctx.createRadialGradient(cx + winW/2, cy + winH/2, 0, cx + winW/2, cy + winH/2, winW);
        g.addColorStop(0, 'rgba(255,80,80,0.7)');
        g.addColorStop(1, 'rgba(231,32,32,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - winW*0.5, cy - winH*0.5, winW * 2, winH * 2);
      } else if (v < 0.13) {
        // Dim red
        ctx.fillStyle = 'rgba(154,19,22,0.7)';
        ctx.fillRect(cx, cy, winW, winH);
      } else if (v < 0.19) {
        // Blue window
        ctx.fillStyle = 'rgba(79,103,147,0.9)';
        ctx.fillRect(cx, cy, winW, winH);
        const g = ctx.createRadialGradient(cx + winW/2, cy + winH/2, 0, cx + winW/2, cy + winH/2, winW);
        g.addColorStop(0, 'rgba(100,150,255,0.6)');
        g.addColorStop(1, 'rgba(79,103,147,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - winW*0.5, cy - winH*0.5, winW * 2, winH * 2);
      } else if (v < 0.24) {
        // Warm orange (rare)
        ctx.fillStyle = 'rgba(255,160,60,0.5)';
        ctx.fillRect(cx, cy, winW, winH);
      } else {
        // Dark / off
        ctx.fillStyle = 'rgba(15,16,22,0.9)';
        ctx.fillRect(cx, cy, winW, winH);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx, cy, winW, winH);
      }
    }
  }

  // Top roof accent line
  const roofColor = accentColor === 'red' ? 'rgba(231,32,32,0.9)' : 'rgba(79,103,147,0.9)';
  ctx.fillStyle = roofColor;
  ctx.fillRect(0, 0, W, 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// ─── Single building mesh ────────────────────────────────────────────────────
function Building({ position, width, height, depth, seed }: BuildingDef) {
  const rand = seededRand(seed);
  const accentColor = rand() > 0.5 ? 'red' : 'blue';
  const cols = Math.floor(rand() * 3) + 3;  // 3–5 window cols
  const rows = Math.max(4, Math.floor(height * 0.8)); // proportional rows

  const texture = useMemo(
    () => makeWindowTexture(cols, rows, seed, accentColor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed]
  );

  const emissiveColor = accentColor === 'red' ? '#E72020' : '#4F6793';
  const emissiveIntensity = 0.08 + (seed % 7) * 0.015;

  return (
    <mesh
      position={position}
      castShadow
      receiveShadow
      userData={{ type: 'building' }}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        map={texture}
        color="#0a0b10"
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.85}
        metalness={0.15}
      />
    </mesh>
  );
}

// ─── Building layout ─────────────────────────────────────────────────────────
// Camera is at y=0, z=18, looking slightly upward.
// Buildings surround the viewport edges. Their faces are at x=±14, z=-5,
// and a back wall at z=-25. Top buildings sit at y=+12.
// Heights vary so skylines are jagged.

const LEFT_BUILDINGS: BuildingDef[] = [
  { position: [-15.5, -2,  -2], width: 3, height: 38, depth: 10, seed: 1  },
  { position: [-15,   -4,  -12], width: 3.5, height: 30, depth: 10, seed: 2  },
  { position: [-14.5, -1,   6], width: 2.5, height: 44, depth: 8,  seed: 3  },
  { position: [-16,   -6, -20], width: 4,   height: 26, depth: 8,  seed: 4  },
  { position: [-15,   0,   14], width: 3,   height: 36, depth: 10, seed: 5  },
];

const RIGHT_BUILDINGS: BuildingDef[] = [
  { position: [15.5,  -3,  -2], width: 3,   height: 40, depth: 10, seed: 11 },
  { position: [15,    -5, -12], width: 3.5, height: 28, depth: 10, seed: 12 },
  { position: [14.5,  -1,   6], width: 2.5, height: 46, depth: 8,  seed: 13 },
  { position: [16,    -4, -20], width: 4,   height: 32, depth: 8,  seed: 14 },
  { position: [15,    -2,  14], width: 3,   height: 38, depth: 10, seed: 15 },
];

const BACK_BUILDINGS: BuildingDef[] = [
  { position: [-10,  -3, -26], width: 8,  height: 34, depth: 4, seed: 21 },
  { position: [ -2,  -1, -27], width: 7,  height: 42, depth: 4, seed: 22 },
  { position: [  6,  -4, -26], width: 9,  height: 28, depth: 4, seed: 23 },
  { position: [ 13,  -2, -25], width: 6,  height: 38, depth: 4, seed: 24 },
  { position: [-18,  -5, -24], width: 5,  height: 22, depth: 4, seed: 25 },
];

const TOP_BUILDINGS: BuildingDef[] = [
  { position: [-12,  14,  -8], width: 7, height: 10, depth: 8, seed: 31 },
  { position: [  0,  15,  -6], width: 8, height: 8,  depth: 8, seed: 32 },
  { position: [ 12,  14, -10], width: 7, height: 12, depth: 8, seed: 33 },
  { position: [-18,  13, -14], width: 5, height: 8,  depth: 6, seed: 34 },
  { position: [ 18,  13,  -8], width: 5, height: 10, depth: 6, seed: 35 },
];

const BOTTOM_BUILDINGS: BuildingDef[] = [
  { position: [-10, -16,  -8], width: 8, height: 8,  depth: 6, seed: 41 },
  { position: [  0, -16,  -6], width: 9, height: 10, depth: 6, seed: 42 },
  { position: [ 10, -16,  -8], width: 7, height: 8,  depth: 6, seed: 43 },
  { position: [-17, -15, -12], width: 5, height: 6,  depth: 6, seed: 44 },
  { position: [ 17, -15,  -6], width: 5, height: 8,  depth: 6, seed: 45 },
];

// ─── Window point lights ─────────────────────────────────────────────────────
// Sparse lights to cast red/blue glow onto the scene without tanking perf.
const WINDOW_LIGHTS = [
  { pos: [-14, 4,  -2] as [number,number,number],  color: '#E72020', intensity: 1.2, distance: 10 },
  { pos: [ 14, 6,  -2] as [number,number,number],  color: '#4F6793', intensity: 1.0, distance: 10 },
  { pos: [-14, -2, -12] as [number,number,number], color: '#9A1316', intensity: 0.8, distance: 8  },
  { pos: [ 14, 2,  -12] as [number,number,number], color: '#4F6793', intensity: 0.8, distance: 8  },
  { pos: [  0, 2,  -26] as [number,number,number], color: '#E72020', intensity: 0.6, distance: 12 },
  { pos: [-10, 10,  -8] as [number,number,number], color: '#E72020', intensity: 0.5, distance: 8  },
  { pos: [ 10, 10,  -8] as [number,number,number], color: '#4F6793', intensity: 0.5, distance: 8  },
];

// ─── All buildings in one group ───────────────────────────────────────────────
function CityBuildings() {
  const all = [
    ...LEFT_BUILDINGS,
    ...RIGHT_BUILDINGS,
    ...BACK_BUILDINGS,
    ...TOP_BUILDINGS,
    ...BOTTOM_BUILDINGS,
  ];

  return (
    <group>
      {all.map((b) => (
        <Building key={b.seed} {...b} />
      ))}

      {/* Window glow lights */}
      {WINDOW_LIGHTS.map((l, i) => (
        <pointLight
          key={i}
          position={l.pos}
          color={l.color}
          intensity={l.intensity}
          distance={l.distance}
          decay={2}
        />
      ))}
    </group>
  );
}

// ─── Main exported scene ──────────────────────────────────────────────────────
export const CityScene = ({ handData, gestureResult }: CitySceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="city-scene-container">
      <Canvas
        ref={canvasRef}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        shadows
        dpr={[1, 1.5]}
      >
        {/* Street-level camera, tilted slightly upward */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 18]}
          rotation={[-0.12, 0, 0]}
          fov={75}
          near={0.1}
          far={200}
        />

        {/* Ambient — keep dark so buildings feel moody */}
        <ambientLight intensity={0.15} />

        {/* Key light from above/front — slight red tint */}
        <directionalLight
          position={[0, 20, 10]}
          intensity={0.4}
          color="#ff9999"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Subtle sky fill — deep blue */}
        <hemisphereLight args={['#0a1020', '#000000', 0.2]} />

        {/* Atmospheric fog — starts far so buildings are crisp, fades back wall */}
        <fog attach="fog" args={['#00000000', 30, 80]} />

        <Physics gravity={[0, -9.81, 0]}>
          <CityBuildings />
          <AdvancedWebShooter handData={handData} gestureResult={gestureResult} />
        </Physics>
      </Canvas>
    </div>
  );
};
