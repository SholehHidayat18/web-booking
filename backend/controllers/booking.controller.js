const db = require('../config/db');

  exports.createBooking = (req, res) => {
    const {
      fullName,
      phoneNumber,
      email,
      items,
      total_price,
      booking_date,
      start_date,
      end_date,
      place_id
    } = req.body;

    if (!phoneNumber || !place_id) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon dan tempat wajib diisi."
      });
    }

    // Format nomor telepon
    let convertedPhone = phoneNumber.startsWith("08") 
      ? phoneNumber.replace(/^0/, "+62") 
      : phoneNumber;

    // Mulai transaksi
    db.beginTransaction(err => {
      if (err) {
        console.error("Gagal memulai transaksi:", err);
        return res.status(500).json({ success: false, message: "Gagal memulai transaksi" });
      }

      // 1. Cek user berdasarkan nomor telepon
      db.query(
        "SELECT user_id FROM users WHERE phone_number IN (?, ?) LIMIT 1",
        [convertedPhone, phoneNumber],
        (userErr, userResult) => {
          if (userErr) {
            return rollback(db, res, userErr);
          }

          let userId = userResult[0] ? userResult[0].user_id : null;

          // 2. Jika user tidak ada, buat user baru
          const handleUser = (callback) => {
            if (userId) return callback();

            db.query(
              "INSERT INTO users (full_name, phone_number, email) VALUES (?, ?, ?)",
              [fullName, convertedPhone, email],
              (insertErr, insertResult) => {
                if (insertErr) {
                  return rollback(db, res, insertErr);
                }
                userId = insertResult.insertId;
                callback();
              }
            );
          };

          handleUser(() => {
            // 3.a. Cek block dates overlapping untuk place_id dan rentang start_date - end_date
            const bookingStart = new Date(start_date).toISOString().split('T')[0];
            const bookingEnd = new Date(end_date).toISOString().split('T')[0];
          
            db.query(
              `SELECT * FROM block_dates 
               WHERE (place_id = ? OR place_id IS NULL)
               AND NOT (end_date < ? OR start_date > ?)`,
              [place_id, bookingStart, bookingEnd],
              (blockErr, blockRows) => {
                if (blockErr) {
                  return rollback(db, res, blockErr);
                }
          
                if (blockRows.length > 0) {
                  // Ada tanggal yang diblokir (overlapping)
                  return rollback(db, res, null, {
                    success: false,
                    message: "Booking gagal: tanggal yang dipilih masuk dalam tanggal blokir",
                    status: 400
                  });
                }
          
                // 3.b. Ambil data tempat
                db.query(
                  "SELECT capacity FROM places WHERE id = ?",
                  [place_id],
                  (placeErr, placeRows) => {
                    if (placeErr) {
                      return rollback(db, res, placeErr);
                    }
          
                    if (placeRows.length === 0) {
                      return rollback(db, res, null, {
                        success: false,
                        message: "Tempat tidak ditemukan",
                        status: 404
                      });
                    }
          
                    const place = placeRows[0];
                    const bookingDate = new Date(start_date).toISOString().split('T')[0];
          
                    // 4. Cek ketersediaan jadwal (dengan LOCK)
                    db.query(
                      "SELECT * FROM place_schedules WHERE place_id = ? AND date = ? FOR UPDATE",
                      [place_id, bookingDate],
                      (scheduleErr, scheduleRows) => {
                        if (scheduleErr) {
                          return rollback(db, res, scheduleErr);
                        }
          
                        let schedule = scheduleRows[0];
          
                        // Fungsi untuk melanjutkan setelah update schedule
                        const processBooking = () => {
                          // 5. Simpan data booking tanpa kolom status
                          db.query(
                            `INSERT INTO bookings (
                              user_id,
                              place_id,
                              items,
                              total_price,
                              booking_date,
                              start_date,
                              end_date
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [
                              userId,
                              place_id,
                              JSON.stringify(items),
                              total_price,
                              booking_date,
                              start_date,
                              end_date
                            ],
                            (bookingErr, bookingResult) => {
                              if (bookingErr) {
                                return rollback(db, res, bookingErr);
                              }
          
                              // Commit transaksi jika semua berhasil
                              db.commit(commitErr => {
                                if (commitErr) {
                                  return rollback(db, res, commitErr);
                                }
          
                                const remainingQuota = schedule
                                  ? schedule.max_capacity - schedule.booked_count - 1
                                  : place.capacity - 1;
          
                                return res.status(201).json({
                                  success: true,
                                  message: "Booking berhasil dibuat",
                                  data: {
                                    bookingId: bookingResult.insertId,
                                    quotaRemaining: remainingQuota < 0 ? 0 : remainingQuota,
                                    totalCapacity: place.capacity
                                  }
                                });
                              });
                            }
                          );
                        };
          
                        // Jika schedule belum ada, buat baru
                        if (!schedule) {
                          db.query(
                            `INSERT INTO place_schedules (place_id, date, max_capacity, booked_count)
                            VALUES (?, ?, ?, 1)`,
                            [place_id, bookingDate, place.capacity],
                            (insertScheduleErr, insertResult) => {
                              if (insertScheduleErr) {
                                return rollback(db, res, insertScheduleErr);
                              }
          
                              // Ambil schedule yang baru dibuat
                              db.query(
                                `SELECT * FROM place_schedules WHERE id = ?`,
                                [insertResult.insertId],
                                (newScheduleErr, newScheduleRows) => {
                                  if (newScheduleErr) {
                                    return rollback(db, res, newScheduleErr);
                                  }
                                  schedule = newScheduleRows[0];
                                  processBooking();
                                }
                              );
                            }
                          );
                        } else {
                          // Jika schedule sudah ada, cek kuota
                          if (schedule.booked_count >= schedule.max_capacity) {
                            return rollback(db, res, null, {
                              success: false,
                              message: "Maaf, kuota untuk tanggal ini sudah penuh",
                              status: 400
                            });
                          }
          
                          // Update booked_count
                          db.query(
                            `UPDATE place_schedules SET booked_count = booked_count + 1 WHERE id = ?`,
                            [schedule.id],
                            (updateErr) => {
                              if (updateErr) {
                                return rollback(db, res, updateErr);
                              }
                              schedule.booked_count += 1;
                              processBooking();
                            }
                          );
                        }
                      }
                    );
                  }
                );
              }
            );
          });          
        }
      );
    });
  };

  // Fungsi rollback dan kirim response error
  function rollback(db, res, err, customResponse) {
    db.rollback(() => {
      if (err) console.error("Database error:", err);

      if (customResponse) {
        return res.status(customResponse.status || 500).json({
          success: customResponse.success,
          message: customResponse.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan sistem",
        error: process.env.NODE_ENV === 'development' && err ? err.message : undefined
      });
    });
  }

// Controller untuk cek ketersediaan (tetap pakai db.query langsung)
exports.checkAvailability = (req, res) => {
  const { place_id, date } = req.query;

  // 1. Cek apakah ada schedule untuk tanggal tersebut
  db.query(
    `SELECT * FROM place_schedules WHERE place_id = ? AND date = ?`,
    [place_id, date],
    (scheduleErr, scheduleRows) => {
      if (scheduleErr) {
        return res.status(500).json({ 
          success: false, 
          message: "Gagal memeriksa ketersediaan" 
        });
      }

      let maxCapacity;
      let bookedCount = 0;

      if (scheduleRows.length > 0) {
        maxCapacity = scheduleRows[0].max_capacity;
        bookedCount = scheduleRows[0].booked_count;
      } else {
        // 2. Jika tidak ada schedule, ambil capacity default dari tempat
        db.query(
          `SELECT capacity FROM places WHERE id = ?`,
          [place_id],
          (placeErr, placeRows) => {
            if (placeErr) {
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

            maxCapacity = placeRows[0].capacity;
            const remaining = maxCapacity - bookedCount;

            return res.json({
              success: true,
              data: {
                available: remaining > 0,
                remaining,
                maxCapacity,
                date
              }
            });
          }
        );
        return;
      }

      const remaining = maxCapacity - bookedCount;

      res.json({
        success: true,
        data: {
          available: remaining > 0,
          remaining,
          maxCapacity,
          date
        }
      });
    }
  );
};
