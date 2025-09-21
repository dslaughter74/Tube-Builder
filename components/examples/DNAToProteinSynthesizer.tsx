/* tslint:disable */
import React, { useState, useEffect } from 'react';

const codonTable: { [key: string]: string } = { 'AUG': 'Met', 'UGG': 'Trp', 'UAA': 'Stop', 'UAG': 'Stop' };
const dnaTemplate = 'TACACC';
const correctRna = 'AUGUGG';
const correctProtein = ['Met', 'Trp'];

const DNAToProteinSynthesizer = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [dna, setDna] = useState(dnaTemplate);
    const [rna, setRna] = useState('');
    const [protein, setProtein] = useState<string[]>([]);
    const [step, setStep] = useState(0);

    const runSynthesis = () => {
        const transcribedRna = dna.split('').map(b => b === 'T' ? 'A' : b === 'A' ? 'U' : b === 'G' ? 'C' : 'G').join('');
        setRna(transcribedRna);
        
        const codons = transcribedRna.match(/.{1,3}/g) || [];
        const synthesizedProtein: string[] = [];
        for (const codon of codons) {
            const aminoAcid = codonTable[codon];
            if (aminoAcid === 'Stop') break;
            if (aminoAcid) synthesizedProtein.push(aminoAcid);
        }
        setProtein(synthesizedProtein);
    };

    useEffect(() => {
        if (difficulty === 'Easy' || (difficulty === 'Medium' && step >= 2) || (difficulty === 'Hard')) {
            runSynthesis();
        } else {
            setRna('');
            setProtein([]);
        }
    }, [dna, difficulty, step]);

    const handleMutation = (index: number) => {
        if (difficulty !== 'Hard') return;
        const bases = ['A', 'T', 'C', 'G'];
        const currentBase = dna[index];
        let newBase = currentBase;
        while (newBase === currentBase) { newBase = bases[Math.floor(Math.random() * 4)]; }
        const newDna = dna.substring(0, index) + newBase + dna.substring(index + 1);
        setDna(newDna);
    };
    
    const reset = () => { setDna(dnaTemplate); setStep(0); };

    return (
        <>
            <div className="dna-container">
                <h2>DNA to Protein Synthesizer</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => { setDifficulty('Easy'); reset(); }}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => { setDifficulty('Medium'); reset(); }}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => { setDifficulty('Hard'); reset(); }}>Hard</button>
                </div>

                <div className="process-diagram">
                    <div className="molecule-row">
                        <h3>DNA</h3>
                        <div className="dna-strand">
                            {dna.split('').map((base, i) => <div key={i} className="base" onClick={() => handleMutation(i)}>{base}</div>)}
                        </div>
                    </div>
                    
                    { (difficulty === 'Easy' || step >= 1) && <>
                        <div className="arrow">↓ Transcription</div>
                        <div className="molecule-row"><h3>mRNA</h3><div className="rna-strand">{rna.split('').map((base,i) => <div key={i} className="base rna">{base}</div>)}</div></div>
                    </>}

                    { (difficulty === 'Easy' || step >= 2) && <>
                        <div className="arrow">↓ Translation</div>
                        <div className="molecule-row"><h3>Protein</h3><div className="protein-chain">{protein.map((aa, i) => <div key={i} className="amino-acid">{aa}</div>)}</div></div>
                    </>}
                </div>
                
                {difficulty === 'Medium' && <div className="step-controls"><button onClick={() => setStep(s => Math.min(s + 1, 2))} disabled={step >= 2}>Next Step</button></div>}
                <button onClick={reset}>Reset</button>

                <div className="instructions">
                    {difficulty === 'Hard' && <p>Click a DNA base to cause a random mutation and see the effect!</p>}
                </div>
            </div>
            <style>{`
                .dna-container { text-align: center; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #8a2be2; color: white; }
                .process-diagram { margin: 20px 0; }
                .molecule-row { display: flex; align-items: center; justify-content: center; gap: 15px; margin: 10px 0; }
                .dna-strand, .rna-strand, .protein-chain { display: flex; gap: 5px; padding: 10px; border-radius: 5px; }
                .dna-strand { background: #add8e6; } .rna-strand { background: #ffb6c1; } .protein-chain { background: #90ee90; }
                .base, .amino-acid { width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-weight: bold; border-radius: 3px; }
                .base { background: #e0ffff; } .base.rna { background: #ffe4e1; }
                .amino-acid { background: #c1f0c1; padding: 0 5px; }
                .arrow { font-weight: bold; margin: 10px 0; }
                .instructions { margin-top: 10px; font-style: italic; }
            `}</style>
        </>
    );
};

export default DNAToProteinSynthesizer;