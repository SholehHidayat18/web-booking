const db = require('../config/db');

exports.createBooking = async (req, res) => {
  const {
    fullName,
    phoneNumber,
    email,
    items,
    total_price,
    booking_date,
    start_date,
    end_date
  } = req.body;

  console.log("Data request:", req.body); // cek data masuk

  if (!phoneNumber) {
    return res.status(400).json({ message: "Nomor telepon wajib diisi." });
  }

  try {
    let convertedPhone = phoneNumber;
    if (phoneNumber.startsWith("08")) {
      convertedPhone = phoneNumber.replace(/^0/, "+62");
    }

    // cek user
    const [userResult] = await db.promise().query(
      "SELECT * FROM users WHERE phone_number = ? OR phone_number = ?",
      [convertedPhone, phoneNumber]
    );

    console.log("User result:", userResult); // cek hasil query

    let userId;

    if (userResult.length === 0) {
      const [insertResult] = await db.promise().query(
        "INSERT INTO users (full_name, phone_number, email) VALUES (?, ?, ?)",
        [fullName, convertedPhone, email]
      );
      console.log("Insert result ID:", insertResult.insertId); // cek id hasil insert
      userId = insertResult.insertId;
    } else {
      userId = userResult[0].user_id;
    }

    console.log("User ID yang dipakai booking:", userId); // cek id final

    if (!userId) {
      return res.status(400).json({ message: "User ID tidak ditemukan." });
    }

    const [bookingResult] = await db.promise().query(
      `INSERT INTO bookings (user_id, items, total_price, booking_date, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify(items),
        total_price,
        booking_date,
        start_date,
        end_date
      ]
    );

    res.status(201).json({
      message: "Booking berhasil",
      bookingId: bookingResult.insertId
    });

  } catch (error) {
    console.error("Gagal buat booking:", error);
    res.status(500).json({ message: "Gagal buat booking", error: error.message });
  }
};
