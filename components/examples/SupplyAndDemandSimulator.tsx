/* tslint:disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';

const P_MAX = 100;
const Q_MAX = 100;
const SHIFT_AMOUNTS = { Easy: 3, Medium: 5, Hard: 8 };

const SupplyAndDemandSimulator = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [demandShift, setDemandShift] = useState(0);
    const [supplyShift, setSupplyShift] = useState(0);
    const [equilibrium, setEquilibrium] = useState({ p: 50, q: 50 });
    const [difficulty, setDifficulty] = useState('Medium');
    const [marketShock, setMarketShock] = useState<{type: string, amount: number} | null>(null);
    
    const shiftAmount = SHIFT_AMOUNTS[difficulty as keyof typeof SHIFT_AMOUNTS];

    const draw = useCallback(() => {
        const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return;
        const scaleX = canvas.width / Q_MAX; const scaleY = canvas.height / P_MAX;
        const currentSupplyShift = supplyShift + (marketShock ? marketShock.amount : 0);
        const demand = (q: number, shift: number) => 100 - q + shift;
        const supply = (q: number, shift: number) => q + shift;
        const findEq = () => { const eq_q = (100 + demandShift - currentSupplyShift) / 2; const eq_p = eq_q + currentSupplyShift; return { q: Math.max(0, Math.min(Q_MAX, eq_q)), p: Math.max(0, Math.min(P_MAX, eq_p)) }; };
        setEquilibrium(findEq());
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const drawCurve = (func: (q:number, s:number)=>number, shift: number, color: string) => {
            ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 3;
            let p = func(0, shift); if (p < 0) p = 0; if (p > P_MAX) p = P_MAX;
            ctx.moveTo(0, canvas.height - p * scaleY);
            for (let q = 1; q <= Q_MAX; q++) { p = func(q, shift); if (p >= 0 && p <= P_MAX) ctx.lineTo(q * scaleX, canvas.height - p * scaleY); }
            ctx.stroke();
        };
        drawCurve(demand, demandShift, 'royalblue');
        drawCurve(supply, currentSupplyShift, 'tomato');

        const eq = findEq(); ctx.beginPath(); ctx.fillStyle = '#333'; ctx.arc(eq.q * scaleX, canvas.height - eq.p * scaleY, 6, 0, 2 * Math.PI); ctx.fill();
    }, [demandShift, supplyShift, marketShock]);

    useEffect(() => { draw(); }, [draw]);
    
    const handleReset = () => { setDemandShift(0); setSupplyShift(0); setMarketShock(null); };
    const triggerMarketShock = () => {
        const shocks = [{ type: 'Supplier Tax', amount: 20 }, { type: 'Production Subsidy', amount: -20 }];
        setMarketShock(shocks[Math.floor(Math.random() * shocks.length)]);
    };
    const handleDifficultyChange = (level: string) => { setDifficulty(level); handleReset(); };

    return (
        <><div className="supply-demand-container">
            <h1>Supply & Demand Simulator</h1>
            <div className="difficulty-controls">
                <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => handleDifficultyChange('Easy')}>Easy</button>
                <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => handleDifficultyChange('Medium')}>Medium</button>
                <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => handleDifficultyChange('Hard')}>Hard</button>
            </div>
            <div className="graph-container"><canvas ref={canvasRef} id="chart" width="400" height="400"></canvas><span className="axis-label y">Price</span><span className="axis-label x">Quantity</span></div>
            <div className="controls">
                <div className="control-group"><label>Demand</label><div><button onClick={() => setDemandShift(s => s - shiftAmount)}>-</button><span>Shift</span><button onClick={() => setDemandShift(s => s + shiftAmount)}>+</button></div></div>
                <div className="control-group"><label>Supply</label><div><button onClick={() => setSupplyShift(s => s + shiftAmount)}>-</button><span>Shift</span><button onClick={() => setSupplyShift(s => s - shiftAmount)}>+</button></div></div>
            </div>
            {difficulty === 'Hard' && <div className="shock-controls"><button onClick={triggerMarketShock} disabled={!!marketShock}>Trigger Market Shock</button></div>}
            <div className="info">{marketShock && <p className="shock-status"><strong>Active Shock:</strong> {marketShock.type}</p>}<p>Equilibrium Price: <strong>${equilibrium.p.toFixed(2)}</strong></p><p>Equilibrium Quantity: <strong>{equilibrium.q.toFixed(2)} units</strong></p><button onClick={handleReset} className="reset-button">Reset</button></div>
        </div><style>{`
            .supply-demand-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
            .graph-container { position: relative; width: 400px; height: 400px; border-left: 2px solid #333; border-bottom: 2px solid #333; margin: 0 auto; }
            .axis-label { position: absolute; font-weight: bold; color: #555; }
            .axis-label.y { top: 50%; left: -40px; transform: rotate(-90deg); } .axis-label.x { bottom: -30px; left: 50%; transform: translateX(-50%); }
            .controls { margin-top: 1rem; display: flex; justify-content: center; gap: 2rem; }
            .control-group { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
            .difficulty-controls { display: flex; justify-content: center; gap: 10px; margin-bottom: 1rem; }
            .difficulty-controls button { padding: 8px 16px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer; border-radius: 6px; }
            .difficulty-controls button.active { background: #007bff; color: white; border-color: #007bff; }
            .shock-controls { margin-top: 1rem; }
            .shock-controls button { padding: 10px 20px; background-color: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; }
            .shock-controls button:disabled { background-color: #a0a0a0; }
            .shock-status { color: #dc3545; font-weight: bold; }
            .reset-button { margin-top: 1rem; padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; }
        `}</style></>
    );
};

export default SupplyAndDemandSimulator;