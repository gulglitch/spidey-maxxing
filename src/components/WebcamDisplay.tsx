import { useEffect, useRef } from 'react';
import './WebcamDisplay.css';

/**
 * Purely visual webcam feed — no hand tracking, just display.
 * The hand tracking runs independently in useHandTracking via its own
 * hidden video element. This component renders a second stream so the
 * user can see themselves without interfering with MediaPipe.
 */
export const WebcamDisplay = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('WebcamDisplay: could not start camera', err);
      }
    };

    start();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="webcam-display">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="webcam-display-video"
      />
    </div>
  );
};
