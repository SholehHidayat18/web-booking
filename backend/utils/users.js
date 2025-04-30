const bcrypt = require("bcrypt");
const connection = require("../config/db");

// Fungsi untuk insert user baru ke database
const createUser = ({ fullname, email, phoneNumber, password, is_verified = 0 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validasi data dasar
      if (!fullname || !email || !phoneNumber || !password) {
        return reject(new Error("Semua field wajib diisi"));
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // SQL Query
      const query = `
        INSERT INTO users (full_name, email, phone_number, password_hash, is_verified)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [fullname, email, phoneNumber, password_hash, is_verified];

      // Eksekusi query
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error("Database Query Error:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      console.error("Create User Error:", error);
      reject(error);
    }
  });
};

module.exports = { createUser };
