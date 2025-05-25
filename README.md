
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