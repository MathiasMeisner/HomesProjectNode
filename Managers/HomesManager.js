// HomesManager.js

const { MongoClient } = require('mongodb');

class HomesManager {
    constructor(uri) {
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    async getAllHomes() {
        try {
            await this.client.connect();
            const homesCollection = this.client.db().collection('homes');
            const homes = await homesCollection.find({}).toArray();
            return homes;
        } catch (error) {
            console.error('Error fetching homes:', error);
            return [];
        } finally {
            await this.client.close();
        }
    }
}

// Exporting the getAllHomes function separately
async function getAllHomes(uri) {
    const manager = new HomesManager(uri);
    return await manager.getAllHomes();
}

module.exports = { HomesManager, getAllHomes };

