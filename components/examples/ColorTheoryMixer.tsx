/* tslint:disable */
import React, { useState } from 'react';

const colors = { red: '#FF0000', yellow: '#FFFF00', blue: '#0000FF', white: '#FFFFFF', black: '#000000' };
const mixes: { [key: string]: { color: string, name: string } } = {
    'red,yellow': { color: '#FFA500', name: 'Orange' }, 'yellow,red': { color: '#FFA500', name: 'Orange' },
    'yellow,blue': { color: '#008000', name: 'Green' }, 'blue,yellow': { color: '#008000', name: 'Green' },
    'blue,red': { color: '#800080', name: 'Purple' }, 'red,blue': { color: '#800080', name: 'Purple' },
};

const ColorTheoryMixer = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [mix, setMix] = useState<string[]>([]);
    const [result, setResult] = useState({ color: '#CCCCCC', name: 'Gray' });

    const handleColorClick = (color: string) => {
        const newMix = [...mix, color];
        if (newMix.length > 2) newMix.shift();
        setMix(newMix);

        if (newMix.length === 2) {
            const mixKey = newMix.join(',');
            setResult(mixes[mixKey] || { color: '#808080', name: 'Brown' });
        }
    };
    
    const resetMix = () => { setMix([]); setResult({ color: '#CCCCCC', name: 'Gray' }); };

    const palette = difficulty === 'Easy' ? ['red', 'yellow', 'blue'] : ['red', 'yellow', 'blue', 'white', 'black'];

    return (
        <>
            <div className="color-container">
                <h2>Color Theory Mixer</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                <div className="main-color-area">
                    <div className="palette">
                        {palette.map(c => <div key={c} className="color-swatch" style={{ background: colors[c as keyof typeof colors] }} onClick={() => handleColorClick(c)}></div>)}
                    </div>
                    <div className="mixing-area">
                        {mix.map((c, i) => <div key={i} className="color-swatch" style={{ background: colors[c as keyof typeof colors] }}></div>)}
                        {mix.length === 2 && <span>=</span>}
                        <div className="color-swatch result" style={{ background: result.color }}></div>
                    </div>
                </div>
                <div className="result-name">{result.name}</div>
                <button onClick={resetMix}>Reset</button>

                {difficulty === 'Hard' && <div className="color-wheel">🎨 Full Color Wheel & Harmonies</div>}
            </div>
            <style>{`
                .color-container { text-align: center; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #ff4500; color: white; }
                .main-color-area { display: flex; justify-content: center; align-items: center; gap: 20px; margin: 20px 0; }
                .palette, .mixing-area { display: flex; gap: 10px; align-items: center; padding: 10px; background: #f0f0f0; border-radius: 5px; }
                .color-swatch { width: 50px; height: 50px; border-radius: 50%; cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); }
                .result-name { font-size: 1.5rem; font-weight: bold; margin: 10px 0; }
                .color-wheel { margin-top: 20px; font-style: italic; color: #666; }
            `}</style>
        </>
    );
};

export default ColorTheoryMixer;