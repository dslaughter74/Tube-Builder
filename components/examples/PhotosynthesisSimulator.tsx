/* tslint:disable */
import React, { useState, useEffect } from 'react';

const PhotosynthesisSimulator = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [rate, setRate] = useState(1);
    const [light, setLight] = useState(100);
    const [co2, setCo2] = useState(400);

    useEffect(() => {
        const lightFactor = Math.min(light / 1000, 1);
        const co2Factor = Math.min(co2 / 1500, 1);
        setRate(parseFloat((lightFactor * co2Factor).toFixed(2)));
    }, [light, co2]);

    const renderEasy = () => (
        <div className="ps-diagram">
            <div className="sun animated">☀️<br/>Sunlight</div>
            <div className="arrow down">↓</div>
            <div className="leaf">🌿<br/>Leaf</div>
            <div className="inputs">
                <div>CO₂<br/>Carbon Dioxide</div>
                <div className="arrow right">→</div>
                <div className="arrow left">←</div>
                <div>H₂O<br/>Water</div>
            </div>
            <div className="arrow down">↓</div>
            <div className="outputs">
                <div>O₂<br/>Oxygen</div>
                <div className="arrow left">←</div>
                 <div className="arrow right">→</div>
                <div>C₆H₁₂O₆<br/>Glucose</div>
            </div>
        </div>
    );

    const renderMedium = () => (
        <div className="ps-diagram">
            {renderEasy()}
            <div className="equation">
                <strong>6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂</strong>
            </div>
        </div>
    );

    const renderHard = () => (
        <div className="ps-diagram">
            {renderMedium()}
            <div className="controls-hard">
                <div className="slider-group">
                    <label>Light Intensity: {light} µmol/m²/s</label>
                    <input type="range" min="0" max="2000" value={light} onChange={(e) => setLight(Number(e.target.value))} />
                </div>
                <div className="slider-group">
                    <label>CO₂ Level: {co2} ppm</label>
                    <input type="range" min="0" max="2000" value={co2} onChange={(e) => setCo2(Number(e.target.value))} />
                </div>
                <div className="rate-display">
                    Oxygen Production Rate: <strong>{rate * 100}%</strong>
                    <div className="oxygen-bubbles" style={{ '--rate': rate } as React.CSSProperties}>
                        {Array(10).fill(0).map((_, i) => <div key={i} className="bubble" style={{'--i': i} as React.CSSProperties}></div>)}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="ps-container">
                <h2>Photosynthesis Simulator</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                {difficulty === 'Easy' && renderEasy()}
                {difficulty === 'Medium' && renderMedium()}
                {difficulty === 'Hard' && renderHard()}
            </div>
            <style>{`
                .ps-container { font-family: sans-serif; text-align: center; background: #f0f8ff; padding: 20px; border-radius: 10px; }
                .difficulty-controls { margin-bottom: 20px; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #2e8b57; color: white; }
                .ps-diagram { display: flex; flex-direction: column; align-items: center; gap: 10px; }
                .sun { font-size: 2rem; }
                .leaf { font-size: 3rem; color: #2e8b57; }
                .inputs, .outputs { display: flex; align-items: center; gap: 10px; }
                .arrow { font-size: 2rem; color: #888; }
                .equation { margin-top: 20px; font-size: 1.2rem; background: #e8f4e8; padding: 10px; border-radius: 5px; }
                .controls-hard { margin-top: 20px; width: 80%; }
                .slider-group { margin-bottom: 15px; }
                .rate-display { font-size: 1.1rem; }
                .oxygen-bubbles { position: relative; height: 50px; width: 100px; margin: 10px auto; }
                .bubble { position: absolute; bottom: 0; width: 8px; height: 8px; background: #aaddff; border-radius: 50%; animation: bubble-rise 4s infinite ease-in; opacity: 0; }
                @keyframes bubble-rise { 
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
                .bubble { animation-duration: calc(6s - (4s * var(--rate))); left: calc(var(--i) * 10%); animation-delay: calc(var(--i) * 0.4s); }
                @keyframes sun-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                .sun.animated { animation: sun-pulse 3s infinite; }
            `}</style>
        </>
    );
};

export default PhotosynthesisSimulator;