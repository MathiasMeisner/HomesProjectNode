'use strict';
delete require.cache[require.resolve('dotenv')];
require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { importHomesFromExcel } = require('./Managers/HomeImportService');
const { connectionString } = require('./Models/connectionstring');

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

console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Add CORS middleware
app.use(cors());

// Connect to the MongoDB database and import homes from Excel
const uri = process.env.MONGODB_URI || connectionString; // Use MongoDB URI from .env file or fallback to the one from connectionstring.js
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
    .then(() => {
        console.log('Connected to the MongoDB database');
        return importHomesFromExcel(uri, excelFilePath); // Pass the MongoDB URI instead of connectionString
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
