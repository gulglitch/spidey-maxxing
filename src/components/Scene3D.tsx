import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { AdvancedWebShooter } from './AdvancedWebShooter';
import { TestObjects } from './TestObjects';
import type { HandData, GestureResult } from '../types';
import './Scene3D.css';

interface Scene3DProps {
  handData: HandData | null;
  gestureResult: GestureResult | null;
}

export const Scene3D = ({ handData, gestureResult }: Scene3DProps) => {
  return (
    <div className="scene-container">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
        
        {/* Enhanced lighting for interactive objects */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.0} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 5, 5]} intensity={0.5} color="#4ecdc4" />
        <pointLight position={[10, 5, -5]} intensity={0.5} color="#ff6b6b" />
        
        {/* Test objects for collision detection - TRANSPARENT FOR DEBUGGING */}
        <TestObjects />
        
        {/* Advanced Web Shooter with swing and pull modes */}
        <AdvancedWebShooter handData={handData} gestureResult={gestureResult} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#000000', 10, 50]} />
      </Canvas>
    </div>
  );
};
