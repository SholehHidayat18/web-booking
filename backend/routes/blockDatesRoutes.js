const express = require('express');
const router = express.Router();
const blockDatesController = require('../controllers/blockDatesController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes in this router
router.use(authMiddleware.authenticateAdmin); // Changed from protect to authenticateAdmin

// POST /api/v1/blockdates
router.post('/', blockDatesController.createBlockDate);

// GET /api/v1/blockdates
router.get('/', blockDatesController.getBlockDates);

// DELETE /api/v1/blockdates/:id
router.delete('/:id', blockDatesController.deleteBlockDate);

module.exports = router;