const db = require('../config/db');
const moment = require('moment');

/* =========================
   GET Semua Data Booking
========================= */
exports.getAllBookings = (req, res) => {
  const { status, place_id, date } = req.query;
  
  let sql = `
    SELECT 
      b.id, 
      b.user_id, 
      u.full_name, 
      u.email,
      u.phone_number,
      b.place_id,
      pl.place_name,
      b.items, 
      b.booking_date, 
      b.start_date, 
      b.end_date, 
      b.total_price, 
      b.created_at,
      p.status as payment_status,
      p.amount as payment_amount,
      p.qr_code_url,
      p.created_at as payment_date
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN places pl ON b.place_id = pl.id
    LEFT JOIN payments p ON b.id = p.booking_id
  `;

  const params = [];
  
  // Add filters
  if (status || place_id || date) {
    sql += ' WHERE ';
    const conditions = [];
    
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    
    if (place_id) {
      conditions.push('b.place_id = ?');
      params.push(place_id);
    }
    
    if (date) {
      conditions.push('DATE(b.start_date) = ?');
      params.push(date);
    }
    
    sql += conditions.join(' AND ');
  }

  sql += ' ORDER BY b.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch bookings',
        error: err.message 
      });
    }

    const formattedResults = results.map(booking => ({
      ...booking,
      booking_date: moment(booking.booking_date).format('YYYY-MM-DD HH:mm'),
      start_date: moment(booking.start_date).format('YYYY-MM-DD'),
      end_date: moment(booking.end_date).format('YYYY-MM-DD'),
      created_at: moment(booking.created_at).format('YYYY-MM-DD HH:mm'),
      payment_date: booking.payment_date ? moment(booking.payment_date).format('YYYY-MM-DD HH:mm') : null,
      total_price: Number(booking.total_price),
      payment: {
        status: booking.payment_status,
        amount: booking.payment_amount,
        qr_code_url: booking.qr_code_url
      }
    }));

    res.status(200).json({ 
      success: true, 
      data: formattedResults,
      count: formattedResults.length 
    });
  });
};


/* =========================
   CREATE Booking
========================= */
exports.createBooking = (req, res) => {
  const { user_id, place_id, booking_date, start_date, end_date, total_price } = req.body;

  if (!user_id || !place_id || !start_date || !end_date || !total_price) {
    return res.status(400).json({ message: 'Semua data booking wajib diisi' });
  }

  const sql = `INSERT INTO bookings (user_id, place_id, booking_date, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [user_id, place_id, booking_date, start_date, end_date, total_price], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal membuat booking', error: err });
    res.status(201).json({ message: 'Booking berhasil dibuat', bookingId: result.insertId });
  });
};

/* =========================
   DELETE Booking
========================= */
exports.deleteBooking = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM bookings WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus booking', error: err });
    res.status(200).json({ message: 'Booking berhasil dihapus' });
  });
};

/* =========================
   GET Semua Payment
========================= */
exports.getAllPayments = (req, res) => {
  const sql = `
    SELECT 
      p.id as payment_id,
      p.booking_id,
      p.amount,
      p.status,
      p.qr_code_url,
      p.created_at,
      b.user_id,
      u.full_name,
      b.place_id,
      pl.place_name,
      b.total_price
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN users u ON b.user_id = u.user_id
    JOIN places pl ON b.place_id = pl.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data payment', error: err });
    res.status(200).json(results);
  });
};

/* =========================
   CREATE Payment
========================= */
exports.createPayment = (req, res) => {
  const { booking_id, amount, status, qr_code_url } = req.body;

  if (!booking_id || !amount || !status) {
    return res.status(400).json({ message: 'booking_id, amount, dan status wajib diisi' });
  }

  const sql = `INSERT INTO payments (booking_id, amount, status, qr_code_url) VALUES (?, ?, ?, ?)`;
  db.query(sql, [booking_id, amount, status, qr_code_url || null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal menambahkan payment', error: err });
    res.status(201).json({ message: 'Payment berhasil ditambahkan', paymentId: result.insertId });
  });
};

/* =========================
   DELETE Payment
========================= */
exports.deletePayment = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM payments WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus payment', error: err });
    res.status(200).json({ message: 'Payment berhasil dihapus' });
  });
};

