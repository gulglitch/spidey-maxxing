import { useMemo } from 'react';
import { Vector3, CatmullRomCurve3 } from 'three';
import { Line, Sparkles } from '@react-three/drei';

interface WebLineProps {
  start: Vector3;
  end: Vector3;
  opacity?: number;
  color?: string;
  lineWidth?: number;
  showSparkles?: boolean;
}

export const WebLine = ({
  start,
  end,
  opacity = 1,
  color = '#dce8ff',
  lineWidth = 1.5,
  showSparkles = true
}: WebLineProps) => {
  // Build a taut, mostly-straight curve with only a tiny organic jitter.
  // No gravity sag here - we want it to read as light/energy, not rope.
  const points = useMemo(() => {
    const midPoint = new Vector3().lerpVectors(start, end, 0.5);

    midPoint.x += (Math.random() - 0.5) * 0.15;
    midPoint.y += (Math.random() - 0.5) * 0.15;
    midPoint.z += (Math.random() - 0.5) * 0.15;

    const curve = new CatmullRomCurve3([start, midPoint, end]);
    return curve.getPoints(24);
  }, [start.x, start.y, start.z, end.x, end.y, end.z]);

  const midForSparkles = useMemo(
    () => new Vector3().lerpVectors(start, end, 0.5),
    [start.x, start.y, start.z, end.x, end.y, end.z]
  );

  const strandLength = useMemo(() => start.distanceTo(end), [start.x, start.y, start.z, end.x, end.y, end.z]
  );

  return (
    <group>
      {/* Sharp bright core strand - ENHANCED GLOW */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth * 1.5}
        transparent
        opacity={opacity}
        toneMapped={false}
      />

      {/* Medium glow layer */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth * 4}
        transparent
        opacity={opacity * 0.4}
        toneMapped={false}
      />

      {/* Wider, softer outer glow - gives bloom effect */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth * 8}
        transparent
        opacity={opacity * 0.15}
        toneMapped={false}
      />

      {/* Sparkle particles traveling along the strand for an "energy" feel */}
      {showSparkles && strandLength > 0.01 && (
        <Sparkles
          position={midForSparkles}
          count={Math.max(6, Math.floor(strandLength * 3))}
          scale={[strandLength, 0.5, 0.5] as [number, number, number]}
          size={3}
          speed={0.5}
          opacity={opacity * 1.2}
          color={color}
        />
      )}
    </group>
  );
};
