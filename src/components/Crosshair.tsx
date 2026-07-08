import { useWebStore } from '../store/webStore';
import './Crosshair.css';

export const Crosshair = () => {
  const interactionMode = useWebStore((state) => state.interactionMode);

  const modeColors = {
    shoot: '#E72020',
    swing: '#4F6793',
    pull: '#9A1316'
  };

  return (
    <div className="crosshair-container">
      <svg 
        className={`crosshair crosshair-${interactionMode}`} 
        viewBox="0 0 100 100"
        style={{ '--mode-color': modeColors[interactionMode] } as React.CSSProperties}
      >
        <circle 
          cx="50" 
          cy="50" 
          r="20" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="crosshair-ring"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="30" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
          opacity="0.3"
          className="crosshair-outer"
        />
        <line x1="50" y1="35" x2="50" y2="42" stroke="currentColor" strokeWidth="2" className="crosshair-line"/>
        <line x1="50" y1="58" x2="50" y2="65" stroke="currentColor" strokeWidth="2" className="crosshair-line"/>
        <line x1="35" y1="50" x2="42" y2="50" stroke="currentColor" strokeWidth="2" className="crosshair-line"/>
        <line x1="58" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="2" className="crosshair-line"/>
        <circle cx="50" cy="50" r="2" fill="currentColor" className="crosshair-dot"/>
      </svg>
    </div>
  );
};
