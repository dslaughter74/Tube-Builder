/* tslint:disable */
import React, { useState } from 'react';

const MapProjectionVisualizer = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [projection, setProjection] = useState('Mercator');

    return (
        <>
            <div className="map-container">
                <h2>Map Projection Visualizer</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                
                {(difficulty === 'Medium' || difficulty === 'Hard') && (
                    <div className="projection-selector">
                        <select value={projection} onChange={e => setProjection(e.target.value)}>
                            <option>Mercator</option>
                            <option>Peters</option>
                            <option>Robinson</option>
                        </select>
                    </div>
                )}

                <div className="maps-display">
                    <div className="map-view">
                        <h3>Globe (Reality)</h3>
                        <div className="globe">
                            {difficulty === 'Hard' && <div className="tissot-indicatrix" style={{ top: '20%', left: '50%' }}></div>}
                        </div>
                    </div>
                    <div className="map-view">
                        <h3>{projection} Projection</h3>
                        <div className={`flat-map ${projection.toLowerCase()}`}>
                             {difficulty === 'Hard' && <div className="tissot-indicatrix flat" style={{ top: '10%', left: '50%', transform: 'scale(2, 4)' }}></div>}
                        </div>
                    </div>
                </div>

                <div className="instructions">
                    {difficulty === 'Easy' && <p>Notice how Greenland looks as big as Africa on the flat map.</p>}
                    {difficulty === 'Medium' && <p>Switch between projections to see how they distort the world differently.</p>}
                    {difficulty === 'Hard' && <p>The red circles (Tissot's Indicatrix) show how shape and area are distorted.</p>}
                </div>
            </div>
            <style>{`
                .map-container { text-align: center; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #006400; color: white; }
                .projection-selector { margin: 15px 0; }
                .maps-display { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
                .map-view { flex: 1; }
                .globe, .flat-map { width: 100%; max-width: 300px; height: 300px; background-size: cover; margin: 0 auto; border: 1px solid #ccc; position: relative; }
                .globe { border-radius: 50%; background-image: url('https://upload.wikimedia.org/wikipedia/commons/c/c4/Earth_Caucasus_and_surrounding_region_-_August_2021.jpg'); }
                .flat-map.mercator { background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Mercator_projection_SW.jpg/1280px-Mercator_projection_SW.jpg'); }
                .flat-map.peters { background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Gall%E2%80%93Peters_projection_SW.jpg/1280px-Gall%E2%80%93Peters_projection_SW.jpg'); }
                .flat-map.robinson { background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Robinson_projection_SW.jpg/1280px-Robinson_projection_SW.jpg'); }
                .tissot-indicatrix { position: absolute; width: 30px; height: 30px; background: rgba(255, 0, 0, 0.5); border: 1px solid red; border-radius: 50%; transform: translate(-50%, -50%); }
                .instructions { margin-top: 20px; font-style: italic; }
            `}</style>
        </>
    );
};

export default MapProjectionVisualizer;