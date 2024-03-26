'use strict';
delete require.cache[require.resolve('dotenv')];
require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { importHomesFromExcel } = require('./Managers/HomeImportService');
const { connectionString } = require('./Models/connectionstring');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 1337;

// Function to choose the appropriate Excel file path
function getExcelFilePath() {
    const ec2FilePath = '/home/ec2-user/HomesProjectNode/output_excel_file.xlsx';
    const localFilePath = 'C:\\code\\BoligsidenWebScrape\\BoligsidenWebScrape\\spiders\\output_excel_file.xlsx';

    try {
        fs.accessSync(ec2FilePath, fs.constants.F_OK);
        return ec2FilePath; // Return EC2 file path if it exists
    } catch (error) {
        return localFilePath; // Return local file path if EC2 file path doesn't exist
    }
}

const excelFilePath = getExcelFilePath(); // Choose Excel file path based on environment

// Middleware to set Content-Type header for HTML responses
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html');
    next();
});

// Middleware to set Content-Type header for CSS responses
app.use('/css', (req, res, next) => {
    res.setHeader('Content-Type', 'text/css');
    next();
}, express.static('Frontend/css'));

// Serve JavaScript files from the 'js' directory
app.use('/js', (req, res, next) => {
    res.setHeader('Content-Type', 'text/javascript');
    next();
}, express.static('Frontend/js'));

// Serve HTML files from the 'html' directory
app.use('/html', express.static('Frontend/html'));

// Serve CSS files from the 'css' directory
app.use('/css', express.static('Frontend/css'));

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
        return importHomesFromExcel(uri, excelFilePath); // Pass the MongoDB URI and Excel file path
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
        process.exit(1);
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
