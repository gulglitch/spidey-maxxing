import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SpiderWeb } from './SpiderWeb';
import type { HandData, GestureResult } from '../types';
import { landmarkTo3D, getShootDirection } from '../utils/coordinateTransform';
import { checkBuildingCollision } from '../utils/raycasting';


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
  isAttached: boolean;
  attachPoint?: Vector3;
}

export const WebShooter = ({ handData, gestureResult }: WebShooterProps) => {
  const [webs, setWebs] = useState<WebProjectile[]>([]);
  const previousHandPos = useRef<[number, number, number]>([0, 0, 0]);
  const currentHandPos = useRef<[number, number, number]>([0, 0, 0]);
  const wasGestureActive = useRef(false);
  const webIdCounter = useRef(0);
  
  // Get scene for raycasting
  const { scene } = useThree();

  // Update hand position every frame
  useEffect(() => {
    if (handData && handData.landmarks.length >= 9) {
      // Use index finger tip (landmark 8) for web shooting origin
      const indexFingerTip = handData.landmarks[8];
      const pos3D = landmarkTo3D(indexFingerTip, 75, 10); // Match Scene3D camera settings
      
      // Store previous position before updating current
      previousHandPos.current = currentHandPos.current;
      currentHandPos.current = pos3D;
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
    if (!handData || handData.landmarks.length < 13) {
      console.log('❌ Not enough landmarks to shoot');
      return;
    }

    // Get required landmarks for direction calculation
    const indexFingerTip = handData.landmarks[8];  // Index finger tip
    const wrist = handData.landmarks[0];            // Wrist
    const middleFinger = handData.landmarks[12];    // Middle finger tip

    // Calculate direction based on hand orientation
    const direction = getShootDirection(indexFingerTip, wrist, middleFinger);
    const speed = 50; // Web shooting speed

    const newWeb: WebProjectile = {
      id: webIdCounter.current++,
      startPosition: new Vector3(...currentHandPos.current),
      currentPosition: new Vector3(...currentHandPos.current),
      velocity: new Vector3(
        direction[0] * speed,
        direction[1] * speed,
        direction[2] * speed
      ),
      life: 0,
      maxLife: 5.0, // 5 seconds lifetime
      isAttached: false,
    };

    setWebs((prev) => [...prev, newWeb]);

    console.log('🕸️ THWIP!', {
      from: currentHandPos.current,
      direction: direction,
      velocity: [direction[0] * speed, direction[1] * speed, direction[2] * speed]
    });
  };

  // Animate webs with collision detection
  useFrame((_state, delta) => {
    // Get all objects in scene for collision detection
    const testObjects = scene.getObjectByName('test-objects');
    const collisionObjects = testObjects ? testObjects.children : [];

    // Debug: log available collision objects count
    if (webs.length > 0 && collisionObjects.length === 0) {
      console.warn('⚠️ No collision objects found in scene!');
    }

    setWebs((currentWebs) => {
      return currentWebs
        .map((web) => {
          // Skip physics if web is attached
          if (web.isAttached && web.attachPoint) {
            web.life += delta;
            return web;
          }

          // Debug: Log web position and velocity every 30 frames
          if (Math.random() < 0.05) {
            console.log('🕸️ Web flying:', {
              pos: [web.currentPosition.x.toFixed(1), web.currentPosition.y.toFixed(1), web.currentPosition.z.toFixed(1)],
              vel: [web.velocity.x.toFixed(1), web.velocity.y.toFixed(1), web.velocity.z.toFixed(1)],
              speed: web.velocity.length().toFixed(1)
            });
          }

          // Check for collision before moving
          const collision = checkBuildingCollision(
            web.currentPosition,
            web.velocity,
            scene,
            delta
          );

          if (collision.hit && collision.point) {
            // Web hit something! Attach it
            web.isAttached = true;
            web.attachPoint = collision.point.clone();
            web.currentPosition.copy(collision.point);
            web.velocity.set(0, 0, 0);
            web.maxLife = 8.0; // Attached webs last longer
            
            console.log('💥💥💥 WEB SUCCESSFULLY ATTACHED! 💥💥💥');
            console.log('Attach point:', [
              collision.point.x.toFixed(2),
              collision.point.y.toFixed(2), 
              collision.point.z.toFixed(2)
            ]);
            console.log('Collision distance:', collision.distance?.toFixed(2));
          } else {
            // Apply gravity
            web.velocity.y -= 9.8 * delta;

            // Update position
            web.currentPosition.x += web.velocity.x * delta;
            web.currentPosition.y += web.velocity.y * delta;
            web.currentPosition.z += web.velocity.z * delta;
          }

          // Update life
          web.life += delta;

          return web;
        })
        .filter((web) => web.life < web.maxLife); // Remove old webs
    });
  });

  return (
    <group>
      {/* DEBUG: Visual marker at index finger tip - should align with red dot */}
      {handData && (
        <mesh position={currentHandPos.current}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* DEBUG: Show web projectile positions */}
      {webs.map((web) => (
        <mesh key={`debug-${web.id}`} position={web.currentPosition}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial 
            color={web.isAttached ? "#00ff00" : "#ff00ff"} 
            transparent 
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Render converging-and-bursting web strands */}
      {webs.map((web) => {
        const opacity = web.isAttached 
          ? 0.8 // Attached webs stay visible
          : 1 - web.life / web.maxLife; // Fading webs

        return (
          <SpiderWeb
            key={web.id}
            start={web.startPosition}
            end={web.currentPosition}
            opacity={opacity}
            strands={web.isAttached ? 12 : 18} // Fewer strands when attached
          />
        );
      })}
    </group>
  );
};