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
    const [mode, setMode] = useState(null); // null, 'single', 'all', 'history', 'historical', 'updateRates'
    const [history, setHistory] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateDetails, setUpdateDetails] = useState(null);
    const [historicalDate, setHistoricalDate] = useState('');
    const [historicalResult, setHistoricalResult] = useState(null);
    const [updateRatesDate, setUpdateRatesDate] = useState(new Date().toISOString().split('T')[0]);
    const [updateRatesResult, setUpdateRatesResult] = useState(null);

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

    const handleUpdateRates = async () => {
        setIsUpdating(true);
        setError('');
        setUpdateRatesResult(null);
        try {
            const response = await fetch('http://localhost:5000/api/update-rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: updateRatesDate
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setLastUpdate(new Date(data.timestamp));
                setUpdateDetails(data.details);
                setUpdateRatesResult(data.rates);
                // Refresh currencies to get updated rates
                await fetchCurrencies();
            } else {
                setError(data.error || 'Failed to update rates');
            }
        } catch (err) {
            setError('Failed to update rates');
        } finally {
            setIsUpdating(false);
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

    const handleHistoricalConvert = async (e) => {
        e.preventDefault();
        setError('');
        setHistoricalResult(null);
        try {
            const response = await fetch('http://localhost:5000/api/convert-historical', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    sourceCurrency,
                    targetCurrency,
                    date: historicalDate
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setHistoricalResult(data);
                // Clear the input fields after successful conversion
                setAmount('');
                setHistoricalDate('');
            } else {
                let errorMessage = data.error || 'Historical conversion failed';
                if (data.availableCurrencies) {
                    errorMessage += `. Available currencies for this date: ${data.availableCurrencies.join(', ')}`;
                }
                if (data.details) {
                    errorMessage += ` (${data.details})`;
                }
                setError(errorMessage);
            }
        } catch (err) {
            setError('Failed to perform historical conversion. Please try again later.');
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
                    <button className="tab" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('historical')}>
                        Convert using historical rates
                    </button>
                    <button className="tab" style={{ width: '100%', marginBottom: 16 }} onClick={() => { fetchHistory(); setMode('history'); }}>
                        View Conversion History
                    </button>
                    <button className="tab" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('updateRates')}>
                        Update Exchange Rates
                    </button>
                </div>
            </div>
        );
    }

    // Update Rates mode
    if (mode === 'updateRates') {
        return (
            <div className="App">
                <div className="container" style={{ maxWidth: 500 }}>
                    <button className="back-btn" onClick={() => { setMode(null); setError(''); setUpdateRatesResult(null); }}>
                        &larr; Back
                    </button>
                    <h1>Update Exchange Rates</h1>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label>Select Date:</label>
                        <input
                            type="date"
                            value={updateRatesDate}
                            onChange={(e) => setUpdateRatesDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                        />
                    </div>
                    <button
                        className="update-rates-btn"
                        onClick={handleUpdateRates}
                        disabled={isUpdating}
                        style={{ marginTop: 16 }}
                    >
                        {isUpdating ? 'Updating...' : 'Update Exchange Rates'}
                    </button>
                    {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}
                    {updateRatesResult && (
                        <div className="update-info" style={{ marginTop: 24 }}>
                            <h3>New Exchange Rates:</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '4px' }}>Currency</th>
                                        <th style={{ textAlign: 'left', padding: '4px' }}>Name</th>
                                        <th style={{ textAlign: 'right', padding: '4px' }}>Value (USD)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(updateRatesResult).map(([code, value]) => {
                                        const currency = currencies.find(c => c.code === code);
                                        return (
                                            <tr key={code}>
                                                <td style={{ padding: '4px' }}>{code}</td>
                                                <td style={{ padding: '4px' }}>{currency ? currency.name : ''}</td>
                                                <td style={{ padding: '4px', textAlign: 'right' }}>{typeof value === 'number' && !isNaN(value) ? value.toFixed(10) : 'N/A'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Add historical conversion mode
    if (mode === 'historical') {
        return (
            <div className="App">
                <div className="container">
                    <button className="back-btn" onClick={() => { setMode(null); setError(''); setHistoricalResult(null); }}>
                        &larr; Back
                    </button>
                    <h1>Historical Currency Conversion</h1>
                    <form onSubmit={handleHistoricalConvert}>
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

                        <div className="form-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                value={historicalDate}
                                onChange={(e) => setHistoricalDate(e.target.value)}
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <button type="submit">Convert</button>
                    </form>

                    {error && <div className="error">{error}</div>}

                    {historicalResult && (
                        <div className="result">
                            <h2>Historical Conversion Result:</h2>
                            <p>
                                {historicalResult.originalAmount} {historicalResult.sourceCurrency} = {typeof historicalResult.convertedAmount === 'number' ? historicalResult.convertedAmount.toFixed(10) : 'N/A'} {historicalResult.targetCurrency}
                            </p>
                            <p className="historical-details">
                                Rate on {new Date(historicalResult.date).toLocaleDateString()}: 1 {historicalResult.sourceCurrency} = {typeof historicalResult.rate === 'number' ? historicalResult.rate.toFixed(10) : 'N/A'} {historicalResult.targetCurrency}
                            </p>
                        </div>
                    )}
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
                                    {amount} {sourceCurrency} = {convertedAmount.toFixed(10)} {targetCurrency}
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
                                                <td style={{ padding: '4px', textAlign: 'right' }}>{typeof conv.convertedAmount === 'number' ? conv.convertedAmount.toFixed(10) : 'N/A'}</td>
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
                )}
            </div>
        </div>
    );
}

export default App; 