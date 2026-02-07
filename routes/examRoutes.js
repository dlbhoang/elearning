const express = require('express');
const { 
  createExam, 
  getAllExams, 
  getExamById, 
  updateExam, 
  deleteExam, 
  getExamsByCourse,
  addQuestionToExam,
  deleteQuestionFromExam,
  updateQuestion,
  getStudentExams
} = require('../controllers/examController.js');
const { verifyToken } = require('../middlewares/authMiddleware.js');

const router = express.Router();

// ⭐ ROUTES CỤ THỂ PHẢI ĐẶT TRƯỚC ROUTES GENERIC!

// 🆕 Lấy bài thi cho học sinh (các khóa học đã thanh toán)
router.get('/student/my-exams', verifyToken, getStudentExams);

// Lấy bài thi theo course
router.get('/course/:courseId', verifyToken, getExamsByCourse);

// Bài thi CRUD
router.post('/', verifyToken, createExam);
router.get('/', verifyToken, getAllExams);
router.get('/:id', verifyToken, getExamById);
router.put('/:id', verifyToken, updateExam);
router.delete('/:id', verifyToken, deleteExam);

// Câu hỏi
router.post('/:examId/questions', verifyToken, addQuestionToExam);
router.delete('/:examId/questions/:questionId', verifyToken, deleteQuestionFromExam);
router.put('/:examId/questions/:questionId', verifyToken, updateQuestion);

module.exports = router;

