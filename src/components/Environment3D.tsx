import { useRef } from 'react';
import { Mesh } from 'three';

export const Environment3D = () => {
  const buildingRefs = useRef<Mesh[]>([]);

  // Simple city buildings
  const buildings = [
    { position: [15, 0, -20], size: [5, 20, 5], color: '#333' },
    { position: [-15, 0, -20], size: [4, 15, 4], color: '#444' },
    { position: [20, 0, -30], size: [6, 25, 6], color: '#2a2a2a' },
    { position: [-20, 0, -30], size: [5, 18, 5], color: '#3a3a3a' },
    { position: [0, 0, -35], size: [8, 30, 8], color: '#1a1a1a' },
    { position: [10, 0, -40], size: [4, 22, 4], color: '#333' },
    { position: [-10, 0, -40], size: [5, 19, 5], color: '#2a2a2a' },
  ];

  // Ground
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Buildings */}
      {buildings.map((building, index) => (
        <mesh
          key={index}
          position={building.position as [number, number, number]}
          castShadow
          receiveShadow
          ref={(el) => {
            if (el) buildingRefs.current[index] = el;
          }}
        >
          <boxGeometry args={building.size as [number, number, number]} />
          <meshStandardMaterial 
            color={building.color} 
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Some windows glow */}
      {buildings.map((building, index) => (
        <pointLight
          key={`light-${index}`}
          position={[building.position[0], building.position[1] + 5, building.position[2]]}
          intensity={0.5}
          distance={10}
          color="#ffaa00"
        />
      ))}
    </group>
  );
};
