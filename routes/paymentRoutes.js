const express = require("express");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware.js");
const paymentController = require("../controllers/paymentController.js");

const router = express.Router();

router.post("/", verifyToken, paymentController.createPayment);
router.put("/:id/status", verifyToken, authorizeRole("teacher"), paymentController.updatePaymentStatus);
router.put("/approve/:enrollmentId", verifyToken, authorizeRole("teacher"), paymentController.approvePayment);
router.get("/", verifyToken, paymentController.getUserPayments);

module.exports = router;
