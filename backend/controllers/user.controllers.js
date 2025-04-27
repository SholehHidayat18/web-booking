const db = require("../config/db");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");

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

  res.json({ status: "success", message: "OTP sent successfully" });
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

  // Update is_verified di database
  const updateQuery = `UPDATE users SET is_verified = 1 WHERE phone_number = ?`;
  db.query(updateQuery, [phoneNumber], (err, result) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }

    // Hapus OTP setelah berhasil verifikasi
    delete otpStore[phoneNumber];

    res.json({ status: "success", message: "Phone number verified successfully" });
  });
};

// Register user
exports.registerUser = (req, res) => {
  const { fullname, email, phoneNumber, password } = req.body;

  if (!fullname || !email || !phoneNumber || !password) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const query = `INSERT INTO users (full_name, email, phone_number, password_hash) VALUES (?, ?, ?, ?)`;

  db.query(query, [fullname, email, phoneNumber, passwordHash], (err, result) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }

    res.json({ status: "success", message: "User registered successfully" });
  });
};
