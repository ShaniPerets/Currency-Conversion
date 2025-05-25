import React, { useState, useEffect } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import SingleConversionForm from './components/SingleConversionForm';
import AllConversionsForm from './components/AllConversionsForm';
import HistoricalConversionForm from './components/HistoricalConversionForm';
import UpdateRatesPage from './components/UpdateRatesPage';
import HistoryTable from './components/HistoryTable';

function App() {
    const [currencies, setCurrencies] = useState([]);//all the currencies
    const [amount, setAmount] = useState(''); //the amount to convert
    const [sourceCurrency, setSourceCurrency] = useState('USD'); //the source currency
    const [targetCurrency, setTargetCurrency] = useState('EUR'); //the target currency
    const [mode, setMode] = useState(null); //the mode of the app,by the user chosen null, 'single', 'all', 'history', 'historical', 'updateRates'
    const [conversionHistory, setConversionHistory] = useState([]); //the history of conversions
    const [historicalDate, setHistoricalDate] = useState(''); //the date of the historical conversion
    const [updateRatesDate, setUpdateRatesDate] = useState(new Date().toISOString().split('T')[0]);//the date for update the rates

    //loading the currencies from the server
    useEffect(() => {
        loadCurrencies();
    }, []);

    const loadCurrencies = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/currencies');
            const data = await response.json();
            setCurrencies(data);
        } catch (err) {
            // Optionally handle error
        }
    };

    //getting the name of the currency
    function getCurrencyName(code) {
        const currency = currencies.find(c => c.code === code);
        return currency ? `${code} - ${currency.name}` : code;
    }

    // Mode of app accordding the user selection
    if (!mode) {
        return (
            <div className="App">
                <MainMenu setMode={setMode} />
            </div>
        );
    }

    // Update Rates 
    if (mode === 'updateRates') {
        return (
            <div className="App">
                <div className="container" style={{ maxWidth: 500 }}>
                    <button className="back-button" onClick={() => setMode(null)}>
                        &larr; Back
                    </button>
                    <h1>Update Exchange Rates</h1>
                    <UpdateRatesPage
                        updateRatesDate={updateRatesDate}
                        setUpdateRatesDate={setUpdateRatesDate}
                        currencies={currencies}
                    />
                </div>
            </div>
        );
    }

    // historical conversion mode
    if (mode === 'historical') {
        return (
            <div className="App">
                <div className="container">
                    <button className="back-button" onClick={() => setMode(null)}>
                        &larr; Back
                    </button>
                    <h1>Historical Currency Conversion</h1>
                    <HistoricalConversionForm
                        amount={amount}
                        setAmount={setAmount}
                        sourceCurrency={sourceCurrency}
                        setSourceCurrency={setSourceCurrency}
                        targetCurrency={targetCurrency}
                        setTargetCurrency={setTargetCurrency}
                        currencies={currencies}
                        historicalDate={historicalDate}
                        setHistoricalDate={setHistoricalDate}
                    />
                </div>
            </div>
        );
    }

    //single conversion mode
    if (mode === 'single') {
        return (
            <div className="App">
                <div className="container">
                    <button className="back-button" onClick={() => setMode(null)}>
                        &larr; Back
                    </button>
                    <h1>Currency Conversion</h1>
                    <SingleConversionForm
                        amount={amount}
                        setAmount={setAmount}
                        sourceCurrency={sourceCurrency}
                        setSourceCurrency={setSourceCurrency}
                        targetCurrency={targetCurrency}
                        setTargetCurrency={setTargetCurrency}
                        currencies={currencies}
                    />
                </div>
            </div>
        );
    }

    //all conversion mode
    if (mode === 'all') {
        return (
            <div className="App">
                <div className="container">
                    <button className="back-button" onClick={() => setMode(null)}>
                        &larr; Back
                    </button>
                    <h1>Currency Conversion</h1>
                    <AllConversionsForm
                        amount={amount}
                        setAmount={setAmount}
                        sourceCurrency={sourceCurrency}
                        setSourceCurrency={setSourceCurrency}
                        currencies={currencies}
                    />
                </div>
            </div>
        );
    }

    //history conversion mode
    if (mode === 'history') {
        return (
            <div className="App">
                <div className="container">
                    <button className="back-button" onClick={() => setMode(null)}>
                        &larr; Back
                    </button>
                    <HistoryTable
                        getCurrencyName={getCurrencyName}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="App">
            <div className="container">
                <button className="back-button" onClick={() => { setMode(null); }}>
                    &larr; Back
                </button>
                <h1>Currency Conversion</h1>
                {mode === 'history' && (
                    <div className="history-section">
                        <h2>Conversion History</h2>
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
                                {conversionHistory.map((item) => (
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
                                                <span>{typeof item.result.convertedAmount === 'number' ? item.result.convertedAmount.toFixed(20) : 'N/A'}</span>
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
                        {conversionHistory.length === 0 && <div style={{ marginTop: '1rem' }}>No history yet.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App; 