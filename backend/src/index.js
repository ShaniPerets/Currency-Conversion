const express = require('express');
const cors = require('cors');
const path = require('path');
const { getCurrencies, convertCurrency, convertToAll, getHistory } = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/currencies', (req, res) => {
    getCurrencies((err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
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
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 