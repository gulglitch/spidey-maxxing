import { useEffect, useState } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import { detectWebShooterGesture } from './utils/gestureRecognition';
import { useWebStore } from './store/webStore';
import WelcomeScreen from './components/WelcomeScreen';
import { WebcamDisplay } from './components/WebcamDisplay';
import { CityScene } from './components/CityScene';
import { FuturisticHUD } from './components/FuturisticHUD';
import './App.css';

/**
 * Layer stack (bottom → top):
 *
 *  z-index 1   WebcamDisplay   — raw mirrored camera feed, object-fit:contain
 *  z-index 5   CityScene       — Three.js alpha canvas: 3D buildings + web shooter
 *  z-index 50  FuturisticHUD   — 2D overlay: status bar, mode buttons, gesture ring
 *  z-index 9999 loading/error  — full-screen overlays
 */
function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { handData, isLoading, error } = useHandTracking();
  const { setHandData, setGestureResult, gestureResult } = useWebStore();

  useEffect(() => {
    setHandData(handData);
    if (handData) {
      setGestureResult(detectWebShooterGesture(handData));
    } else {
      setGestureResult(null);
    }
  }, [handData, setHandData, setGestureResult]);

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
  }

  return (
    <>
      {/* Layer 1 — visible webcam feed */}
      <WebcamDisplay />

      {/* Layer 2 — 3D city buildings + web shooter (alpha canvas) */}
      <CityScene handData={handData} gestureResult={gestureResult} />

      {/* Layer 3 — HUD */}
      {!isLoading && !error && (
        <FuturisticHUD handData={handData} gestureResult={gestureResult} />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Calibrating Web-Shooters...</p>
          <p className="loading-subtitle">Initializing hand tracking</p>
        </div>
      )}

      {/* Error */}
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
