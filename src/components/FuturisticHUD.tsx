import { useEffect, useState } from 'react';
import type { HandData, GestureResult } from '../types';
import { useWebStore } from '../store/webStore';
import './FuturisticHUD.css';

interface FuturisticHUDProps {
  handData: HandData | null;
  gestureResult: GestureResult | null;
}

export const FuturisticHUD = ({ handData, gestureResult }: FuturisticHUDProps) => {
  const interactionMode = useWebStore((state) => state.interactionMode);
  const setInteractionMode = useWebStore((state) => state.setInteractionMode);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') setInteractionMode('shoot');
      if (e.key === '2') setInteractionMode('swing');
      if (e.key === '3') setInteractionMode('pull');
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setInteractionMode]);

  const parallaxX = (mousePos.x / window.innerWidth - 0.5) * 20;
  const parallaxY = (mousePos.y / window.innerHeight - 0.5) * 20;

  return (
    <div className="futuristic-hud">
      {/* Geometric Corner Frames */}
      <div className="corner-frame corner-tl" style={{ transform: `translate(${-parallaxX * 0.1}px, ${-parallaxY * 0.1}px)` }}>
        <svg viewBox="0 0 200 200" className="corner-svg">
          <path d="M0,0 L200,0 L200,30 L170,30 L170,50 L30,50 L30,170 L50,170 L50,200 L0,200 Z" className="frame-path" />
          <path d="M10,10 L190,10 L190,20 L170,20 L170,40 L40,40 L40,180 L50,180 L50,190 L10,190 Z" className="frame-inner" />
        </svg>
        <div className="corner-accent corner-accent-1"></div>
        <div className="corner-accent corner-accent-2"></div>
      </div>

      <div className="corner-frame corner-tr" style={{ transform: `translate(${parallaxX * 0.1}px, ${-parallaxY * 0.1}px)` }}>
        <svg viewBox="0 0 200 200" className="corner-svg">
          <path d="M200,0 L0,0 L0,30 L30,30 L30,50 L170,50 L170,170 L150,170 L150,200 L200,200 Z" className="frame-path" />
          <path d="M190,10 L10,10 L10,20 L30,20 L30,40 L160,40 L160,180 L150,180 L150,190 L190,190 Z" className="frame-inner" />
        </svg>
        <div className="corner-accent corner-accent-1"></div>
        <div className="corner-accent corner-accent-2"></div>
      </div>

      <div className="corner-frame corner-bl" style={{ transform: `translate(${-parallaxX * 0.1}px, ${parallaxY * 0.1}px)` }}>
        <svg viewBox="0 0 200 200" className="corner-svg">
          <path d="M0,200 L200,200 L200,170 L170,170 L170,150 L30,150 L30,30 L50,30 L50,0 L0,0 Z" className="frame-path" />
          <path d="M10,190 L190,190 L190,180 L170,180 L170,160 L40,160 L40,20 L50,20 L50,10 L10,10 Z" className="frame-inner" />
        </svg>
        <div className="corner-accent corner-accent-1"></div>
        <div className="corner-accent corner-accent-2"></div>
      </div>

      <div className="corner-frame corner-br" style={{ transform: `translate(${parallaxX * 0.1}px, ${parallaxY * 0.1}px)` }}>
        <svg viewBox="0 0 200 200" className="corner-svg">
          <path d="M200,200 L0,200 L0,170 L30,170 L30,150 L170,150 L170,30 L150,30 L150,0 L200,0 Z" className="frame-path" />
          <path d="M190,190 L10,190 L10,180 L30,180 L30,160 L160,160 L160,20 L150,20 L150,10 L190,10 Z" className="frame-inner" />
        </svg>
        <div className="corner-accent corner-accent-1"></div>
        <div className="corner-accent corner-accent-2"></div>
      </div>

      {/* Top HUD Bar */}
      <div className="hud-bar hud-top">
        <div className="hud-section hud-left">
          <div className="hud-logo">
            <div className="spider-icon-hud">
              <svg viewBox="0 0 40 40">
                <path d="M20,8 L20,32 M8,20 L32,20 M12,12 L28,28 M28,12 L12,28" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="20" r="6" fill="currentColor" />
              </svg>
            </div>
            <span className="hud-title">SPIDEY MAXXING</span>
          </div>
        </div>

        <div className="hud-section hud-center">
          <div className="status-grid">
            <div className="status-cell">
              <span className="status-label">TRACKING</span>
              <span className={`status-value ${handData ? 'active' : ''}`}>
                {handData ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="status-divider"></div>
            <div className="status-cell">
              <span className="status-label">SHOOTER</span>
              <span className={`status-value ${gestureResult?.isWebShooter ? 'active' : ''}`}>
                {gestureResult?.isWebShooter ? 'FIRING' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        <div className="hud-section hud-right">
          <div className="mode-label">MODE</div>
        </div>
      </div>

      {/* Right Side Mode Selector */}
      <div className="mode-selector-vertical">
        <div className="mode-title">WEB SYSTEM</div>
        
        {[
          { mode: 'shoot' as const, label: 'SHOOT', icon: '🎯', key: '1' },
          { mode: 'swing' as const, label: 'SWING', icon: '🕷️', key: '2' },
          { mode: 'pull' as const, label: 'PULL', icon: '🧲', key: '3' }
        ].map(({ mode, label, icon, key }) => (
          <button
            key={mode}
            className={`mode-btn-vertical ${interactionMode === mode ? 'active' : ''}`}
            onClick={() => setInteractionMode(mode)}
          >
            <div className="mode-hex-container">
              <svg viewBox="0 0 100 100" className="mode-hex-bg">
                <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" className="hex-fill" />
                <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" className="hex-stroke" />
              </svg>
              <div className="mode-content-vertical">
                <span className="mode-icon-vertical">{icon}</span>
                <span className="mode-label-vertical">{label}</span>
                <span className="mode-key-vertical">[{key}]</span>
              </div>
            </div>
            <div className="mode-indicator"></div>
          </button>
        ))}
      </div>

      {/* Bottom Gesture Indicator */}
      <div className="gesture-hud-bottom">
        <div className={`gesture-status ${
          !handData ? 'status-error' : 
          gestureResult?.isWebShooter ? 'status-active' : 
          'status-ready'
        }`}>
          <div className="gesture-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="ring-bg" />
              <circle cx="60" cy="60" r="50" className="ring-progress" />
              <circle cx="60" cy="60" r="40" className="ring-inner" />
            </svg>
          </div>
          <div className="gesture-icon">
            {!handData ? '🔴' : gestureResult?.isWebShooter ? '🟢' : '🟡'}
          </div>
          <div className="gesture-label">
            {!handData ? 'NO HAND' : gestureResult?.isWebShooter ? 'ACTIVE' : 'READY'}
          </div>
        </div>
      </div>

      {/* Scan Lines */}
      <div className="scan-line scan-1"></div>
      <div className="scan-line scan-2"></div>

      {/* Grid Overlay */}
      <div className="grid-overlay"></div>
    </div>
  );
};
