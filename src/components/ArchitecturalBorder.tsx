import { useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface Panel {
  position: [number, number, number];
  size: [number, number, number];
  type: 'wall' | 'window' | 'pipe' | 'beam';
}

export const ArchitecturalBorder = () => {
  const panels = useMemo<Panel[]>(() => {
    const list: Panel[] = [];
    
    // LEFT WALL - Vertical architectural panels
    for (let i = 0; i < 7; i++) {
      const y = -12 + i * 6;
      list.push({ position: [-22, y, 0], size: [4, 5, 35], type: 'wall' });
      list.push({ position: [-21, y + 1, -8 + i * 5], size: [2, 3, 8], type: 'window' });
      list.push({ position: [-24, y - 1, -10 + i * 6], size: [0.8, 0.8, 10], type: 'pipe' });
    }
    
    // RIGHT WALL - Mirror left
    for (let i = 0; i < 7; i++) {
      const y = -12 + i * 6;
      list.push({ position: [22, y, 0], size: [4, 5, 35], type: 'wall' });
      list.push({ position: [21, y + 1, -8 + i * 5], size: [2, 3, 8], type: 'window' });
      list.push({ position: [24, y - 1, -10 + i * 6], size: [0.8, 0.8, 10], type: 'pipe' });
    }
    
    // TOP BEAMS - Horizontal architectural elements
    for (let i = 0; i < 8; i++) {
      const x = -18 + i * 5;
      list.push({ position: [x, 20, 0], size: [4, 2, 35], type: 'beam' });
      list.push({ position: [x, 19, -6 + i * 3], size: [3, 0.5, 6], type: 'window' });
    }
    
    // BOTTOM BASE - Foundation panels
    for (let i = 0; i < 8; i++) {
      const x = -18 + i * 5;
      list.push({ position: [x, -18, 0], size: [4, 3, 35], type: 'beam' });
    }
    
    return list;
  }, []);

  return (
    <group>
      {panels.map((panel, i) => (
        <ArchPanel key={i} {...panel} />
      ))}
      
      {/* Point lights for windows */}
      <pointLight position={[-21, 0, 0]} intensity={0.8} color="#E72020" distance={15} />
      <pointLight position={[21, 0, 0]} intensity={0.8} color="#4F6793" distance={15} />
      <pointLight position={[-21, 10, -10]} intensity={0.6} color="#9A1316" distance={12} />
      <pointLight position={[21, 10, -10]} intensity={0.6} color="#4F6793" distance={12} />
      <pointLight position={[0, 19, 0]} intensity={0.5} color="#E72020" distance={20} />
    </group>
  );
};

const ArchPanel = ({ position, size, type }: Panel) => {
  const [ref] = useBox(() => ({
    position,
    args: size,
    type: 'Static',
    userData: { type: 'building' }
  }));
  
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base colors
    const colors = {
      wall: '#1a1a2e',
      window: '#223057',
      pipe: '#2a2a3a',
      beam: '#0f0f1a'
    };
    
    const glowColors = {
      wall: '#E72020',
      window: '#00d9ff',
      pipe: '#4F6793',
      beam: '#9A1316'
    };
    
    ctx.fillStyle = colors[type];
    ctx.fillRect(0, 0, 512, 512);
    
    if (type === 'wall' || type === 'beam') {
      // Hexagonal geometric pattern
      ctx.strokeStyle = glowColors[type];
      ctx.lineWidth = 1.5;
      
      for (let y = 0; y < 512; y += 50) {
        for (let x = 0; x < 512; x += 50) {
          const cx = x + 25;
          const cy = y + 25;
          const r = 18;
          
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      
      // Panel borders with corner accents
      ctx.strokeStyle = glowColors[type];
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, 496, 496);
      
      // Corner brackets
      ctx.lineWidth = 4;
      const s = 40;
      ctx.beginPath();
      ctx.moveTo(8, s); ctx.lineTo(8, 8); ctx.lineTo(s, 8);
      ctx.moveTo(512-s, 8); ctx.lineTo(512-8, 8); ctx.lineTo(512-8, s);
      ctx.moveTo(8, 512-s); ctx.lineTo(8, 512-8); ctx.lineTo(s, 512-8);
      ctx.moveTo(512-s, 512-8); ctx.lineTo(512-8, 512-8); ctx.lineTo(512-8, 512-s);
      ctx.stroke();
    }
    
    if (type === 'window') {
      // Window grid with glow
      const rows = 4, cols = 4;
      const w = 512 / cols, h = 512 / rows;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * w + 10;
          const y = r * h + 10;
          const isLit = Math.random() > 0.3;
          
          ctx.fillStyle = isLit ? '#00d9ff' : '#0a0a1a';
          ctx.fillRect(x, y, w - 20, h - 20);
          
          if (isLit) {
            const gradient = ctx.createRadialGradient(
              x + w/2, y + h/2, 0,
              x + w/2, y + h/2, w/2
            );
            gradient.addColorStop(0, 'rgba(0, 217, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, w - 20, h - 20);
          }
          
          ctx.strokeStyle = glowColors.window;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w - 20, h - 20);
        }
      }
    }
    
    if (type === 'pipe') {
      // Metallic pipe segments
      ctx.strokeStyle = glowColors.pipe;
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 30) {
        ctx.beginPath();
        ctx.arc(256, i, 240, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Rivets
      ctx.fillStyle = glowColors.pipe;
      for (let i = 0; i < 512; i += 40) {
        ctx.beginPath();
        ctx.arc(128, i, 4, 0, Math.PI * 2);
        ctx.arc(384, i, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [type]);

  const material = useMemo(() => {
    const props = {
      wall: { emissive: '#E72020', emissiveIntensity: 0.15, metalness: 0.3, roughness: 0.7 },
      window: { emissive: '#00d9ff', emissiveIntensity: 0.4, metalness: 0.1, roughness: 0.3 },
      pipe: { emissive: '#4F6793', emissiveIntensity: 0.2, metalness: 0.8, roughness: 0.4 },
      beam: { emissive: '#9A1316', emissiveIntensity: 0.12, metalness: 0.4, roughness: 0.8 }
    };
    return props[type];
  }, [type]);

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        map={texture}
        emissive={material.emissive}
        emissiveIntensity={material.emissiveIntensity}
        metalness={material.metalness}
        roughness={material.roughness}
      />
    </mesh>
  );
};
