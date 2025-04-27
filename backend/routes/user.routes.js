const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers");

router.post("/verify-phone", userController.verifyPhone);
router.post("/check-otp", userController.checkOtp);
router.post("/register", userController.registerUser);

module.exports = router;
