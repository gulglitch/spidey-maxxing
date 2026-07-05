// Hand tracking types
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
  worldLandmarks: HandLandmark[];
}

export interface GestureResult {
  isWebShooter: boolean;
  confidence: number;
  handPosition: [number, number, number];
  handVelocity: [number, number, number];
}

// Web physics types
export interface WebState {
  isActive: boolean;
  position: [number, number, number];
  velocity: [number, number, number];
  attachPoint: [number, number, number] | null;
  mode: 'idle' | 'shooting' | 'attached' | 'swinging';
}

// Store types
export interface WebStore {
  webState: WebState;
  handData: HandData | null;
  gestureResult: GestureResult | null;
  
  setWebState: (state: Partial<WebState>) => void;
  setHandData: (data: HandData | null) => void;
  setGestureResult: (result: GestureResult | null) => void;
  shootWeb: (position: [number, number, number], velocity: [number, number, number]) => void;
  resetWeb: () => void;
}
