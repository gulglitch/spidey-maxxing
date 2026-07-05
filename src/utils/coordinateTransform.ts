import type { HandLandmark } from '../types';

// Convert MediaPipe normalized coordinates (0-1) to 3D world space
export const landmarkTo3D = (
  landmark: HandLandmark,
  scale: number = 20
): [number, number, number] => {
  // MediaPipe: x=0 is left, x=1 is right, y=0 is top, y=1 is bottom
  // Three.js: x increases right, y increases up, z increases toward camera
  
  const x = (landmark.x - 0.5) * scale;  // Center at 0
  const y = -(landmark.y - 0.5) * scale; // Flip Y (MediaPipe is top-down)
  const z = landmark.z * scale;          // Depth
  
  return [x, y, z];
};

// Calculate velocity from two positions over time
export const calculateVelocity = (
  current: [number, number, number],
  previous: [number, number, number],
  deltaTime: number = 0.016 // ~60fps
): [number, number, number] => {
  if (deltaTime === 0) return [0, 0, 0];
  
  return [
    (current[0] - previous[0]) / deltaTime,
    (current[1] - previous[1]) / deltaTime,
    (current[2] - previous[2]) / deltaTime,
  ];
};

// Get the direction vector from hand position
export const getShootDirection = (
  handPosition: [number, number, number],
  handVelocity: [number, number, number]
): [number, number, number] => {
  // Combine hand orientation with velocity for shoot direction
  const baseDirection: [number, number, number] = [0, 0, -1]; // Forward
  
  // If hand is moving fast, use velocity direction
  const speed = Math.sqrt(
    handVelocity[0] ** 2 + 
    handVelocity[1] ** 2 + 
    handVelocity[2] ** 2
  );
  
  if (speed > 5) {
    // Normalize velocity
    return [
      handVelocity[0] / speed,
      handVelocity[1] / speed,
      handVelocity[2] / speed,
    ];
  }
  
  return baseDirection;
};
