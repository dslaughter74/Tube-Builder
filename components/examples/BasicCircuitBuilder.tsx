/* tslint:disable */
import React, { useState, useRef, useEffect } from 'react';

const BasicCircuitBuilder = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [components, setComponents] = useState<{ id: number, type: string, x: number, y: number }[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [voltage, setVoltage] = useState('0.00');

    const handleDrop = (e: React.DragEvent) => {
        const type = e.dataTransfer.getData('type');
        setComponents([...components, { id: Date.now(), type, x: e.nativeEvent.offsetX - 25, y: e.nativeEvent.offsetY - 25 }]);
    };

    const handleDragStart = (e: React.DragEvent, type: string) => e.dataTransfer.setData('type', type);

    useEffect(() => {
        const battery = components.find(c => c.type === 'battery');
        const bulb = components.find(c => c.type === 'bulb');
        const sw = components.find(c => c.type === 'switch');
        const isWired = components.length >= 4; // Simplistic check
        setIsComplete(!!battery && !!bulb && !!sw && isWired);
        if (difficulty === 'Hard' && isComplete) {
            const bulbs = components.filter(c => c.type === 'bulb').length;
            setVoltage((9.0 / bulbs).toFixed(2));
        }
    }, [components, difficulty]);

    const reset = () => setComponents([]);

    return (
        <>
            <div className="circuit-container">
                <h2>Basic Circuit Builder</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => {setDifficulty('Easy'); reset();}}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => {setDifficulty('Medium'); reset();}}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => {setDifficulty('Hard'); reset();}}>Hard</button>
                </div>
                <div className="main-area">
                    <div className="palette">
                        <h3>Components</h3>
                        <div className="component-item" draggable onDragStart={(e) => handleDragStart(e, 'battery')}>🔋 Battery</div>
                        <div className="component-item" draggable onDragStart={(e) => handleDragStart(e, 'bulb')}>💡 Bulb</div>
                        <div className="component-item" draggable onDragStart={(e) => handleDragStart(e, 'switch')}>🕹️ Switch</div>
                        <div className="component-item" draggable onDragStart={(e) => handleDragStart(e, 'wire')}>〰️ Wire</div>
                        <button onClick={reset}>Reset</button>
                    </div>
                    <div className="workspace" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                        {components.map(c => (
                            <div key={c.id} className="component-instance" style={{ left: c.x, top: c.y, animation: c.type === 'bulb' && isComplete ? 'glow 1s infinite' : 'none' }}>
                                {c.type === 'battery' ? '🔋' : c.type === 'bulb' ? '💡' : c.type === 'switch' ? '🕹️' : '〰️'}
                            </div>
                        ))}
                        {difficulty === 'Hard' && isComplete && <div className="voltmeter">⚡ {voltage}V</div>}
                    </div>
                </div>
                <div className="instructions">
                    {difficulty === 'Easy' && <p>Drag a battery, switch, bulb, and wire to build a circuit.</p>}
                    {difficulty === 'Medium' && <p>Try building a circuit with two bulbs in series (one after another).</p>}
                    {difficulty === 'Hard' && <p>Build a series circuit and see the voltage drop across the bulbs.</p>}
                </div>
            </div>
            <style>{`
                .circuit-container { text-align: center; }
                .difficulty-controls { margin-bottom: 15px; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #f0ad4e; color: white; }
                .main-area { display: flex; gap: 20px; justify-content: center; }
                .palette { border: 1px solid #ccc; padding: 10px; background: #f9f9f9; border-radius: 5px; text-align: left; }
                .component-item { padding: 10px; margin: 5px 0; background: #eee; border-radius: 5px; cursor: grab; }
                .workspace { width: 400px; height: 300px; border: 2px dashed #ccc; background: #fff; position: relative; }
                .component-instance { position: absolute; font-size: 2rem; user-select: none; }
                .voltmeter { position: absolute; top: 10px; right: 10px; background: black; color: lime; padding: 5px; border-radius: 3px; font-family: monospace; }
                .instructions { margin-top: 15px; font-style: italic; }
                @keyframes glow { 0%, 100% { filter: drop-shadow(0 0 2px #ff0); } 50% { filter: drop-shadow(0 0 10px #ff0); } }
            `}</style>
        </>
    );
};

export default BasicCircuitBuilder;