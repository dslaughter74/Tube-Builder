/* tslint:disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';

const noteFrequencies: { [key: string]: number } = {
    'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50
};

const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const keyboardKeys = [
    { note: 'C4', type: 'white' }, { note: 'C#4', type: 'black' }, { note: 'D4', type: 'white' }, { note: 'D#4', type: 'black' }, { note: 'E4', type: 'white' },
    { note: 'F4', type: 'white' }, { note: 'F#4', type: 'black' }, { note: 'G4', type: 'white' }, { note: 'G#4', type: 'black' }, { note: 'A4', type: 'white' }, { note: 'A#4', type: 'black' }, { note: 'B4', type: 'white' },
    { note: 'C5', type: 'white' }, { note: 'C#5', type: 'black' }, { note: 'D5', type: 'white' }, { note: 'D#5', type: 'black' }, { note: 'E5', type: 'white' },
    { note: 'F5', type: 'white' }, { note: 'F#5', type: 'black' }, { note: 'G5', type: 'white' }, { note: 'G#5', type: 'black' }, { note: 'A5', type: 'white' }, { note: 'A#5', type: 'black' }, { note: 'B5', type: 'white' },
    { note: 'C6', type: 'white' }
];

const chordTypesByDifficulty = {
    Easy: ['Major', 'Minor'],
    Medium: ['Major', 'Minor', 'Diminished', 'Augmented'],
    Hard: ['Major 7th', 'Minor 7th', 'Dominant 7th']
};

const HowChordsWork = () => {
    const [rootNote, setRootNote] = useState('C');
    const [chordType, setChordType] = useState('Major');
    const [inversion, setInversion] = useState('Root Position');
    const [difficulty, setDifficulty] = useState('Easy');
    const [chordInfo, setChordInfo] = useState({ selection: '', formula: '', notes: '', lowestNote: '' });
    const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) { console.error("Web Audio API is not supported in this browser", e); }
        }
    }, []);

    const playNote = useCallback((note: string, duration = 0.6) => {
        initAudioContext();
        const audioContext = audioContextRef.current;
        if (!audioContext) return;
        const freq = noteFrequencies[note];
        if (!freq) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration * 0.9);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }, [initAudioContext]);

    const playChord = useCallback((notes: string[]) => {
        initAudioContext();
        if (!audioContextRef.current) return;
        notes.forEach(note => playNote(note, 1.0));
    }, [initAudioContext, playNote]);

    useEffect(() => {
        const availableTypes = chordTypesByDifficulty[difficulty as keyof typeof chordTypesByDifficulty];
        if (!availableTypes.includes(chordType)) {
            setChordType(availableTypes[0]);
        }
    }, [difficulty, chordType]);

    useEffect(() => {
        const calculateIntervals = (type: string) => {
            switch (type) {
                case 'Minor': return { third: 3, fifth: 7, seventh: null, names: ["Minor Third", "Perfect Fifth"] };
                case 'Diminished': return { third: 3, fifth: 6, seventh: null, names: ["Minor Third", "Diminished Fifth"] };
                case 'Augmented': return { third: 4, fifth: 8, seventh: null, names: ["Major Third", "Augmented Fifth"] };
                case 'Major 7th': return { third: 4, fifth: 7, seventh: 11, names: ["Major Third", "Perfect Fifth", "Major Seventh"] };
                case 'Minor 7th': return { third: 3, fifth: 7, seventh: 10, names: ["Minor Third", "Perfect Fifth", "Minor Seventh"] };
                case 'Dominant 7th': return { third: 4, fifth: 7, seventh: 10, names: ["Major Third", "Perfect Fifth", "Minor Seventh"] };
                default: return { third: 4, fifth: 7, seventh: null, names: ["Major Third", "Perfect Fifth"] }; // Major
            }
        };
        const getNoteName = (index: number, preferFlat = false) => (preferFlat ? notesFlat : notesSharp)[index % 12];
        const getNoteIndex = (noteName: string) => notesSharp.indexOf(noteName) !== -1 ? notesSharp.indexOf(noteName) : notesFlat.indexOf(noteName);
        const getChordNotes = (root: string, type: string, startOctave = 4) => {
            const rootIndex = getNoteIndex(root);
            const intervals = calculateIntervals(type);
            const preferFlat = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root) || root.includes('b');
            const notes = [{ name: getNoteName(rootIndex, preferFlat), octave: startOctave, note: `${getNoteName(rootIndex, preferFlat)}${startOctave}`, role: "Root" }];
            const thirdIndex = rootIndex + intervals.third;
            notes.push({ name: getNoteName(thirdIndex, preferFlat), octave: thirdIndex >= 12 ? startOctave + 1 : startOctave, note: `${getNoteName(thirdIndex, preferFlat)}${thirdIndex >= 12 ? startOctave + 1 : startOctave}`, role: "Third" });
            const fifthIndex = rootIndex + intervals.fifth;
            notes.push({ name: getNoteName(fifthIndex, preferFlat), octave: fifthIndex >= 12 ? startOctave + 1 : startOctave, note: `${getNoteName(fifthIndex, preferFlat)}${fifthIndex >= 12 ? startOctave + 1 : startOctave}`, role: "Fifth" });
            if (intervals.seventh !== null) {
                const seventhIndex = rootIndex + intervals.seventh;
                notes.push({ name: getNoteName(seventhIndex, preferFlat), octave: seventhIndex >= 12 ? startOctave + 1 : startOctave, note: `${getNoteName(seventhIndex, preferFlat)}${seventhIndex >= 12 ? startOctave + 1 : startOctave}`, role: "Seventh" });
            }
            return notes;
        };
        const applyInversion = (notes: any[], inv: string) => {
            if (inv === 'Root Position' || notes.length > 3) return { invertedNotes: notes, lowestNoteRole: "Root" };
            let invertedNotes = [...notes]; let lowestNoteRole = "Root";
            if (inv === 'First Inversion') { const [root, third, fifth] = notes; invertedNotes = [third, fifth, { ...root, octave: root.octave + 1, note: `${root.name}${root.octave + 1}` }]; lowestNoteRole = "Third"; } 
            else if (inv === 'Second Inversion') { const [root, third, fifth] = notes; invertedNotes = [fifth, { ...root, octave: root.octave + 1, note: `${root.name}${root.octave + 1}` }, { ...third, octave: third.octave + 1, note: `${third.name}${third.octave + 1}` }]; lowestNoteRole = "Fifth"; }
            return { invertedNotes, lowestNoteRole };
        };

        const rootPositionNotes = getChordNotes(rootNote, chordType);
        const { invertedNotes, lowestNoteRole } = applyInversion(rootPositionNotes, inversion);
        const notesToHighlight = invertedNotes.map(n => n.note);
        setHighlightedKeys(notesToHighlight);
        playChord(notesToHighlight);
        const intervals = calculateIntervals(chordType);
        const rootPosNoteNames = rootPositionNotes.map(n => n.name);
        let formula = `Root: ${rootPosNoteNames[0]}, Third: ${intervals.names[0]} (${rootPosNoteNames[1]}), Fifth: ${intervals.names[1]} (${rootPosNoteNames[2]})`;
        if (rootPosNoteNames.length > 3) formula += `, Seventh: ${intervals.names[2]} (${rootPosNoteNames[3]})`;
        
        setChordInfo({
            selection: `${rootNote} ${chordType}, ${inversion}`, formula, notes: notesToHighlight.join(', '),
            lowestNote: inversion !== 'Root Position' && notesToHighlight.length <= 3 ? `${lowestNoteRole} (${invertedNotes[0].note})` : ''
        });
    }, [rootNote, chordType, inversion, playChord, difficulty]);

    const availableChordTypes = chordTypesByDifficulty[difficulty as keyof typeof chordTypesByDifficulty];

    return (
        <><div className="app-container"><h1>Triads and Inversions</h1>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                <div className="controls"><div className="control-group"><label>Root Note:</label><select value={rootNote} onChange={e => setRootNote(e.target.value)}>{['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(n => <option key={n} value={n}>{n}</option>)}</select></div><div className="control-group"><label>Chord Type:</label><select value={chordType} onChange={e => setChordType(e.target.value)}>{availableChordTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div><div className="control-group"><label>Inversion:</label><select value={inversion} onChange={e => setInversion(e.target.value)} disabled={difficulty === 'Hard'}> {['Root Position', 'First Inversion', 'Second Inversion'].map(i => <option key={i} value={i}>{i}</option>)}</select></div></div>
                <div className="info-display"><p><strong>Selection:</strong> {chordInfo.selection}</p><p><strong>Formula:</strong> {chordInfo.formula}</p><p><strong>Notes:</strong> {chordInfo.notes}</p>{chordInfo.lowestNote && <p><strong>Lowest Note:</strong> {chordInfo.lowestNote}</p>}</div>
                <div className="keyboard-container"><div className="keyboard">{keyboardKeys.map(({ note, type }) => (<div key={note} className={`key ${type} ${highlightedKeys.includes(note) ? 'highlighted' : ''}`} data-note={note} onMouseDown={() => playNote(note)}>{note.slice(0, -1)}</div>))}</div></div>
            </div><style>{`
                .app-container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); width: 100%; max-width: 800px; }
                h1 { text-align: center; margin-bottom: 20px; color: #2c3e50; }
                .difficulty-controls { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
                .difficulty-controls button { padding: 8px 16px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer; border-radius: 4px; }
                .difficulty-controls button.active { background: #3498db; color: white; border-color: #3498db; }
                .controls { display: flex; flex-wrap: wrap; justify-content: space-around; margin-bottom: 25px; gap: 15px; }
                .control-group { display: flex; flex-direction: column; align-items: center; }
                label { margin-bottom: 5px; font-weight: bold; color: #555; }
                select { padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; min-width: 120px; background-color: #fff; cursor: pointer; }
                .info-display { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 25px; border: 1px solid #ced4da; }
                p { margin-bottom: 8px; line-height: 1.5; } strong { color: #343a40; }
                .keyboard-container { width: 100%; margin: 0 auto; overflow-x: auto; padding-bottom: 10px; }
                .keyboard { display: flex; position: relative; height: 180px; width: max-content; min-width: 100%; margin: 0 auto; border: 2px solid #555; border-radius: 5px; background-color: #333; }
                .key { cursor: pointer; border: 1px solid #555; transition: background-color 0.1s ease; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px; font-size: 0.8em; position: relative; user-select: none; }
                .key.white { background-color: #ffffff; width: 50px; height: 100%; color: #333; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; z-index: 1; }
                .key.black { background-color: #333333; width: 30px; height: 60%; color: #ffffff; position: absolute; top: 0; margin-left: -15px; z-index: 2; border-bottom-left-radius: 3px; border-bottom-right-radius: 3px; }
                .key[data-note^="C#"], .key[data-note^="Db"] { margin-left: -15px; left: 50px; } .key[data-note^="D#"], .key[data-note^="Eb"] { margin-left: -15px; left: 100px; }
                .key[data-note^="F#"], .key[data-note^="Gb"] { margin-left: -15px; left: 200px; } .key[data-note^="G#"], .key[data-note^="Ab"] { margin-left: -15px; left: 250px; }
                .key[data-note^="A#"], .key[data-note^="Bb"] { margin-left: -15px; left: 300px; } .key[data-note="C#5"], .key[data-note="Db5"] { left: calc(50px + 7 * 50px); }
                .key[data-note="D#5"], .key[data-note="Eb5"] { left: calc(100px + 7 * 50px); } .key[data-note="F#5"], .key[data-note="Gb5"] { left: calc(200px + 7 * 50px); }
                .key[data-note="G#5"], .key[data-note="Ab5"] { left: calc(250px + 7 * 50px); } .key[data-note="A#5"], .key[data-note="Bb5"] { left: calc(300px + 7 * 50px); }
                .key.highlighted { background-color: #4a90e2; } .key.black.highlighted { background-color: #3a7bc8; }
            `}</style></>
    );
};

export default HowChordsWork;