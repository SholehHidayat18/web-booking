const db = require("../config/db");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const { createUser } = require("../utils/users");

// Simpan OTP sementara di memory
let otpStore = {};

// Kirim OTP ke user
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

// Verifikasi OTP
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

  const updateQuery = `UPDATE users SET is_verified = 1 WHERE phone_number = ?`;
  db.query(updateQuery, [phoneNumber], (err, result) => {
    if (err) {
      console.error("Error updating verification status:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }

    delete otpStore[phoneNumber];

    res.json({ status: "success", message: "Phone number verified successfully" });
  });
};

// Register user
exports.registerUser = async (req, res) => {
  const { fullname, email, phoneNumber, password } = req.body;

  if (!fullname || !email || !phoneNumber || !password) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
    await createUser({ fullname, email, phoneNumber, password });
    res.status(201).json({ status: "success", message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Login user
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password are required" });
  }

  const findUserQuery = `SELECT * FROM users WHERE email = ?`;
  db.query(findUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error querying user:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    // Generate token kalau perlu
    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET || "secretkey");

    res.json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        is_verified: user.is_verified,
        is_admin: user.is_admin  // <<< ini bagian yang dipakai frontend buat route/redirect nanti
      }
    });
  });
};
