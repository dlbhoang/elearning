const express = require("express");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware.js");
const notificationController = require("../controllers/notificationController.js");

const router = express.Router();

// Lấy danh sách thông báo
router.get("/", verifyToken, notificationController.getNotifications);

// Đánh dấu thông báo đã đọc
router.post("/mark-read", verifyToken, notificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.post("/mark-all-read", verifyToken, notificationController.markAllAsRead);

// Gửi thông báo/ tin nhắn cho phụ huynh (teacher only)
router.post("/send-parent", verifyToken, authorizeRole("teacher"), notificationController.sendToParent);

// Kiểm tra và tạo thông báo exam (có thể gọi định kỳ từ frontend hoặc cron job)
router.post("/check-exam-notifications", verifyToken, notificationController.checkAndCreateExamNotifications);

module.exports = router;

