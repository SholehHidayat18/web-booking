require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 5000;

const userRoutes = require("./routes/user.routes");
const placeRoutes = require("./routes/place.routes");

const bookingRoutes = require('./routes/booking.route');
const paymentRoutes = require('./routes/payment.route');
const adminRoutes = require('./routes/admin.routes');
const blockDatesRoutes = require('./routes/blockDatesRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/v1", placeRoutes);
app.use("/api/v1/users", userRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/block-dates', blockDatesRoutes);

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
  
  // Handle database constraint errors
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ 
      status: "error",
      message: "Invalid reference ID" 
    });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      status: "error",
      message: "Duplicate entry" 
    });
  }

  res.status(500).json({ 
    status: "error",
    message: "Internal Server Error" 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/test", (req, res) => {
  res.send("Server is running!");
});
