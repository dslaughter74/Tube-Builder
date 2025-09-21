/* tslint:disable */
import React, { useState, useMemo } from 'react';

const db = {
    employees: [
        { id: 1, name: 'Alice', dept_id: 1 }, { id: 2, name: 'Bob', dept_id: 2 }, { id: 3, name: 'Charlie', dept_id: 1 }
    ],
    departments: [
        { id: 1, name: 'Engineering' }, { id: 2, name: 'Marketing' }
    ],
    salaries: [
        { emp_id: 1, amount: 90000 }, { emp_id: 2, amount: 60000 }, { emp_id: 3, amount: 110000 }
    ]
};

const SQLQuerySimulator = () => {
    const [difficulty, setDifficulty] = useState('Easy');
    const [query, setQuery] = useState('SELECT * FROM employees;');
    const [result, setResult] = useState<any[]>([]);
    const [error, setError] = useState('');

    const tables = useMemo(() => {
        if (difficulty === 'Easy') return { employees: db.employees };
        if (difficulty === 'Medium') return { employees: db.employees, departments: db.departments };
        return db;
    }, [difficulty]);

    const runQuery = () => {
        try {
            setError('');
            if (/SELECT \* FROM employees;?/i.test(query)) { setResult(tables.employees); return; }
            if (/SELECT name FROM employees;?/i.test(query)) { setResult(tables.employees.map(e => ({ name: e.name }))); return; }
            if (/SELECT \* FROM employees WHERE dept_id = 1;?/i.test(query)) { setResult(tables.employees.filter(e => e.dept_id === 1)); return; }
            if (difficulty !== 'Easy' && /SELECT e.name, d.name AS department FROM employees e JOIN departments d ON e.dept_id = d.id;?/i.test(query)) {
                const joined = db.employees.map(e => ({...e, department: db.departments.find(d => d.id === e.dept_id)?.name }));
                setResult(joined.map(j => ({ name: j.name, department: j.department }))); return;
            }
            if (difficulty === 'Hard' && /SELECT d.name, COUNT\(e.id\) AS num_employees FROM employees e JOIN departments d ON e.dept_id = d.id GROUP BY d.name;?/i.test(query)) {
                const counts = db.departments.map(d => ({ name: d.name, num_employees: db.employees.filter(e => e.dept_id === d.id).length }));
                setResult(counts); return;
            }
            throw new Error('Query not recognized for this difficulty level.');
        } catch (e: any) {
            setError(e.message);
            setResult([]);
        }
    };

    return (
        <>
            <div className="sql-container">
                <h2>SQL Query Simulator</h2>
                <div className="difficulty-controls">
                    <button className={difficulty === 'Easy' ? 'active' : ''} onClick={() => setDifficulty('Easy')}>Easy</button>
                    <button className={difficulty === 'Medium' ? 'active' : ''} onClick={() => setDifficulty('Medium')}>Medium</button>
                    <button className={difficulty === 'Hard' ? 'active' : ''} onClick={() => setDifficulty('Hard')}>Hard</button>
                </div>
                <div className="sql-main">
                    <div className="tables-view">
                        <h3>Tables</h3>
                        {Object.entries(tables).map(([name, data]) => (<div key={name}><h4>{name}</h4><pre>{JSON.stringify(data, null, 2)}</pre></div>))}
                    </div>
                    <div className="query-view">
                        <h3>Query Editor</h3>
                        <textarea value={query} onChange={e => setQuery(e.target.value)} rows={4}></textarea>
                        <button onClick={runQuery}>Run Query</button>
                        <h3>Result</h3>
                        {error && <div className="sql-error">{error}</div>}
                        {result.length > 0 && <table><thead><tr>{Object.keys(result[0]).map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{result.map((row, i) => <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}</tbody></table>}
                    </div>
                </div>
            </div>
            <style>{`
                .sql-container { font-family: monospace; }
                .difficulty-controls { text-align: center; margin-bottom: 15px; }
                .difficulty-controls button { margin: 0 5px; padding: 8px 12px; border-radius: 5px; border: 1px solid #ccc; cursor: pointer; }
                .difficulty-controls button.active { background: #4b0082; color: white; }
                .sql-main { display: flex; gap: 20px; }
                .tables-view, .query-view { flex: 1; }
                textarea { width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 5px; }
                .sql-error { color: red; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            `}</style>
        </>
    );
};

export default SQLQuerySimulator;