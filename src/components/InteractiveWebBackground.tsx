import { useEffect, useRef } from 'react';
import './InteractiveWebBackground.css';

interface Node {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  velocityX: number;
  velocityY: number;
  color: { stroke: string; glow: string };
}

interface WebLine {
  // Ordered list of node indices this line passes through. Arcs are just
  // [start, end]; radials now list every ring node along that spoke, so
  // the line actually routes through the same dots that physics moves,
  // instead of jumping straight from center to the outer edge.
  pathNodeIndices: number[];
  // For arcs, the control point is stored as an offset from the
  // start/end midpoint (computed once from the original layout), then
  // re-applied to the *current* midpoint every frame — so the bulge
  // shape survives node movement instead of staying pinned in space.
  controlOffsetX?: number;
  controlOffsetY?: number;
  color: { stroke: string; glow: string };
  type: 'radial' | 'arc';
}

export function InteractiveWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const linesRef = useRef<WebLine[]>([]);
  // Start off-screen so nothing reacts until the user actually moves the mouse
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const initializeWeb = (width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.max(width, height) * 0.8;
      const numRadials = 16;
      const numRings = 12;

      const colors = [
        { stroke: 'rgba(255, 30, 45, 0.5)', glow: 'rgba(255, 30, 45, 0.8)' },
        { stroke: 'rgba(231, 32, 32, 0.5)', glow: 'rgba(231, 32, 32, 0.8)' },
        { stroke: 'rgba(200, 20, 35, 0.5)', glow: 'rgba(200, 20, 35, 0.8)' },
        { stroke: 'rgba(30, 100, 255, 0.5)', glow: 'rgba(30, 100, 255, 0.8)' },
        { stroke: 'rgba(50, 120, 230, 0.5)', glow: 'rgba(50, 120, 230, 0.8)' },
        { stroke: 'rgba(20, 80, 200, 0.5)', glow: 'rgba(20, 80, 200, 0.8)' },
        { stroke: 'rgba(150, 50, 200, 0.5)', glow: 'rgba(150, 50, 200, 0.8)' },
        { stroke: 'rgba(255, 100, 150, 0.5)', glow: 'rgba(255, 100, 150, 0.8)' },
      ];

      const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

      nodesRef.current = [];
      linesRef.current = [];

      // nodeGrid[ring][i] = index into nodesRef.current for that
      // ring/radial intersection. Ring 0 is the center point, shared by
      // every radial line, so every slot in nodeGrid[0] points at the
      // same single center node.
      const nodeGrid: number[][] = [];

      const centerNodeIndex = nodesRef.current.length;
      nodesRef.current.push({
        x: centerX,
        y: centerY,
        originalX: centerX,
        originalY: centerY,
        velocityX: 0,
        velocityY: 0,
        color: getRandomColor(),
      });
      nodeGrid[0] = new Array(numRadials).fill(centerNodeIndex);

      for (let ring = 1; ring <= numRings; ring++) {
        const radius = (maxRadius / numRings) * ring;
        nodeGrid[ring] = [];

        for (let i = 0; i < numRadials; i++) {
          const angle = (Math.PI * 2 * i) / numRadials;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          const idx = nodesRef.current.length;
          nodesRef.current.push({
            x,
            y,
            originalX: x,
            originalY: y,
            velocityX: 0,
            velocityY: 0,
            color: getRandomColor(),
          });
          nodeGrid[ring][i] = idx;
        }
      }

      // Radial lines: routed through every ring node along that spoke
      // (center -> ring 1 -> ring 2 -> ... -> outermost), so the line
      // bends wherever any of those already-interactive dots get pulled.
      for (let i = 0; i < numRadials; i++) {
        const pathNodeIndices: number[] = [nodeGrid[0][i]];
        for (let ring = 1; ring <= numRings; ring++) {
          pathNodeIndices.push(nodeGrid[ring][i]);
        }
        linesRef.current.push({
          pathNodeIndices,
          type: 'radial',
          color: getRandomColor(),
        });
      }

      // Arc lines: connect neighboring nodes on the same ring, wrapping
      // the last slice back to the first (`% numRadials`) so the ring
      // actually closes instead of leaving a gap.
      for (let ring = 1; ring <= numRings; ring++) {
        const radius = (maxRadius / numRings) * ring;

        for (let i = 0; i < numRadials; i++) {
          const startIdx = nodeGrid[ring][i];
          const endIdx = nodeGrid[ring][(i + 1) % numRadials];
          const start = nodesRef.current[startIdx];
          const end = nodesRef.current[endIdx];

          const startAngle = (Math.PI * 2 * i) / numRadials;
          const endAngle = (Math.PI * 2 * (i + 1)) / numRadials;
          const midAngle = (startAngle + endAngle) / 2;
          const controlRadius = radius * 0.85;
          const controlX = centerX + Math.cos(midAngle) * controlRadius;
          const controlY = centerY + Math.sin(midAngle) * controlRadius;

          const midX = (start.originalX + end.originalX) / 2;
          const midY = (start.originalY + end.originalY) / 2;

          linesRef.current.push({
            pathNodeIndices: [startIdx, endIdx],
            type: 'arc',
            controlOffsetX: controlX - midX,
            controlOffsetY: controlY - midY,
            color: getRandomColor(),
          });
        }
      }
    };

    const drawStaticWeb = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      linesRef.current.forEach((line) => {
        const color = line.color;
        const points = line.pathNodeIndices.map((idx) => nodesRef.current[idx]).filter(Boolean);
        if (points.length < 2) return;

        const tracePath = () => {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);

          if (line.type === 'arc' && points.length === 2) {
            // Recompute the arc's control point from the nodes' *current*
            // positions each frame, so the bulge travels with the nodes
            // instead of staying anchored to their original spot.
            const midX = (points[0].x + points[1].x) / 2;
            const midY = (points[0].y + points[1].y) / 2;
            const controlX = midX + (line.controlOffsetX ?? 0);
            const controlY = midY + (line.controlOffsetY ?? 0);
            ctx.quadraticCurveTo(controlX, controlY, points[1].x, points[1].y);
          } else {
            // Radial: walk straight through every ring node along the
            // spoke, so the line bends at each point physics has moved.
            for (let k = 1; k < points.length; k++) {
              ctx.lineTo(points[k].x, points[k].y);
            }
          }
        };

        ctx.strokeStyle = color.glow;
        ctx.shadowBlur = 25;
        ctx.shadowColor = color.glow;
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 12;
        tracePath();
        ctx.stroke();

        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 6;
        tracePath();
        ctx.stroke();

        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = color.stroke;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;
        tracePath();
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const drawNodes = () => {
      if (!ctx) return;

      nodesRef.current.forEach((node) => {
        for (let i = 3; i >= 1; i--) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2 + i * 2, 0, Math.PI * 2);
          ctx.fillStyle = node.color.glow;
          ctx.globalAlpha = 0.1 * i;
          ctx.shadowBlur = 15;
          ctx.shadowColor = node.color.glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color.glow;
        ctx.globalAlpha = 0.9;
        ctx.shadowBlur = 20;
        ctx.shadowColor = node.color.glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = node.color.glow;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const updatePhysics = () => {
      const springStrength = 0.015;
      const damping = 0.88;
      const mouseInfluence = 180;
      const repelStrength = 6;

      nodesRef.current.forEach((node) => {
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseInfluence && distance > 0) {
          const force = (1 - distance / mouseInfluence) * repelStrength;
          const angle = Math.atan2(dy, dx);
          node.velocityX -= Math.cos(angle) * force;
          node.velocityY -= Math.sin(angle) * force;
        }

        const springForceX = (node.originalX - node.x) * springStrength;
        const springForceY = (node.originalY - node.y) * springStrength;

        node.velocityX += springForceX;
        node.velocityY += springForceY;

        node.velocityX *= damping;
        node.velocityY *= damping;

        node.x += node.velocityX;
        node.y += node.velocityY;
      });
    };

    const animate = () => {
      if (!canvas || !ctx) return;

      updatePhysics();
      drawStaticWeb();
      drawNodes();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeWeb(canvas.width, canvas.height);
    };

    // Convert a page-space (clientX/clientY) point into canvas-local coordinates.
    // This is what actually fixes interactivity: the listener lives on `window`
    // so it fires even if the canvas has `pointer-events: none`, and the
    // getBoundingClientRect() offset keeps it correct if the canvas isn't
    // pinned at (0,0).
    const setMouseFromClientPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = clientX - rect.left;
      mouseRef.current.y = clientY - rect.top;
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMouseFromClientPoint(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMouseFromClientPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const resetMouse = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', resetMouse);
    window.addEventListener('blur', resetMouse);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeWeb(canvas.width, canvas.height);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', resetMouse);
      window.removeEventListener('blur', resetMouse);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-web-bg" />;
}