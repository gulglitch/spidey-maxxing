import { useState } from 'react';
import { useBox, usePlane } from '@react-three/cannon';
import { PullableObject } from './PullableObject';
import { Vector3 } from 'three';

export const InteractiveTestObjects = () => {
  const [pullForces, setPullForces] = useState<{ [key: string]: Vector3 | null }>({
    cube1: null,
    cube2: null,
    cube3: null,
  });

  // Ground plane
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -10, 0],
    material: {
      friction: 0.5,
      restitution: 0.3,
    },
  }));

  // Static walls for testing web attachment
  const [leftWallRef] = useBox(() => ({
    args: [1, 20, 20],
    position: [-20, 0, 0],
    type: 'Static',
  }));

  const [rightWallRef] = useBox(() => ({
    args: [1, 20, 20],
    position: [20, 0, 0],
    type: 'Static',
  }));

  const [backWallRef] = useBox(() => ({
    args: [20, 20, 1],
    position: [0, 0, -20],
    type: 'Static',
  }));

  // Ceiling for swinging
  const [ceilingRef] = useBox(() => ({
    args: [40, 1, 40],
    position: [0, 15, 0],
    type: 'Static',
  }));

  return (
    <group name="test-objects">
      {/* Ground */}
      <mesh ref={groundRef as any} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Left Wall */}
      <mesh ref={leftWallRef as any} castShadow receiveShadow>
        <boxGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>

      {/* Right Wall */}
      <mesh ref={rightWallRef as any} castShadow receiveShadow>
        <boxGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>

      {/* Back Wall */}
      <mesh ref={backWallRef as any} castShadow receiveShadow>
        <boxGeometry args={[20, 20, 1]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>

      {/* Ceiling */}
      <mesh ref={ceilingRef as any} receiveShadow>
        <boxGeometry args={[40, 1, 40]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Pullable Objects */}
      <PullableObject
        position={[-8, 0, -5]}
        size={[2, 2, 2]}
        color="#ff6b6b"
        mass={5}
        pullForce={pullForces.cube1}
        onPullComplete={() => {
          console.log('✅ Cube 1 pulled!');
          setPullForces(prev => ({ ...prev, cube1: null }));
        }}
      />

      <PullableObject
        position={[0, 0, -8]}
        size={[3, 1.5, 1.5]}
        color="#51cf66"
        mass={8}
        pullForce={pullForces.cube2}
        onPullComplete={() => {
          console.log('✅ Cube 2 pulled!');
          setPullForces(prev => ({ ...prev, cube2: null }));
        }}
      />

      <PullableObject
        position={[8, 2, -6]}
        size={[1.5, 1.5, 1.5]}
        color="#4dabf7"
        mass={3}
        pullForce={pullForces.cube3}
        onPullComplete={() => {
          console.log('✅ Cube 3 pulled!');
          setPullForces(prev => ({ ...prev, cube3: null }));
        }}
      />

      {/* Static platforms for swinging */}
      <mesh position={[-10, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.5, 4]} />
        <meshStandardMaterial color="#ffd43b" roughness={0.6} metalness={0.4} />
      </mesh>

      <mesh position={[10, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.5, 4]} />
        <meshStandardMaterial color="#ffd43b" roughness={0.6} metalness={0.4} />
      </mesh>

      <mesh position={[0, 8, -10]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.5, 4]} />
        <meshStandardMaterial color="#ffd43b" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Reference grid on ground */}
      <gridHelper args={[50, 50, '#444444', '#222222']} position={[0, -9.9, 0]} />
    </group>
  );
};
