/* tslint:disable */
import React, { useState, useEffect, useRef } from 'react';

const strokes = [
    { name: 'Intake', desc: 'Piston moves down, intake valve opens, drawing in fuel-air mixture.', pistonY: 250, intakeOpen: true, exhaustOpen: false, spark: false, gasColor: 'rgba(173, 216, 230, 0.7)', highlight: 'intake-valve' },
    { name: 'Compression', desc: 'Piston moves up, both valves close, compressing the mixture.', pistonY: 0, intakeOpen: false, exhaustOpen: false, spark: false, gasColor: 'rgba(173, 216, 230, 1)', highlight: 'piston' },
    { name: 'Power', desc: 'Spark plug ignites mixture, forcing piston down.', pistonY: 250, intakeOpen: false, exhaustOpen: false, spark: true, gasColor: 'rgba(255, 99, 71, 1)', highlight: 'spark-plug' },
    { name: 'Exhaust', desc: 'Piston moves up, exhaust valve opens, pushing burnt gases out.', pistonY: 0, intakeOpen: false, exhaustOpen: true, spark: false, gasColor: 'rgba(128, 128, 128, 0.7)', highlight: 'exhaust-valve' }
];

const FourStrokeEngineAnimator = () => {
    const [currentStroke, setCurrentStroke] = useState(0);
    const [difficulty, setDifficulty] = useState('Easy');
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isPlaying && difficulty !== 'Easy') {
            // FIX: Use window.setInterval to ensure the correct return type (number).
            intervalRef.current = window.setInterval(() => {
                setCurrentStroke(prev => (prev + 1) % strokes.length);
            }, 1500 / speed);
        } else {
            // FIX: Use window.clearInterval to match window.setInterval.
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        }
        // FIX: Use window.clearInterval to match window.setInterval.
        return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
    }, [isPlaying, speed, difficulty]);

    const handleNext = () => setCurrentStroke(prev => (prev + 1) % strokes.length);
    const handlePrev = () => setCurrentStroke(prev => (prev - 1 + strokes.length) % strokes.length);
    const handlePlayPause = () => setIsPlaying(p => !p);

    const stroke = strokes[currentStroke];
    const showDetailedLabels = difficulty === 'Hard';

    return (
        <><div className="engine-body"><h2>4-Stroke Engine Animator</h2>
            <div className="difficulty-controls-engine">
                <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => { setDifficulty('Easy'); setIsPlaying(false); }}>Easy</button>
                <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
            </div>
            <div className="engine-container">
                <div className={`spark-plug ${showDetailedLabels && stroke.highlight === 'spark-plug' ? 'highlight' : ''}`}><div id="spark" style={{ opacity: stroke.spark ? 1 : 0 }}></div>{showDetailedLabels && <span className="label">Spark Plug</span>}</div>
                <div className={`valve intake ${showDetailedLabels && stroke.highlight === 'intake-valve' ? 'highlight' : ''}`} style={{ transform: stroke.intakeOpen ? 'translateY(10px)' : 'translateY(0)' }}>{showDetailedLabels && <span className="label">Intake</span>}</div>
                <div className={`valve exhaust ${showDetailedLabels && stroke.highlight === 'exhaust-valve' ? 'highlight' : ''}`} style={{ transform: stroke.exhaustOpen ? 'translateY(10px)' : 'translateY(0)' }}>{showDetailedLabels && <span className="label">Exhaust</span>}</div>
                <div className="cylinder"><div className="gas" style={{ backgroundColor: stroke.gasColor, height: `${stroke.pistonY + 50}px` }}></div><div className={`piston ${showDetailedLabels && stroke.highlight === 'piston' ? 'highlight' : ''}`} style={{ top: `${stroke.pistonY}px` }}></div></div>
            </div>
            <div className="info"><h3 id="stroke-name">{stroke.name.toUpperCase()}</h3><p id="stroke-description">{stroke.desc}</p></div>
            <div className="controls">
                {difficulty === 'Easy' ? (<><button onClick={handlePrev}>Previous</button><button onClick={handleNext}>Next</button></>) : 
                (<><button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button><input type="range" min="0.5" max="3" step="0.1" value={speed} onChange={e => setSpeed(Number(e.target.value))} /><span>Speed: {speed.toFixed(1)}x</span></>)}
            </div>
        </div><style>{`
            .engine-body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f0f2f5; padding: 20px; }
            .difficulty-controls-engine { display: flex; gap: 10px; margin-bottom: 15px; }
            .difficulty-controls-engine button { padding: 8px 12px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer; border-radius: 4px; }
            .difficulty-controls-engine button.active { background: #6c757d; color: white; border-color: #6c757d; }
            .engine-container { position: relative; width: 200px; height: 350px; border: 4px solid #333; background: #ddd; border-radius: 10px; margin: 0 auto; }
            .cylinder { position: absolute; top: 50px; left: 50%; transform: translateX(-50%); width: 120px; height: 300px; background: #fff; border: 2px solid #555; overflow: hidden; }
            .piston { position: absolute; left: 0; width: 100%; height: 50px; background: #888; border-bottom: 5px solid #666; transition: top 0.5s ease-in-out; }
            .valve { position: absolute; top: 30px; width: 40px; height: 20px; background: #666; border-radius: 3px; transition: transform 0.3s ease; }
            .intake { left: 10px; } .exhaust { right: 10px; }
            .spark-plug { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 30px; background: #a00; }
            #spark { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-radius: 50%; background: yellow; box-shadow: 0 0 15px 10px yellow; opacity: 0; transition: opacity 0.1s; }
            .gas { position: absolute; bottom: 0; left: 0; right: 0; transition: background-color 0.5s, height 0.5s ease-in-out; }
            .controls { margin-top: 20px; display: flex; gap: 10px; align-items: center; }
            .info { margin-top: 20px; text-align: center; width: 300px; }
            .highlight { border: 2px solid #ffc107; box-shadow: 0 0 10px #ffc107; }
            .label { display: none; position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #ffc107; color: black; padding: 2px 5px; border-radius: 3px; font-size: 0.8em; white-space: nowrap; }
            .highlight .label { display: block; }
        `}</style></>
    );
};

export default FourStrokeEngineAnimator;