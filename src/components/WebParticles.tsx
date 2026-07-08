import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface WebParticlesProps {
  position: THREE.Vector3;
  count?: number;
  speed?: number;
  color?: string;
  size?: number;
  lifetime?: number;
}

export const WebParticles = ({
  position,
  count = 30,
  speed = 5,
  color = '#ffffff',
  size = 0.1,
  lifetime = 1.0
}: WebParticlesProps) => {
  const particles = useRef<THREE.Points>(null);
  const time = useRef(0);

  // Generate particle positions and velocities
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Start at impact position
      pos[i3] = position.x;
      pos[i3 + 1] = position.y;
      pos[i3 + 2] = position.z;

      // Random velocities in all directions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      vel[i3] = Math.sin(phi) * Math.cos(theta) * velocity;
      vel[i3 + 1] = Math.sin(phi) * Math.sin(theta) * velocity;
      vel[i3 + 2] = Math.cos(phi) * velocity;
    }

    return { positions: pos, velocities: vel };
  }, [position, count, speed]);

  // Animate particles
  useFrame((_, delta) => {
    if (!particles.current) return;

    time.current += delta;

    // Fade out and remove after lifetime
    if (time.current > lifetime) {
      return;
    }

    const positions = particles.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update position based on velocity
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      // Apply gravity
      velocities[i3 + 1] -= 9.8 * delta;

      // Apply damping
      velocities[i3] *= 0.98;
      velocities[i3 + 1] *= 0.98;
      velocities[i3 + 2] *= 0.98;
    }

    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  const opacity = Math.max(0, 1 - time.current / lifetime);

  return (
    <Points ref={particles} positions={positions}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};
