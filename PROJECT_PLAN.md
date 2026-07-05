# 🕷️ Spider-Man Web Shooter - Complete Project Plan

## 📋 Project Overview

**Project Name**: Spidey-Maxxing  
**Difficulty**: ⭐⭐⭐⭐⭐  
**Estimated Timeline**: 4-6 weeks  

### What It Does
- Detects web-shooter hand gesture (middle two fingers down) via webcam
- Shoots realistic webs with physics simulation
- Creates web swinging between points with rope physics
- Interactive object pulling with web mechanics

### Why It's Amazing
✨ Complex physics simulation  
✨ Real-time hand tracking  
✨ Multiple interaction modes (shoot, swing, pull)  
✨ Immersive 3D environment  
✨ Advanced visual effects  

---

## 🏗️ Architecture Overview

```
User's Webcam
     ↓
MediaPipe Hands (Hand Detection & Tracking)
     ↓
React State Management (Zustand)
     ↓
Three.js/React Three Fiber (3D Rendering)
     ↓
Physics Engine (Cannon.js - Web Physics)
     ↓
Visual Effects (Particles, Shaders, Trails)
     ↓
Audio System (Howler.js - Sound Effects)
     ↓
Final Canvas Output (60 FPS)
```

---

## 📦 Complete Tech Stack

### Core Technologies

| Technology | Purpose | Why This One? |
|------------|---------|---------------|
| **React 18.3.1** | UI Framework | Already in project, component-based |
| **TypeScript** | Type Safety | Catch bugs early, better DX |
| **Vite** | Build Tool | Fast HMR, optimized builds |
| **MediaPipe Hands** | Hand Tracking | Real-time, accurate, browser-native |
| **Three.js** | 3D Graphics | Industry standard WebGL library |
| **React Three Fiber** | 3D in React | JSX for 3D, React integration |
| **Drei** | R3F Helpers | Pre-built 3D components |
| **Cannon.js** | Physics Engine | Lightweight, web-optimized |
| **Zustand** | State Management | Simple, performant, no boilerplate |
| **Howler.js** | Audio System | Better than HTML5 audio |
| **Three.quarks** | Particle System | GPU-accelerated particles |

### Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@mediapipe/hands": "^0.4.1646424915",
    "@mediapipe/camera_utils": "^0.3.1620248357",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.95.0",
    "cannon-es": "^0.20.0",
    "@react-three/cannon": "^6.6.0",
    "three.quarks": "^0.12.0",
    "howler": "^2.2.3",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

---

## 🎯 Core Features Breakdown

### 1. Hand Detection & Gesture Recognition

**MediaPipe Hands Integration**
- Real-time webcam capture (30-60 FPS)
- 21 landmark points per hand
- Gesture detection algorithm

**Web Shooter Gesture**
```typescript
// Target gesture: 🤘 but with middle + ring fingers down
const isWebShooterGesture = 
  indexFingerExtended &&
  pinkyExtended &&
  thumbExtended &&
  middleFingerDown &&
  ringFingerDown;
```

**Hand Tracking Data**
```typescript
interface HandLandmark {
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
  z: number;  // depth
}

interface HandData {
  landmarks: HandLandmark[]; // 21 points
  handedness: 'Left' | 'Right';
  confidence: number;
}
```

### 2. Web Physics Simulation

**Web Shooting Mechanics**
- Initial velocity from hand thrust speed
- Gravity effects
- Air resistance
- Collision detection with raycasting

**Physics Properties**
```typescript
const webPhysics = {
  mass: 0.1,              // kg
  initialSpeed: 50,       // m/s
  gravity: -9.8,          // m/s²
  airResistance: 0.02,    // drag coefficient
  maxLength: 100,         // meters
  springStiffness: 100,   // for swinging
  damping: 0.95          // momentum loss
};
```

**Web States**
1. **Shooting**: Projectile motion with gravity
2. **Attached**: Spring constraint to surface
3. **Swinging**: Pendulum physics
4. **Retracting**: Pull-back animation

### 3. 3D Rendering System

**Scene Components**
- Main camera (follows hand position)
- Environment (buildings, obstacles)
- Web visualization (lines, trails, particles)
- Hand skeleton overlay
- UI elements (crosshair, gesture indicator)

**Web Visual Elements**
- Line geometry for web string
- Trail effect for motion
- Impact particles on collision
- Glow shader for emphasis

### 4. Interaction Modes

**Mode 1: Web Shooting**
- Detect gesture → Shoot web forward
- Raycast for collision
- Visual + audio feedback

**Mode 2: Web Swinging**
- Attach to surface
- Pendulum physics simulation
- Rope rendering with segments

**Mode 3: Object Pulling**
- Attach web to object
- Apply force toward hand
- Physics-based movement

---

## 🗂️ Project Structure

