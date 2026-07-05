# 🕷️ Phase 4: Advanced Web Interactions

## Overview
Phase 4 introduces three distinct web interaction modes with advanced physics simulation, transforming the basic web shooting into a full-featured Spider-Man experience.

## 🎯 Three Interaction Modes

### 1. **Shoot Mode** 🎯
The classic web shooting mode from Phase 3.

**How to Use:**
1. Click the "Shoot" button in the mode selector (top-right)
2. Make the web shooter gesture (🤘 with middle & ring fingers down)
3. Web shoots forward and sticks to surfaces
4. Multiple webs can exist simultaneously

**Features:**
- Fast projectile motion with gravity
- Collision detection with environment
- Visual burst effect at impact point
- 18-strand fan pattern

### 2. **Swing Mode** 🕷️
Attach webs and swing with realistic rope physics!

**How to Use:**
1. Click the "Swing" button in the mode selector
2. Make the web shooter gesture
3. Web attaches to ceiling/walls and creates a rope
4. Move your hand to swing - the rope follows physics!

**Physics Details:**
- 20 rope segments for smooth motion
- Verlet integration for stability
- Distance constraints maintain rope length
- Gravity: 15 m/s²
- Tension: 0.98 (very tight rope)
- Hand position updates rope start point in real-time

**Technical:**
```typescript
- Segments: 20
- Spring stiffness: 200
- Damping: 0.99
- Constraint iterations: 5
```

### 3. **Pull Mode** 🧲
Grab objects with webs and pull them toward you!

**How to Use:**
1. Click the "Pull" button in the mode selector
2. Aim at one of the colored cubes
3. Make the web shooter gesture
4. Web attaches and pulls the object toward you
5. Object glows red while being pulled

**Features:**
- Physics-based force application
- Pull strength: 150 units
- Objects have mass and momentum
- Completion detection at 70% distance
- Visual feedback (glow + particle effects)

## 🏗️ New Components

### SwingingRope.tsx
Implements Verlet integration physics for rope simulation.

**Key Features:**
- Fixed endpoints (hand and attach point)
- Verlet integration for realistic motion
- Distance constraints between segments
- Configurable gravity and tension

**Parameters:**
```typescript
segments?: number      // Default: 20
gravity?: number       // Default: 9.8
tension?: number       // Default: 0.95
damping?: number       // Default: 0.99
```

### PullableObject.tsx
Physics-enabled objects that can be pulled with webs.

**Properties:**
- Mass-based physics simulation
- Force application from pull webs
- Emissive glow when being pulled
- Rotation torque for visual effect
- Completion callback

### AdvancedWebShooter.tsx
Enhanced web shooter supporting all three modes.

**Improvements over basic WebShooter:**
- Mode-aware behavior
- Multiple attachment tracking
- Real-time hand position updates
- Mode-specific rendering
- Integration with Zustand store

### InteractionModeSelector.tsx
UI component for switching between modes.

**Features:**
- Visual mode indicator
- Active mode highlighting
- Smooth transitions
- Keyboard-friendly (can be extended)

### InteractiveTestObjects.tsx
Physics-enabled test environment.

**Contents:**
- 3 pullable cubes (different sizes/masses)
- 4 walls for web attachment
- Ceiling for swinging
- 3 platforms for testing
- Ground plane with physics
- Grid reference

## 🎨 Visual Enhancements

### Rope Rendering
- Sparkles on every 3rd segment
- Multiple glow layers
- Smooth line interpolation
- Opacity based on lifetime

### Pull Mode Visuals
- Red sphere at attach point
- Object emissive glow
- Point light following object
- Force direction indicators

### Swing Mode Visuals
- Longer web lifetime (15 seconds)
- Fewer strands (12 vs 18) for performance
- Real-time hand tracking
- Smooth segment transitions

## 📊 Performance Considerations

### Optimizations
1. **Rope Segments**: Limited to 20 for 60fps
2. **Physics Iterations**: 5 constraint passes
3. **Reduced Strands**: 12 for attached webs
4. **Damping**: Prevents unstable oscillations
5. **Frame Capping**: Delta capped at 0.016s

### Physics Settings
```typescript
Physics {
  gravity: [0, -9.8, 0]
  iterations: 20
  tolerance: 0.0001
}
```

## 🧪 Testing Guide

### Test Swing Mode
1. Switch to Swing mode
2. Aim at the ceiling (gray surface above)
3. Shoot web upward
4. Move your hand left/right to see rope physics
5. Watch the rope segments respond to gravity

### Test Pull Mode
1. Switch to Pull mode
2. Aim at the red cube (left side)
3. Shoot web at the cube
4. Object should glow and move toward you
5. Try different cubes (different masses)

### Test Multiple Attachments
1. Shoot mode allows multiple webs
2. Each web tracked independently
3. Attachments stored in Zustand
4. Can be extended for dual-hand swinging

## 🔧 Configuration

### Adjust Rope Physics
In `SwingingRope.tsx`:
```typescript
gravity={15}        // Increase for faster fall
tension={0.98}      // Increase for tighter rope
damping={0.99}      // Increase to reduce bounce
segments={20}       // More = smoother (but slower)
```

### Adjust Pull Force
In `AdvancedWebShooter.tsx`:
```typescript
const pullStrength = 150;  // Increase for stronger pull
```

### Adjust Object Mass
In `InteractiveTestObjects.tsx`:
```typescript
<PullableObject
  mass={5}  // Lower = easier to pull
  ...
/>
```

## 🐛 Known Issues & Limitations

### Current Limitations
1. Pull force applies globally (not to specific object yet)
2. No multi-point swinging (coming in future phase)
3. Rope doesn't collide with environment
4. No web breaking under tension

### Future Enhancements
- Dual-hand swinging
- Web breaking physics
- Object-specific pull forces
- Rope collision detection
- Web strength visualization

## 📚 Technical Details

### Store Schema
```typescript
interface ExtendedWebStore {
  attachments: WebAttachment[]
  interactionMode: 'shoot' | 'swing' | 'pull'
  addAttachment: (attachment) => void
  removeAttachment: (id) => void
  clearAttachments: () => void
  setInteractionMode: (mode) => void
}
```

### Physics Integration
Uses `@react-three/cannon` for:
- Rigid body dynamics
- Collision detection
- Force application
- Ground/wall physics

### Verlet Integration
```typescript
// Position update
velocity = (position - prevPosition) * damping
position = position + velocity + gravity * dt²

// Distance constraint
error = distance - targetLength
correction = direction * error * 0.5 * tension
```

## 🚀 Next Steps (Phase 5)

Phase 5 will add:
- Enhanced particle systems
- Impact effects
- Motion trails
- Shader effects for webs
- Audio integration
- Performance optimization

## 💡 Tips for Development

1. **Test in Swing Mode First**: Most visually impressive
2. **Adjust Physics Live**: Use React DevTools to tweak values
3. **Monitor FPS**: Keep an eye on performance with rope segments
4. **Try Different Masses**: See how pull mode responds
5. **Experiment with Tension**: Find the sweet spot for your preference

---

**Phase 4 Status**: ✅ Complete
**Next Phase**: Phase 5 - Visual Effects
