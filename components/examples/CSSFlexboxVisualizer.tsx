/* tslint:disable */
import React, { useState } from 'react';

const CSSFlexboxVisualizer = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [containerStyles, setContainerStyles] = useState({
        justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'nowrap'
    });
    const [items, setItems] = useState([ { id: 1, order: 0, flexGrow: 0, flexShrink: 1 }, { id: 2, order: 0, flexGrow: 0, flexShrink: 1 }, { id: 3, order: 0, flexGrow: 0, flexShrink: 1 } ]);

    const handleContainerChange = (prop: string, value: string) => setContainerStyles(prev => ({ ...prev, [prop]: value }));
    const handleItemChange = (id: number, prop: string, value: number) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [prop]: value } : item));
    };

    return (
        <>
            <div className="flexbox-container">
                <h2>CSS Flexbox Visualizer</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                <div className="controls-panel">
                    <div className="control-group">
                        <label>justify-content</label>
                        <select value={containerStyles.justifyContent} onChange={e => handleContainerChange('justifyContent', e.target.value)}>
                            {['flex-start', 'flex-end', 'center', 'space-between', 'space-around'].map(v => <option key={v}>{v}</option>)}
                        </select>
                    </div>
                    <div className="control-group">
                        <label>align-items</label>
                        <select value={containerStyles.alignItems} onChange={e => handleContainerChange('alignItems', e.target.value)}>
                            {['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].map(v => <option key={v}>{v}</option>)}
                        </select>
                    </div>
                    {(difficulty === 'Medium' || difficulty === 'Hard') && <>
                        <div className="control-group">
                            <label>flex-direction</label>
                            <select value={containerStyles.flexDirection} onChange={e => handleContainerChange('flexDirection', e.target.value)}>
                                {['row', 'row-reverse', 'column', 'column-reverse'].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>flex-wrap</label>
                            <select value={containerStyles.flexWrap} onChange={e => handleContainerChange('flexWrap', e.target.value)}>
                                {['nowrap', 'wrap', 'wrap-reverse'].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                    </>}
                </div>
                <div className="flex-preview" style={containerStyles as any}>
                    {items.map(item => (
                        <div key={item.id} className="flex-item" style={{ order: item.order, flexGrow: item.flexGrow, flexShrink: item.flexShrink }}>
                            {item.id}
                            {difficulty === 'Hard' && <div className="item-controls">
                                <div>G:<input type="number" value={item.flexGrow} onChange={e => handleItemChange(item.id, 'flexGrow', Number(e.target.value))} /></div>
                                <div>S:<input type="number" value={item.flexShrink} onChange={e => handleItemChange(item.id, 'flexShrink', Number(e.target.value))} /></div>
                                <div>O:<input type="number" value={item.order} onChange={e => handleItemChange(item.id, 'order', Number(e.target.value))} /></div>
                            </div>}
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .flexbox-container { text-align: center; }
                .difficulty-controls { margin-bottom: 15px; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #0275d8; color: white; }
                .controls-panel { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
                .control-group { display: flex; flex-direction: column; align-items: center; }
                .flex-preview { display: flex; min-height: 250px; background: #ddd; border-radius: 5px; border: 1px solid #ccc; padding: 10px; }
                .flex-item { background: #0275d8; color: white; padding: 20px; margin: 5px; border-radius: 5px; min-width: 60px; text-align: center; font-size: 1.5rem; }
                .item-controls { font-size: 0.7rem; margin-top: 10px; display: flex; gap: 5px; justify-content: center; }
                .item-controls input { width: 30px; text-align: center; }
            `}</style>
        </>
    );
};

export default CSSFlexboxVisualizer;