import './CityBorderBuildings.css';

// Window class sequence per building — deterministic, no random on render
type WinClass = 'red' | 'red-dim' | 'blue' | 'blue-dim' | 'warm' | '';

function makeWindows(
  cols: number,
  rows: number,
  seed: number
): WinClass[] {
  // Simple seeded pseudo-random so pattern is stable
  const rand = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const total = cols * rows;
  const result: WinClass[] = [];
  for (let i = 0; i < total; i++) {
    const r = rand(i);
    if (r < 0.08)       result.push('red');
    else if (r < 0.18)  result.push('red-dim');
    else if (r < 0.26)  result.push('blue');
    else if (r < 0.34)  result.push('blue-dim');
    else if (r < 0.38)  result.push('warm');
    else                result.push('');
  }
  return result;
}

interface BuildingDef {
  height: number;   // px — how tall this slice is
  width: number;    // flex-basis px
  cols: number;     // window columns
  rows: number;     // window rows
  roofColor?: 'red' | 'blue';
  seed: number;
}

// ─── LEFT SIDE — 5 building slices, varying heights ───────────────────────
const LEFT_BUILDINGS: BuildingDef[] = [
  { height: 560, width: 36, cols: 3, rows: 14, roofColor: 'red',  seed: 1  },
  { height: 420, width: 30, cols: 2, rows: 11, roofColor: 'blue', seed: 2  },
  { height: 640, width: 42, cols: 3, rows: 16, roofColor: 'red',  seed: 3  },
  { height: 380, width: 28, cols: 2, rows: 10, roofColor: 'blue', seed: 4  },
  { height: 500, width: 34, cols: 3, rows: 13, roofColor: 'red',  seed: 5  },
];

// ─── RIGHT SIDE ────────────────────────────────────────────────────────────
const RIGHT_BUILDINGS: BuildingDef[] = [
  { height: 480, width: 34, cols: 3, rows: 12, roofColor: 'blue', seed: 11 },
  { height: 600, width: 40, cols: 3, rows: 15, roofColor: 'red',  seed: 12 },
  { height: 360, width: 28, cols: 2, rows:  9, roofColor: 'blue', seed: 13 },
  { height: 540, width: 36, cols: 3, rows: 14, roofColor: 'red',  seed: 14 },
  { height: 440, width: 32, cols: 2, rows: 11, roofColor: 'blue', seed: 15 },
];

// ─── TOP SIDE — buildings hang down from top edge ─────────────────────────
const TOP_BUILDINGS: BuildingDef[] = [
  { height: 130, width: 80,  cols: 4, rows: 4, roofColor: 'red',  seed: 21 },
  { height:  80, width: 60,  cols: 3, rows: 3, roofColor: 'blue', seed: 22 },
  { height: 140, width: 90,  cols: 4, rows: 4, roofColor: 'red',  seed: 23 },
  { height:  70, width: 50,  cols: 2, rows: 3, roofColor: 'blue', seed: 24 },
  { height: 150, width: 100, cols: 5, rows: 5, roofColor: 'red',  seed: 25 },
  { height:  90, width: 70,  cols: 3, rows: 3, roofColor: 'blue', seed: 26 },
  { height: 120, width: 85,  cols: 4, rows: 4, roofColor: 'red',  seed: 27 },
  { height:  75, width: 55,  cols: 3, rows: 3, roofColor: 'blue', seed: 28 },
  { height: 155, width: 95,  cols: 5, rows: 5, roofColor: 'red',  seed: 29 },
];

// ─── BOTTOM SIDE ───────────────────────────────────────────────────────────
const BOTTOM_BUILDINGS: BuildingDef[] = [
  { height:  90, width: 80,  cols: 4, rows: 3, roofColor: 'red',  seed: 31 },
  { height: 110, width: 90,  cols: 4, rows: 4, roofColor: 'blue', seed: 32 },
  { height:  70, width: 60,  cols: 3, rows: 3, roofColor: 'red',  seed: 33 },
  { height: 100, width: 85,  cols: 4, rows: 4, roofColor: 'blue', seed: 34 },
  { height:  80, width: 70,  cols: 3, rows: 3, roofColor: 'red',  seed: 35 },
  { height: 115, width: 95,  cols: 5, rows: 4, roofColor: 'blue', seed: 36 },
  { height:  85, width: 75,  cols: 3, rows: 3, roofColor: 'red',  seed: 37 },
  { height: 105, width: 80,  cols: 4, rows: 4, roofColor: 'blue', seed: 38 },
];

// ─── Building component ────────────────────────────────────────────────────
interface BuildingProps {
  def: BuildingDef;
  side: 'left' | 'right' | 'top' | 'bottom';
}

function Building({ def, side }: BuildingProps) {
  const { height, width, cols, rows, roofColor, seed } = def;
  const windows = makeWindows(cols, rows, seed);

  const isVertical = side === 'left' || side === 'right';

  const style: React.CSSProperties = isVertical
    ? { height, width: '100%' }
    : { height: '100%', width, flexShrink: 0 };

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
  };

  return (
    <div className="building" style={style}>
      <div className={`building-roof${roofColor === 'blue' ? ' blue' : ''}`} />
      <div className="windows" style={gridStyle}>
        {windows.map((cls, i) => (
          <div key={i} className={`win${cls ? ` ${cls}` : ''}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export const CityBorderBuildings = () => {
  return (
    <div className="city-border">
      {/* Left wall */}
      <div className="city-left">
        {LEFT_BUILDINGS.map((b, i) => (
          <Building key={i} def={b} side="left" />
        ))}
      </div>

      {/* Right wall */}
      <div className="city-right">
        {RIGHT_BUILDINGS.map((b, i) => (
          <Building key={i} def={b} side="right" />
        ))}
      </div>

      {/* Top wall */}
      <div className="city-top" style={{ left: 160, right: 160 }}>
        {TOP_BUILDINGS.map((b, i) => (
          <Building key={i} def={b} side="top" />
        ))}
      </div>

      {/* Bottom wall */}
      <div className="city-bottom" style={{ left: 160, right: 160 }}>
        {BOTTOM_BUILDINGS.map((b, i) => (
          <Building key={i} def={b} side="bottom" />
        ))}
      </div>

      {/* Corner fills */}
      <div className="city-corner city-corner-tl" />
      <div className="city-corner city-corner-tr" />
      <div className="city-corner city-corner-bl" />
      <div className="city-corner city-corner-br" />
    </div>
  );
};
