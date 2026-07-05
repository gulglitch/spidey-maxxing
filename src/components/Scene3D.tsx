import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { WebShooter } from './WebShooter';
import { Environment3D } from './Environment3D';
import type { HandData, GestureResult } from '../types';
import './Scene3D.css';

interface Scene3DProps {
  handData: HandData | null;
  gestureResult: GestureResult | null;
}

export const Scene3D = ({ handData, gestureResult }: Scene3DProps) => {
  return (
    <div className="scene-container">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff0000" />
        
        {/* Scene elements */}
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Environment3D />
        <WebShooter handData={handData} gestureResult={gestureResult} />
        
        {/* Controls for debugging (optional) */}
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
};
