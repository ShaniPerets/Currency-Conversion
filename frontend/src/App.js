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
            console.error('Failed to load currencies:', err);
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
                
            </div>
        </div>
    );
}

export default App; 