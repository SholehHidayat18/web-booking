const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/auth'); 

router.use(authenticateAdmin);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/admin-status', adminController.updateUserAdminStatus);

// Pemesanan
router.get('/bookings', adminController.getAllBookings);
router.post('/bookings', adminController.createBooking);
router.delete('/bookings/:id', adminController.deleteBooking);

// Pembayaran
router.get('/payments', adminController.getAllPayments);
router.get('/payments/reports', adminController.getPaymentReports); 
router.post('/payments', adminController.createPayment);
router.delete('/payments/:id', adminController.deletePayment);

// Laporan Keuangan
router.get('/financial-reports', adminController.getFinancialReports);

// Data Kamar
router.get('/rooms', adminController.getRooms);

// Data Gedung
router.get('/buildings', adminController.getBuildings);

// Data Lapangan
router.get('/fields', adminController.getFields);

// Tanggal Diblokir
router.get('/blocked-dates', adminController.getBlockedDates);
router.post('/block-dates', adminController.blockDates);

module.exports = router;
