import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3 } from 'three';
import type { Mesh } from 'three';

interface PullableObjectProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  mass?: number;
  pullForce?: Vector3 | null;
  onPullComplete?: () => void;
}

export const PullableObject = ({
  position,
  size = [2, 2, 2],
  color = '#ff6b6b',
  mass = 10,
  pullForce = null,
  onPullComplete
}: PullableObjectProps) => {
  const meshRef = useRef<Mesh>(null);
  const [isBeingPulled, setIsBeingPulled] = useState(false);
  
  const [ref, api] = useBox(() => ({
    mass,
    position,
    args: size,
    linearDamping: 0.5,
    angularDamping: 0.8,
  }));

  const currentPosition = useRef(new Vector3(...position));
  const pullStartDistance = useRef<number>(0);

  // Subscribe to position updates
  useRef(() => {
    const unsubscribe = api.position.subscribe((pos) => {
      currentPosition.current.set(pos[0], pos[1], pos[2]);
    });
    return unsubscribe;
  });

  // Apply pull force
  useFrame(() => {
    if (pullForce && pullForce.length() > 0.01) {
      if (!isBeingPulled) {
        setIsBeingPulled(true);
        pullStartDistance.current = currentPosition.current.length();
      }

      // Apply force toward target
      const pullStrength = 150; // Adjust for pull speed
      const force = pullForce.clone().normalize().multiplyScalar(pullStrength);
      
      api.applyForce(
        [force.x, force.y, force.z],
        [0, 0, 0]
      );

      // Add some rotation for visual effect
      const torque = [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ];
      api.applyTorque(torque);

      // Check if object has been pulled close enough
      const currentDistance = currentPosition.current.length();
      const distancePulled = pullStartDistance.current - currentDistance;
      
      if (distancePulled > pullStartDistance.current * 0.7) {
        // Object pulled more than 70% of the way
        if (onPullComplete) {
          onPullComplete();
        }
      }
    } else {
      if (isBeingPulled) {
        setIsBeingPulled(false);
      }
    }
  });

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color}
        emissive={isBeingPulled ? '#ff0000' : '#000000'}
        emissiveIntensity={isBeingPulled ? 0.5 : 0}
        roughness={0.4}
        metalness={0.6}
      />
      
      {/* Highlight when being pulled */}
      {isBeingPulled && (
        <pointLight 
          position={[0, 0, 0]} 
          intensity={2} 
          distance={5} 
          color="#ff6b6b" 
        />
      )}
    </mesh>
  );
};
