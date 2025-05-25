import React, { useEffect, useState } from 'react';

function HistoryTable({ getCurrencyName }) {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/history');
                const data = await response.json();
                setHistory(data);
            } catch (err) {
                setError('Failed to load history');
            }
        };
        loadHistory();
    }, []);

    return (
        <div className="history-section">
            <h2>Conversion History</h2>
            {error && <div className="error">{error}</div>}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '4px' }}>Time</th>
                        <th style={{ padding: '4px' }}>Type</th>
                        <th style={{ padding: '4px' }}>Amount</th>
                        <th style={{ padding: '4px' }}>From</th>
                        <th style={{ padding: '4px' }}>To</th>
                        <th style={{ padding: '4px' }}>Result</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item) => (
                        <tr key={item.id}>
                            <td style={{ padding: '4px', fontSize: '0.95em' }}>{new Date(item.timestamp).toLocaleString()}</td>
                            <td style={{ padding: '4px' }}>{item.type}</td>
                            <td style={{ padding: '4px' }}>{item.amount}</td>
                            <td style={{ padding: '4px' }}>{getCurrencyName(item.sourceCurrency || item.source_currency)}</td>
                            <td style={{ padding: '4px' }}>
                                {item.type === 'all' ? 'All Currencies' :
                                    (item.targetCurrency ? getCurrencyName(item.targetCurrency) : (item.target_currency ? getCurrencyName(item.target_currency) : '-'))
                                }
                            </td>
                            <td style={{ padding: '4px' }}>
                                {item.type === 'single' && item.result.convertedAmount !== undefined && (
                                    <span>{typeof item.result.convertedAmount === 'number' ? item.result.convertedAmount.toFixed(10) : 'N/A'}</span>
                                )}
                                {item.type === 'all' && Array.isArray(item.result) && (
                                    <div className="history-multiline-result">
                                        {item.result.map(r => (
                                            <div key={r.targetCurrency}>
                                                {getCurrencyName(r.targetCurrency)}: {typeof r.convertedAmount === 'number' ? r.convertedAmount.toFixed(10) : 'N/A'}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {history.length === 0 && <div style={{ marginTop: '1rem' }}>No history yet.</div>}
        </div>
    );
}

export default HistoryTable; 