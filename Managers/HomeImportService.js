// homeImportService.js

const ExcelJS = require('exceljs');
const { MongoClient } = require('mongodb');

async function importHomesFromExcel(uri, excelFilePath) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    let importedHomes = [];

    try {
        await client.connect();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelFilePath);

        const worksheet = workbook.getWorksheet(1);
        const rowCount = worksheet.rowCount;

        // Retrieve the addresses of homes in the current Excel file
        const addressesInExcel = [];
        for (let row = 2; row <= rowCount; row++) {
            addressesInExcel.push(worksheet.getCell(row, 1).value);
        }

        // Get the addresses of homes currently stored in the database
        const homesCollection = client.db().collection('homes');
        const queryResult = await homesCollection.find({}, { projection: { _id: 0, address: 1 } }).toArray();
        const addressesInDatabase = queryResult.map(row => row.address);

        // Find addresses that are in the database but not in the Excel file
        const addressesToDelete = addressesInDatabase.filter(address => !addressesInExcel.includes(address));

        // Delete homes with addresses found in addressesToDelete
        for (const address of addressesToDelete) {
            await homesCollection.deleteOne({ address: address });
        }

        // Import new homes from the Excel file
        for (let row = 2; row <= rowCount; row++) {
            const home = {
                municipality: worksheet.getCell(row, 2).value,
                address: worksheet.getCell(row, 1).value,
                price: worksheet.getCell(row, 3).value,
                squaremeters: worksheet.getCell(row, 4).value,
                constructionyear: worksheet.getCell(row, 5).value,
                energylabel: worksheet.getCell(row, 6).value,
                imageurl: worksheet.getCell(row, 7).value,
            };

            await insertHome(client, home); // Call the insertHome function directly
            importedHomes.push(home); // Add the imported home to the list
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }

    return importedHomes; // Return the list of imported homes
}

async function insertHome(client, home) {
    try {
        const homesCollection = client.db().collection('homes');

        // Check if the home already exists in the database based on the address
        const existingHome = await homesCollection.findOne({ address: home.address });

        if (existingHome) {
            // Update the existing home with the new image URL if it is not null
            if (home.imageurl) {
                const updateResult = await homesCollection.updateOne(
                    { address: home.address },
                    { $set: { imageurl: home.imageurl } }
                );

                if (updateResult.modifiedCount === 0) {
                    console.log('Failed to update existing home:', home.address);
                }
            } else {
                console.log('New home has no image URL, skipping update:', home.address);
            }
        } else {
            // Insert the home into the homes collection if it doesn't already exist
            const insertResult = await homesCollection.insertOne(home);

            if (insertResult.insertedCount > 0) {
                console.log('New home inserted into the database:', home.address);
            } else {
                console.log('Failed to insert new home into the database:', home.address);
            }
        }
    } catch (error) {
        console.error('Error inserting home into the database:', error);
    }
}


module.exports = { insertHome, importHomesFromExcel };
