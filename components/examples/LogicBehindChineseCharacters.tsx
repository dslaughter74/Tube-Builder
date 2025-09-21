/* tslint:disable */
import React, { useState, useEffect } from 'react';

const allRadicals = ['女', '木', '氵', '口', '亻', '艹', '人', '心', '日', '月'];
const allPhonetics = ['马', '青', '可', '也', '羊', '木', '巴', '生', '每', '丁'];
const characterData = [
    { character: "妈", radical: "女", phonetic: "马", pinyin: "mā", radicalMeaning: "female", phoneticMeaning: "horse (provides 'ma' sound)" },
    { character: "清", radical: "氵", phonetic: "青", pinyin: "qīng", radicalMeaning: "water", phoneticMeaning: "blue/green (provides 'qing' sound)" },
    { character: "吗", radical: "口", phonetic: "马", pinyin: "ma", radicalMeaning: "mouth (often indicates question)", phoneticMeaning: "horse (provides 'ma' sound)" },
    { character: "河", radical: "氵", phonetic: "可", pinyin: "hé", radicalMeaning: "water", phoneticMeaning: "'can/able' (provides 'ke/he' sound)" },
    { character: "他", radical: "亻", phonetic: "也", pinyin: "tā", radicalMeaning: "person", phoneticMeaning: "'also' (provides 'ye/ta' sound)" },
    { character: "样", radical: "木", phonetic: "羊", pinyin: "yàng", radicalMeaning: "wood/tree", phoneticMeaning: "sheep (provides 'yang' sound)" },
    { character: "洋", radical: "氵", phonetic: "羊", pinyin: "yáng", radicalMeaning: "water", phoneticMeaning: "sheep (provides 'yang' sound)" },
    { character: "沐", radical: "氵", phonetic: "木", pinyin: "mù", radicalMeaning: "water", phoneticMeaning: "tree/wood (provides 'mu' sound)" },
    { character: "林", radical: "木", phonetic: "木", pinyin: "lín", radicalMeaning: "tree/wood", phoneticMeaning: "tree/wood (doubled implies forest)" },
    { character: "爸", radical: "人", phonetic: "巴", pinyin: "bà", radicalMeaning: "person", phoneticMeaning: "巴 (ba sound)" },
    { character: "性", radical: "心", phonetic: "生", pinyin: "xìng", radicalMeaning: "heart/mind", phoneticMeaning: "life (sheng sound)" },
    { character: "梅", radical: "木", phonetic: "每", pinyin: "méi", radicalMeaning: "tree/wood", phoneticMeaning: "every (mei sound)" },
    { character: "灯", radical: "火", phonetic: "丁", pinyin: "dēng", radicalMeaning: "fire", phoneticMeaning: "丁 (ding sound)" }
];

const Component = ({ component, type, onDragStart }: { component: string, type: string, onDragStart: (e: React.DragEvent<HTMLDivElement>, component: string, type: string) => void }) => (
    <div className="component" draggable onDragStart={(e) => onDragStart(e, component, type)}>{component}</div>
);

