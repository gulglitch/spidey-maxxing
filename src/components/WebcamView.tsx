import { useEffect, useRef } from 'react';
import type { HandData } from '../types';
import './WebcamView.css';

interface WebcamViewProps {
  videoElement: HTMLVideoElement | null;
  handData: HandData | null;
}

export const WebcamView = ({ videoElement, handData }: WebcamViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !videoElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Draw video frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Draw hand landmarks if available
        if (handData) {
          drawHandLandmarks(ctx, handData, canvas.width, canvas.height);
        }
      }
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, [videoElement, handData]);

  const drawHandLandmarks = (
    ctx: CanvasRenderingContext2D,
    handData: HandData,
    width: number,
    height: number
  ) => {
    const { landmarks } = handData;

    // Draw connections between landmarks
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],     // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17]           // Palm
    ];

    // Draw lines
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      ctx.beginPath();
      ctx.moveTo(startPoint.x * width, startPoint.y * height);
      ctx.lineTo(endPoint.x * width, endPoint.y * height);
      ctx.stroke();
    });

    // Draw landmark points
    landmarks.forEach((landmark, index) => {
      const x = landmark.x * width;
      const y = landmark.y * height;

      // Different colors for fingertips
      if ([4, 8, 12, 16, 20].includes(index)) {
        ctx.fillStyle = '#FF0000'; // Red for fingertips
      } else if (index === 0) {
        ctx.fillStyle = '#FFFF00'; // Yellow for wrist
      } else {
        ctx.fillStyle = '#00FF00'; // Green for other points
      }

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  return (
    <div className="webcam-view">
      <canvas ref={canvasRef} className="webcam-canvas" />
    </div>
  );
};
