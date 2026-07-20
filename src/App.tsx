import { useEffect, useState, useRef } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import { detectWebShooterGesture } from './utils/gestureRecognition';
import { useWebStore } from './store/webStore';
import WelcomeScreen from './components/WelcomeScreen';
import { GameplayCanyonScene, type GameplayCanyonHandle } from './components/GameplayCanyonScene';
import { FuturisticHUD } from './components/FuturisticHUD';
import { InteractiveWebBackground } from './components/InteractiveWebBackground';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { handData, isLoading, error } = useHandTracking();
  const { setHandData, setGestureResult, gestureResult } = useWebStore();
  const canyonSceneRef = useRef<GameplayCanyonHandle>(null);

  useEffect(() => {
    setHandData(handData);
    
    if (handData) {
      const gesture = detectWebShooterGesture(handData);
      setGestureResult(gesture);
    } else {
      setGestureResult(null);
    }
  }, [handData, setHandData, setGestureResult]);

  const handleStart = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <>
      {/* Interactive Web Background - Always visible */}
      <InteractiveWebBackground />

      {/* GameplayCanyonScene - Webcam + 3D Buildings + Web shooting */}
      {!isLoading && !error && (
        <GameplayCanyonScene ref={canyonSceneRef} />
      )}

      {/* Futuristic HUD Overlay */}
      {!isLoading && !error && (
        <FuturisticHUD handData={handData} gestureResult={gestureResult} />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Calibrating Web-Shooters...</p>
          <p className="loading-subtitle">Initializing hand tracking</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-overlay">
          <div className="error-icon">❌</div>
          <h2>Camera Access Required</h2>
          <p>{error}</p>
          <p>Please allow camera access and refresh the page</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      )}
    </>
  );
}

export default App;
