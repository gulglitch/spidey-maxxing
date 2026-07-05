import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import type { HandData } from '../types';

export const useHandTracking = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isCleanedUp = false;

    const initializeHandDetection = async () => {
      try {
        console.log('Loading MediaPipe vision tasks...');
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        console.log('Creating HandLandmarker...');
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task',
            delegate: 'GPU'
          },
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          runningMode: 'VIDEO'
        });

        console.log('HandLandmarker created successfully!');
        detectHands();
      } catch (err: any) {
        console.error('Error initializing hand detection:', err);
        setError('Failed to initialize hand tracking: ' + err.message);
        setIsLoading(false);
      }
    };

    const detectHands = () => {
      if (isCleanedUp) return;
      
      if (videoRef.current && videoRef.current.readyState >= 2 && handLandmarkerRef.current) {
        try {
          const detections: HandLandmarkerResult = handLandmarkerRef.current.detectForVideo(
            videoRef.current,
            performance.now()
          );

          if (detections.landmarks && detections.landmarks.length > 0) {
            const landmarks = detections.landmarks[0];
            const worldLandmarks = detections.worldLandmarks?.[0] || landmarks;
            
            const detectedHand = detections.handedness?.[0]?.[0]?.categoryName as 'Left' | 'Right' || 'Right';


            setHandData({
              landmarks: landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z })),
              worldLandmarks: worldLandmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z })),
              handedness: detectedHand
            });
          } else {
            setHandData(null);
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }

      animationFrameId = requestAnimationFrame(detectHands);
    };

    const startWebcam = async () => {
      try {
        console.log('Starting webcam...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480 
          } 
        });
        
        const video = document.createElement('video');
        video.style.display = 'none';
        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = stream;
        
        await video.play();
        document.body.appendChild(video);
        videoRef.current = video;

        console.log('Webcam started!');
        setIsLoading(false);
        
        await initializeHandDetection();
      } catch (err: any) {
        console.error('Error accessing webcam:', err);
        setError('Failed to access camera: ' + err.message);
        setIsLoading(false);
      }
    };

    startWebcam();

    return () => {
      console.log('Cleaning up hand tracking...');
      isCleanedUp = true;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (document.body.contains(videoRef.current)) {
          document.body.removeChild(videoRef.current);
        }
      }
      
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  return { handData, isLoading, error, videoRef };
};
