/* tslint:disable */
import React, { useState } from 'react';

const chords = {
    Easy: {
        'G': ['320003', 'G Major'], 'C': ['x32010', 'C Major'], 'D': ['xx0232', 'D Major'],
        'Em': ['022000', 'E Minor'], 'Am': ['x02210', 'A Minor']
    },
    Medium: {
        'F': ['133211', 'F Major (Barre)'], 'Bm': ['x24432', 'B Minor (Barre)']
    },
    Hard: {
        'Cmaj7': ['x3545x', 'C Major 7'], 'G7': ['35343x', 'G Dominant 7'], 'Dm7': ['x5756x', 'D Minor 7']
    }
};

const QuizBank = { ...chords.Easy, ...chords.Medium, ...chords.Hard };
const QuizKeys = Object.keys(QuizBank);

const GuitarChordTrainer = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [selectedChord, setSelectedChord] = useState('G');
    const [quizMode, setQuizMode] = useState(false);
    const [quizChord, setQuizChord] = useState('C');
    const [feedback, setFeedback] = useState('');

    const handleQuizGuess = (guess: string) => {
        if (guess === quizChord) {
            setFeedback('Correct! 🎉');
            setTimeout(() => {
                setFeedback('');
                setQuizChord(QuizKeys[Math.floor(Math.random() * QuizKeys.length)]);
            }, 1500);
        } else {
            setFeedback('Try again!');
        }
    };
    
    const currentChordFingering = quizMode ? QuizBank[quizChord][0] : chords[difficulty as keyof typeof chords][selectedChord]?.[0] || 'xxxxxx';
    const currentChordName = quizMode ? '' : chords[difficulty as keyof typeof chords][selectedChord]?.[1] || '';

    return (
        <>
            <div className="guitar-container">
                <h2>Guitar Chord Trainer</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => { setDifficulty('Easy'); setQuizMode(false); setSelectedChord('G'); }}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => { setDifficulty('Medium'); setQuizMode(false); setSelectedChord('F'); }}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>

                {difficulty === 'Hard' && <button onClick={() => setQuizMode(!quizMode)} className={`quiz-toggle ${quizMode ? 'active' : ''}`}>Quiz Mode</button>}

                <div className="fretboard">
                    {[...Array(6)].map((_, stringIndex) => (
                        <div className="string" key={stringIndex}>
                            {[...Array(6)].map((_, fretIndex) => (
                                <div className="fret" key={fretIndex}>
                                    {currentChordFingering[stringIndex] === fretIndex.toString() && <div className="dot"></div>}
                                    {fretIndex === 0 && currentChordFingering[stringIndex] === 'x' && <div className="mute">X</div>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {!quizMode ? (
                    <>
                        <div className="chord-name">{currentChordName}</div>
                        <div className="chord-selector">
                            {Object.keys(chords[difficulty as keyof typeof chords]).map(chord => (
                                <button key={chord} className={selectedChord === chord ? 'active' : ''} onClick={() => setSelectedChord(chord)}>{chord}</button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="quiz-section">
                        <h3>What chord is this?</h3>
                        <div className="quiz-options">
                            {QuizKeys.map(key => <button key={key} onClick={() => handleQuizGuess(key)}>{key}</button>)}
                        </div>
                        <div className="feedback">{feedback}</div>
                    </div>
                )}
            </div>
            <style>{`
                .guitar-container { font-family: sans-serif; text-align: center; background: #fff; padding: 20px; border-radius: 10px; width: fit-content; margin: auto; }
                .difficulty-controls, .chord-selector, .quiz-options { margin: 15px 0; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
                button { padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; background: #f0f0f0; }
                button.active { background: #d9534f; color: white; }
                .quiz-toggle { background: #5bc0de; color: white; }
                .fretboard { display: flex; border: 2px solid #663300; background: #deb887; width: 200px; margin: 20px auto; flex-direction: column-reverse; }
                .string { display: flex; flex-direction: column; }
                .fret { width: 100%; height: 40px; border-top: 2px solid #999; position: relative; display: flex; justify-content: center; align-items: center; }
                .dot { width: 20px; height: 20px; background: #333; border-radius: 50%; position: absolute; top: -10px; }
                .mute { font-size: 1.5rem; color: #ff0000; position: absolute; top: 5px; font-weight: bold; }
                .chord-name { font-size: 1.5rem; font-weight: bold; margin-top: 10px; }
                .feedback { margin-top: 10px; font-size: 1.2rem; font-weight: bold; height: 20px; }
            `}</style>
        </>
    );
};

export default GuitarChordTrainer;