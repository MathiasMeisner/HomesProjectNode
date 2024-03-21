// HomesController.js

const express = require('express');
const { HomesManager } = require('../Managers/HomesManager');

const router = express.Router();
const homesManager = new HomesManager(process.env.MONGODB_URI);

router.get('/', async (req, res) => {
    try {
        const homes = await homesManager.getAllHomes();
        res.json(homes);
    } catch (error) {
        console.error('Error fetching homes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
