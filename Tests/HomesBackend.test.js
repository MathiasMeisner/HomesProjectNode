/* eslint-disable */
delete require.cache[require.resolve('dotenv')];
require('dotenv').config();

const { MongoClient } = require('mongodb');
const { getAllHomes } = require('../Managers/HomesManager');
const { HomesManager } = require('../Managers/HomesManager')
const { importHomesFromExcel } = require('../Managers/HomeImportService')
const request = require('supertest');
const app = require('../server');

// Create a global client instance for database connection
let client;

beforeAll(async () => {
    // Initialize the MongoDB connection
    client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
});

afterAll(async () => {
    // Close the MongoDB connection after all tests are done
    await client.close();
});

// Test suites:

// Testing getAllHomes function from HomesManager.js
describe('HomesManager', () => {
    describe('getAllHomes', () => {
        it('should return an array of homes with at least one home', async () => {
            const homes = await getAllHomes(process.env.MONGODB_URI); // Pass MongoDB URI
            expect(Array.isArray(homes)).toBe(true);
            expect(homes.length).toBeGreaterThan(0); // Check if the array contains at least one home
        })
    })
})


// Testing GET function from HomesController.js
describe('GET /api/homes', () => {
    it('should return a list of homes', async () => {
        const response = await request(app).get('/api/homes');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
    });
});

// Testing if importHomesFromExcel is importing the homes from the Excel file
//const fs = require('fs');

//function getExcelFilePath() {
//    const ec2FilePath = '/home/ec2-user/HomesProjectNode/output_excel_file.xlsx';
//    const localFilePath = 'C:\\code\\BoligsidenWebScrape\\output_excel_file.xlsx';

//    try {
//        fs.accessSync(ec2FilePath, fs.constants.F_OK);
//        return ec2FilePath; // Return EC2 file path if it exists
//    } catch (error) {
//        return localFilePath; // Return local file path if EC2 file path doesn't exist
//    }
//}

//const excelFilePath = getExcelFilePath(); // Choose Excel file path based on environment

//describe('importHomesFromExcel', () => {
//    it('should import homes from test Excel file', async () => {
//        const importedHomes = await importHomesFromExcel(process.env.MONGODB_URI, excelFilePath);

//        // Check that the importedHomes array is not empty
//        expect(importedHomes).toBeDefined();
//        expect(Array.isArray(importedHomes)).toBe(true);
//    }, 50000); // Increase timeout to 10 seconds
//})


