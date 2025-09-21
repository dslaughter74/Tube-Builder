/* tslint:disable */
import React, { useState, useEffect } from 'react';

const patterns = {
    Easy: [[1, 1, 1, 1], [2, 2]],
    Medium: [[1, 1, 0.5, 0.5, 1], [0.5, 0.5, 1, 0.5, 0.5, 1]],
    Hard: [[1, 0, 1, 1, 1], [0.5, 0.5, 0, 1, 0.5, 0.5, 1]] // 0 represents a rest
};
const BPM = 120;
const BEAT_MS = 60000 / BPM;

const RhythmTrainingGame = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [pattern, setPattern] = useState(patterns.Easy[0]);
    const [state, setState] = useState('listen'); // listen, play, feedback
    const [userTaps, setUserTaps] = useState<number[]>([]);
    const [feedback, setFeedback] = useState('');

    const playPattern = () => {
        let delay = 0;
        pattern.forEach(noteDuration => {
            if (noteDuration > 0) {
                setTimeout(() => {
                    // Visual/Audio cue for note
                    console.log('Beat!');
                }, delay);
            }
            delay += noteDuration * BEAT_MS;
        });
        setTimeout(() => setState('play'), delay + BEAT_MS);
    };

    const handleTap = () => {
        if (state !== 'play') return;
        setUserTaps([...userTaps, Date.now()]);
    };

    useEffect(() => {
        if (state === 'listen') {
            playPattern();
        } else if (state === 'play' && userTaps.length === pattern.filter(n => n > 0).length) {
            // Simple scoring logic for demonstration
            setFeedback('Good job!');
            setTimeout(() => {
                const newPatterns = patterns[difficulty as keyof typeof patterns];
                setPattern(newPatterns[Math.floor(Math.random() * newPatterns.length)]);
                setUserTaps([]);
                setState('listen');
                setFeedback('');
            }, 1500);
        }
    }, [state, userTaps]);

    return (
        <>
            <div className="rhythm-container">
                <h2>Rhythm Training Game</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                <div className="game-area">
                    <div className="status">{state.toUpperCase()}</div>
                    <button className="tap-button" onClick={handleTap} disabled={state !== 'play'}>TAP</button>
                    <div className="feedback">{feedback}</div>
                </div>
            </div>
            <style>{`
                .rhythm-container { text-align: center; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #17a2b8; color: white; }
                .game-area { margin-top: 20px; }
                .status { font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; }
                .tap-button { width: 150px; height: 150px; border-radius: 50%; background: #dc3545; color: white; font-size: 2rem; border: none; cursor: pointer; }
                .feedback { margin-top: 10px; font-weight: bold; }
            `}</style>
        </>
    );
};

export default RhythmTrainingGame;