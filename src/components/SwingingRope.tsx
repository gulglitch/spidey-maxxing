import { useState, useRef, useEffect } from 'react';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { WebLine } from './WebLine';

interface SwingingRopeProps {
  start: Vector3;
  end: Vector3;
  segments?: number;
  gravity?: number;
  tension?: number;
  damping?: number;
  opacity?: number;
}

interface RopePoint {
  position: Vector3;
  prevPosition: Vector3;
  isFixed: boolean;
}

export const SwingingRope = ({
  start,
  end,
  segments = 20,
  gravity = 9.8,
  tension = 0.95,
  damping = 0.99,
  opacity = 1
}: SwingingRopeProps) => {
  const [ropePoints, setRopePoints] = useState<RopePoint[]>([]);
  const initialized = useRef(false);

  // Initialize rope points
  useEffect(() => {
    if (!initialized.current) {
      const points: RopePoint[] = [];
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const position = new Vector3().lerpVectors(start, end, t);
        
        points.push({
          position: position.clone(),
          prevPosition: position.clone(),
          isFixed: i === 0 || i === segments // Fix start and end points
        });
      }
      
      setRopePoints(points);
      initialized.current = true;
    }
  }, [start, end, segments]);

  // Update fixed points when start or end changes
  useEffect(() => {
    if (ropePoints.length > 0) {
      setRopePoints(prev => {
        const updated = [...prev];
        if (updated[0]) {
          updated[0].position.copy(start);
          updated[0].prevPosition.copy(start);
        }
        if (updated[updated.length - 1]) {
          updated[updated.length - 1].position.copy(end);
          updated[updated.length - 1].prevPosition.copy(end);
        }
        return updated;
      });
    }
  }, [start, end, ropePoints.length]);

  // Verlet integration physics simulation
  useFrame((_, delta) => {
    if (ropePoints.length === 0) return;

    const dt = Math.min(delta, 0.016); // Cap at 60fps
    const iterations = 5; // Constraint iterations for stability

    setRopePoints(prev => {
      const updated = prev.map(point => ({
        position: point.position.clone(),
        prevPosition: point.prevPosition.clone(),
        isFixed: point.isFixed
      }));

      // Apply Verlet integration
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].isFixed) continue;

        const point = updated[i];
        const velocity = new Vector3()
          .subVectors(point.position, point.prevPosition)
          .multiplyScalar(damping);

        point.prevPosition.copy(point.position);

        // Update position with velocity
        point.position.add(velocity);

        // Apply gravity
        point.position.y -= gravity * dt * dt;
      }

      // Apply distance constraints (multiple iterations for stability)
      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < updated.length - 1; i++) {
          const p1 = updated[i];
          const p2 = updated[i + 1];

          const segmentLength = start.distanceTo(end) / segments;
          const diff = new Vector3().subVectors(p2.position, p1.position);
          const distance = diff.length();
          const error = distance - segmentLength;

          if (distance > 0.0001) {
            const correction = diff.normalize().multiplyScalar(error * 0.5 * tension);

            if (!p1.isFixed) {
              p1.position.add(correction);
            }
            if (!p2.isFixed) {
              p2.position.sub(correction);
            }
          }
        }
      }

      return updated;
    });
  });

  // Render rope as connected line segments
  if (ropePoints.length < 2) return null;

  return (
    <group>
      {ropePoints.slice(0, -1).map((point, i) => {
        const nextPoint = ropePoints[i + 1];
        if (!nextPoint) return null;

        return (
          <WebLine
            key={i}
            start={point.position}
            end={nextPoint.position}
            opacity={opacity}
            lineWidth={2}
            showSparkles={i % 3 === 0} // Sparkles on every 3rd segment
          />
        );
      })}
    </group>
  );
};
