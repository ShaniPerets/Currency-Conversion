import React, { useState } from 'react';

function UpdateRatesPage({
    updateRatesDate,
    setUpdateRatesDate,
    currencies
}) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [updateRatesResult, setUpdateRatesResult] = useState(null);

    const updateRates = async () => {
        // Validate date before sending request
        if (!updateRatesDate) {
            setError('Please select a date');
            return;
        }
        // Check date format fits the format YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(updateRatesDate)) {
            setError('Invalid date format. Please enter a date in YYYY-MM-DD format');
            return;
        }
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
                setUpdateRatesResult(data.rates);
            } else {
                setError(data.error || 'Failed to update rates');
            }
        } catch (err) {
            setError('Failed to update rates');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: 500 }}>
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
                className="update-rates-button"
                onClick={updateRates}
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
    );
}

export default UpdateRatesPage; 