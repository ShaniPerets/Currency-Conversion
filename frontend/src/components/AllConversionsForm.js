import React, { useState } from 'react';

function AllConversionsForm({
    amount,
    setAmount,
    sourceCurrency,
    setSourceCurrency,
    currencies
}) {
    const [error, setError] = useState('');
    const [allConversions, setAllConversions] = useState([]);

    //convert all the currencies accordding the source currency
    const convertAll = async (e) => {
        e.preventDefault();
        setError('');
        setAllConversions([]);
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
                setTimeout(() => setAmount(''), 5000);
            } else {
                setError(data.error || 'Conversion failed');
            }
        } catch (err) {
            setError('Failed to perform conversion');
        }
    };

    return (
        <div className="convert-all-section">
            <form onSubmit={convertAll}>
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
                <button type="submit" className="convert-all-button">Convert to All</button>
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
    );
}

export default AllConversionsForm; 