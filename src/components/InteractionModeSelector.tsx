import { useWebStore } from '../store/webStore';
import type { WebInteractionMode } from '../types';
import './InteractionModeSelector.css';

export const InteractionModeSelector = () => {
  const interactionMode = useWebStore((state) => state.interactionMode);
  const setInteractionMode = useWebStore((state) => state.setInteractionMode);

  const modes: { mode: WebInteractionMode; label: string; icon: string; description: string }[] = [
    {
      mode: 'shoot',
      label: 'Shoot',
      icon: '🎯',
      description: 'Shoot webs that stick to surfaces'
    },
    {
      mode: 'swing',
      label: 'Swing',
      icon: '🕷️',
      description: 'Attach and swing with rope physics'
    },
    {
      mode: 'pull',
      label: 'Pull',
      icon: '🧲',
      description: 'Pull objects toward you'
    }
  ];

  return (
    <div className="mode-selector">
      <div className="mode-selector-title">Web Mode</div>
      <div className="mode-buttons">
        {modes.map(({ mode, label, icon, description }) => (
          <button
            key={mode}
            className={`mode-button ${interactionMode === mode ? 'active' : ''}`}
            onClick={() => setInteractionMode(mode)}
            title={description}
          >
            <span className="mode-icon">{icon}</span>
            <span className="mode-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
