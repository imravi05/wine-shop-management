const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// GET /api/wines
router.get('/', stockController.getAllWines);

// GET /api/wines/:id
router.get('/:id', stockController.getWineById);

// POST /api/wines
router.post('/', stockController.createWine);

// PUT /api/wines/:id
router.put('/:id', stockController.updateWine);

// DELETE /api/wines/:id
router.delete('/:id', stockController.deleteWine);

module.exports = router;