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

  // Validasi input
  if (!phoneNumber || !place_id || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Nomor telepon, tempat, dan tanggal booking wajib diisi."
    });
  }

  // Format nomor telepon
  const convertedPhone = phoneNumber.startsWith("08")
    ? phoneNumber.replace(/^0/, "+62")
    : phoneNumber;

  const bookingStart = new Date(start_date).toISOString().split('T')[0];
  const bookingEnd = new Date(end_date).toISOString().split('T')[0];

  db.getConnection((connErr, connection) => {
    if (connErr) {
      console.error("DB connection error:", connErr);
      return res.status(500).json({ 
        success: false, 
        message: "Kesalahan koneksi database" 
      });
    }

    // Mulai transaksi
    connection.beginTransaction((beginErr) => {
      if (beginErr) {
        connection.release();
        return res.status(500).json({ 
          success: false, 
          message: "Gagal memulai transaksi" 
        });
      }

      // 1. Cek user berdasarkan nomor telepon
      connection.query(
        `SELECT user_id FROM users WHERE phone_number IN (?, ?) LIMIT 1`,
        [convertedPhone, phoneNumber],
        (userErr, userResult) => {
          if (userErr) {
            return rollback(connection, res, userErr);
          }

          let userId = userResult[0]?.user_id || null;

          // 2. Jika user belum ada, buat baru
          const handleUser = (callback) => {
            if (userId) return callback();

            connection.query(
              `INSERT INTO users (full_name, phone_number, email) VALUES (?, ?, ?)`,
              [fullName, convertedPhone, email],
              (insertErr, insertResult) => {
                if (insertErr) {
                  return rollback(connection, res, insertErr);
                }
                userId = insertResult.insertId;
                callback();
              }
            );
          };

          handleUser(() => {
            // 3. Dapatkan informasi tempat beserta relasinya
            connection.query(
              `SELECT p1.id, p1.place_name, p1.place_type, p1.parent_id, p1.capacity,
                      p2.id as parent_id, p2.place_name as parent_name, p2.place_type as parent_type
               FROM places p1
               LEFT JOIN places p2 ON p1.parent_id = p2.id
               WHERE p1.id = ?`,
              [place_id],
              (placeErr, placeRows) => {
                if (placeErr) {
                  return rollback(connection, res, placeErr);
                }

                if (placeRows.length === 0) {
                  return rollback(connection, res, null, {
                    success: false,
                    message: "Tempat tidak ditemukan",
                    status: 404
                  });
                }

                const place = placeRows[0];
                const placeIdsToCheck = [place.id];
                let relatedPlacesMessage = '';

                // 4. Tentukan tempat terkait yang perlu dicek
                if (place.place_type === 'meeting_room' && place.parent_id) {
                  // Jika meeting room, cek building induk dan meeting room lain di building yang sama
                  placeIdsToCheck.push(place.parent_id);
                  relatedPlacesMessage = `Booking meeting room ini akan menonaktifkan gedung ${place.parent_name} dan meeting room lain di dalamnya`;
                  
                  connection.query(
                    `SELECT id FROM places WHERE parent_id = ? AND id != ?`,
                    [place.parent_id, place.id],
                    (siblingErr, siblingRows) => {
                      if (siblingErr) {
                        return rollback(connection, res, siblingErr);
                      }
                      
                      siblingRows.forEach(row => placeIdsToCheck.push(row.id));
                      checkAvailabilityAndProceed();
                    }
                  );
                  return;
                } else if (place.place_type === 'building') {
                  // Jika building, cek semua meeting room dibawahnya
                  relatedPlacesMessage = `Booking gedung ini akan menonaktifkan semua meeting room di dalamnya`;
                  
                  connection.query(
                    `SELECT id FROM places WHERE parent_id = ?`,
                    [place.id],
                    (childErr, childRows) => {
                      if (childErr) {
                        return rollback(connection, res, childErr);
                      }
                      
                      childRows.forEach(row => placeIdsToCheck.push(row.id));
                      checkAvailabilityAndProceed();
                    }
                  );
                  return;
                }
                
                // Untuk field atau tipe lain tanpa relasi
                checkAvailabilityAndProceed();

                function checkAvailabilityAndProceed() {
                  // 5. Cek block dates untuk semua tempat terkait
                  connection.query(
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
                      bookingStart, bookingEnd,
                      bookingStart, bookingEnd,
                      bookingStart, bookingEnd
                    ],
                    (blockErr, blockRows) => {
                      if (blockErr) {
                        return rollback(connection, res, blockErr);
                      }

                      if (blockRows.length > 0) {
                        return rollback(connection, res, null, {
                          success: false,
                          message: `Booking gagal: ${blockRows[0].place_name} diblokir (${blockRows[0].reason})`,
                          status: 400
                        });
                      }

                      // 6. Cek booking yang ada untuk semua tempat terkait
                      connection.query(
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
                            return rollback(connection, res, bookingErr);
                          }

                          if (bookingRows.length > 0) {
                            const conflictPlace = bookingRows[0];
                            let message = '';
                            
                            if (conflictPlace.place_id === place.id) {
                              message = `Tempat ini sudah dibooking pada tanggal tersebut`;
                            } else {
                              message = `Booking gagal: ${conflictPlace.place_name} (${conflictPlace.place_type}) sudah dibooking`;
                            }

                            return rollback(connection, res, null, {
                              success: false,
                              message: message,
                              status: 400
                            });
                          }

                          // 7. Cek jadwal dan kuota untuk tanggal booking (dengan LOCK)
                          connection.query(
                            `SELECT * FROM place_schedules 
                             WHERE place_id = ? AND date = ? FOR UPDATE`,
                            [place.id, bookingStart],
                            (scheduleErr, scheduleRows) => {
                              if (scheduleErr) {
                                return rollback(connection, res, scheduleErr);
                              }

                              let schedule = scheduleRows[0];

                              // Fungsi untuk menyelesaikan booking
                              const completeBooking = () => {
                                // 8. Simpan data booking
                                connection.query(
                                  `INSERT INTO bookings (
                                    user_id,
                                    place_id,
                                    items,
                                    total_price,
                                    booking_date,
                                    start_date,
                                    end_date,
                                    status
                                  ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
                                  [
                                    userId,
                                    place_id,
                                    JSON.stringify(items),
                                    total_price,
                                    booking_date,
                                    start_date,
                                    end_date
                                  ],
                                  (bookingInsertErr, bookingResult) => {
                                    if (bookingInsertErr) {
                                      return rollback(connection, res, bookingInsertErr);
                                    }

                                    // Commit transaksi
                                    connection.commit((commitErr) => {
                                      connection.release();
                                      
                                      if (commitErr) {
                                        return rollback(connection, res, commitErr);
                                      }

                                      const remainingQuota = schedule
                                        ? schedule.max_capacity - schedule.booked_count - 1
                                        : place.capacity - 1;

                                      res.status(201).json({
                                        success: true,
                                        message: "Booking berhasil dibuat",
                                        data: {
                                          bookingId: bookingResult.insertId,
                                          quotaRemaining: Math.max(0, remainingQuota),
                                          totalCapacity: place.capacity,
                                          notice: relatedPlacesMessage
                                        }
                                      });
                                    });
                                  }
                                );
                              };

                              // Jika belum ada schedule, buat baru
                              if (!schedule) {
                                connection.query(
                                  `INSERT INTO place_schedules (
                                    place_id, 
                                    date, 
                                    max_capacity, 
                                    booked_count
                                  ) VALUES (?, ?, ?, 1)`,
                                  [place.id, bookingStart, place.capacity],
                                  (insertScheduleErr, insertResult) => {
                                    if (insertScheduleErr) {
                                      return rollback(connection, res, insertScheduleErr);
                                    }

                                    // Ambil schedule yang baru dibuat
                                    connection.query(
                                      `SELECT * FROM place_schedules WHERE id = ?`,
                                      [insertResult.insertId],
                                      (newScheduleErr, newScheduleRows) => {
                                        if (newScheduleErr) {
                                          return rollback(connection, res, newScheduleErr);
                                        }
                                        schedule = newScheduleRows[0];
                                        completeBooking();
                                      }
                                    );
                                  }
                                );
                              } else {
                                // Cek kuota
                                if (schedule.booked_count >= schedule.max_capacity) {
                                  return rollback(connection, res, null, {
                                    success: false,
                                    message: "Maaf, kuota untuk tanggal ini sudah penuh",
                                    status: 400
                                  });
                                }

                                // Update booked_count
                                connection.query(
                                  `UPDATE place_schedules 
                                   SET booked_count = booked_count + 1 
                                   WHERE id = ?`,
                                  [schedule.id],
                                  (updateErr) => {
                                    if (updateErr) {
                                      return rollback(connection, res, updateErr);
                                    }
                                    completeBooking();
                                  }
                                );
                              }
                            }
                          );
                        }
                      );
                    }
                  );
                }
              }
            );
          });
        }
      );
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