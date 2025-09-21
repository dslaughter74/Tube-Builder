/* tslint:disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';

const knotData = {
    'Bowline': {
        steps: [
            // FIX: Make the 'p' parameter optional to create a compatible function signature.
            { title: 'Step 1', desc: 'Make a small overhand loop in the rope.', draw: (ctx: CanvasRenderingContext2D, p?: number) => { ctx.beginPath(); ctx.moveTo(50, 150); ctx.lineTo(350, 150); ctx.stroke(); ctx.beginPath(); ctx.arc(150, 150, 30, 0, 2 * Math.PI); ctx.stroke(); } },
            { title: 'Step 2', desc: 'Pass the end of the rope up through the loop.', draw: (ctx: CanvasRenderingContext2D, p: number) => { knotData.Bowline.steps[0].draw(ctx, 1); const endX = 350 - 150 * p, endY = 150 - 50 * p; ctx.beginPath(); ctx.moveTo(350, 150); ctx.lineTo(endX, endY); ctx.stroke(); }},
            { title: 'Step 3', desc: 'Pass the end around the standing part.', draw: (ctx: CanvasRenderingContext2D, p: number) => { knotData.Bowline.steps[1].draw(ctx,1); ctx.beginPath(); ctx.moveTo(200, 100); ctx.arc(200, 125, 25, -Math.PI/2, -Math.PI/2 + (Math.PI*1.5)*p, false); ctx.stroke(); }},
            { title: 'Step 4', desc: 'Pass the end back down through the loop.', draw: (ctx: CanvasRenderingContext2D, p: number) => { knotData.Bowline.steps[2].draw(ctx,1); const startX = 200, startY = 150; ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(startX - 50*p, startY + 50*p); ctx.stroke(); }},
            { title: 'Step 5', desc: 'Pull tight to form the knot.', draw: (ctx: CanvasRenderingContext2D, p: number) => { ctx.clearRect(0,0,400,300); ctx.beginPath(); ctx.moveTo(50,150); ctx.lineTo(130-10*p,150); ctx.stroke(); ctx.beginPath(); ctx.moveTo(150-10*p,200-50*p); ctx.lineTo(350,150); ctx.stroke(); ctx.beginPath(); ctx.arc(180-10*p,150,40-10*p,0,Math.PI*2); ctx.stroke(); }}
        ]
    },
    'Figure 8 Bend': {
        steps: [
            // FIX: Make the 'p' parameter optional to create a compatible function signature.
            { title: 'Step 1', desc: 'Make a figure 8 in the first rope.', draw: (ctx: CanvasRenderingContext2D, p?: number) => { ctx.beginPath(); ctx.moveTo(50,150); ctx.bezierCurveTo(150, 50, 250, 250, 350, 150); ctx.stroke(); }},
            { title: 'Step 2', desc: 'Trace the figure 8 backwards with the second rope.', draw: (ctx: CanvasRenderingContext2D, p: number) => { knotData['Figure 8 Bend'].steps[0].draw(ctx, 1); ctx.save(); ctx.strokeStyle = '#d9534f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(350, 180); ctx.bezierCurveTo(250, 280, 150, 80, 50 * p + 300 * (1-p), 180); ctx.stroke(); ctx.restore(); }},
            { title: 'Step 3', desc: 'Pull all four ends to tighten.', draw: (ctx: CanvasRenderingContext2D, p: number) => { ctx.clearRect(0,0,400,300); ctx.beginPath(); ctx.moveTo(50,150); ctx.bezierCurveTo(150-20*p, 50+20*p, 250+20*p, 250-20*p, 350, 150); ctx.stroke(); ctx.save(); ctx.strokeStyle = '#d9534f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(350, 160); ctx.bezierCurveTo(250+20*p, 260-20*p, 150-20*p, 60+20*p, 50, 160); ctx.stroke(); ctx.restore(); }}
        ]
    },
    'Double Bowline': {
         steps: [
            // FIX: Make the 'p' parameter optional to create a compatible function signature.
            { title: 'Step 1', desc: 'Double the rope and make a loop.', draw: (ctx: CanvasRenderingContext2D, p?: number) => { ctx.beginPath(); ctx.moveTo(50,150); ctx.lineTo(350,150); ctx.stroke(); ctx.beginPath(); ctx.moveTo(50,160); ctx.lineTo(350,160); ctx.stroke(); ctx.beginPath(); ctx.arc(150,155,30,0,Math.PI*2); ctx.stroke(); }},
            { title: 'Step 2', desc: 'Pass the doubled end up through the loop.', draw: (ctx: CanvasRenderingContext2D, p: number) => { knotData['Double Bowline'].steps[0].draw(ctx, 1); ctx.beginPath(); ctx.moveTo(350,150); ctx.lineTo(350 - 150 * p, 150 - 50*p); ctx.stroke(); ctx.beginPath(); ctx.moveTo(350,160); ctx.lineTo(350 - 150 * p, 160 - 50*p); ctx.stroke(); }},
            { title: 'Step 3', desc: 'Open the doubled end and pass it over the entire knot.', draw: (ctx: CanvasRenderingContext2D, p: number) => { knotData['Double Bowline'].steps[1].draw(ctx,1); ctx.beginPath(); ctx.arc(200, 105, 50*p, 0, Math.PI*2); ctx.stroke(); }},
            { title: 'Step 4', desc: 'Pull it tight behind the original loop.', draw: (ctx: CanvasRenderingContext2D, p: number) => { ctx.clearRect(0,0,400,300); ctx.beginPath(); ctx.moveTo(50,150); ctx.lineTo(130,150); ctx.stroke(); ctx.beginPath(); ctx.moveTo(50,160); ctx.lineTo(130,160); ctx.stroke(); ctx.beginPath(); ctx.moveTo(250,155); ctx.lineTo(350,155); ctx.stroke(); ctx.beginPath(); ctx.arc(190,155,60-30*p,0,Math.PI*2); ctx.stroke(); }}
         ]
    }
};
type KnotType = keyof typeof knotData;
const hardKnots: KnotType[] = ['Figure 8 Bend', 'Double Bowline'];

const AnimatedKnotTyingGuide = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [difficulty, setDifficulty] = useState('Easy');
    const [knot, setKnot] = useState<KnotType>('Bowline');
    const [currentStep, setCurrentStep] = useState(0);
    const animationFrameId = useRef<number | null>(null);
    const steps = knotData[knot].steps;

    const drawStep = useCallback((stepIndex: number, progressOverride?: number) => {
        const step = steps[stepIndex]; const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.lineWidth = 5; ctx.strokeStyle = '#A0522D'; ctx.lineCap = 'round';
        step.draw(ctx, progressOverride ?? 1);
    }, [steps]);

    const animateStep = useCallback((stepIndex: number) => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / 500, 1);
            drawStep(stepIndex, progress);
            if (progress < 1) animationFrameId.current = requestAnimationFrame(animate);
        };
        animationFrameId.current = requestAnimationFrame(animate);
    }, [drawStep]);

    useEffect(() => { animateStep(currentStep); return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); }; }, [currentStep, animateStep]);

    const handleDifficultyChange = (level: string) => {
        setDifficulty(level);
        if (level === 'Easy') setKnot('Bowline');
        else setKnot(hardKnots[0]);
        setCurrentStep(0);
    };

    const handleNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
    const handlePrev = () => setCurrentStep(s => Math.max(s - 1, 0));
    const handleReset = () => setCurrentStep(0);
    const step = steps[currentStep];

    return (
        <><div className="knot-container">
            <h2>{knot} Guide</h2>
            <div className="difficulty-controls-knots">
                <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => handleDifficultyChange('Easy')}>Easy</button>
                <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => handleDifficultyChange('Hard')}>Hard</button>
            </div>
            {difficulty === 'Hard' && <div className="knot-selector"><select value={knot} onChange={e => { setKnot(e.target.value as KnotType); setCurrentStep(0); }}>{hardKnots.map(k => <option key={k}>{k}</option>)}</select></div>}
            <canvas ref={canvasRef} id="knot-canvas" width="400" height="300"></canvas>
            <div id="step-info"><h3>{step.title}</h3><p>{step.desc}</p></div>
            <div className="controls"><button onClick={handlePrev} disabled={currentStep === 0}>Previous</button><button onClick={handleReset}>Reset</button><button onClick={handleNext} disabled={currentStep === steps.length - 1}>Next</button></div>
        </div><style>{`
            .knot-container { max-width: 500px; width: 90%; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }
            #knot-canvas { display: block; margin: 0 auto 15px; background: #e0e0e0; border-radius: 5px; }
            .controls { display: flex; justify-content: center; gap: 10px; margin-top: 15px; }
            #step-info { text-align: center; min-height: 60px; } h3 { margin: 0 0 5px 0; }
            .difficulty-controls-knots { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 15px; }
            .difficulty-controls-knots button { padding: 5px 10px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer; border-radius: 4px; }
            .difficulty-controls-knots button.active { background: #A0522D; color: white; border-color: #A0522D; }
            .knot-selector { margin-bottom: 15px; }
        `}</style></>
    );
};

export default AnimatedKnotTyingGuide;