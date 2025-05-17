const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// GET all payments
router.get("/", paymentController.getAllPayments);

// GET payment by ID
router.get("/:id", paymentController.getPaymentById);

// CREATE payment
router.post("/", paymentController.createPayment);

// UPDATE payment status
router.put("/:id", paymentController.updatePaymentStatus);

// DELETE payment
router.delete("/:id", paymentController.deletePayment);

router.get('/admin/payments', paymentController.getAdminPayments);

module.exports = router;
