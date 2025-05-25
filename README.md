
# Currency Conversion Application

A full-stack application for currency conversion 
with React frontend and Node.js backend.

## Project Structure


- `frontend/` - React frontend application
- `backend/` - Node.js backend application

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   NODE_ENV=development
   RATES_API=https://api.frankfurter.app
   ```

4. Start the server-backend:

   Using Node directly:
   ```bash
   node src/index.js
   ```

   OR using npm scripts:
   ```bash
   npm run dev    # for development with hot-reload
   npm start      # for production
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Features
- Modern React frontend with Material-UI
- Express.js backend with RESTful API
- CORS enabled for cross-origin requests
- Environment variable configuration
- Development hot-reloading 

## API Design (RESTful)
The backend exposes several endpoints for currency-related operations:

```GET /api/currencies``` List all supported currencies

```POST /api/convert``` Convert an amount from one currency to another

```POST /api/convert-all``` Convert an amount from one currency to all others

```POST /api/convert-historical``` Convert using historical exchange rates for a given date

```GET /api/history``` Retrieve past conversion history

```POST /api/update-rates``` Update exchange rates for a specific date

*Note*  
The following endpoints require an API key for the exchange rate provider:

```/api/convert-historical```

```/api/update-rates```

All endpoints accept and return data in JSON format.

## Storage Method

The data is stored primarily in JSON files for easy readability and maintainability.
Additionally, data is retrieved dynamically from external APIs as needed.
The JSON files serve as a local storage mechanism for static or semi-static data,
while API calls fetch real-time or updated information.

## User Interface
The main page includes 5 core features:

- Convert a Single Currency - 
A form where the user selects a source currency, target currency, and amount. The application returns the converted value based on rates stored in the JSON file.

- Convert to All Currencies - 
The user enters an amount and a source currency. The application displays a table showing the equivalent value of the amount in all other currencies, using the JSON file data.

- Conversion by Historical Rates -
The user selects a date, source currency, target currency, and amount. The app fetches the historical exchange rate from an API and returns the converted amount based on the selected date.

- View Conversion History - 
Displays a list of all conversions previously performed by the user. This data is retrieved from the local JSON file.

- Update Rates by Date -
Allows the user to select a date and update currency rates accordingly. The rates are fetched from an external API based on the chosen date.

## What I Would Improve/Add With More Time
✅ User Authentication – Support user accounts and private history per user

✅ Testing – Add unit and integration tests for both backend and frontend

✅ Mobile Responsiveness – Improve UI experience on smaller screens

✅ Report Section – Add ability to view, filter, and export currency conversion reports

## Tech Stack
``Frontend:`` React, CSS, Axios

``Backend:`` Node.js, Express

``API:`` Frankfurter.app for exchange rates

``Environment:`` .env config with dotenv

``Dev Tools:`` nodemon