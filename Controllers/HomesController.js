const express = require('express');
const router = express.Router();
const { getHomes } = require('../Managers/HomesManager');

// GET: /api/homes
router.get('/', async (req, res) => {
    try {
        const homes = await getHomes();
        res.json(homes);
    } catch (error) {
        console.error('Error fetching homes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
