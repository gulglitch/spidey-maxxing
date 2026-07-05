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
  }, [start, end]);

  const midForSparkles = useMemo(
    () => new Vector3().lerpVectors(start, end, 0.5),
    [start, end]
  );

  const strandLength = useMemo(() => start.distanceTo(end), [start, end]);

  return (
    <group>
      {/* Sharp bright core strand */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        toneMapped={false}
      />

      {/* Wider, softer strand underneath - gives bloom something bigger to catch */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth * 3}
        transparent
        opacity={opacity * 0.25}
        toneMapped={false}
      />

      {/* Sparkle particles traveling along the strand for an "energy" feel */}
      {showSparkles && strandLength > 0.01 && (
        <Sparkles
          position={midForSparkles}
          count={Math.max(4, Math.floor(strandLength * 2))}
          scale={[strandLength, 0.4, 0.4] as [number, number, number]}
          size={2}
          speed={0.4}
          opacity={opacity}
          color={color}
        />
      )}
    </group>
  );
};