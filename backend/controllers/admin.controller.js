const db = require('../config/db');
const moment = require('moment');

// Get semua data pemesanan
exports.getAllBookings = (req, res) => {
  const sql = `
    SELECT 
      b.id, 
      b.user_id, 
      u.full_name, 
      u.email,
      u.phone_number,
      b.items, 
      b.booking_date, 
      b.start_date, 
      b.end_date, 
      b.total_price, 
      b.created_at,
      p.status as payment_status,
      p.amount as payment_amount,
      p.qr_code_url
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    LEFT JOIN payments p ON b.id = p.booking_id
    ORDER BY b.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Gagal mengambil data pemesanan',
        error: err.message 
      });
    }

    // Format data untuk frontend
    const formattedResults = results.map(booking => ({
      ...booking,
      booking_date: moment(booking.booking_date).format('YYYY-MM-DD HH:mm'),
      start_date: moment(booking.start_date).format('YYYY-MM-DD'),
      end_date: moment(booking.end_date).format('YYYY-MM-DD'),
      created_at: moment(booking.created_at).format('YYYY-MM-DD HH:mm'),
      total_price: Number(booking.total_price),
      payment: {
        status: booking.payment_status,
        amount: booking.payment_amount,
        qr_code_url: booking.qr_code_url
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedResults
    });
  });
};

// Tambah data booking
exports.createBooking = (req, res) => {
  const { user_id, place_id, booking_date, start_date, end_date, total_price } = req.body;
  const sql = `INSERT INTO bookings (user_id, place_id, booking_date, start_date, end_date, total_price) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [user_id, place_id, booking_date, start_date, end_date, total_price], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal membuat booking', error: err });
    res.status(201).json({ message: 'Booking berhasil dibuat', bookingId: result.insertId });
  });
};

// Hapus booking
exports.deleteBooking = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM bookings WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus booking', error: err });
    res.status(200).json({ message: 'Booking berhasil dihapus' });
  });
};

// Get semua data pembayaran
exports.getAllPayments = (req, res) => {
  const sql = `
  SELECT 
    b.id, b.user_id, b.place_id, u.full_name, pl.place_name, b.items, b.booking_date, b.start_date, b.end_date, b.total_price, b.created_at
  FROM bookings b
  JOIN users u ON b.user_id = u.user_id
  JOIN places pl ON b.place_id = pl.id
`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data payment', error: err });
    res.status(200).json(results);
  });
};

// Tambah payment
exports.createPayment = (req, res) => {
  const { booking_id, amount, status, qr_code_url } = req.body;
  const sql = `INSERT INTO payments (booking_id, amount, status, qr_code_url) VALUES (?, ?, ?, ?)`;
  db.query(sql, [booking_id, amount, status, qr_code_url], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal menambahkan payment', error: err });
    res.status(201).json({ message: 'Payment berhasil ditambahkan', paymentId: result.insertId });
  });
};

// Hapus payment
exports.deletePayment = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM payments WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus payment', error: err });
    res.status(200).json({ message: 'Payment berhasil dihapus' });
  });
};

// Get laporan keuangan
exports.getFinancialReports = (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(b.booking_date, '%Y-%m') AS month, 
      SUM(p.amount) AS total_income
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    WHERE p.status = 'paid'
    GROUP BY month
    ORDER BY month DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil laporan keuangan', error: err });
    res.status(200).json(results);
  });
};

// Get data kamar
exports.getRooms = (req, res) => {
  const sql = `SELECT * FROM rooms`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data kamar', error: err });
    res.status(200).json(results);
  });
};

// Get data gedung
exports.getBuildings = (req, res) => {
  const sql = `SELECT * FROM buildings`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data gedung', error: err });
    res.status(200).json(results);
  });
};

// Get data lapangan
exports.getFields = (req, res) => {
  const sql = `SELECT * FROM fields`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data lapangan', error: err });
    res.status(200).json(results);
  });
};

exports.getBlockedDates = (req, res) => {
  const sql = `SELECT * FROM block_dates`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data tanggal diblokir', error: err });
    res.status(200).json(results);
  });
};

// Tambah rentang tanggal yang diblokir
exports.blockDates = (req, res) => {
  const { place_id, start_date, end_date, reason } = req.body;

  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'start_date dan end_date harus diisi' });
  }

  // Validasi format tanggal (optional)
  if (!moment(start_date, 'YYYY-MM-DD', true).isValid() || !moment(end_date, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ message: 'Format tanggal harus YYYY-MM-DD' });
  }

  // Pastikan start_date <= end_date
  if (moment(start_date).isAfter(end_date)) {
    return res.status(400).json({ message: 'start_date harus sebelum atau sama dengan end_date' });
  }

  const sql = `INSERT INTO block_dates (place_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)`;

  db.query(sql, [place_id || null, start_date, end_date, reason || null], (err, result) => {
    if (err) {
      console.error('Error inserting blocked dates:', err);
      return res.status(500).json({ message: 'Gagal menambahkan tanggal diblokir', error: err });
    }

    res.status(201).json({ 
      message: 'Tanggal berhasil diblokir', 
      insertedId: result.insertId,
      start_date,
      end_date,
      reason
    });
  });
};

exports.deleteBlockedDate = (req, res) => {
  const { id } = req.params;  // hapus berdasarkan id, bukan berdasarkan date
  const sql = `DELETE FROM block_dates WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus tanggal', error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tanggal tidak ditemukan' });
    }

    res.status(200).json({ message: 'Tanggal berhasil dihapus' });
  });
};

// Get all users data
exports.getAllUsers = (req, res) => {
  const sql = `
    SELECT 
      user_id,
      full_name,
      email,
      phone_number,
      is_verified,
      is_admin,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Gagal mengambil data pengguna',
        error: err.message 
      });
    }

    // Format dates for better readability
    const formattedResults = results.map(user => ({
      ...user,
      created_at: moment(user.created_at).format('YYYY-MM-DD HH:mm'),
      updated_at: moment(user.updated_at).format('YYYY-MM-DD HH:mm'),
      is_admin: Boolean(user.is_admin), // Convert to boolean
      is_verified: Boolean(user.is_verified) // Convert to boolean
    }));

    res.status(200).json({
      success: true,
      data: formattedResults,
      count: formattedResults.length
    });
  });
};

// Update user admin status
exports.updateUserAdminStatus = (req, res) => {
  const { userId } = req.params;
  const { is_admin } = req.body;

  if (typeof is_admin === 'undefined') {
    return res.status(400).json({ 
      success: false,
      message: 'Parameter is_admin diperlukan' 
    });
  }

  const sql = `UPDATE users SET is_admin = ? WHERE user_id = ?`;
  db.query(sql, [is_admin ? 1 : 0, userId], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Gagal memperbarui status admin',
        error: err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Pengguna tidak ditemukan' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status admin berhasil diperbarui'
    });
  });
};