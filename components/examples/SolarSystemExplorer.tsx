/* tslint:disable */
import React, { useState } from 'react';

const solarSystemData = {
    sun: { name: 'Sun', type: 'Star', data: { fact: 'The center of our solar system, a hot ball of glowing gases.' } },
    mercury: { name: 'Mercury', type: 'Planet', data: { fact: 'The smallest planet in our solar system and nearest to the Sun.', diameter: '4,879 km', orbital_period: '88 days' } },
    venus: { name: 'Venus', type: 'Planet', data: { fact: 'Spins backwards compared to most planets and is the hottest planet.', diameter: '12,104 km', orbital_period: '225 days' } },
    earth: { name: 'Earth', type: 'Planet', data: { fact: 'Our home, the only place known to have an atmosphere containing free oxygen, oceans of water, and life.', diameter: '12,742 km', orbital_period: '365.25 days' } },
    mars: { name: 'Mars', type: 'Planet', data: { fact: 'Known as the Red Planet, it has seasons, polar ice caps, volcanoes, and canyons.', diameter: '6,779 km', orbital_period: '1.88 years' } },
    jupiter: { name: 'Jupiter', type: 'Planet', data: { fact: 'The largest planet, its Great Red Spot is a storm bigger than Earth.', diameter: '139,820 km', orbital_period: '11.86 years' } },
    saturn: { name: 'Saturn', type: 'Planet', data: { fact: 'Adorned with a dazzling, complex system of icy rings.', diameter: '116,460 km', orbital_period: '29.45 years' } },
    uranus: { name: 'Uranus', type: 'Planet', data: { fact: 'Rotates at a nearly 90-degree angle from the plane of its orbit, appearing to spin on its side.', diameter: '50,724 km', orbital_period: '84 years' } },
    neptune: { name: 'Neptune', type: 'Planet', data: { fact: 'The most distant planet, it is dark, cold, and whipped by supersonic winds.', diameter: '49,244 km', orbital_period: '164.8 years' } },
    pluto: { name: 'Pluto', type: 'Dwarf Planet', data: { fact: 'A dwarf planet in the Kuiper Belt, a ring of bodies beyond Neptune.', diameter: '2,376 km', orbital_period: '248 years' } },
    moon: { name: 'Moon', type: 'Moon', parent: 'earth', data: { fact: "Earth's only natural satellite." } },
    ganymede: { name: 'Ganymede', type: 'Moon', parent: 'jupiter', data: { fact: 'The largest moon in our solar system, bigger than Mercury.' } },
    titan: { name: 'Titan', type: 'Moon', parent: 'saturn', data: { fact: 'A moon with a thick, nitrogen-rich atmosphere.' } }
};

type BodyId = keyof typeof solarSystemData;

