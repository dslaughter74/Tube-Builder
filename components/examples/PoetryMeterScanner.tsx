/* tslint:disable */
import React, { useState, useMemo } from 'react';

const lines = {
    Easy: ["Shall I compare thee to a summer's day?"],
    Medium: ["To be, or not to be: that is the question:", "My mistress' eyes are nothing like the sun;"],
    Hard: ["When I consider how my light is spent", "Batter my heart, three-person'd God; for you"] // Hard has a trochaic start
};
const scans = {
    "Shall I compare thee to a summer's day?": "u S u S u S u S u S",
    "To be, or not to be: that is the question:": "u S u S u S u S u S",
    "My mistress' eyes are nothing like the sun;": "u S u S u S u S u S",
    "When I consider how my light is spent": "u S u S u S u S u S",
    "Batter my heart, three-person'd God; for you": "S u u S u S u S u S" // Trochaic substitution
};

const PoetryMeterScanner = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [currentLine, setCurrentLine] = useState(lines.Easy[0]);
    const [userScan, setUserScan] = useState<string[]>([]);
    const [quizResult, setQuizResult] = useState('');

    const syllables = useMemo(() => currentLine.split(/([aeiouy]+[^$e\s\.,:;!?])|([aiouy]+$)/i).filter(Boolean), [currentLine]);
    const correctScan = useMemo(() => scans[currentLine as keyof typeof scans].split(' '), [currentLine]);

    const handleSyllableClick = (index: number) => {
        if (difficulty === 'Easy') return;
        const newScan = [...userScan];
        newScan[index] = newScan[index] === 'S' ? 'u' : 'S';
        setUserScan(newScan);
    };
    
    const checkScan = () => {
        if (userScan.join(' ') === correctScan.join(' ')) {
            setQuizResult('Correct! Perfect scan.');
        } else {
            setQuizResult('Not quite, try again.');
        }
    };
    
    const changeLine = (level: string) => {
        const levelLines = lines[level as keyof typeof lines];
        const newLine = levelLines[Math.floor(Math.random() * levelLines.length)];
        setCurrentLine(newLine);
        setUserScan([]);
        setQuizResult('');
    };

    return (
        <>
            <div className="poetry-container">
                <h2>Poetry Meter Scanner</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => { setDifficulty('Easy'); changeLine('Easy'); }}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => { setDifficulty('Medium'); changeLine('Medium'); }}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => { setDifficulty('Hard'); changeLine('Hard'); }}>Hard</button>
                </div>
                <div className="line-display">
                    {syllables.map((syl, i) => (
                        <div key={i} className="syllable" onClick={() => handleSyllableClick(i)}>
                            <div className="stress-mark">
                                {difficulty === 'Easy' ? (correctScan[i] === 'S' ? 'S' : 'u') : (userScan[i] || '?')}
                            </div>
                            {syl}
                        </div>
                    ))}
                </div>
                {difficulty !== 'Easy' && <button onClick={checkScan}>Check My Scan</button>}
                <div className="quiz-result">{quizResult}</div>
                <div className="instructions">
                    {difficulty === 'Easy' && <p>This is a pre-scanned line. 'u' is unstressed, 'S' is stressed.</p>}
                    {difficulty === 'Medium' && <p>Click the syllables to mark them as Stressed (S) or unstressed (u).</p>}
                    {difficulty === 'Hard' && <p>Beware of poetic variations! Scan the line and check your answer.</p>}
                </div>
            </div>
            <style>{`
                .poetry-container { text-align: center; }
                .difficulty-controls { margin-bottom: 20px; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #563d7c; color: white; }
                .line-display { display: flex; flex-wrap: wrap; justify-content: center; margin-bottom: 20px; font-size: 1.5rem; }
                .syllable { padding: 10px; cursor: pointer; user-select: none; }
                .stress-mark { font-weight: bold; color: #563d7c; }
                .quiz-result { margin: 10px 0; font-weight: bold; }
                .instructions { font-style: italic; color: #666; }
            `}</style>
        </>
    );
};

export default PoetryMeterScanner;