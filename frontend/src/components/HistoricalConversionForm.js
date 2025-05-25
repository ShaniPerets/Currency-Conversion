import React, { useState } from 'react';

function HistoricalConversionForm({
    amount,
    setAmount,
    sourceCurrency,
    setSourceCurrency,
    targetCurrency,
    setTargetCurrency,
    currencies,
    historicalDate,
    setHistoricalDate
}) {
    const [error, setError] = useState('');
    const [historicalResult, setHistoricalResult] = useState(null);

    //convert the currency according to the historical date has been chosen
    const historicalConversion = async (e) => {
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

    return (
        <div className="container">
            <form onSubmit={historicalConversion}>
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
    );
}

export default HistoricalConversionForm; 