import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [currencies, setCurrencies] = useState([]);
    const [amount, setAmount] = useState('');
    const [sourceCurrency, setSourceCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [error, setError] = useState('');
    const [allConversions, setAllConversions] = useState([]);
    const [mode, setMode] = useState(null); // null, 'single', 'all', 'history'
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/currencies');
            const data = await response.json();
            setCurrencies(data);
        } catch (err) {
            setError('Failed to fetch currencies');
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/history');
            const data = await response.json();
            setHistory(data);
        } catch (err) {
            setError('Failed to fetch history');
        }
    };

    const handleConvert = async (e) => {
        e.preventDefault();
        setError('');
        setConvertedAmount(null);
        try {
            const response = await fetch('http://localhost:5000/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    sourceCurrency,
                    targetCurrency,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setConvertedAmount(data.convertedAmount);
            } else {
                setError(data.error || 'Conversion failed');
            }
        } catch (err) {
            setError('Failed to perform conversion');
        }
    };

    const handleConvertAll = async (e) => {
        e.preventDefault();
        setError('');
        setAllConversions([]);
        setConvertedAmount(null);
        try {
            const response = await fetch('http://localhost:5000/api/convert-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    sourceCurrency,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setAllConversions(data.conversions);
            } else {
                setError(data.error || 'Conversion failed');
            }
        } catch (err) {
            setError('Failed to perform conversion');
        }
    };

    function getCurrencyName(code) {
        const currency = currencies.find(c => c.code === code);
        return currency ? `${code} - ${currency.name}` : code;
    }

    // Mode selection screen
    if (!mode) {
        return (
            <div className="App">
                <div className="container" style={{ textAlign: 'center', maxWidth: 400 }}>
                    <h1>Currency Converter</h1>
                    <p>What would you like to do?</p>
                    <button className="tab" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('single')}>
                        Convert to a single currency
                    </button>
                    <button className="tab" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('all')}>
                        Convert to all currencies
                    </button>
                    <button className="tab" style={{ width: '100%' }} onClick={() => { fetchHistory(); setMode('history'); }}>
                        View Conversion History
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="App">
            <div className="container">
                <button className="back-btn" onClick={() => { setMode(null); setError(''); setConvertedAmount(null); setAllConversions([]); }}>
                    &larr; Back
                </button>
                <h1>Currency Converter</h1>
                {mode === 'single' && (
                    <>
                        <form onSubmit={handleConvert}>
                            <div className="form-group">
                                <label>Amount:</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label>From:</label>
                                <select
                                    value={sourceCurrency}
                                    onChange={(e) => setSourceCurrency(e.target.value)}
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>To:</label>
                                <select
                                    value={targetCurrency}
                                    onChange={(e) => setTargetCurrency(e.target.value)}
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit">Convert</button>
                        </form>

                        {error && <div className="error">{error}</div>}

                        {convertedAmount !== null && (
                            <div className="result">
                                <h2>Result:</h2>
                                <p>
                                    {amount} {sourceCurrency} = {convertedAmount.toFixed(2)} {targetCurrency}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {mode === 'all' && (
                    <div className="convert-all-section">
                        <form onSubmit={handleConvertAll}>
                            <div className="form-group">
                                <label>Amount:</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>From:</label>
                                <select
                                    value={sourceCurrency}
                                    onChange={(e) => setSourceCurrency(e.target.value)}
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="convert-all-btn">Convert to All</button>
                        </form>

                        {error && <div className="error">{error}</div>}

                        {allConversions.length > 0 && (
                            <div className="result" style={{ marginTop: '1.5rem' }}>
                                <h3>All Conversions:</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '4px' }}>Currency</th>
                                            <th style={{ textAlign: 'right', padding: '4px' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allConversions.map((conv) => (
                                            <tr key={conv.targetCurrency}>
                                                <td style={{ padding: '4px' }}>{conv.targetCurrency} - {conv.targetName}</td>
                                                <td style={{ padding: '4px', textAlign: 'right' }}>{conv.convertedAmount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'history' && (
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
                                                <span>{item.result.convertedAmount.toFixed(2)}</span>
                                            )}
                                            {item.type === 'all' && Array.isArray(item.result) && (
                                                <div className="history-multiline-result">
                                                    {item.result.map(r => (
                                                        <div key={r.targetCurrency}>
                                                            {getCurrencyName(r.targetCurrency)}: {r.convertedAmount.toFixed(2)}
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
                )}
            </div>
        </div>
    );
}

export default App; 