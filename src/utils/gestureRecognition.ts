import type { HandData, GestureResult, HandLandmark } from '../types';

// MediaPipe hand landmark indices
const LANDMARKS = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  INDEX_MCP: 5,
  MIDDLE_TIP: 12,
  MIDDLE_MCP: 9,
  RING_TIP: 16,
  RING_MCP: 13,
  PINKY_TIP: 20,
  PINKY_MCP: 17
};

const isFingerExtended = (
  tip: HandLandmark,
  mcp: HandLandmark,
  wrist: HandLandmark
): boolean => {
  const tipToWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
  const mcpToWrist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
  return tipToWrist > mcpToWrist * 1.2;
};

export const detectWebShooterGesture = (handData: HandData): GestureResult => {
  const { landmarks } = handData;
  
  const wrist = landmarks[LANDMARKS.WRIST];
  const indexExtended = isFingerExtended(
    landmarks[LANDMARKS.INDEX_TIP],
    landmarks[LANDMARKS.INDEX_MCP],
    wrist
  );
  const pinkyExtended = isFingerExtended(
    landmarks[LANDMARKS.PINKY_TIP],
    landmarks[LANDMARKS.PINKY_MCP],
    wrist
  );
  const middleFolded = !isFingerExtended(
    landmarks[LANDMARKS.MIDDLE_TIP],
    landmarks[LANDMARKS.MIDDLE_MCP],
    wrist
  );
  const ringFolded = !isFingerExtended(
    landmarks[LANDMARKS.RING_TIP],
    landmarks[LANDMARKS.RING_MCP],
    wrist
  );

  const isWebShooter = indexExtended && pinkyExtended && middleFolded && ringFolded;
  
  // Get hand position (using wrist as reference)
  const handPosition: [number, number, number] = [wrist.x, wrist.y, wrist.z];
  
  // Simple velocity estimation (would need previous frame for accuracy)
  const handVelocity: [number, number, number] = [0, 0, 0];

  return {
    isWebShooter,
    confidence: isWebShooter ? 0.9 : 0,
    handPosition,
    handVelocity
  };
};
