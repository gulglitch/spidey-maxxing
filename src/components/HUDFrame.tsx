import './HUDFrame.css';

export const HUDFrame = () => {
  return (
    <div className="hud-frame">
      <div className="corner-bracket top-left"></div>
      <div className="corner-bracket top-right"></div>
      <div className="corner-bracket bottom-left"></div>
      <div className="corner-bracket bottom-right"></div>
      
      <div className="scan-line"></div>
      <div className="scan-line scan-line-2"></div>
      
      <div className="hex-grid"></div>
    </div>
  );
};
