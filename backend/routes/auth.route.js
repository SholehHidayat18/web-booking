const express = require('express');
const router = express.Router();
const { verifyUser } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

router.get('/verify', authenticateUser, verifyUser);

module.exports = router;