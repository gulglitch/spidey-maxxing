import type { HandLandmark } from '../types';

// Convert MediaPipe normalized coordinates (0-1) to 3D world space
// This version precisely matches the 2D canvas overlay positioning
export const landmarkTo3D = (
  landmark: HandLandmark,
  cameraFOV: number = 75,
  cameraZ: number = 10
): [number, number, number] => {
  // MediaPipe gives normalized coords (0-1)
  // x: 0 = left edge, 1 = right edge
  // y: 0 = top edge, 1 = bottom edge
  // z: depth relative to wrist (negative = closer to camera)

  // Calculate the visible width/height at the camera's near plane
  const vFOV = (cameraFOV * Math.PI) / 180;
  const height = 2 * Math.tan(vFOV / 2) * cameraZ;
  const width = height * (16 / 9); // Assuming 16:9 aspect ratio, adjust if needed

  // Convert normalized coords to 3D space
  // FLIP X to match the mirrored video (scaleX(-1) in CSS)
  // Center the coordinates and flip Y axis (MediaPipe Y is top-down, Three.js Y is bottom-up)
  const x = -(landmark.x - 0.5) * width; // NEGATIVE to mirror
  const y = -(landmark.y - 0.5) * height; // Flip Y
  const z = -landmark.z * 10; // Map depth (negative z = closer to camera)

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

// Get the direction vector based on hand orientation
export const getShootDirection = (
  indexFingerTip: HandLandmark,
  wrist: HandLandmark,
  middleFinger: HandLandmark
): [number, number, number] => {
  // Convert landmarks to 3D
  const fingerPos = landmarkTo3D(indexFingerTip, 75, 10);
  const wristPos = landmarkTo3D(wrist, 75, 10);
  const middlePos = landmarkTo3D(middleFinger, 75, 10);

  console.log('🎯 DIRECTION CALCULATION:');
  console.log('  Index Finger 3D:', fingerPos);
  console.log('  Wrist 3D:', wristPos);
  console.log('  Middle Finger 3D:', middlePos);

  // Calculate finger pointing direction (from wrist to index finger tip)
  const dirX = fingerPos[0] - wristPos[0];
  const dirY = fingerPos[1] - wristPos[1];
  const dirZ = fingerPos[2] - wristPos[2];

  console.log('  Raw Direction Vector:', [dirX, dirY, dirZ]);

  // Calculate hand plane normal (for twist detection)
  // Vector from wrist to middle finger
  const middleX = middlePos[0] - wristPos[0];
  const middleY = middlePos[1] - wristPos[1];
  const middleZ = middlePos[2] - wristPos[2];

  // Cross product to get perpendicular direction
  const crossX = dirY * middleZ - dirZ * middleY;
  const crossY = dirZ * middleX - dirX * middleZ;
  const crossZ = dirX * middleY - dirY * middleX;

  console.log('  Cross Product:', [crossX, crossY, crossZ]);

  // Use finger direction plus a slight bias from hand orientation
  const finalX = dirX + crossX * 0.1;
  const finalY = dirY + crossY * 0.1;
  const finalZ = dirZ + crossZ * 0.1;

  console.log('  Final Before Normalize:', [finalX, finalY, finalZ]);

  // Normalize the direction
  const length = Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ);
  
  console.log('  Vector Length:', length);

  if (length === 0) {
    // Fallback to forward direction
    console.log('  ⚠️ FALLBACK TO FORWARD!');
    return [0, 0, -1];
  }

  const normalized: [number, number, number] = [finalX / length, finalY / length, finalZ / length];
  console.log('  ✅ Normalized Direction:', normalized);

  return normalized;
};

// Legacy velocity-based direction (keep for backward compatibility)
export const getShootDirectionFromVelocity = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handPosition: [number, number, number],
  handVelocity: [number, number, number]
): [number, number, number] => {
  const baseDirection: [number, number, number] = [0, 0, -1];
  
  const speed = Math.sqrt(
    handVelocity[0] ** 2 + 
    handVelocity[1] ** 2 + 
    handVelocity[2] ** 2
  );
  
  if (speed > 5) {
    return [
      handVelocity[0] / speed,
      handVelocity[1] / speed,
      handVelocity[2] / speed,
    ];
  }
  
  return baseDirection;
};
