import { useEffect, useState } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import { detectWebShooterGesture } from './utils/gestureRecognition';
import { useWebStore } from './store/webStore';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WebcamView } from './components/WebcamView';
import { Scene3D } from './components/Scene3D';
import { FuturisticHUD } from './components/FuturisticHUD';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { handData, isLoading, error, videoRef } = useHandTracking();
  const { setHandData, setGestureResult, gestureResult } = useWebStore();

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
      {/* Fullscreen Webcam Video - Base Layer */}
      {!isLoading && !error && (
        <WebcamView videoElement={videoRef.current} handData={handData} />
      )}

      {/* 3D Canvas Overlay - Buildings and effects */}
      {!isLoading && !error && (
        <Scene3D handData={handData} gestureResult={gestureResult} />
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
