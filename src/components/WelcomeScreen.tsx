import { useState, useEffect } from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleKeyPress = () => {
      if (isVisible) {
        onStart();
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, onStart]);

  if (!isVisible) return null;

  return (
    <div className="welcome-screen">
      <div className="welcome-bg-pattern"></div>
      
      <div className="welcome-content">
        <div className="spider-logo">
          <svg viewBox="0 0 100 100" className="spider-icon">
            <path d="M50 20 L50 80 M20 50 L80 50 M30 30 L70 70 M70 30 L30 70" 
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="15" fill="currentColor"/>
          </svg>
        </div>

        <h1 className="welcome-title">
          <span className="title-main">SPIDEY MAXXING</span>
          <span className="title-glow">SPIDEY MAXXING</span>
        </h1>

        <p className="welcome-quote">
          "With great power comes<br />great responsibility"
        </p>

        <button className="start-button" onClick={onStart}>
          <span className="button-text">PRESS TO START</span>
          <span className="button-glow"></span>
        </button>

        <div className="web-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};
