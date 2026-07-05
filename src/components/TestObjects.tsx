import { useRef } from 'react';
import { Mesh } from 'three';

/**
 * Test objects for collision detection
 * These are targets you can shoot webs at
 */
export const TestObjects = () => {
  const box1Ref = useRef<Mesh>(null!);
  const box2Ref = useRef<Mesh>(null!);
  const sphereRef = useRef<Mesh>(null!);
  const wallRef = useRef<Mesh>(null!);

  return (
    <group name="test-objects">
      {/* Box 1 - Left side - TRANSPARENT */}
      <group position={[-5, 2, -5]}>
        <mesh ref={box1Ref} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color="#ff6b6b" 
            roughness={0.5}
            metalness={0.1}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
        {/* Collision sphere indicator - MORE VISIBLE */}
        <mesh>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial 
            color="#ff0000" 
            wireframe
            transparent 
            opacity={0.4}
          />
        </mesh>
        {/* DEBUG TARGET - RED DOT IN CENTER */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color="#ff0000" 
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Box 2 - Right side - TRANSPARENT */}
      <group position={[5, 2, -5]}>
        <mesh ref={box2Ref} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color="#4ecdc4"
            roughness={0.5}
            metalness={0.1}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
        {/* Collision sphere indicator - MORE VISIBLE */}
        <mesh>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial 
            color="#00ffff" 
            wireframe
            transparent 
            opacity={0.4}
          />
        </mesh>
        {/* DEBUG TARGET - RED DOT IN CENTER */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color="#ff0000" 
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Sphere - Center top - TRANSPARENT */}
      <group position={[0, 5, -8]}>
        <mesh ref={sphereRef} castShadow receiveShadow>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial 
            color="#ffe66d"
            roughness={0.5}
            metalness={0.1}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
        {/* Collision sphere indicator - MORE VISIBLE */}
        <mesh>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial 
            color="#ffff00" 
            wireframe
            transparent 
            opacity={0.4}
          />
        </mesh>
        {/* DEBUG TARGET - RED DOT IN CENTER */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color="#ff0000" 
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Back wall - TRANSPARENT */}
      <mesh ref={wallRef} position={[0, 0, -15]} receiveShadow>
        <boxGeometry args={[30, 20, 1]} />
        <meshStandardMaterial 
          color="#95a5a6"
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Ground plane - TRANSPARENT */}
      <mesh position={[0, -5, -5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#34495e"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Grid helper for depth perception - DIMMER */}
      <gridHelper args={[50, 50, '#555555', '#333333']} position={[0, -4.99, -5]} />
    </group>
  );
};
