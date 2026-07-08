import { useState, useEffect } from 'react';
import { Vector3 } from 'three';
import { WebParticles } from './WebParticles';

interface ImpactEffectProps {
  position: Vector3;
  onComplete?: () => void;
  duration?: number;
}

export const ImpactEffect = ({ 
  position, 
  onComplete,
  duration = 1.5 
}: ImpactEffectProps) => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
      if (onComplete) onComplete();
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!active) return null;

  return (
    <group position={position}>
      {/* Main explosion particles */}
      <WebParticles
        position={new Vector3(0, 0, 0)}
        count={40}
        speed={8}
        color="#ffffff"
        size={0.15}
        lifetime={0.8}
      />

      {/* Secondary slower particles */}
      <WebParticles
        position={new Vector3(0, 0, 0)}
        count={20}
        speed={4}
        color="#aaccff"
        size={0.2}
        lifetime={1.2}
      />

      {/* Sparkle particles */}
      <WebParticles
        position={new Vector3(0, 0, 0)}
        count={15}
        speed={10}
        color="#ffff00"
        size={0.1}
        lifetime={0.6}
      />

      {/* Flash effect at impact point */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={Math.max(0, 1 - (Date.now() % 1000) / 500)}
          toneMapped={false}
        />
      </mesh>

      {/* Expanding ring effect */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.8, 32]} />
        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={Math.max(0, 0.6 - (Date.now() % 1000) / 800)}
          side={2}
          toneMapped={false}
        />
      </mesh>

      {/* Bright point light for impact flash */}
      <pointLight
        intensity={5}
        distance={10}
        color="#ffffff"
        decay={2}
      />
    </group>
  );
};
