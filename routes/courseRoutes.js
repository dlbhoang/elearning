const express = require("express");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware.js");
const courseController = require("../controllers/courseController.js");

const router = express.Router();

// ✅ SPECIFIC ROUTES PHẢI TRƯỚC GENERIC ROUTES!

// -------------------------
// Tạo course (admin hoặc teacher)
// -------------------------
router.post(
  "/create",
  verifyToken,
  authorizeRole("admin", "teacher"),
  courseController.createCourse
);

// -------------------------
// Lấy danh sách course (tất cả user đã đăng nhập)
// -------------------------
router.get("/list", verifyToken, courseController.getAllCourses);

// -------------------------
// Lấy course theo token (my courses) 
// - teacher → course của chính mình
// - student → course đã đăng ký
// -------------------------
router.get("/me/mine", verifyToken, courseController.getMyCourses);

// ✅ SPECIFIC ROUTES PHẢI TRƯỚC /grade/:grade vì /grade có thể match với /progress
// Lấy số học sinh và tiến độ của course
router.get("/:id/students-count", verifyToken, courseController.getStudentsCount);

// ✅ Lấy tiến độ khóa học của học sinh
router.get("/:id/progress", verifyToken, courseController.getCourseProgress);

// ✅ Theo grade (PHẢI SAU các specific routes vì grade cũng là :id pattern)
router.get("/grade/:grade", verifyToken, courseController.getCoursesByGrade);

// ✅ GENERIC ROUTE CÓ :ID ở cuối - PHẢI SAU TẤT CẢ
// Lấy chi tiết course theo ID
router.get("/:id", verifyToken, courseController.getCourseById);

// -------------------------
// Cập nhật course (chỉ admin hoặc teacher sở hữu course đó)
// -------------------------
router.put(
  "/:id",
  verifyToken,
  authorizeRole("admin", "teacher"),
  courseController.updateCourse
);

// -------------------------
// Xóa course (chỉ admin)
// -------------------------
router.delete(
  "/:id",
  verifyToken,
  authorizeRole("admin", "teacher"),
  courseController.deleteCourse
);

module.exports = router;
