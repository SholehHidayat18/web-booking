const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "bkpp",
  waitForConnections: true,
  connectionLimit: 10, // Sesuaikan dengan kebutuhan
  queueLimit: 0
});

module.exports = pool;