const LogicBehindChineseCharacters = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [radicals, setRadicals] = useState(allRadicals.slice(0, 4));
    const [phonetics, setPhonetics] = useState(allPhonetics.slice(0, 4));
    const [currentRadical, setCurrentRadical] = useState<string | null>(null);
    const [currentPhonetic, setCurrentPhonetic] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [quizChar, setQuizChar] = useState(characterData[0]);
    const [quizFeedback, setQuizFeedback] = useState('');

    useEffect(() => {
        handleReset();
        if (difficulty === 'Easy') { setRadicals(allRadicals.slice(0, 4)); setPhonetics(allPhonetics.slice(0, 4)); } 
        else if (difficulty === 'Medium') { setRadicals(allRadicals.slice(0, 7)); setPhonetics(allPhonetics.slice(0, 7)); } 
        else { setRadicals(allRadicals); setPhonetics(allPhonetics); nextQuizChar(); }
    }, [difficulty]);
    
    const nextQuizChar = () => {
        setQuizChar(characterData[Math.floor(Math.random() * characterData.length)]);
        setQuizFeedback('');
        handleReset();
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: string, type: string) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ component, type }));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); setIsDragOver(false);
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (data.type === 'radical') setCurrentRadical(data.component);
        else setCurrentPhonetic(data.component);
    };

    const handleReset = () => { setCurrentRadical(null); setCurrentPhonetic(null); };

    useEffect(() => {
        if (difficulty === 'Hard' && currentRadical && currentPhonetic) {
            if (currentRadical === quizChar.radical && currentPhonetic === quizChar.phonetic) {
                setQuizFeedback('Correct! 🎉');
                setTimeout(nextQuizChar, 1500);
            } else {
                setQuizFeedback('Not quite, try again!');
            }
        }
    }, [currentRadical, currentPhonetic, difficulty, quizChar]);
    
    const getDisplayContent = () => {
        if (!currentRadical || !currentPhonetic) return { character: '', pinyin: '', radicalMeaning: '', phoneticMeaning: '', message: 'Drop components above...' };
        const match = characterData.find(c => c.radical === currentRadical && c.phonetic === currentPhonetic);
        return match || { character: '?', pinyin: '', radicalMeaning: '', phoneticMeaning: '', message: 'No character found for this combination.' };
    };

    const displayContent = getDisplayContent();

    return (
        <><h1>Chinese Character Builder</h1><p>Drag a radical and a sound component to the central area to form a character.</p>
            <div className="difficulty-controls-char">
                <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
            </div>
            <div className="chinese-char-container">
                <div className="palettes"><div className="palette"><h2>Radicals (Meaning)</h2>{radicals.map(r => <Component key={r} component={r} type="radical" onDragStart={handleDragStart} />)}</div><div className="palette"><h2>Sound Components</h2>{phonetics.map(p => <Component key={p} component={p} type="phonetic" onDragStart={handleDragStart} />)}</div></div>
                <div className="display-section">
                    {difficulty === 'Hard' && <div className="quiz-prompt"><h3>Quiz: Make "{quizChar.character}" ({quizChar.pinyin})</h3><p>Meaning hint: {quizChar.radicalMeaning}</p></div>}
                    <div id="display-area" className={isDragOver ? 'drag-over' : ''} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop}>
                        {displayContent.character || (currentRadical || currentPhonetic ? '' : '?')}
                        {currentRadical && <div className="component-indicator" id="radical-indicator">Rad: {currentRadical}</div>}
                        {currentPhonetic && <div className="component-indicator" id="phonetic-indicator">Phon: {currentPhonetic}</div>}
                    </div>
                    <button id="reset-button" onClick={handleReset}>Reset</button>
                    <div id="explanation-area">
                        {/* FIX: Use 'in' operator to check for property existence before access. */}
                        {difficulty === 'Hard' ? (<p className="quiz-feedback">{quizFeedback}</p>) : 'message' in displayContent ? <p>{displayContent.message}</p> : (<>
                                <p><span id="character-display">{displayContent.character}</span><span id="pinyin-display">({displayContent.pinyin})</span></p>
                                <p><strong>Radical:</strong> {currentRadical} ({displayContent.radicalMeaning})</p>
                                <p><strong>Phonetic:</strong> {currentPhonetic} ({displayContent.phoneticMeaning})</p>
                        </>)}
                    </div>
                </div>
            </div><style>{`
                h1, p { text-align: center; }
                .difficulty-controls-char { text-align: center; margin-bottom: 15px; }
                .difficulty-controls-char button { padding: 8px 16px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer; border-radius: 4px; margin: 0 5px; }
                .difficulty-controls-char button.active { background: #d9534f; color: white; border-color: #d9534f; }
                .chinese-char-container { display: flex; gap: 30px; width: 100%; max-width: 800px; justify-content: center; align-items: flex-start; flex-wrap: wrap; }
                .palettes { display: flex; flex-direction: column; gap: 20px; flex-basis: 200px; flex-shrink: 0; }
                .palette { border: 1px solid #ccc; padding: 15px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h2 { margin-top: 0; margin-bottom: 10px; font-size: 1.1em; color: #555; text-align: center; }
                .component { display: inline-block; border: 1px solid #ddd; padding: 10px 15px; margin: 5px; font-size: 1.8em; cursor: grab; background-color: #e9e9e9; border-radius: 4px; user-select: none; }
                .display-section { display: flex; flex-direction: column; align-items: center; flex-basis: 300px; flex-grow: 1; }
                #display-area { width: 200px; height: 200px; border: 2px dashed #aaa; display: flex; justify-content: center; align-items: center; font-size: 6em; margin-bottom: 20px; background-color: #fff; border-radius: 8px; position: relative; }
                #display-area.drag-over { background-color: #e0f7ff; border-color: #007bff; }
                .component-indicator { position: absolute; font-size: 0.2em; color: #888; background-color: rgba(255, 255, 255, 0.8); padding: 2px 5px; border-radius: 3px; }
                #radical-indicator { top: 5px; left: 5px; } #phonetic-indicator { top: 5px; right: 5px; }
                #explanation-area { width: 100%; max-width: 300px; padding: 15px; border: 1px solid #ccc; background-color: #f9f9f9; border-radius: 8px; min-height: 100px; font-size: 0.9em; }
                #character-display { font-size: 1.5em; font-weight: bold; } #pinyin-display { font-style: italic; }
                .quiz-prompt { text-align: center; margin-bottom: 10px; } .quiz-feedback { font-weight: bold; font-size: 1.1em; text-align: center; }
            `}</style></>
    );
};

export default LogicBehindChineseCharacters;