const SolarSystemExplorer = () => {
    const [selectedBody, setSelectedBody] = useState<BodyId | null>('sun');
    const [difficulty, setDifficulty] = useState('Easy');
    
    const bodyInfo = selectedBody ? solarSystemData[selectedBody] : null;

    const bodiesToShow = Object.entries(solarSystemData).filter(([id, body]) => {
        if (difficulty === 'Easy') return body.type === 'Planet' || body.type === 'Star';
        if (difficulty === 'Medium') return body.type === 'Planet' || body.type === 'Star' || body.type === 'Dwarf Planet';
        return true; // Hard mode shows all
    }).map(([id]) => id as BodyId);

    return (
        <><div className="solar-system-body">
            <h2>Solar System Explorer</h2>
            <div className="difficulty-controls-solar">
                <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
            </div>
            <div className="solar-system-container">
                <div className="solar-system">
                    {bodiesToShow.map(id => (
                        <div key={id} id={id} className={`space-body ${solarSystemData[id].type.toLowerCase().replace(' ', '-')}`} onClick={() => setSelectedBody(id)}>
                            <span>{solarSystemData[id].name}</span>
                        </div>
                    ))}
                </div>
                {bodyInfo && (
                    <div id="info-box">
                        <h2>{bodyInfo.name} <small>({bodyInfo.type})</small></h2>
                        <p>{bodyInfo.data.fact}</p>
                        {/* FIX: Cast to a known shape to help TypeScript infer the correct type after the 'in' check. */}
                        {difficulty === 'Hard' && 'diameter' in bodyInfo.data && <p><strong>Diameter:</strong> {(bodyInfo.data as { diameter: string }).diameter}</p>}
                        {/* FIX: Cast to a known shape to help TypeScript infer the correct type after the 'in' check. */}
                        {difficulty === 'Hard' && 'orbital_period' in bodyInfo.data && <p><strong>Orbital Period:</strong> {(bodyInfo.data as { orbital_period: string }).orbital_period}</p>}
                    </div>
                )}
            </div>
        </div><style>{`
            .solar-system-body { position: relative; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #000; color: #fff; font-family: 'Segoe UI', sans-serif; min-height: 600px; overflow: hidden; padding: 20px; box-sizing: border-box; }
            h2 { text-align: center; }
            .difficulty-controls-solar { display: flex; gap: 10px; margin-bottom: 20px; }
            .difficulty-controls-solar button { padding: 8px 16px; border: 1px solid #555; background: #333; color: white; cursor: pointer; border-radius: 4px; }
            .difficulty-controls-solar button.active { background: #007bff; border-color: #007bff; }
            .solar-system-container { display: flex; align-items: center; gap: 20px; width: 100%; max-width: 1000px; }
            .solar-system { position: relative; flex-grow: 1; height: 500px; border: 1px solid #333; background: #080815; border-radius: 10px; }
            .space-body { position: absolute; border-radius: 50%; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; }
            .space-body:hover { transform: scale(1.1); box-shadow: 0 0 15px #fff; z-index: 10; }
            .space-body span { display: none; position: absolute; top: -20px; background: rgba(0,0,0,0.7); padding: 2px 5px; border-radius: 3px; font-size: 0.8em; }
            .space-body:hover span { display: block; }
            .star { width: 80px; height: 80px; background: radial-gradient(circle, #ffd700, #ff4500); top: 50%; left: 50%; transform: translate(-50%, -50%); }
            .planet { background: #aaa; }
            #mercury { width: 15px; height: 15px; top: 48%; left: 65%; background: #a9a9a9; }
            #venus { width: 25px; height: 25px; top: 70%; left: 70%; background: #e6e6fa; }
            #earth { width: 25px; height: 25px; top: 20%; left: 60%; background: #4682b4; }
            #mars { width: 20px; height: 20px; top: 85%; left: 50%; background: #cd5c5c; }
            #jupiter { width: 50px; height: 50px; top: 60%; left: 20%; background: #deb887; }
            #saturn { width: 45px; height: 45px; top: 25%; left: 30%; background: #f0e68c; }
            #uranus { width: 35px; height: 35px; top: 80%; left: 85%; background: #afeeee; }
            #neptune { width: 35px; height: 35px; top: 10%; left: 80%; background: #4169e1; }
            .dwarf-planet { background: #d2b48c; }
            #pluto { width: 10px; height: 10px; top: 5%; left: 95%; }
            .moon { border: 1px dotted #888; background: #eee; }
            #moon { width: 8px; height: 8px; top: 28%; left: 65%; }
            #ganymede { width: 12px; height: 12px; top: 55%; left: 15%; }
            #titan { width: 10px; height: 10px; top: 35%; left: 25%; }
            #info-box { background: rgba(20, 20, 30, 0.8); padding: 15px; border-radius: 8px; border: 1px solid #444; width: 250px; flex-shrink: 0; }
            #info-box h2 { margin-top: 0; color: #ffd700; } #info-box p { line-height: 1.5; }
        `}</style></>
    );
};

export default SolarSystemExplorer;