const db = require("../config/db");

// GET all payments
// GET all payments with filtering
exports.getAllPayments = (req, res) => {
  let sql = `SELECT * FROM payments`;
  const params = [];
  
  // Check for status filter in query params
  if (req.query.status) {
    sql += ` WHERE status = ?`;
    params.push(req.query.status);
  }

  // Add sorting if needed
  if (req.query.sortBy) {
    sql += ` ORDER BY ${req.query.sortBy}`;
    if (req.query.sortOrder) {
      sql += ` ${req.query.sortOrder}`;
    }
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching payments:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch payments",
      });
    }
    res.status(200).json({
      status: "success",
      data: results,
    });
  });
};

// GET payment by ID
exports.getPaymentById = (req, res) => {
  const paymentId = req.params.id;
  const sql = `SELECT * FROM payments WHERE id = ?`;
  db.query(sql, [paymentId], (err, results) => {
    if (err) {
      console.error("Error fetching payment:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch payment",
      });
    }
    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: results[0],
    });
  });
};

// CREATE payment
exports.createPayment = async (req, res) => {
  const { booking_id, total_price } = req.body;

  if (!booking_id || !total_price) {
    return res.status(400).json({
      status: "error",
      message: "Booking ID and total price are required",
    });
  }

  try {
    // Check booking valid
    const bookingQuery = `
      SELECT b.id, b.total_price, u.user_id AS user_id 
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      WHERE b.id = ?
    `;

    const [booking] = await new Promise((resolve, reject) => {
      db.query(bookingQuery, [booking_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!booking) {
      return res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    }

    if (parseFloat(booking.total_price) !== parseFloat(total_price)) {
      return res.status(400).json({
        status: "error",
        message: "Total price does not match booking amount",
      });
    }

    // Generate QR Code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=PAYMENT-${booking_id}-${total_price}&size=150x150`;
    const createdAt = new Date();

    // Save payment
    const insertPaymentQuery = `
      INSERT INTO payments (booking_id, amount, qr_code_url, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await new Promise((resolve, reject) => {
      db.query(
        insertPaymentQuery,
        [booking_id, total_price, qrCodeUrl, "pending", createdAt],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    res.status(201).json({
      status: "success",
      message: "Payment successfully created",
      payment_id: result.insertId,
      qr_code_url: qrCodeUrl,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

// UPDATE payment status
exports.updatePaymentStatus = async (req, res) => {
  const paymentId = req.params.id;
  const { status } = req.body;

  const allowedStatus = ['pending', 'paid', 'cancelled'];

  if (!status) {
    return res.status(400).json({ status: "error", message: "Status is required" });
  }

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ status: "error", message: "Invalid status value" });
  }

  try {
    const sql = `UPDATE payments SET status = ? WHERE id = ?`;
    await new Promise((resolve, reject) => {
      db.query(sql, [status, paymentId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    res.status(200).json({ status: "success", message: "Payment status updated successfully" });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ status: "error", message: "Failed to update payment" });
  }
};


// DELETE payment
exports.deletePayment = (req, res) => {
  const paymentId = req.params.id;
  const sql = `DELETE FROM payments WHERE id = ?`;
  db.query(sql, [paymentId], (err, result) => {
    if (err) {
      console.error("Error deleting payment:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to delete payment",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Payment deleted successfully",
    });
  });
};

// GET all payments for admin dashboard
exports.getAdminPayments = (req, res) => {
  let sql = `
    SELECT p.*, b.full_name, b.email, b.phone_number 
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
  `;
  const params = [];
  
  // Add filters
  if (req.query.status) {
    sql += sql.includes('WHERE') ? ' AND' : ' WHERE';
    sql += ` p.status = ?`;
    params.push(req.query.status);
  }

  // Add date range filter
  if (req.query.startDate && req.query.endDate) {
    sql += sql.includes('WHERE') ? ' AND' : ' WHERE';
    sql += ` p.created_at BETWEEN ? AND ?`;
    params.push(req.query.startDate, req.query.endDate);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching admin payments:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch payments",
      });
    }
    res.status(200).json({
      status: "success",
      data: results,
    });
  });
};