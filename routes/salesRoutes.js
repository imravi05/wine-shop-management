const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// GET /api/sales
router.get('/', salesController.getAllSales);

// POST /api/sales
router.post('/', salesController.createSale);

// DELETE /api/sales/:id
router.delete('/:id', salesController.deleteSale);

// Note: A PUT (update) for a sale is complex (restore old stock, reduce new?)
// We'll leave it out for now, as the frontend only has delete.

module.exports = router;