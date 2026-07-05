import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';
import type { Mesh } from 'three';

interface RopeSegmentProps {
  position: [number, number, number];
  previousSegment?: any;
  isFixed?: boolean;
  mass?: number;
  onPositionUpdate?: (position: Vector3) => void;
}

export const RopeSegment = ({
  position,
  previousSegment,
  isFixed = false,
  mass = 0.05,
  onPositionUpdate
}: RopeSegmentProps) => {
  const [ref, api] = useSphere(() => ({
    mass: isFixed ? 0 : mass,
    position,
    args: [0.1], // Small sphere for segment
    linearDamping: 0.8,
    angularDamping: 0.8,
  }));

  const meshRef = useRef<Mesh>(null);
  const currentPosition = useRef(new Vector3(...position));
  const segmentLength = 0.5; // Distance constraint between segments
  const springStiffness = 200;
  const damping = 10;

  // Subscribe to position updates
  useEffect(() => {
    const unsubscribe = api.position.subscribe((pos) => {
      currentPosition.current.set(pos[0], pos[1], pos[2]);
      if (onPositionUpdate) {
        onPositionUpdate(currentPosition.current.clone());
      }
    });
    return unsubscribe;
  }, [api, onPositionUpdate]);

  // Apply constraint forces to maintain rope segment length
  useFrame(() => {
    if (isFixed || !previousSegment) return;

    const prevPos = previousSegment.position;
    if (!prevPos) return;

    const currentPos = currentPosition.current;
    const diff = new Vector3().subVectors(prevPos, currentPos);
    const distance = diff.length();
    const error = distance - segmentLength;

    // Spring force to maintain segment length
    if (Math.abs(error) > 0.01) {
      const force = diff.normalize().multiplyScalar(error * springStiffness);
      
      // Apply force toward previous segment
      api.applyForce(
        [force.x, force.y, force.z],
        [0, 0, 0]
      );

      // Apply damping
      api.velocity.subscribe((vel) => {
        const dampingForce = new Vector3(vel[0], vel[1], vel[2])
          .multiplyScalar(-damping);
        api.applyForce(
          [dampingForce.x, dampingForce.y, dampingForce.z],
          [0, 0, 0]
        );
      })();
    }
  });

  return (
    <mesh ref={meshRef as any}>
      {/* Invisible physics body */}
    </mesh>
  );
};