/* =========================
   Enhanced Payment Reports
========================= */
exports.getPaymentReports = (req, res) => {
  const { 
    status, 
    start_date, 
    end_date, 
    customer_name,
    place_id,
    sort_by = 'payment_date',
    sort_order = 'DESC',
    page = 1,
    page_size = 10
  } = req.query;

  // Base query
  let sql = `
    SELECT 
      p.id as payment_id,
      p.booking_id,
      p.amount,
      p.status,
      p.qr_code_url,
      p.created_at as payment_date,
      b.user_id,
      u.full_name as customer_name,
      u.email as customer_email,
      u.phone_number as customer_phone,
      b.place_id,
      pl.place_name,
      b.total_price,
      b.start_date,
      b.end_date
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN users u ON b.user_id = u.user_id
    JOIN places pl ON b.place_id = pl.id
  `;

  const params = [];
  const conditions = [];

  // Add filters
  if (status) {
    conditions.push('p.status = ?');
    params.push(status);
  }

  if (start_date && end_date) {
    conditions.push('DATE(p.created_at) BETWEEN ? AND ?');
    params.push(start_date, end_date);
  } else if (start_date) {
    conditions.push('DATE(p.created_at) >= ?');
    params.push(start_date);
  } else if (end_date) {
    conditions.push('DATE(p.created_at) <= ?');
    params.push(end_date);
  }

  if (customer_name) {
    conditions.push('u.full_name LIKE ?');
    params.push(`%${customer_name}%`);
  }

  if (place_id) {
    conditions.push('b.place_id = ?');
    params.push(place_id);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Add sorting
  const validSortFields = ['payment_date', 'amount', 'customer_name', 'place_name'];
  const sortField = validSortFields.includes(sort_by) ? sort_by : 'payment_date';
  sql += ` ORDER BY ${sortField} ${sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;

  // Add pagination
  const offset = (page - 1) * page_size;
  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(page_size), parseInt(offset));
  // Count query for pagination
  const countSql = `
    SELECT COUNT(*) as total 
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN users u ON b.user_id = u.user_id
    ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch payment reports',
        error: err.message 
      });
    }

    db.query(countSql, params.slice(0, -2), (countErr, countResult) => {
      if (countErr) {
        return res.status(500).json({ 
          success: false,
          message: 'Failed to fetch count',
          error: countErr.message 
        });
      }

      const formattedResults = results.map(payment => ({
        ...payment,
        payment_date: moment(payment.payment_date).format('YYYY-MM-DD HH:mm'),
        start_date: moment(payment.start_date).format('YYYY-MM-DD'),
        end_date: moment(payment.end_date).format('YYYY-MM-DD'),
        amount: Number(payment.amount),
        total_price: Number(payment.total_price)
      }));

      res.status(200).json({
        success: true,
        data: formattedResults,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          page_size: parseInt(page_size),
          total_pages: Math.ceil(countResult[0].total / page_size)
        }
      });
    });
  });
};

/* =========================
   Financial Reports by Period
========================= */
exports.getFinancialReports = (req, res) => {
  const { period = 'month', start_date, end_date } = req.query;

  let dateFormat, groupBy;
  
  switch (period) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      groupBy = 'day';
      break;
    case 'year':
      dateFormat = '%Y';
      groupBy = 'year';
      break;
    default: // month
      dateFormat = '%Y-%m';
      groupBy = 'month';
  }

  let sql = `
    SELECT 
      DATE_FORMAT(p.created_at, ?) AS period,
      SUM(p.amount) AS total_income,
      COUNT(p.id) AS transaction_count
    FROM payments p
    WHERE p.status = 'paid'
  `;

  const params = [dateFormat];

  if (start_date && end_date) {
    sql += ' AND p.created_at BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }

  sql += `
    GROUP BY period
    ORDER BY period DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch financial reports',
        error: err.message 
      });
    }

    res.status(200).json({
      success: true,
      period: groupBy,
      data: results.map(item => ({
        ...item,
        total_income: Number(item.total_income)
      }))
    });
  });
};

/* =========================
   Data Tempat, Kamar, Lapangan
========================= */
exports.getRooms = (req, res) => {
  db.query(`SELECT * FROM rooms`, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data kamar', error: err });
    res.status(200).json(results);
  });
};

exports.getBuildings = (req, res) => {
  db.query(`SELECT * FROM buildings`, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data gedung', error: err });
    res.status(200).json(results);
  });
};

exports.getFields = (req, res) => {
  db.query(`SELECT * FROM fields`, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data lapangan', error: err });
    res.status(200).json(results);
  });
};

/* =========================
   Blocked Dates
========================= */
exports.getBlockedDates = (req, res) => {
  db.query(`SELECT * FROM block_dates`, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data tanggal diblokir', error: err });
    res.status(200).json(results);
  });
};

exports.blockDates = (req, res) => {
  const { place_id, start_date, end_date, reason } = req.body;

  if (!start_date || !end_date)
    return res.status(400).json({ message: 'start_date dan end_date harus diisi' });

  if (!moment(start_date, 'YYYY-MM-DD', true).isValid() || !moment(end_date, 'YYYY-MM-DD', true).isValid())
    return res.status(400).json({ message: 'Format tanggal harus YYYY-MM-DD' });

  if (moment(start_date).isAfter(end_date))
    return res.status(400).json({ message: 'start_date harus <= end_date' });

  const sql = `INSERT INTO block_dates (place_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)`;
  db.query(sql, [place_id || null, start_date, end_date, reason || null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal menambahkan tanggal diblokir', error: err });
    res.status(201).json({ message: 'Tanggal berhasil diblokir', insertedId: result.insertId });
  });
};

exports.deleteBlockedDate = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM block_dates WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus tanggal', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Tanggal tidak ditemukan' });
    res.status(200).json({ message: 'Tanggal berhasil dihapus' });
  });
};

/* =========================
   GET Semua Users
========================= */
exports.getAllUsers = (req, res) => {
  const sql = `SELECT user_id, full_name, email, phone_number, is_verified, is_admin, created_at, updated_at FROM users ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data pengguna', error: err.message });

    const formattedResults = results.map(user => ({
      ...user,
      created_at: moment(user.created_at).format('YYYY-MM-DD HH:mm'),
      updated_at: moment(user.updated_at).format('YYYY-MM-DD HH:mm'),
      is_admin: Boolean(user.is_admin),
      is_verified: Boolean(user.is_verified)
    }));

    res.status(200).json({ success: true, data: formattedResults, count: formattedResults.length });
  });
};

/* =========================
   Update Status Admin User
========================= */
exports.updateUserAdminStatus = (req, res) => {
  const { userId } = req.params;
  const { is_admin } = req.body;

  if (typeof is_admin === 'undefined') {
    return res.status(400).json({ message: 'Parameter is_admin diperlukan' });
  }

  const sql = `UPDATE users SET is_admin = ? WHERE user_id = ?`;
  db.query(sql, [is_admin ? 1 : 0, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal memperbarui status admin', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    res.status(200).json({ message: 'Status admin berhasil diperbarui' });
  });
};
