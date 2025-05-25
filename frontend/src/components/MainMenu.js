import React from 'react';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';
import UpdateIcon from '@mui/icons-material/Update';
import TimelineIcon from '@mui/icons-material/Timeline';

function MainMenu({ setMode }) {
    return (
        <div className="container" style={{ textAlign: 'center', maxWidth: 400 }}>
            <h1>Currency Conversion</h1>
            <p>What would you like to do?</p>
            <button className="tab mainmenu-btn" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('single')}>
                <CurrencyExchangeIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Convert to a single currency
            </button>
            <button className="tab mainmenu-btn" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('all')}>
                <ListAltIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Convert to all currencies
            </button>
            <button className="tab mainmenu-btn" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('historical')}>
                <TimelineIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Convert using historical rates
            </button>
            <button className="tab mainmenu-btn" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('history')}>
                <HistoryIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                View Conversion History
            </button>
            <button className="tab mainmenu-btn" style={{ width: '100%', marginBottom: 16 }} onClick={() => setMode('updateRates')}>
                <UpdateIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Update Exchange Rates
            </button>
        </div>
    );
}

export default MainMenu; 