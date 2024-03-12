const { Pool } = require('pg');
const { connectionString } = require('../Models/connectionstring');

const pool = new Pool({
    connectionString: connectionString,
});

async function getHomes() {
    let client;
    try {
        client = await pool.connect();
        const query = 'SELECT * FROM homes ORDER BY id';
        const result = await client.query(query);
        return result.rows; // Return fetched homes
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

module.exports = { getHomes };