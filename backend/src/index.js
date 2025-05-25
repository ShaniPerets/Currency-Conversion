const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const { getCurrencies, convertCurrency, convertToAll, getHistory, updateRates } = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/currencies', (req, res) => {
    getCurrencies((err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch currencies' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/convert', (req, res) => {
    const { amount, sourceCurrency, targetCurrency } = req.body;

    if (!amount || !sourceCurrency || !targetCurrency) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    convertCurrency(parseFloat(amount), sourceCurrency, targetCurrency, (err, convertedAmount) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            originalAmount: amount,
            convertedAmount,
            sourceCurrency,
            targetCurrency
        });
    });
});

app.post('/api/convert-all', (req, res) => {
    const { amount, sourceCurrency } = req.body;
    if (!amount || !sourceCurrency) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    convertToAll(parseFloat(amount), sourceCurrency, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            originalAmount: amount,
            sourceCurrency,
            conversions: results
        });
    });
});

app.get('/api/history', (req, res) => {
    getHistory((err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch history' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/update-rates', async (req, res) => {
    try {
        console.log('Starting rate update...');
        // Fetch latest rates from exchangerate.host
        const response = await fetch('https://api.exchangerate.host/latest?base=USD');
        const data = await response.json();

        if (!data.rates) {
            console.error('No rates received from API');
            return res.status(500).json({ error: 'Failed to fetch rates' });
        }

        console.log('Rates received from API:', Object.keys(data.rates).length, 'currencies');

        // Update rates in db.json
        const updatedRates = updateRates(data.rates);
        console.log('Rates updated in database:', Object.keys(updatedRates).length, 'currencies');

        res.json({
            success: true,
            message: 'Rates updated successfully',
            rates: updatedRates,
            timestamp: new Date().toISOString(),
            details: {
                totalCurrencies: Object.keys(updatedRates).length,
                currencies: Object.keys(updatedRates)
            }
        });
    } catch (err) {
        console.error('Error updating rates:', err);
        res.status(500).json({ error: 'Error updating rates' });
    }
});

// Historical conversion endpoint
app.post('/api/convert-historical', async (req, res) => {
    try {
        const { amount, sourceCurrency, targetCurrency, date } = req.body;

        console.log('Historical conversion request:', { amount, sourceCurrency, targetCurrency, date });

        if (!amount || !sourceCurrency || !targetCurrency || !date) {
            console.log('Missing parameters:', { amount, sourceCurrency, targetCurrency, date });
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            console.log('Invalid date format:', date);
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Fetch historical rates from Frankfurter API
        const historicalUrl = `https://api.frankfurter.app/${date}?from=${sourceCurrency}&to=${targetCurrency}`;
        console.log('Fetching from API:', historicalUrl);

        const response = await fetch(historicalUrl);
        const data = await response.json();

        console.log('API Response:', {
            amount: data.amount,
            base: data.base,
            date: data.date,
            rates: data.rates
        });

        if (!data.rates || !data.rates[targetCurrency]) {
            console.error('Conversion failed:', data);
            return res.status(500).json({
                error: 'Failed to fetch historical rates',
                details: 'Currency pair not available for the selected date'
            });
        }

        const rate = data.rates[targetCurrency];
        const convertedAmount = amount * rate;

        console.log('Conversion result:', {
            amount,
            sourceCurrency,
            targetCurrency,
            date,
            rate,
            convertedAmount
        });

        res.json({
            originalAmount: amount,
            convertedAmount,
            sourceCurrency,
            targetCurrency,
            date,
            rate
        });
    } catch (err) {
        console.error('Error in historical conversion:', err);
        res.status(500).json({
            error: 'Error performing historical conversion',
            details: err.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 