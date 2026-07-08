import { useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface ArchitecturalPanel {
  position: [number, number, number];
  size: [number, number, number];
  type: 'main' | 'accent' | 'pipe' | 'vent';
  rotation?: [number, number, number];
}

export const CityBuildings = () => {
  const panels = useMemo<ArchitecturalPanel[]>(() => {
    const panelList: ArchitecturalPanel[] = [];
    
    // LEFT WALL - Layered futuristic architecture
    for (let i = 0; i < 5; i++) {
      const y = -8 + i * 8;
      // Main structural panels
      panelList.push({
        position: [-22, y, 0],
        size: [3, 7, 40],
        type: 'main'
      });
      
      // Accent panels
      panelList.push({
        position: [-24, y + 1, -5 + i * 8],
        size: [1, 5, 6],
        type: 'accent'
      });
      
      // Pipes
      panelList.push({
        position: [-23, y, -10 + i * 10],
        size: [0.5, 0.5, 8],
        type: 'pipe'
      });
    }
    
    // RIGHT WALL - Mirror left side
    for (let i = 0; i < 5; i++) {
      const y = -8 + i * 8;
      panelList.push({
        position: [22, y, 0],
        size: [3, 7, 40],
        type: 'main'
      });
      
      panelList.push({
        position: [24, y + 1, -5 + i * 8],
        size: [1, 5, 6],
        type: 'accent'
      });
      
      panelList.push({
        position: [23, y, -10 + i * 10],
        size: [0.5, 0.5, 8],
        type: 'pipe'
      });
    }
    
    // TOP architectural elements
    for (let i = 0; i < 6; i++) {
      panelList.push({
        position: [-15 + i * 6, 25, 0],
        size: [5, 2, 30],
        type: 'main'
      });
      
      // Vents
      panelList.push({
        position: [-14 + i * 6, 23, -8 + i * 4],
        size: [3, 0.5, 4],
        type: 'vent'
      });
    }
    
    // BOTTOM architectural base
    for (let i = 0; i < 6; i++) {
      panelList.push({
        position: [-15 + i * 6, -15, 0],
        size: [5, 3, 30],
        type: 'main'
      });
    }
    
    return panelList;
  }, []);

  return (
    <group>
      {panels.map((panel, index) => (
        <ArchitecturalPanel key={index} {...panel} />
      ))}
    </group>
  );
};

interface ArchitecturalPanelProps {
  position: [number, number, number];
  size: [number, number, number];
  type: 'main' | 'accent' | 'pipe' | 'vent';
  rotation?: [number, number, number];
}

const ArchitecturalPanel = ({ position, size, type, rotation = [0, 0, 0] }: ArchitecturalPanelProps) => {
  // Physics body
  const [ref] = useBox(() => ({
    position,
    args: size,
    rotation,
    type: 'Static',
    userData: { type: 'building' }
  }));
  
  // Material based on panel type
  const material = useMemo(() => {
    const colors = {
      main: '#1a1a2e',
      accent: '#223057',
      pipe: '#2a2a3a',
      vent: '#0a0a1a'
    };
    
    const emissive = {
      main: '#E72020',
      accent: '#9A1316',
      pipe: '#4F6793',
      vent: '#E72020'
    };
    
    return {
      color: colors[type],
      emissive: emissive[type],
      emissiveIntensity: type === 'accent' || type === 'vent' ? 0.3 : 0.1,
      roughness: 0.7,
      metalness: type === 'pipe' ? 0.8 : 0.3
    };
  }, [type]);

  // Panel texture with geometric details
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = material.color;
    ctx.fillRect(0, 0, 512, 512);
    
    if (type === 'main' || type === 'accent') {
      // Geometric panel lines
      ctx.strokeStyle = material.emissive;
      ctx.lineWidth = 2;
      
      // Hexagonal grid pattern
      for (let y = 0; y < 512; y += 40) {
        for (let x = 0; x < 512; x += 40) {
          const centerX = x + 20;
          const centerY = y + 20;
          const size = 15;
          
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = centerX + size * Math.cos(angle);
            const py = centerY + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          
          // Random glow dots
          if (Math.random() > 0.7) {
            ctx.fillStyle = material.emissive;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Panel borders
      ctx.strokeStyle = material.emissive;
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 492, 492);
      
      // Corner details
      const cornerSize = 30;
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(10, 40);
      ctx.lineTo(10, 10);
      ctx.lineTo(40, 10);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(472, 10);
      ctx.lineTo(502, 10);
      ctx.lineTo(502, 40);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(10, 472);
      ctx.lineTo(10, 502);
      ctx.lineTo(40, 502);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(472, 502);
      ctx.lineTo(502, 502);
      ctx.lineTo(502, 472);
      ctx.stroke();
    }
    
    if (type === 'pipe') {
      // Pipe segments
      ctx.strokeStyle = material.emissive;
      ctx.lineWidth = 1;
      for (let i = 0; i < 512; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
    }
    
    if (type === 'vent') {
      // Vent slits
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 512; i += 15) {
        ctx.fillRect(0, i, 512, 8);
      }
      
      // Glow edges
      ctx.strokeStyle = material.emissive;
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 15) {
        ctx.strokeRect(0, i, 512, 8);
      }
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [type, material]);

  return (
    <mesh ref={ref} castShadow receiveShadow rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        map={texture}
        color={material.color}
        emissive={material.emissive}
        emissiveIntensity={material.emissiveIntensity}
        roughness={material.roughness}
        metalness={material.metalness}
      />
    </mesh>
  );
};
