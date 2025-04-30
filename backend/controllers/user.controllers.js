const db = require("../config/db");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
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

  res.json({ status: "success", message: "OTP sent successfully", otp }); // ← kalau buat testing bisa kirim otp ke frontend juga, production tinggal hapus
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
      console.error("Error saat insert ke database:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }

    // Hapus OTP setelah verifikasi berhasil
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
