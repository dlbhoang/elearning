const express = require("express");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware.js");
const enrollmentController = require("../controllers/enrollmentController.js");

const router = express.Router();

router.post("/", verifyToken, authorizeRole("student"), enrollmentController.enrollCourse);

// Lấy danh sách học sinh của giáo viên
router.get("/students", verifyToken, authorizeRole("teacher"), enrollmentController.getTeacherStudents);

// Lấy chi tiết khóa học của một học sinh cụ thể
router.get("/student/:studentId/courses", verifyToken, authorizeRole("teacher"), enrollmentController.getStudentCourses);

module.exports = router;
