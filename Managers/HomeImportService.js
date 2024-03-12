// homeImportService.js

const ExcelJS = require('exceljs');
const { Client } = require('pg');

async function importHomesFromExcel(connectionString, excelFilePath) {
    const client = new Client({
        connectionString: connectionString,
    });

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
        const queryResult = await client.query('SELECT address FROM homes');
        const addressesInDatabase = queryResult.rows.map(row => row.address);

        // Find addresses that are in the database but not in the Excel file
        const addressesToDelete = addressesInDatabase.filter(address => !addressesInExcel.includes(address));

        // Delete homes with addresses found in addressesToDelete
        for (const address of addressesToDelete) {
            await client.query('DELETE FROM homes WHERE address = $1', [address]);
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

            await insertHome(connectionString, home); // Call the insertHome function directly
            importedHomes.push(home); // Add the imported home to the list
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }

    return importedHomes; // Return the list of imported homes
}

async function insertHome(connectionString, home) {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();

        // Check if the home already exists in the database based on the address
        const commandText = `
        SELECT *
        FROM homes
        WHERE Address = $1
    `;
        const values = [home.address];
        const { rows } = await client.query(commandText, values);

        if (rows.length > 0) {
            // Update the existing home with the new image URL if it is not null
            const existingHome = rows[0];
            if (home.imageurl) {
                existingHome.imageurl = home.imageurl;
                const updateCommandText = `
                UPDATE homes
                SET ImageUrl = $1
                WHERE id = $2
            `;
                const updateValues = [home.imageurl, existingHome.id];
                const { rowCount } = await client.query(updateCommandText, updateValues);

                if (rowCount === 0) {
                    console.log('Failed to update existing home.');
                }
            } else {
                console.log('New home has no image URL, skipping update.');
            }
        } else {
            // Insert the home into the homes table if it doesn't already exist
            const insertCommandText = `
            INSERT INTO homes (Municipality, Address, Price, SquareMeters, ConstructionYear, EnergyLabel, ImageUrl)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
            const insertValues = [
                home.municipality,
                home.address,
                home.price,
                home.squaremeters,
                home.constructionyear,
                home.energylabel,
                home.imageurl || null,
            ];
            const { rowCount } = await client.query(insertCommandText, insertValues);

            if (rowCount > 0) {
                console.log('New home inserted into the database.');
            } else {
                console.log('Failed to insert new home into the database.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

module.exports = { insertHome, importHomesFromExcel };