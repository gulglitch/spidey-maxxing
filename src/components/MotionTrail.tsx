import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, CatmullRomCurve3, TubeGeometry } from 'three';
import * as THREE from 'three';

interface MotionTrailProps {
  position: Vector3;
  maxLength?: number;
  color?: string;
  opacity?: number;
  radius?: number;
}

export const MotionTrail = ({
  position,
  maxLength = 20,
  color = '#00d9ff',
  opacity = 0.6,
  radius = 0.05
}: MotionTrailProps) => {
  const trailPoints = useRef<Vector3[]>([]);
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<TubeGeometry | null>(null);

  // Update trail points
  useFrame(() => {
    // Add current position to trail
    trailPoints.current.unshift(position.clone());

    // Limit trail length
    if (trailPoints.current.length > maxLength) {
      trailPoints.current.pop();
    }

    // Need at least 2 points to create a curve
    if (trailPoints.current.length < 2 || !meshRef.current) return;

    // Create curve from trail points
    const curve = new CatmullRomCurve3(trailPoints.current);

    // Create tube geometry
    if (geometryRef.current) {
      geometryRef.current.dispose();
    }

    try {
      geometryRef.current = new TubeGeometry(
        curve,
        Math.max(2, trailPoints.current.length - 1),
        radius,
        8,
        false
      );

      meshRef.current.geometry = geometryRef.current;
    } catch (e) {
      // Ignore geometry errors for short trails
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
    };
  }, []);

  return (
    <mesh ref={meshRef}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
};
