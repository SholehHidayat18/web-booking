const axios = require('axios');
const db = require('../config/db');

exports.createPayment = async (req, res) => {
  const { booking_id, total_price } = req.body;

  if (!booking_id || !total_price) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  try {
    // Simulasi QR code URL tanpa request API eksternal
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=PAYMENT-${booking_id}-${total_price}&size=150x150`;

    // Simpan payment ke database
    const sql = `
      INSERT INTO payments (booking_id, amount, qr_code_url, status)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [booking_id, total_price, qrCodeUrl, 'pending'], (err, result) => {
      if (err) {
        console.error('Error simpan payment:', err);
        return res.status(500).json({ message: 'Gagal menyimpan payment' });
      }

      res.status(201).json({
        message: 'Payment berhasil dibuat',
        payment_id: result.insertId,
        qr_code_url: qrCodeUrl
      });
    });

  } catch (error) {
    console.error('Error generate QRIS:', error.message);
    res.status(500).json({ message: 'Gagal generate QRIS' });
  }
};
