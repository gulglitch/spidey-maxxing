import { useEffect, useState } from 'react';
import type { HandData, GestureResult } from '../types';
import './GestureIndicator.css';

interface GestureIndicatorProps {
  handData: HandData | null;
  gestureResult: GestureResult | null;
}

export const GestureIndicator = ({ handData, gestureResult }: GestureIndicatorProps) => {
  const [status, setStatus] = useState<'no-hand' | 'ready' | 'active'>('no-hand');

  useEffect(() => {
    if (!handData) {
      setStatus('no-hand');
    } else if (gestureResult?.isWebShooter) {
      setStatus('active');
    } else {
      setStatus('ready');
    }
  }, [handData, gestureResult]);

  const statusConfig = {
    'no-hand': {
      color: '#E72020',
      icon: '🔴',
      text: 'NO HAND DETECTED',
      class: 'status-error'
    },
    'ready': {
      color: '#4F6793',
      icon: '🟡',
      text: 'READY',
      class: 'status-ready'
    },
    'active': {
      color: '#9A1316',
      icon: '🟢',
      text: 'WEB SHOOTER ACTIVE',
      class: 'status-active'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`gesture-indicator ${config.class}`}>
      <svg className="indicator-ring" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="4"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={config.color}
          strokeWidth="4"
          strokeLinecap="round"
          className="progress-ring"
          style={{
            strokeDasharray: '502.4',
            strokeDashoffset: status === 'no-hand' ? '502.4' : '0'
          }}
        />
      </svg>

      <div className="indicator-content">
        <div className="indicator-icon">{config.icon}</div>
        <div className="indicator-text">{config.text}</div>
      </div>

      {status === 'active' && (
        <div className="indicator-particles">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--angle': `${(i * 30)}deg`,
                animationDelay: `${i * 0.1}s`
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
};