```
spidey-maxxing/
├── public/
│   ├── sounds/
│   │   ├── thwip.mp3          # Web shooting sound
│   │   ├── impact.mp3         # Web hit sound
│   │   └── swing.mp3          # Swinging sound
│   └── models/
│       └── environment.glb     # 3D environment (optional)
├── src/
│   ├── components/
│   │   ├── Scene/
│   │   │   ├── Scene.tsx              # Main R3F scene
│   │   │   ├── Camera.tsx             # Camera controller
│   │   │   ├── Environment.tsx        # 3D environment
│   │   │   └── Lighting.tsx           # Lights setup
│   │   ├── Web/
│   │   │   ├── WebShooter.tsx         # Web shooting logic
│   │   │   ├── WebLine.tsx            # Web visualization
│   │   │   ├── WebParticles.tsx       # Particle effects
│   │   │   └── WebPhysics.tsx         # Physics simulation
│   │   ├── Hand/
│   │   │   ├── HandTracking.tsx       # MediaPipe integration
│   │   │   ├── HandSkeleton.tsx       # Visual overlay
│   │   │   └── GestureDetector.tsx    # Gesture recognition
│   │   └── UI/
│   │       ├── WebcamView.tsx         # Video feed
│   │       ├── Crosshair.tsx          # Aiming crosshair
│   │       └── GestureIndicator.tsx   # Gesture status
│   ├── hooks/
│   │   ├── useHandTracking.ts         # MediaPipe hook
│   │   ├── useWebPhysics.ts           # Physics hook
│   │   ├── useGesture.ts              # Gesture detection
│   │   └── useAudio.ts                # Sound effects
│   ├── store/
│   │   └── webStore.ts                # Zustand state
│   ├── utils/
│   │   ├── coordinateTransform.ts     # 2D to 3D conversion
│   │   ├── physics.ts                 # Physics calculations
│   │   ├── raycasting.ts              # Collision detection
│   │   └── gestureRecognition.ts      # Gesture algorithms
│   ├── shaders/
│   │   ├── webGlow.glsl               # Web glow effect
│   │   └── webTexture.glsl            # Web string texture
│   ├── types/
│   │   └── index.ts                   # TypeScript types
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── PROJECT_PLAN.md                    # This file
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔧 Implementation Phases

### Phase 1: Setup & Hand Tracking (Week 1)

**Goals**
- ✅ Project setup with all dependencies
- ✅ MediaPipe Hands integration
- ✅ Webcam access and video feed
- ✅ Hand skeleton visualization
- ✅ Basic gesture detection

**Deliverables**
- Working webcam feed
- Hand landmarks displayed as dots
- Console logging detected gestures

**Key Tasks**
1. Install MediaPipe packages
2. Create HandTracking component
3. Implement webcam capture
4. Extract 21 hand landmarks
5. Build gesture recognition algorithm
6. Create visual feedback for gestures

### Phase 2: 3D Scene & Basic Web (Week 2)

**Goals**
- ✅ Three.js/R3F scene setup
- ✅ Basic web shooting visualization
- ✅ Coordinate transformation (2D → 3D)
- ✅ Simple line rendering

**Deliverables**
- 3D scene with camera
- Web shoots from hand position
- Line follows trajectory
- Basic collision detection

**Key Tasks**
1. Setup React Three Fiber
2. Create main Scene component
3. Implement coordinate conversion
4. Build WebShooter component
5. Create WebLine visualization
6. Add basic raycasting

### Phase 3: Physics Integration (Week 3)

**Goals**
- ✅ Cannon.js physics setup
- ✅ Realistic web trajectory
- ✅ Gravity and air resistance
- ✅ Collision physics

**Deliverables**
- Web follows realistic parabolic arc
- Bounces off surfaces (optional)
- Sticks to objects
- Spring constraints for attachment

**Key Tasks**
1. Setup @react-three/cannon
2. Create physics world
3. Implement web physics body
4. Add gravity forces
5. Build collision system
6. Create spring constraints

### Phase 4: Advanced Interactions (Week 4)

**Goals**
- ✅ Web swinging mechanics
- ✅ Object pulling
- ✅ Multiple web points support
- ✅ Rope physics with Verlet integration

**Deliverables**
- ✅ Functional web swinging with rope physics
- ✅ Pull objects toward hand with force application
- ✅ Rope with segment physics and constraints
- ✅ Smooth pendulum motion with damping
- ✅ Interactive mode selector UI (Shoot/Swing/Pull)
- ✅ Physics-enabled test environment
- ✅ Multiple attachment point tracking

**Key Tasks**
1. ✅ Implement rope segmentation with Verlet integration
2. ✅ Build swinging physics with pendulum dynamics
3. ✅ Create pendulum system with distance constraints
4. ✅ Add object pulling force with physics bodies
5. ✅ Handle multiple attach points via store
6. ✅ Optimize rope rendering with segment reduction

**Implementation Details**
- Created `SwingingRope.tsx` with Verlet physics simulation
- Created `PullableObject.tsx` with physics bodies and pull forces
- Created `AdvancedWebShooter.tsx` supporting 3 interaction modes
- Created `InteractionModeSelector.tsx` UI for mode switching
- Created `InteractiveTestObjects.tsx` with physics-enabled environment
- Updated `webStore.ts` to track multiple attachments
- Integrated `@react-three/cannon` for physics simulation
- Added distance constraints for rope segment integrity
- Implemented spring forces for realistic swinging motion

**How It Works**
- **Shoot Mode**: Traditional web shooting with sticking
- **Swing Mode**: Attaches web and simulates rope with 20 segments
  - Uses Verlet integration for physics
  - Distance constraints maintain rope length
  - Gravity and tension create realistic swing motion
- **Pull Mode**: Attaches to objects and applies pull force
  - Objects glow when being pulled
  - Force strength: 150 units toward hand
  - Completion detection at 70% distance threshold

### Phase 5: Visual Effects (Week 5)

**Goals**
- ✅ Particle systems
- ✅ Shader effects
- ✅ Motion trails
- ✅ Impact effects
