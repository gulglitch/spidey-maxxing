import { useEffect, useRef, useState, useCallback } from 'react';
import { InteractiveWebBackground } from './InteractiveWebBackground';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart?: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const threadRef = useRef<HTMLDivElement | null>(null);

  const [fluid, setFluid] = useState(100);
  const [power, setPower] = useState(100);
  const [status, setStatus] = useState('READY');
  const [flashOn, setFlashOn] = useState(false);
  const [readyMsgVisible, setReadyMsgVisible] = useState(false);

  const handleSpiderClick = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    el.style.height = '250px';
    setTimeout(() => {
      if (el) el.style.height = '200px';
    }, 500);
  }, []);

  const handleStart = useCallback(() => {
    setFluid((v) => Math.max(0, v - 15));
    setPower((v) => Math.max(0, v - 6));
    setStatus('LAUNCHING');
    setFlashOn(true);
    setTimeout(() => setFlashOn(false), 90);
    setReadyMsgVisible(true);
    setTimeout(() => {
      setReadyMsgVisible(false);
      setStatus('READY');
    }, 2200);
    onStart?.();
  }, [onStart]);

  return (
    <div className="splash-stage" style={{ ['--sm-red' as string]: '#ff1e2d', ['--sm-red-dim' as string]: '#7a0f16' }}>
      <InteractiveWebBackground />

      <div className="hud-panel panel-left">
        <div className="panel-title">SUIT SYSTEMS</div>
        <div className="bar-row">
          <div className="label">
            WEB FLUID <span className="value">{fluid}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${fluid}%` }} />
          </div>
        </div>
        <div className="bar-row">
          <div className="label">
            SUIT POWER <span className="value">{power}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${power}%` }} />
          </div>
        </div>
      </div>

      <div className="hud-panel panel-right">
        <div>
          STATUS <span className="status-dot" />
        </div>
        <div className="ready-label">{status}</div>
        <div className="label">
          SYSTEM CHECK
          <br />
          COMPLETE
        </div>
      </div>

      <div className="splash-center">
        <div className="spider-drop" onClick={handleSpiderClick}>
          <div ref={threadRef} className="spider-thread" />
          <svg className="spider-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="55" rx="14" ry="18" fill="var(--sm-red)" />
            <ellipse cx="50" cy="32" rx="9" ry="9" fill="var(--sm-red)" />
            <g stroke="var(--sm-red)" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <path d="M38 45 L15 30" />
              <path d="M36 55 L8 50" />
              <path d="M38 65 L14 75" />
              <path d="M40 72 L22 90" />
              <path d="M62 45 L85 30" />
              <path d="M64 55 L92 50" />
              <path d="M62 65 L86 75" />
              <path d="M60 72 L78 90" />
            </g>
          </svg>
        </div>

        <h1 className="splash-title">
          SPIDEY MAXXING
        </h1>

        <p className="splash-quote">
          &quot;With great power comes
          <br />
          great responsibility&quot;
        </p>

        <button className="start-btn" onClick={handleStart}>
          PRESS TO START
        </button>
        <div className={`ready-msg${readyMsgVisible ? ' visible' : ''}`}>
          SYSTEM ARMED — SWING AWAY
        </div>
      </div>

      <div className="footer-left">SPIDEY MAXXING v1.0</div>
      <div className="footer-right">YOU × RESPONSIBILITY</div>

      <div className={`screen-flash${flashOn ? ' flash-on' : ''}`} />
    </div>
  );
}