const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const { getCurrencies, convertCurrency, convertToAll, getHistory, readDB, writeDB } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const exchangeRatesUrl = process.env.RATES_API || 'https://api.frankfurter.app';
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
        const historicalUrl = `${exchangeRatesUrl}/${date}?from=${sourceCurrency}&to=${targetCurrency}`;
        console.log('Fetching from API:', historicalUrl);

        const apiKey = process.env.CURRENCY_API_KEY;
        const fetchOptions = apiKey ? { headers: { 'Authorization': `Bearer ${apiKey}` } } : {};
        const response = await fetch(historicalUrl, fetchOptions);
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

app.post('/api/update-rates', async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        console.log(`Starting rate update for ${date}...`);

        // Get current database state
        const db = readDB();
        const ourCurrencies = db.currencies.map(c => c.code);

        // Fetch rates from Frankfurter API for the specified date
        const apiKey = process.env.CURRENCY_API_KEY;
        const updateRatesUrl = `${exchangeRatesUrl}/${date}?from=USD`;
        const fetchOptions = apiKey ? { headers: { 'Authorization': `Bearer ${apiKey}` } } : {};
        const updateRatesResponse = await fetch(updateRatesUrl, fetchOptions);
        const data = await updateRatesResponse.json();

        if (!data.rates) {
            console.error('No rates received from API');
            return res.status(500).json({ error: 'Failed to fetch rates' });
        }

        // Filter rates to only include currencies we have in our database and invert them
        const filteredRates = {};

        // Always add USD first
        filteredRates['USD'] = 1;

        // Then add other currencies
        ourCurrencies.forEach(currency => {
            if (currency === 'USD') return;
            if (data.rates[currency]) {
                // Invert the rate: if 1 USD = X currency, then 1 currency = 1/X USD
                filteredRates[currency] = 1 / data.rates[currency];
            } else if (db.rates && db.rates[currency]) {
                // Fallback to last known rate if API does not provide it
                filteredRates[currency] = db.rates[currency];
                console.warn(`No rate for ${currency} from API, using last known rate: ${db.rates[currency]}`);
            } else {
                // If no previous rate, skip (will be undefined)
                console.warn(`No rate for ${currency} from API and no previous rate available.`);
            }
        });

        // Update rates in db.json
        db.rates = filteredRates;
        writeDB(db);

        // Print updated rates
        console.log(`\nUpdated exchange rates for ${date} (USD value per unit):`);
        console.log('----------------------------------------');
        Object.entries(filteredRates).forEach(([currency, rate]) => {
            const currencyInfo = db.currencies.find(c => c.code === currency);
            console.log(`${currency} (${currencyInfo.name}): ${rate.toFixed(4)} USD`);
        });
        console.log('----------------------------------------\n');

        res.json({
            success: true,
            message: `Rates updated successfully to ${date}`,
            rates: filteredRates,
            timestamp: new Date().toISOString(),
            date: date,
            details: {
                totalCurrencies: Object.keys(filteredRates).length,
                currencies: Object.keys(filteredRates)
            }
        });
    } catch (err) {
        console.error('Error updating rates:', err);
        res.status(500).json({ error: 'Error updating rates' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});