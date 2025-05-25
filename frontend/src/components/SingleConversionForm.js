import React, { useState } from 'react';

function SingleConversionForm({
    amount,
    setAmount,
    sourceCurrency,
    setSourceCurrency,
    targetCurrency,
    setTargetCurrency,
    currencies
}) {
    const [error, setError] = useState('');
    const [convertedAmount, setConvertedAmount] = useState(null);

    //converting the currency according to the source and target currencies
    const convert = async (e) => {
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
                setTimeout(() => setAmount(''), 5000);
            } else {
                setError(data.error || 'Conversion failed');
            }
        } catch (err) {
            setError('Failed to perform conversion');
        }
    };

    return (
        <>
            <form onSubmit={convert}>
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
    );
}

export default SingleConversionForm; 