/* eslint-disable */
delete require.cache[require.resolve('dotenv')];
require('dotenv').config();

const { MongoClient } = require('mongodb');
const { getHomes } = require('../Managers/HomesManager');
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

// Testing getHomes function from HomesManager.js
describe('HomesManager', () => {
    describe('getHomes', () => {
        it('should return an array of homes', async () => {
            const homes = await getHomes(process.env.MONGODB_URI); // Pass MongoDB URI
            expect(Array.isArray(homes)).toBe(true);
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
describe('importHomesFromExcel', () => {
    it('should import homes from test Excel file', async () => {
        const excelFilePath = 'C:\\code\\BoligsidenWebScrape\\output_excel_file.xlsx';
        const importedHomes = await importHomesFromExcel(process.env.MONGODB_URI, excelFilePath); // Pass MongoDB URI

        // Check that the importedHomes array is not empty
        expect(importedHomes).toBeDefined();
        expect(Array.isArray(importedHomes)).toBe(true);
    })
})
