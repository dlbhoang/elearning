const express = require("express");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware.js");
const lessonController = require("../controllers/lessonController.js");
const upload = require("../middlewares/upload.js");

const router = express.Router();

// -------------------------
// Chapter
// -------------------------
// Tạo chapter (chỉ teacher)
router.post(
  "/chapter/create",
  verifyToken,
  authorizeRole("teacher"),
  lessonController.createChapter
);

// Lấy chapter theo course (tất cả user)
router.get(
  "/course/:course_id/chapters",
  verifyToken,
  lessonController.getChaptersByCourse
);


// -------------------------
// Lesson
// -------------------------
// Tạo lesson (chỉ teacher, video Base64 upload Cloudinary)
router.post(
  "/lesson/create",
  verifyToken,
  authorizeRole("teacher"),
  upload.fields([{ name: "videoFile" }, { name: "pptFile" }]),
  lessonController.createLesson
);

// Lấy lesson theo chapter (tất cả user)
router.get(
  "/chapter/:chapter_id/lessons",
  verifyToken,
  lessonController.getLessonsByChapter
);

// -------------------------
// Lesson Exercise
// -------------------------
// Tạo exercise (chỉ teacher)
router.post(
  "/exercise/create",
  verifyToken,
  authorizeRole("teacher"),
  lessonController.createLessonExercise
);

// Lấy exercise theo lesson (tất cả user)
router.get(
  "/:lesson_id/exercises",
  verifyToken,
  lessonController.getExercisesByLesson
);

// Cập nhật exercise (chỉ teacher)
router.put(
  "/exercise/:exercise_id",
  verifyToken,
  authorizeRole("teacher"),
  lessonController.updateLessonExercise
);

// Xóa exercise (chỉ teacher) - PHẢI ĐẶT TRƯỚC /lesson/:lesson_id
router.delete(
  "/exercise/:exercise_id",
  verifyToken,
  authorizeRole("teacher"),
  lessonController.deleteLessonExercise
);

// -------------------------
// Lesson Score (student)
// -------------------------
// Ghi điểm bài học
router.post(
  "/score",
  verifyToken,
  authorizeRole("student"),
  lessonController.createLessonScore
);

// -------------------------
// Lấy toàn bộ nội dung course + exercises + điểm học sinh
// -------------------------
router.get(
  "/course/:course_id/content",
  verifyToken,
  lessonController.getCourseContent
);

// Lấy lesson theo ID
router.get("/:lesson_id", verifyToken, lessonController.getLessonById);

// Update & delete chapter
router.put("/chapter/:chapter_id", verifyToken, authorizeRole("teacher"), lessonController.updateChapter);
router.delete("/chapter/:chapter_id", verifyToken, authorizeRole("teacher"), lessonController.deleteChapter);

// Update & delete lesson (PHẢI ĐẶT CUỐI CÙNG vì :lesson_id là param chung)
router.put("/lesson/:lesson_id", verifyToken, authorizeRole("teacher"), lessonController.updateLesson);
router.delete("/lesson/:lesson_id", verifyToken, authorizeRole("teacher"), lessonController.deleteLesson);

// -------------------------
// Lesson Progress (student)
// -------------------------
// Cập nhật tiến độ sau khi xem video (50%) hoặc hoàn thành exercise (100%)
router.post(
  "/progress/update",
  verifyToken,
  lessonController.updateLessonProgress
);

// Lấy tiến độ của học sinh cho một bài học
router.get(
  "/:lesson_id/progress",
  verifyToken,
  lessonController.getLessonProgress
);

// -------------------------
// Teacher Grading APIs
// -------------------------
// Lấy danh sách bài nộp cần chấm (teacher)
router.get(
  "/pending-submissions",
  verifyToken,
  authorizeRole("teacher"),
  lessonController.getPendingSubmissions
);

// Chấm điểm bài nộp (teacher)
router.post(
  "/grade-submission",
  verifyToken,
  authorizeRole("teacher"),
  lessonController.gradeSubmission
);

module.exports = router;
