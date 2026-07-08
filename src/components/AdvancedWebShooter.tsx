import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SpiderWeb } from './SpiderWeb';
import { SwingingRope } from './SwingingRope';
import { ImpactEffect } from './ImpactEffect';
import { MotionTrail } from './MotionTrail';
import { useWebStore } from '../store/webStore';
import { useAudio } from '../hooks/useAudio';
import type { HandData, GestureResult } from '../types';
import { landmarkTo3D, getShootDirection } from '../utils/coordinateTransform';
import { checkWebCollision, checkBuildingCollision } from '../utils/raycasting';

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
  attachedObjectId?: string;
  mode: 'shooting' | 'swinging' | 'pulling';
}

export const AdvancedWebShooter = ({ handData, gestureResult }: WebShooterProps) => {
  const [webs, setWebs] = useState<WebProjectile[]>([]);
  const [impacts, setImpacts] = useState<{ id: number; position: Vector3 }[]>([]);
  const previousHandPos = useRef<[number, number, number]>([0, 0, 0]);
  const currentHandPos = useRef<[number, number, number]>([0, 0, 0]);
  const wasGestureActive = useRef(false);
  const webIdCounter = useRef(0);
  const impactIdCounter = useRef(0);
  const gestureHoldTime = useRef(0);
  
  // Get scene for raycasting
  const { scene } = useThree();
  
  // Get interaction mode from store
  const interactionMode = useWebStore((state) => state.interactionMode);
  const addAttachment = useWebStore((state) => state.addAttachment);

  // Audio system
  const { playThwip, playImpact, playSwing, playPull } = useAudio();

  // Update hand position every frame
  useEffect(() => {
    if (handData && handData.landmarks.length >= 9) {
      const indexFingerTip = handData.landmarks[8];
      const pos3D = landmarkTo3D(indexFingerTip, 75, 10);
      
      previousHandPos.current = currentHandPos.current;
      currentHandPos.current = pos3D;
    }
  }, [handData]);

  // Shoot web when gesture is activated
  useEffect(() => {
    const isGestureActive = gestureResult?.isWebShooter || false;
    
    if (isGestureActive && !wasGestureActive.current && handData) {
      // Gesture just activated
      gestureHoldTime.current = 0;
      shootWeb();
    } else if (isGestureActive) {
      // Gesture is being held
      gestureHoldTime.current += 0.016; // Approximate frame time
    } else {
      gestureHoldTime.current = 0;
    }
    
    wasGestureActive.current = isGestureActive;
  }, [gestureResult?.isWebShooter, handData]);

  const shootWeb = () => {
    if (!handData || handData.landmarks.length < 13) {
      console.log('âŒ Not enough landmarks to shoot');
      return;
    }

    const indexFingerTip = handData.landmarks[8];
    const wrist = handData.landmarks[0];
    const middleFinger = handData.landmarks[12];

    const direction = getShootDirection(indexFingerTip, wrist, middleFinger);
    const speed = 50;

    // Determine mode based on interaction mode setting
    let webMode: 'shooting' | 'swinging' | 'pulling' = 'shooting';
    if (interactionMode === 'swing') {
      webMode = 'swinging';
    } else if (interactionMode === 'pull') {
      webMode = 'pulling';
    }

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
      maxLife: 5.0,
      isAttached: false,
      mode: webMode,
    };

    setWebs((prev) => [...prev, newWeb]);

    // ðŸ”Š PLAY SOUND EFFECT
    playThwip();

    console.log('ðŸ•¸ï¸ðŸ•¸ï¸ðŸ•¸ï¸ WEB SHOT DEBUG ðŸ•¸ï¸ðŸ•¸ï¸ðŸ•¸ï¸');
    console.log('Mode:', webMode);
    console.log('Start Position:', currentHandPos.current);
    console.log('Direction Vector:', direction);
    console.log('Velocity (direction * speed):', [
      direction[0] * speed,
      direction[1] * speed,
      direction[2] * speed
    ]);
    console.log('Index Finger Tip (normalized):', indexFingerTip);
    console.log('Wrist (normalized):', wrist);
    console.log('Middle Finger (normalized):', middleFinger);
    console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
  };

  // Animate webs with mode-specific behavior
  useFrame((_, delta) => {
    const testObjects = scene.getObjectByName('test-objects');
    const collisionObjects = testObjects
      ? testObjects.children.filter((object) => object.type !== 'GridHelper')
      : [];

    setWebs((currentWebs) => {
      return currentWebs
        .map((web) => {
          const nextWeb: WebProjectile = {
            ...web,
            startPosition: web.startPosition.clone(),
            currentPosition: web.currentPosition.clone(),
            velocity: web.velocity.clone(),
            attachPoint: web.attachPoint?.clone(),
          };

          // Update hand position for attached webs
          if (nextWeb.isAttached && (nextWeb.mode === 'swinging' || nextWeb.mode === 'pulling')) {
            nextWeb.startPosition.set(...currentHandPos.current);
            
            // Play swing sound for swinging mode
            if (nextWeb.mode === 'swinging' && nextWeb.life < 0.1) {
              playSwing();
            }
          }

          // Skip physics if web is attached and in shooting mode
          if (nextWeb.isAttached && nextWeb.mode === 'shooting' && nextWeb.attachPoint) {
            nextWeb.life += delta;
            return nextWeb;
          }

          // Check for collision if not yet attached - USE BUILDING-SPECIFIC DETECTION
          if (!nextWeb.isAttached) {
            const collision = checkBuildingCollision(
              nextWeb.currentPosition,
              nextWeb.velocity,
              scene,
              delta
            );

            if (collision.hit && collision.point) {
              const attachPoint = collision.point.clone();

              // ðŸ’¥ WEB HIT SOMETHING!
              nextWeb.isAttached = true;
              nextWeb.attachPoint = attachPoint.clone();
              nextWeb.currentPosition.copy(attachPoint);
              nextWeb.velocity.set(0, 0, 0);
              
              // Extend lifetime for attached webs
              if (nextWeb.mode === 'swinging') {
                nextWeb.maxLife = 15.0;
              } else if (nextWeb.mode === 'pulling') {
                nextWeb.maxLife = 10.0;
                playPull(); // ðŸ”Š Play pull sound
              } else {
                nextWeb.maxLife = 8.0;
              }

              // ðŸ”Š PLAY IMPACT SOUND
              playImpact();

              // âœ¨ CREATE IMPACT EFFECT
              setImpacts(prev => [
                ...prev,
                { id: impactIdCounter.current++, position: attachPoint.clone() }
              ]);

              // Add to store attachments
              addAttachment({
                id: nextWeb.id,
                attachPoint,
                attachedObjectId: collision.object?.uuid,
                createdAt: Date.now()
              });

              console.log(`ðŸ’¥ Web attached! Mode: ${nextWeb.mode}`, collision.point);
            } else {
              // Apply gravity
              nextWeb.velocity.y -= 9.8 * delta;

              // Update position
              nextWeb.currentPosition.addScaledVector(nextWeb.velocity, delta);
            }
          }

          // Update life
          nextWeb.life += delta;

          return nextWeb;
        })
        .filter((web) => web.life < web.maxLife);
    });
  });

  return (
    <group>
      {/* Hand position indicator */}
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

      {/* Render webs based on mode */}
      {webs.map((web) => {
        const opacity = web.isAttached 
          ? 0.8
          : 1 - web.life / web.maxLife;

        // Swinging mode: render rope
        if (web.mode === 'swinging' && web.isAttached && web.attachPoint) {
          return (
            <group key={web.id}>
              <SwingingRope
                start={new Vector3(...currentHandPos.current)}
                end={web.attachPoint}
                opacity={opacity}
                segments={20}
                gravity={15}
                tension={0.98}
              />
              {/* Glow at attach point */}
              <mesh position={web.attachPoint}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial 
                  color="#00ff00" 
                  transparent 
                  opacity={0.6}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        }

        // Pulling mode: render rope with pull visual
        if (web.mode === 'pulling' && web.isAttached && web.attachPoint) {
          return (
            <group key={web.id}>
              <SwingingRope
                start={new Vector3(...currentHandPos.current)}
                end={web.attachPoint}
                opacity={opacity}
                segments={15}
                gravity={8}
                tension={0.95}
              />
              {/* Pull indicator at attach point */}
              <mesh position={web.attachPoint}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial 
                  color="#ff6b6b" 
                  transparent 
                  opacity={0.6 + Math.sin(Date.now() * 0.01) * 0.2}
                  toneMapped={false}
                />
              </mesh>
              <pointLight 
                position={web.attachPoint} 
                intensity={2} 
                distance={5} 
                color="#ff6b6b" 
              />
            </group>
          );
        }

        // Shooting mode: render spider web with motion trail
        return (
          <group key={web.id}>
            <SpiderWeb
              start={web.startPosition}
              end={web.currentPosition}
              opacity={opacity}
              strands={web.isAttached ? 12 : 18}
            />
            {/* Motion trail - only for flying webs */}
            {!web.isAttached && (
              <MotionTrail
                position={web.currentPosition}
                maxLength={15}
                color="#00d9ff"
                opacity={opacity * 0.5}
                radius={0.08}
              />
            )}
          </group>
        );
      })}

      {/* ðŸ’¥ IMPACT EFFECTS */}
      {impacts.map((impact) => (
        <ImpactEffect
          key={impact.id}
          position={impact.position}
          onComplete={() => {
            setImpacts(prev => prev.filter(i => i.id !== impact.id));
          }}
          duration={1.5}
        />
      ))}
    </group>
  );
};

