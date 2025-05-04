const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers");

// OTP endpoints
router.post("/verify-phone", userController.verifyPhone);
router.post("/check-otp", userController.checkOtp);

// Authentication & User Management
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

module.exports = router;

