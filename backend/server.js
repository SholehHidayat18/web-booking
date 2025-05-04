const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 5000;

const userRoutes = require("./routes/user.routes");
const placeRoutes = require("./routes/place.routes");

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/v1", placeRoutes);
app.use("/api/v1/users", userRoutes);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bkpp",
});

// Database connection check
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/test", (req, res) => {
  res.send("Server is running!");
});
