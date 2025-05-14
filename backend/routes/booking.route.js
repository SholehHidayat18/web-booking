const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// POST booking baru
router.post('/', bookingController.createBooking);

module.exports = router;
