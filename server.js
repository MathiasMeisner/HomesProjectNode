'use strict';
delete require.cache[require.resolve('dotenv')];
require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const { connectionString } = require('./Models/connectionstring');
const { importHomesFromExcel } = require('./Managers/HomeImportService');

const app = express();
const port = process.env.PORT || 1337;
const excelFilePath = 'C:\\code\\BoligsidenWebScrape\\output_excel_file.xlsx';

// Middleware to set Content-Type header for JSON responses
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Import the HomesController router
const homesRouter = require('./Controllers/HomesController');

console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);

// Add CORS middleware
app.use(cors());

// Connect to the PostgreSQL database and import homes from Excel
const client = new Client({
    connectionString: connectionString,
});

client.connect()
    .then(() => {
        console.log('Connected to the PostgreSQL database');
        return importHomesFromExcel(connectionString, excelFilePath);
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    });

// Define a route handler for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the HomeNode API!');
});

// Mount the HomesController router at /api/homes
app.use('/api/homes', homesRouter);

// Start the server
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// Export the app object
module.exports = app;