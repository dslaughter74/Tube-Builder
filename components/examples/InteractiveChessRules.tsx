/* tslint:disable */
import React, { useState, useMemo, useCallback } from 'react';

const PIECES: { [key: string]: string } = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const pieceTypes = ['p', 'n', 'b', 'r', 'q', 'k'];
type Piece = { type: string, r: number, c: number, id: number };

const scenarios = {
    Check: [{ type: 'k', r: 7, c: 4, id: 1 }, { type: 'R', r: 0, c: 4, id: 2 }],
    Castling: [
        { type: 'k', r: 7, c: 4, id: 1 }, { type: 'r', r: 7, c: 0, id: 2 }, { type: 'r', r: 7, c: 7, id: 3 },
        { type: 'K', r: 0, c: 4, id: 4 }, { type: 'R', r: 0, c: 0, id: 5 }, { type: 'R', r: 0, c: 7, id: 6 }
    ]
};

const InteractiveChessRules = () => {
    const [pieces, setPieces] = useState<Piece[]>([{ type: 'q', r: 3, c: 3, id: 1 }]);
    const [selectedPieceId, setSelectedPieceId] = useState<number | null>(1);
    const [difficulty, setDifficulty] = useState('Easy');
    const [scenario, setScenario] = useState<string | null>(null);

    const getMoves = useCallback((p: Piece, boardPieces: Piece[]) => {
        const moves: [number, number][] = [];
        const isWhite = p.type === p.type.toUpperCase();
        const add = (dr: number, dc: number) => {
            const r = p.r + dr, c = p.c + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = boardPieces.find(op => op.r === r && op.c === c);
                if (!target) moves.push([r, c]);
                else if ((isWhite && target.type === target.type.toLowerCase()) || (!isWhite && target.type === target.type.toUpperCase())) moves.push([r, c]);
            }
        };
        const addRay = (dr: number, dc: number) => { for (let i = 1; i < 8; i++) { const r = p.r + i * dr, c = p.c + i * dc; if (r >= 0 && r < 8 && c >= 0 && c < 8) { const target = boardPieces.find(op => op.r === r && op.c === c); if (!target) moves.push([r, c]); else { add(i*dr, i*dc); break; } } else break; } };

        const type = p.type.toLowerCase();
        if (type === 'p') { const dir = isWhite ? -1 : 1; add(dir, 0); if((isWhite && p.r===6) || (!isWhite && p.r===1)) add(2*dir,0); }
        if (type === 'n') [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]].forEach(m => add(m[0], m[1]));
        if (type === 'k') [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(m => add(m[0], m[1]));
        if (type === 'r' || type === 'q') { addRay(1, 0); addRay(-1, 0); addRay(0, 1); addRay(0, -1); }
        if (type === 'b' || type === 'q') { addRay(1, 1); addRay(-1, -1); addRay(1, -1); addRay(-1, 1); }
        return moves;
    }, []);

    const selectedPiece = pieces.find(p => p.id === selectedPieceId);
    const highlightedMoves = useMemo(() => selectedPiece ? getMoves(selectedPiece, pieces) : [], [selectedPiece, pieces, getMoves]);
    
    const handleSquareClick = (r: number, c: number) => {
        const pieceOnSquare = pieces.find(p => p.r === r && p.c === c);
        if (pieceOnSquare) { setSelectedPieceId(pieceOnSquare.id); return; }
        if (selectedPiece && highlightedMoves.some(([hr, hc]) => hr === r && hc === c)) {
            setPieces(currentPieces => currentPieces.map(p => p.id === selectedPiece.id ? { ...p, r, c } : p).filter(p => !(p.r === r && p.c === c && p.id !== selectedPiece.id)));
        }
    };
    
    const addPiece = (type: string) => {
        if (difficulty === 'Easy') setPieces([{ type, r: 3, c: 3, id: 1 }]);
        else setPieces(p => [...p, { type, r: 3, c: 3, id: Date.now() }]);
    };
    
    const handleDifficultyChange = (level: string) => { setDifficulty(level); setScenario(null); if (level === 'Easy') setPieces([{ type: 'q', r: 3, c: 3, id: 1 }]); else setPieces([]); };
    const loadScenario = (name: string) => { setScenario(name); setPieces(scenarios[name as keyof typeof scenarios]); };

    return (
        <><div className="chess-container">
            <div className="game-area">
                <div id="board">{[...Array(64)].map((_, i) => { const r = Math.floor(i / 8), c = i % 8; const pieceOnSquare = pieces.find(p => p.r === r && p.c === c); const isHighlighted = highlightedMoves.some(([hr, hc]) => hr === r && hc === c); return <div key={i} className={`square ${(r + c) % 2 === 0 ? 'light' : 'dark'} ${isHighlighted ? 'highlight' : ''}`} onClick={() => handleSquareClick(r, c)}>{pieceOnSquare && <div className={`piece ${pieceOnSquare.id === selectedPieceId ? 'selected' : ''}`}>{PIECES[pieceOnSquare.type]}</div>}</div>; })}</div>
                <div className="controls">
                    <h3>Controls</h3>
                    <div className="difficulty-controls-chess"><button className={difficulty==='Easy'?'active':''} onClick={()=>handleDifficultyChange('Easy')}>Easy</button><button className={difficulty==='Medium'?'active':''} onClick={()=>handleDifficultyChange('Medium')}>Medium</button><button className={difficulty==='Hard'?'active':''} onClick={()=>handleDifficultyChange('Hard')}>Hard</button></div>
                    {difficulty !== 'Easy' && <div className="piece-palette"><h4>Add Pieces</h4><div>{pieceTypes.map(p => <button key={p} onClick={() => addPiece(p)}>{PIECES[p]}</button>)}{pieceTypes.map(p => <button key={p} onClick={() => addPiece(p.toUpperCase())}>{PIECES[p.toUpperCase()]}</button>)}</div></div>}
                    {difficulty === 'Hard' && <div className="scenario-palette"><h4>Scenarios</h4><button onClick={() => loadScenario('Check')}>Check</button><button onClick={() => loadScenario('Castling')}>Castling</button></div>}
                    <button onClick={() => {setPieces([]); setSelectedPieceId(null); setScenario(null)}}>Clear Board</button>
                    {scenario && <div className="scenario-info"><h4>{scenario}</h4>{scenario === 'Check' && <p>The black King is in 'Check' by the white Rook. The King must move out of the highlighted squares to be safe.</p>}{scenario === 'Castling' && <p>Castling is a special move. Click the King to see its legal moves, including castling with either Rook.</p>}</div>}
                </div>
            </div>
            </div><style>{`
                .chess-container { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 20px; }
                #board { display: grid; grid-template-columns: repeat(8, 50px); grid-template-rows: repeat(8, 50px); width: 400px; height: 400px; border: 2px solid #333; }
                .square { width: 50px; height: 50px; position: relative; } .square.light { background-color: #f0d9b5; } .square.dark { background-color: #b58863; }
                .piece { font-size: 42px; cursor: pointer; text-align: center; line-height: 50px; user-select: none; width: 100%; height: 100%; }
                .piece.selected { background: rgba(255, 255, 0, 0.5); }
                .highlight::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 18px; height: 18px; background: rgba(0, 0, 0, 0.4); border-radius: 50%; }
                .controls { width: 200px; } .difficulty-controls-chess { display: flex; gap: 5px; margin-bottom: 10px; } .difficulty-controls-chess button { flex: 1; padding: 5px; } button.active { background: #b58863; color: white; }
                .piece-palette div, .scenario-palette { display: flex; flex-wrap: wrap; gap: 5px; } .piece-palette button, .scenario-palette button { font-size: 1.2rem; }
            `}</style></>
    );
};

export default InteractiveChessRules;