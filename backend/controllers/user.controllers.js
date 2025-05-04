const db = require("../config/db");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const { createUser } = require("../utils/users");

// Temporary in-memory OTP store
let otpStore = {};

/**
 * Send OTP to phone
 */
exports.verifyPhone = (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ status: "error", message: "Phone number is required" });
  }

  const otp = otpGenerator.generate(4, { digits: true });
  otpStore[phoneNumber] = otp;
  console.log(`OTP for ${phoneNumber}: ${otp}`);

  res.json({ status: "success", message: "OTP sent successfully", otp });
};

/**
 * Verify OTP and mark user as verified
 */
exports.checkOtp = (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) {
    return res.status(400).json({ status: "error", message: "Phone number and OTP are required" });
  }

  const validOtp = otpStore[phoneNumber];
  if (!validOtp) {
    return res.status(400).json({ status: "error", message: "No OTP found for this phone number" });
  }

  if (validOtp !== otp) {
    return res.status(400).json({ status: "error", message: "Invalid OTP" });
  }

  // Update verification status in DB
  const updateSql = `UPDATE users SET is_verified = 1 WHERE phone_number = ?`;
  db.query(updateSql, [phoneNumber], (err) => {
    if (err) {
      console.error("Error updating verification status:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }

    delete otpStore[phoneNumber];
    res.json({ status: "success", message: "Phone number verified successfully" });
  });
};

/**
 * Register a new user
 */
exports.registerUser = async (req, res) => {
  const { fullname, email, phoneNumber, password } = req.body;
  if (!fullname || !email || !phoneNumber || !password) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
    await createUser({ fullname, email, phoneNumber, password });
    res.status(201).json({ status: "success", message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * Login existing user
 */
exports.loginUser = (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    return res.status(400).json({ status: "error", message: "Phone number and password are required" });
  }

  const sql = `SELECT * FROM users WHERE phone_number = ?`;
  db.query(sql, [phoneNumber], async (err, results) => {
    if (err) {
      console.error("Login query error:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ status: "error", message: "User not found" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ status: "error", message: "Invalid password" });
    }

    // Respond with user info (including is_admin)
    res.json({
      status: "success",
      message: "Login successful",
      user: {
        id: user.id,
        fullname: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        is_verified: user.is_verified,
        is_admin: user.is_admin,
      },
    });
  });
};
