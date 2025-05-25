const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function getCurrencies(cb) {
    const db = readDB();
    cb(null, db.currencies);
}

function getHistory(cb) {
    const db = readDB();
    cb(null, db.history.slice().reverse().slice(0, 50));
}

function saveToHistory(entry, cb) {
    const db = readDB();
    db.history.push({
        id: Date.now() + Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        ...entry
    });
    writeDB(db);
    if (cb) cb();
}

function convertCurrency(amount, sourceCurrency, targetCurrency, cb) {
    const db = readDB();
    const sourceRate = db.rates[sourceCurrency];
    const targetRate = db.rates[targetCurrency];
    if (sourceRate == null || targetRate == null) {
        return cb(new Error('Currency rates not found'));
    }
    const converted = amount * (sourceRate / targetRate);
    saveToHistory({
        type: 'single',
        amount,
        sourceCurrency,
        targetCurrency,
        result: { convertedAmount: converted }
    });
    cb(null, converted);
}

function convertToAll(amount, sourceCurrency, cb) {
    const db = readDB();
    const sourceRate = db.rates[sourceCurrency];
    if (sourceRate == null) {
        return cb(new Error('Source currency rate not found'));
    }
    const results = db.currencies
        .filter(c => c.code !== sourceCurrency)
        .map(c => ({
            targetCurrency: c.code,
            targetName: c.name,
            convertedAmount: amount * (sourceRate / db.rates[c.code])
        }));
    saveToHistory({
        type: 'all',
        amount,
        sourceCurrency,
        targetCurrency: null,
        result: results
    });
    cb(null, results);
}

module.exports = {
    getCurrencies,
    convertCurrency,
    convertToAll,
    saveToHistory,
    getHistory
}; 