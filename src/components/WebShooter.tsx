import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SpiderWeb } from './SpiderWeb';
import type { HandData, GestureResult } from '../types';
import { landmarkTo3D, calculateVelocity, getShootDirection } from '../utils/coordinateTransform';


interface WebShooterProps {
  handData: HandData | null;
  gestureResult: GestureResult | null;
}

interface WebProjectile {
  id: number;
  startPosition: Vector3;
  currentPosition: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
}

export const WebShooter = ({ handData, gestureResult }: WebShooterProps) => {
  const [webs, setWebs] = useState<WebProjectile[]>([]);
  const [handPosition3D, setHandPosition3D] = useState<[number, number, number]>([0, 0, 0]);
  const previousHandPos = useRef<[number, number, number]>([0, 0, 0]);
  const wasGestureActive = useRef(false);
  const webIdCounter = useRef(0);

  // Debug logging
  useEffect(() => {
    console.log('WebShooter received handData:', handData);
    console.log('WebShooter received gestureResult:', gestureResult);
  }, [handData, gestureResult]);

  // Update hand position
  useEffect(() => {
    if (handData) {
      // Use wrist position (landmark 0)
      const wrist = handData.landmarks[0];
      const pos3D = landmarkTo3D(wrist, 20);
      console.log('Hand position updated:', pos3D);
      setHandPosition3D(pos3D);
      previousHandPos.current = pos3D;
    }
  }, [handData]);

  // Shoot web when gesture is activated
  useEffect(() => {
    if (gestureResult?.isWebShooter && !wasGestureActive.current && handData) {
      // Gesture just activated - shoot web!
      shootWeb();
    }
    wasGestureActive.current = gestureResult?.isWebShooter || false;
  }, [gestureResult?.isWebShooter, handData]);

  const shootWeb = () => {
    const velocity = calculateVelocity(
      handPosition3D,
      previousHandPos.current,
      0.016
    );

    const direction = getShootDirection(handPosition3D, velocity);
    const speed = 50; // Web shooting speed

    const newWeb: WebProjectile = {
      id: webIdCounter.current++,
      startPosition: new Vector3(...handPosition3D),
      currentPosition: new Vector3(...handPosition3D),
      velocity: new Vector3(
        direction[0] * speed,
        direction[1] * speed,
        direction[2] * speed
      ),
      life: 0,
      maxLife: 3.0 // 3 seconds lifetime
    };

    setWebs((prev) => [...prev, newWeb]);

    // Play sound effect (we'll add this later)
    console.log('🕸️ THWIP!');
  };

  // Animate webs
  useFrame((state, delta) => {
    setWebs((currentWebs) => {
      return currentWebs
        .map((web) => {
          // Apply gravity
          web.velocity.y -= 9.8 * delta;

          // Update position
          web.currentPosition.x += web.velocity.x * delta;
          web.currentPosition.y += web.velocity.y * delta;
          web.currentPosition.z += web.velocity.z * delta;

          // Update life
          web.life += delta;

          return web;
        })
        .filter((web) => web.life < web.maxLife); // Remove old webs
    });
  });

  return (
    <group>
      {/* Hand position indicator */}
      {handData && (
        <mesh position={handPosition3D}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={gestureResult?.isWebShooter ? '#00ff00' : '#ff0000'}
            emissive={gestureResult?.isWebShooter ? '#00ff00' : '#ff0000'}
            emissiveIntensity={1}
            toneMapped={false}
          />
          {/* Glow effect */}
          <pointLight
            intensity={2}
            distance={5}
            color={gestureResult?.isWebShooter ? '#00ff00' : '#ff0000'}
          />
        </mesh>
      )}

      {/* Render converging-and-bursting web strands */}
      {webs.map((web) => {
        const opacity = 1 - web.life / web.maxLife;

        return (
          <SpiderWeb
            key={web.id}
            start={web.startPosition}
            end={web.currentPosition}
            opacity={opacity}
            strands={18}
          />
        );
      })}
    </group>
  );
};