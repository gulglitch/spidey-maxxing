import { useEffect } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import { detectWebShooterGesture } from './utils/gestureRecognition';
import { useWebStore } from './store/webStore';
import { WebcamView } from './components/WebcamView';
import { Scene3D } from './components/Scene3D';
import './App.css';

function App() {
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

  return (
    <>
      {/* 3D Scene - Behind everything */}
      {!isLoading && !error && (
        <Scene3D handData={handData} gestureResult={gestureResult} />
      )}

      {/* UI Overlay */}
      <div className="app">
        <div className="header">
          <h1>🕷️ Spidey Maxxing</h1>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading hand tracking...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <p>❌ {error}</p>
            <p>Please allow camera access and refresh the page</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <WebcamView videoElement={videoRef.current} handData={handData} />
            
            <div className="status-panel">
              <div className="status-item">
                <span className="label">Hand Detected:</span>
                <span className={handData ? 'value active' : 'value'}>
                  {handData ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              {handData && (
                <div className="status-item">
                  <span className="label">Handedness:</span>
                  <span className="value">{handData.handedness}</span>
                </div>
              )}
              
              <div className="status-item highlight">
                <span className="label">Web Shooter:</span>
                <span className={gestureResult?.isWebShooter ? 'value gesture-active' : 'value'}>
                  {gestureResult?.isWebShooter ? '🕸️ ACTIVE' : '⭕ Inactive'}
                </span>
              </div>
            </div>

            <div className="instructions">
              <h3>📋 Instructions:</h3>
              <ol>
                <li>Show your hand to the webcam</li>
                <li>Make the gesture: 🤘 (fold middle + ring fingers)</li>
                <li>Watch the 3D scene behind - webs will shoot!</li>
                <li>Green sphere = gesture active, Red = inactive</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
