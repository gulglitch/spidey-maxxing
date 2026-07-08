import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PerspectiveCamera } from '@react-three/drei';
import { AdvancedWebShooter } from './AdvancedWebShooter';
import { ArchitecturalBorder } from './ArchitecturalBorder';
import type { HandData, GestureResult } from '../types';
import './Scene3D.css';

interface Scene3DProps {
  handData: HandData | null;
  gestureResult: GestureResult | null;
}

export const Scene3D = ({ handData, gestureResult }: Scene3DProps) => {
  return (
    <div className="scene-container">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={90} />
        
        {/* Cinematic lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[0, 20, 10]} 
          intensity={0.8} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <hemisphereLight args={['#0a0a1a', '#E72020', 0.3]} />
        
        <Physics gravity={[0, -9.81, 0]}>
          <ArchitecturalBorder />
          <AdvancedWebShooter handData={handData} gestureResult={gestureResult} />
        </Physics>
        
        <fog attach="fog" args={['#000000', 25, 60]} />
      </Canvas>
    </div>
  );
};
