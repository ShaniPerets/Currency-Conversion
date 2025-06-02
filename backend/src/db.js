const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, 'db.json');

//reading the db.json file
function readDB() {
    return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
}

//writing to the db.json file
function writeDB(data) {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}

//getting all the currencies from the db.json file
function getCurrencies(cb) {
    const db = readDB();
    cb(null, db.currencies);
}

//getting the history conversions from the db.json file
function getHistory(cb) {
    const db = readDB();
    cb(null, db.history.slice().reverse().slice(0, 20));
}

//saving the conversions to the history
function saveToHistory(entry, cb) {
    const db = readDB();
    db.history.push({
        //creating a unique id 
        id: Date.now() + Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString(),
        ...entry
    });
    writeDB(db);
    if (cb) cb();
}

//calculating the conversion rate according to the source and target rates to dollar
function convertCurrency(amount, sourceCurrency, targetCurrency, cb) {
    const db = readDB();
    const sourceRate = db.rates[sourceCurrency];
    const targetRate = db.rates[targetCurrency];
    if (sourceRate == null || targetRate == null) {
        return cb(new Error('Currency rates not found'));
    }
    //calculating the conversion rate according the rate of the source and target currencies to dollar
    const converted = amount * (sourceRate / targetRate); // 100 ILS to EUR = 100*(0.28/1.13)=24....
    saveToHistory({
        type: 'single',
        amount,
        sourceCurrency,
        targetCurrency,
        result: { convertedAmount: converted }
    });
    cb(null, converted);
}

//calculating the conversion rate according to the source to all currencies rates 
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

//updating the rates accordding to a choosen date
function updateRates(newRates) {
    const db = readDB();
    // Only update rates for currencies present in db.currencies
    db.rates = db.currencies.reduce((newRatesArray, curr) => {
        if (curr.code === 'USD') {
            newRatesArray[curr.code] = 1; // Always set USD to 1
        } else if (newRates[curr.code]) {
            //getting the oposite rate of the currency to dollar
            newRatesArray[curr.code] = 1 / newRates[curr.code];
        }
        return newRatesArray;
    }, {});
    writeDB(db);
    return db.rates;
}

//exporting the functions
module.exports = {
    getCurrencies,
    convertCurrency,
    convertToAll,
    saveToHistory,
    getHistory,
    updateRates,
    readDB,
    writeDB
}; 