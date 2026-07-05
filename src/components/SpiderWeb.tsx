import { useMemo } from 'react';
import { Vector3 } from 'three';
import { WebLine } from './WebLine';

interface SpiderWebProps {
  start: Vector3;
  end: Vector3;
  opacity?: number;
  strands?: number; // number of strands the bundle fans out into at the burst point
}

export const SpiderWeb = ({ start, end, opacity = 1, strands = 18 }: SpiderWebProps) => {
  // Point along the path where the tight bundle breaks apart into a fan.
  // Sitting this close to `end` (not the midpoint) matches the reference image,
  // where the burst happens right near the target, not halfway there.
  const convergencePoint = useMemo(() => {
    return new Vector3().lerpVectors(start, end, 0.82);
  }, [start, end]);

  // Two vectors perpendicular to the shoot direction, used to scatter the fan
  // strands in a cone around the endpoint instead of a flat line.
  const { right, up } = useMemo(() => {
    const direction = new Vector3().subVectors(end, start).normalize();
    let referenceUp = new Vector3(0, 1, 0);

    // Guard against direction being parallel to the reference up vector,
    // which would make crossVectors degenerate.
    if (Math.abs(direction.dot(referenceUp)) > 0.99) {
      referenceUp = new Vector3(1, 0, 0);
    }

    const rightVec = new Vector3().crossVectors(direction, referenceUp).normalize();
    const upVec = new Vector3().crossVectors(rightVec, direction).normalize();

    return { right: rightVec, up: upVec };
  }, [start, end]);

  const fanStrands = useMemo(() => {
    const fanArray: {
      id: number;
      start: Vector3;
      end: Vector3;
      opacity: number;
      lineWidth: number;
    }[] = [];

    for (let i = 0; i < strands; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 2.8;

      const spread = new Vector3()
        .addScaledVector(right, Math.cos(angle) * radius)
        .addScaledVector(up, Math.sin(angle) * radius);

      const strandEnd = new Vector3().addVectors(end, spread);

      fanArray.push({
        id: i,
        start: convergencePoint.clone(),
        end: strandEnd,
        opacity: opacity * (0.5 + Math.random() * 0.5),
        lineWidth: 1 + Math.random() * 1.2
      });
    }

    return fanArray;
  }, [convergencePoint, end, right, up, strands, opacity]);

  return (
    <group>
      {/* Tight bundle from hand to the point where it bursts open - ENHANCED */}
      <WebLine
        start={start}
        end={convergencePoint}
        opacity={opacity}
        lineWidth={3.5}
        showSparkles
      />

      {/* Fanned-out strands past the convergence point */}
      {fanStrands.map((strand) => (
        <WebLine
          key={strand.id}
          start={strand.start}
          end={strand.end}
          opacity={strand.opacity}
          lineWidth={strand.lineWidth * 1.3}
          showSparkles={false}
        />
      ))}

      {/* Enhanced burst point glow */}
      <pointLight position={end} intensity={3.5} distance={10} color="#aaccff" />
      <pointLight position={convergencePoint} intensity={2.5} distance={8} color="#ffffff" />
    </group>
  );
};