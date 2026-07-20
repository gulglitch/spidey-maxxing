import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Edges, Line } from '@react-three/drei';
import * as THREE from 'three';
import './GameplayCanyonScene.css';

// Call shootWeb(origin, direction) from your MediaPipe hand-tracking code
// whenever the player triggers a web shot. `origin` should be the hand's
// world-space position and `direction` the aim vector; everything else
// (raycasting against buildings, drawing/fading the strand) is handled here.
export interface GameplayCanyonHandle {
  shootWeb: (origin: THREE.Vector3, direction: THREE.Vector3) => boolean;
}

interface BuildingDef {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  edgeColor: string;
}

// Rough canyon layout: near buildings left/right, farther buildings
// further back and taller, one distant building dead ahead. Positions are
// arbitrary world units — tune them against your actual webcam FOV so the
// silhouettes line up with where you want webs to be able to land.
const BUILDINGS: BuildingDef[] = [
  { id: 'left-near', position: [-9, 6, -4], size: [10, 30, 10], rotationY: 0.15, edgeColor: '#5ac8ff' },
  { id: 'left-far', position: [-16, 8, -18], size: [8, 34, 8], rotationY: 0.05, edgeColor: '#5ac8ff' },
  { id: 'right-near', position: [9, 6, -4], size: [10, 30, 10], rotationY: -0.15, edgeColor: '#ff4650' },
  { id: 'right-far', position: [16, 8, -18], size: [8, 34, 8], rotationY: -0.05, edgeColor: '#ff4650' },
  { id: 'back', position: [0, 14, -30], size: [12, 40, 8], rotationY: 0, edgeColor: '#ff4650' },
];

const WEB_LIFETIME_MS = 900;
const STRAND_PRUNE_INTERVAL_MS = 120;

interface WebStrand {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  createdAt: number;
}

function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.error('Could not access webcam:', err);
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return <video ref={videoRef} className="canyon-webcam-video" autoPlay playsInline muted />;
}

function CameraCapture({
  cameraRef,
}: {
  cameraRef: MutableRefObject<THREE.PerspectiveCamera | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    cameraRef.current = camera as THREE.PerspectiveCamera;
  }, [camera, cameraRef]);

  return null;
}

function Buildings({ groupRef }: { groupRef: MutableRefObject<THREE.Group | null> }) {
  return (
    <group ref={groupRef}>
      {BUILDINGS.map((b) => (
        <mesh key={b.id} position={b.position} rotation={[0, b.rotationY, 0]}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color="#0a0b10" roughness={0.9} metalness={0.1} />
          <Edges scale={1.001} color={b.edgeColor} />
        </mesh>
      ))}
    </group>
  );
}

function WebStrands({ strands }: { strands: WebStrand[] }) {
  return (
    <>
      {strands.map((s) => {
        const age = performance.now() - s.createdAt;
        const life = Math.max(0, 1 - age / WEB_LIFETIME_MS);
        return (
          <Line
            key={s.id}
            points={[s.start, s.end]}
            color="#ff4650"
            lineWidth={2}
            transparent
            opacity={life}
          />
        );
      })}
    </>
  );
}

export const GameplayCanyonScene = forwardRef<GameplayCanyonHandle>((_props, ref) => {
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [strands, setStrands] = useState<WebStrand[]>([]);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const shootWeb = useCallback(
    (origin: THREE.Vector3, direction: THREE.Vector3): boolean => {
      if (!buildingsGroupRef.current) return false;

      raycaster.set(origin, direction.clone().normalize());
      const hits = raycaster.intersectObjects(buildingsGroupRef.current.children, true);

      if (hits.length === 0) return false;

      const hitPoint = hits[0].point;
      setStrands((prev) => [
        ...prev,
        {
          id: `web-${performance.now()}-${Math.random().toString(36).slice(2, 7)}`,
          start: origin.clone(),
          end: hitPoint.clone(),
          createdAt: performance.now(),
        },
      ]);
      return true;
    },
    [raycaster]
  );

  useImperativeHandle(ref, () => ({ shootWeb }), [shootWeb]);

  // Fade + remove expired strands. Runs on an interval rather than every
  // R3F frame — plenty smooth for a ~1s fade and avoids re-rendering the
  // whole strand list 60x/second.
  useEffect(() => {
    const interval = setInterval(() => {
      setStrands((prev) => prev.filter((s) => performance.now() - s.createdAt < WEB_LIFETIME_MS));
    }, STRAND_PRUNE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Demo trigger only: click/tap fires a web from the camera position
  // toward wherever you clicked. Replace this handler with a call to
  // shootWeb(handWorldPosition, aimDirection) from your MediaPipe pipeline.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const camera = cameraRef.current;
    if (!camera) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const demoRaycaster = new THREE.Raycaster();
    demoRaycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    shootWeb(camera.position.clone(), demoRaycaster.ray.direction.clone());
  };

  return (
    <div className="canyon-gameplay-stage" onPointerDown={handlePointerDown}>
      <VideoBackground />
      <Canvas
        className="canyon-gameplay-canvas"
        gl={{ alpha: true }}
        camera={{ position: [0, 4, 14], fov: 60 }}
      >
        <CameraCapture cameraRef={cameraRef} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 10, 10]} intensity={0.6} />
        <Buildings groupRef={buildingsGroupRef} />
        <WebStrands strands={strands} />
      </Canvas>
    </div>
  );
});

GameplayCanyonScene.displayName = 'GameplayCanyonScene';
