const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files dari public/uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Koneksi ke database MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bkpp",
});

// Cek koneksi database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

// API Prefix
const apiPrefix = "/api/v1";

// Endpoint GET places
app.get(`${apiPrefix}/places`, (req, res) => {
  db.query("SELECT * FROM places", (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ status: "error", message: err.message });
    res.json({ status: "success", data: result });
  });
});

// Server listen
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
