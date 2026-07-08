import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import { useMemo } from 'react';

export const CityGround = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -5, 0],
    type: 'Static'
  }));

  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Dark ground base
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Street grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    
    // Horizontal lines
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }
    
    // Road markings
    ctx.strokeStyle = '#ffeb99';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 20]);
    
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }, []);

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial 
        map={gridTexture}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};
