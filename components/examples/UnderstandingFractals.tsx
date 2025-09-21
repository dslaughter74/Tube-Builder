/* tslint:disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';

const colorSchemes = {
    default: { flake: '#007bff', bg: '#ffffff' }, dark: { flake: '#00ffff', bg: '#000000' },
    forest: { flake: '#228B22', bg: '#F5F5DC' }, sunset: { flake: '#FFA500', bg: '#00008B' },
};
const ANIMATION_DURATION = 500;

const UnderstandingFractals = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [iteration, setIteration] = useState(0);
    const [difficulty, setDifficulty] = useState('Easy');
    const [fractalType, setFractalType] = useState('Koch');
    const [colorScheme, setColorScheme] = useState('default');
    const [isAnimating, setIsAnimating] = useState(false);
    const segmentsRef = useRef<any[]>([]);
    const transformRef = useRef({ zoom: 1.0, offsetX: 0, offsetY: 0 });
    const panRef = useRef({ isPanning: false, lastX: 0, lastY: 0 });

    const getInitialTriangle = useCallback((width: number, height: number) => {
        const side = Math.min(width, height) * 0.5;
        const h = side * Math.sqrt(3) / 2;
        const cx = width / 2; const cy = height / 2;
        const p1 = { x: cx, y: cy - h / 2 };
        const p2 = { x: cx - side / 2, y: cy + h / 2 };
        const p3 = { x: cx + side / 2, y: cy + h / 2 };
        return [[p1, p2], [p2, p3], [p3, p1]];
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const { zoom, offsetX, offsetY } = transformRef.current;
        const scheme = colorSchemes[colorScheme as keyof typeof colorSchemes];
        ctx.fillStyle = scheme.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(offsetX, offsetY);
        
        ctx.beginPath();
        for (const seg of segmentsRef.current) {
            ctx.moveTo(seg[0].x, seg[0].y);
            ctx.lineTo(seg[1].x, seg[1].y);
        }
        if (fractalType === 'Koch') {
            ctx.closePath();
            ctx.fillStyle = scheme.flake;
            ctx.fill();
        } else {
            ctx.strokeStyle = scheme.flake;
            ctx.lineWidth = 2 / zoom;
            ctx.stroke();
        }
        ctx.restore();
    }, [colorScheme, fractalType]);
    
    const reset = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIteration(0);
        transformRef.current = { zoom: 1.0, offsetX: 0, offsetY: 0 };
        segmentsRef.current = getInitialTriangle(canvas.width, canvas.height);
        draw();
    }, [draw, getInitialTriangle]);

    useEffect(() => {
        const newFractalType = difficulty === 'Hard' ? 'Sierpinski' : 'Koch';
        setFractalType(newFractalType);
        reset();
    }, [difficulty, reset]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            reset();
            const handleResize = () => reset();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [reset]);

    const handleIterate = () => {
        const maxIterations = difficulty === 'Easy' ? 5 : 8;
        if (iteration >= maxIterations || isAnimating) return;
        setIsAnimating(true);
        if (fractalType === 'Koch') iterateKoch(); else iterateSierpinski();
    };

    const iterateKoch = () => {
        const newSegments: any[] = [];
        const sqrt3_2 = Math.sqrt(3) / 2;
        for (const seg of segmentsRef.current) {
            const [p1, p2] = seg;
            const dx = p2.x - p1.x, dy = p2.y - p1.y;
            const pa = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
            const pb = { x: p1.x + 2 * dx / 3, y: p1.y + 2 * dy / 3 };
            const midX = p1.x + dx / 2, midY = p1.y + dy / 2;
            const vecX = -dy * sqrt3_2, vecY = dx * sqrt3_2;
            const pc = { x: midX + vecX / 3, y: midY + vecY / 3 };
            newSegments.push([p1, pa], [pa, pc], [pc, pb], [pb, p2]);
        }
        segmentsRef.current = newSegments;
        setIteration(i => i + 1);
        setIsAnimating(false);
        draw();
    };

    const iterateSierpinski = () => {
        const newTriangles: any[] = [];
        for (const tri of segmentsRef.current) {
            const [p1, p2, p3] = tri;
            const m12 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            const m23 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
            const m31 = { x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2 };
            newTriangles.push([p1, m12, m31], [p2, m23, m12], [p3, m31, m23]);
        }
        segmentsRef.current = newTriangles.flatMap(tri => [[tri[0], tri[1]], [tri[1], tri[2]], [tri[2], tri[0]]]);
        setIteration(i => i + 1);
        setIsAnimating(false);
        draw();
    };
    
    const handleWheel = (e: React.WheelEvent) => { e.preventDefault(); const scaleAmount = 1.1; const zoom = e.deltaY < 0 ? scaleAmount : 1 / scaleAmount; transformRef.current.zoom *= zoom; draw(); };
    const handleMouseDown = (e: React.MouseEvent) => { panRef.current = { isPanning: true, lastX: e.clientX, lastY: e.clientY }; };
    const handleMouseMove = (e: React.MouseEvent) => { if (!panRef.current.isPanning) return; const dx = (e.clientX - panRef.current.lastX) / transformRef.current.zoom; const dy = (e.clientY - panRef.current.lastY) / transformRef.current.zoom; transformRef.current.offsetX += dx; transformRef.current.offsetY += dy; panRef.current.lastX = e.clientX; panRef.current.lastY = e.clientY; draw(); };
    const handleMouseUp = () => { panRef.current.isPanning = false; };

    return (
        <><div className="fractal-container"><h1>Fractal Explorer</h1>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                <div id="info"><p>Fractal: {fractalType} | Iterations: {iteration}</p><p>Use mouse wheel to zoom, click and drag to pan.</p></div>
                <div id="controls"><button onClick={handleIterate} disabled={isAnimating}>Iterate</button><button onClick={reset} disabled={isAnimating}>Reset</button><select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}><option value="default">Default</option><option value="dark">Dark Mode</option><option value="forest">Forest</option><option value="sunset">Sunset</option></select></div>
                <div id="canvasContainer" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}><canvas ref={canvasRef} width="600" height="500"></canvas></div>
            </div><style>{`
                .fractal-container { text-align: center; }
                .difficulty-controls { display: flex; justify-content: center; gap: 10px; margin-bottom: 10px; }
                .difficulty-controls button { padding: 8px 16px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer; border-radius: 4px; }
                .difficulty-controls button.active { background: #007bff; color: white; border-color: #007bff; }
                #canvasContainer { position: relative; border: 1px solid #ccc; margin: 10px auto; cursor: grab; background-color: #fff; }
                #canvasContainer:active { cursor: grabbing; } canvas { display: block; }
                #controls { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; align-items: center; justify-content: center; }
                #info { margin-bottom: 10px; font-size: 0.9em; }
            `}</style></>
    );
};

export default UnderstandingFractals;