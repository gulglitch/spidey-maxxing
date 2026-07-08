import { useEffect } from 'react';
import { useWebStore } from '../store/webStore';
import type { WebInteractionMode } from '../types';
import './InteractionModeSelector.css';

export const InteractionModeSelector = () => {
  const interactionMode = useWebStore((state) => state.interactionMode);
  const setInteractionMode = useWebStore((state) => state.setInteractionMode);

  const modes: { mode: WebInteractionMode; label: string; icon: string; description: string; key: string }[] = [
    {
      mode: 'shoot',
      label: 'Shoot',
      icon: '🎯',
      description: 'Shoot webs that stick to surfaces',
      key: '1'
    },
    {
      mode: 'swing',
      label: 'Swing',
      icon: '🕷️',
      description: 'Attach and swing with rope physics',
      key: '2'
    },
    {
      mode: 'pull',
      label: 'Pull',
      icon: '🧲',
      description: 'Pull objects toward you',
      key: '3'
    }
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const mode = modes.find(m => m.key === e.key);
      if (mode) {
        setInteractionMode(mode.mode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setInteractionMode]);

  return (
    <div className="mode-selector">
      <div className="mode-selector-title">WEB MODE</div>
      <div className="mode-buttons">
        {modes.map(({ mode, label, icon, description, key }) => (
          <button
            key={mode}
            className={`mode-button ${interactionMode === mode ? 'active' : ''}`}
            onClick={() => setInteractionMode(mode)}
            title={description}
          >
            <div className="mode-hex">
              <svg viewBox="0 0 100 100" className="hex-shape">
                <polygon 
                  points="50,10 90,30 90,70 50,90 10,70 10,30" 
                  className="hex-fill"
                />
                <polygon 
                  points="50,10 90,30 90,70 50,90 10,70 10,30" 
                  className="hex-stroke"
                />
              </svg>
              <div className="mode-content">
                <span className="mode-icon">{icon}</span>
                <span className="mode-label">{label}</span>
                <span className="mode-key">[{key}]</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
