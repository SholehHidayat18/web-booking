const db = require('../config/db');

// Fungsi helper untuk rollback dan response error
function rollback(connection, res, err, customResponse) {
  connection.rollback(() => {
    connection.release();
    
    if (customResponse) {
      return res.status(customResponse.status || 500).json({
        success: customResponse.success,
        message: customResponse.message
      });
    }

    const errorMessage = err 
      ? (process.env.NODE_ENV === 'development' ? err.message : "Terjadi kesalahan sistem")
      : "Terjadi kesalahan sistem";

    console.error("Database error:", err || "Unknown error");
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  });
}

exports.createBooking = (req, res) => {
  const {
    user_id,
    fullName,
    phoneNumber,
    email,
    items = [],
    total_price,
    booking_date,
    start_date,
    end_date,
    place_id
  } = req.body;

  if (!phoneNumber || !place_id || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Nomor telepon, tempat, dan tanggal booking wajib diisi."
    });
  }

  const convertedPhone = phoneNumber.startsWith("08")
    ? phoneNumber.replace(/^0/, "+62")
    : phoneNumber;

  const bookingStart = new Date(start_date).toISOString().split('T')[0];
  const bookingEnd = new Date(end_date).toISOString().split('T')[0];

  db.getConnection((connErr, connection) => {
    if (connErr) return res.status(500).json({ success: false, message: "Kesalahan koneksi database" });

    connection.beginTransaction((beginErr) => {
      if (beginErr) {
        connection.release();
        return res.status(500).json({ success: false, message: "Gagal memulai transaksi" });
      }

      const handleUser = (callback) => {
        if (user_id) {
          // Kalau user_id dikirim, cek datanya cocok
          connection.query(
            `SELECT user_id, full_name, phone_number, email FROM users WHERE user_id = ?`,
            [user_id],
            (err, result) => {
              if (err) return rollback(connection, res, err);
              if (result.length === 0) {
                return rollback(connection, res, null, {
                  success: false,
                  message: "User tidak ditemukan",
                  status: 404
                });
              }

              const user = result[0];
              if (user.full_name !== fullName || user.phone_number !== convertedPhone || (email && user.email !== email)) {
                return rollback(connection, res, null, {
                  success: false,
                  message: "Data user tidak sesuai",
                  status: 400
                });
              }

              callback(user_id);
            }
          );
        } else {
          // Kalau tanpa user_id, cek no hp dulu — kalau ada ambil user_id-nya, kalau belum buat guest user
          connection.query(
            `SELECT user_id FROM users WHERE phone_number IN (?, ?) LIMIT 1`,
            [convertedPhone, phoneNumber],
            (err, result) => {
              if (err) return rollback(connection, res, err);

              if (result.length > 0) {
                return callback(result[0].user_id);
              }

              connection.query(
                `INSERT INTO users (full_name, phone_number, email, is_guest) VALUES (?, ?, ?, TRUE)`,
                [fullName, convertedPhone, email],
                (err, insertResult) => {
                  if (err) return rollback(connection, res, err);
                  callback(insertResult.insertId);
                }
              );
            }
          );
        }
      };

      handleUser((validUserId) => {
        connection.query(
          `SELECT id, place_name, place_type, parent_id FROM places WHERE id = ?`,
          [place_id],
          (err, places) => {
            if (err) return rollback(connection, res, err);
            if (places.length === 0) {
              return rollback(connection, res, null, {
                success: false,
                message: "Tempat tidak ditemukan",
                status: 404
              });
            }

            const place = places[0];
            const placeIdsToCheck = new Set([place.id]);
            let relatedPlacesMessage = '';

            const checkAvailability = () => {
              connection.query(
                `SELECT reason FROM block_dates WHERE place_id IN (?) AND 
                  (
                    (start_date <= ? AND end_date >= ?) OR
                    (start_date <= ? AND end_date >= ?) OR
                    (start_date >= ? AND end_date <= ?)
                  )`,
                [
                  Array.from(placeIdsToCheck),
                  bookingEnd, bookingStart,
                  bookingEnd, bookingEnd,
                  bookingStart, bookingEnd
                ],
                (err, blocked) => {
                  if (err) return rollback(connection, res, err);

                  if (blocked.length > 0) {
                    return rollback(connection, res, null, {
                      success: false,
                      message: `Tempat diblokir (${blocked[0].reason})`,
                      status: 400
                    });
                  }

                  connection.query(
                    `SELECT b.id FROM bookings b
                     JOIN places p ON b.place_id = p.id
                     LEFT JOIN payments pay ON pay.booking_id = b.id
                     WHERE b.place_id IN (?) AND 
                     (pay.status IS NULL OR pay.status NOT IN ('cancelled', 'rejected')) AND
                     (
                      (b.start_date <= ? AND b.end_date >= ?) OR
                      (b.start_date <= ? AND b.end_date >= ?) OR
                      (b.start_date >= ? AND b.end_date <= ?)
                     )`,
                    [
                      Array.from(placeIdsToCheck),
                      end_date, start_date,
                      end_date, end_date,
                      start_date, end_date
                    ],
                    (err, existing) => {
                      if (err) return rollback(connection, res, err);

                      if (existing.length > 0) {
                        return rollback(connection, res, null, {
                          success: false,
                          message: `Sudah ada booking aktif di tempat ini.`,
                          status: 400
                        });
                      }

                      // Insert booking baru
                      connection.query(
                        `INSERT INTO bookings 
                        (user_id, place_id, items, total_price, booking_date, start_date, end_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                          validUserId,
                          place_id,
                          JSON.stringify(items),
                          total_price,
                          booking_date,
                          start_date,
                          end_date
                        ],
                        (err, bookingResult) => {
                          if (err) return rollback(connection, res, err);

                          connection.commit((err) => {
                            connection.release();
                            if (err) return rollback(connection, res, err);

                            res.status(201).json({
                              success: true,
                              message: "Booking berhasil",
                              data: { bookingId: bookingResult.insertId, notice: relatedPlacesMessage }
                            });
                          });
                        }
                      );
                    }
                  );
                }
              );
            };

            // Handle kalau parent/child rooms
            if (place.place_type === 'meeting_room' && place.parent_id) {
              relatedPlacesMessage = `Booking ini akan menutup meeting room lain dalam gedung.`;
              connection.query(
                `SELECT id FROM places WHERE parent_id = ? AND id != ?`,
                [place.parent_id, place.id],
                (err, siblings) => {
                  if (err) return rollback(connection, res, err);
                  siblings.forEach(s => placeIdsToCheck.add(s.id));
                  placeIdsToCheck.add(place.parent_id);
                  checkAvailability();
                }
              );
            } else if (place.place_type === 'building') {
              relatedPlacesMessage = `Booking gedung akan menutup semua meeting room di dalamnya.`;
              connection.query(
                `SELECT id FROM places WHERE parent_id = ?`,
                [place.id],
                (err, childs) => {
                  if (err) return rollback(connection, res, err);
                  childs.forEach(c => placeIdsToCheck.add(c.id));
                  checkAvailability();
                }
              );
            } else {
              checkAvailability();
            }
          }
        );
      });
    });
  });
};


exports.checkAvailability = (req, res) => {
  const { place_id, start_date, end_date } = req.query;

  if (!place_id || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Tempat dan tanggal harus diisi"
    });
  }

  // Langsung query tanpa getConnection
  // 1. Dapatkan informasi tempat beserta relasinya
  db.query(
    `SELECT p1.id, p1.place_name, p1.place_type, p1.parent_id, p1.capacity,
            p2.id as parent_id, p2.place_name as parent_name, p2.place_type as parent_type
     FROM places p1
     LEFT JOIN places p2 ON p1.parent_id = p2.id
     WHERE p1.id = ?`,
    [place_id],
    (placeErr, placeRows) => {
      if (placeErr) {
        console.error("DB error:", placeErr);
        return res.status(500).json({
          success: false,
          message: "Gagal memeriksa ketersediaan"
        });
      }

      if (placeRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tempat tidak ditemukan"
        });
      }

      const place = placeRows[0];
      const placeIdsToCheck = [place.id];
      let relatedPlacesMessage = '';

      // Buat function async kecil agar query berantai tapi pakai callback
      const querySiblingsOrChildren = (callback) => {
        if (place.place_type === 'meeting_room' && place.parent_id) {
          // Ambil meeting room lain satu building
          db.query(
            `SELECT id FROM places WHERE parent_id = ? AND id != ?`,
            [place.parent_id, place.id],
            (siblingErr, siblingRows) => {
              if (siblingErr) {
                console.error("DB error:", siblingErr);
                return res.status(500).json({
                  success: false,
                  message: "Gagal memeriksa ketersediaan"
                });
              }
              siblingRows.forEach(row => placeIdsToCheck.push(row.id));
              placeIdsToCheck.push(place.parent_id);
              relatedPlacesMessage = `Booking meeting room ini akan menonaktifkan gedung ${place.parent_name} dan meeting room lain di dalamnya`;
              callback();
            }
          );
        } else if (place.place_type === 'building') {
          // Ambil semua meeting room dalam building
          db.query(
            `SELECT id FROM places WHERE parent_id = ?`,
            [place.id],
            (childErr, childRows) => {
              if (childErr) {
                console.error("DB error:", childErr);
                return res.status(500).json({
                  success: false,
                  message: "Gagal memeriksa ketersediaan"
                });
              }
              childRows.forEach(row => placeIdsToCheck.push(row.id));
              relatedPlacesMessage = `Booking gedung ini akan menonaktifkan semua meeting room di dalamnya`;
              callback();
            }
          );
        } else {
          // Untuk tipe lain langsung lanjut
          callback();
        }
      };

      querySiblingsOrChildren(() => {
        // 3. Cek block dates untuk semua tempat terkait
        db.query(
          `SELECT bd.reason, p.place_name 
           FROM block_dates bd
           JOIN places p ON bd.place_id = p.id
           WHERE bd.place_id IN (?)
           AND (
             (bd.start_date BETWEEN ? AND ?)
             OR (bd.end_date BETWEEN ? AND ?)
             OR (? BETWEEN bd.start_date AND bd.end_date)
             OR (? BETWEEN bd.start_date AND bd.end_date)
           )`,
          [
            placeIdsToCheck,
            start_date, end_date,
            start_date, end_date,
            start_date, end_date
          ],
          (blockErr, blockRows) => {
            if (blockErr) {
              console.error("DB error:", blockErr);
              return res.status(500).json({
                success: false,
                message: "Gagal memeriksa ketersediaan"
              });
            }

            if (blockRows.length > 0) {
              return res.status(400).json({
                success: false,
                message: `Tanggal tidak tersedia: ${blockRows[0].place_name} diblokir (${blockRows[0].reason})`,
                isBlocked: true
              });
            }

            // 4. Cek booking yang ada untuk semua tempat terkait
            db.query(
              `SELECT b.id, p.place_name, p.place_type
               FROM bookings b
               JOIN places p ON b.place_id = p.id
               LEFT JOIN payments pay ON pay.booking_id = b.id
               WHERE b.place_id IN (?)
               AND (pay.status IS NULL OR pay.status NOT IN ('cancelled', 'rejected'))
               AND (
                 (b.start_date BETWEEN ? AND ?)
                 OR (b.end_date BETWEEN ? AND ?)
                 OR (? BETWEEN b.start_date AND b.end_date)
                 OR (? BETWEEN b.start_date AND b.end_date)
               )`,
              [
                placeIdsToCheck,
                start_date, end_date,
                start_date, end_date,
                start_date, end_date
              ],
              (bookingErr, bookingRows) => {
                if (bookingErr) {
                  console.error("DB error:", bookingErr);
                  return res.status(500).json({
                    success: false,
                    message: "Gagal memeriksa ketersediaan"
                  });
                }

                if (bookingRows.length > 0) {
                  const conflictPlace = bookingRows[0];
                  let message = '';

                  if (conflictPlace.place_id === place.id) {
                    message = `Tempat ini sudah dibooking pada tanggal tersebut`;
                  } else {
                    message = `Tidak tersedia karena ${conflictPlace.place_name} (${conflictPlace.place_type}) sudah dibooking`;
                  }

                  return res.status(400).json({
                    success: false,
                    message,
                    conflict: true
                  });
                }

                // 5. Cek kuota/kapasitas
                const bookingDate = new Date(start_date).toISOString().split('T')[0];
                db.query(
                  `SELECT * FROM place_schedules 
                   WHERE place_id = ? AND date = ?`,
                  [place.id, bookingDate],
                  (scheduleErr, scheduleRows) => {
                    if (scheduleErr) {
                      console.error("DB error:", scheduleErr);
                      return res.status(500).json({
                        success: false,
                        message: "Gagal memeriksa ketersediaan"
                      });
                    }

                    const schedule = scheduleRows[0];
                    let remaining, maxCapacity;

                    if (schedule) {
                      remaining = schedule.max_capacity - schedule.booked_count;
                      maxCapacity = schedule.max_capacity;
                    } else {
                      remaining = place.capacity;
                      maxCapacity = place.capacity;
                    }

                    return res.json({
                      success: true,
                      data: {
                        available: remaining > 0,
                        remaining,
                        maxCapacity,
                        date: bookingDate,
                        notice: relatedPlacesMessage
                      }
                    });
                  }
                );
              }
            );
          }
        );
      });
    }
  );
};