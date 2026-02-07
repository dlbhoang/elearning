const db = require('../config/db.js');

// Tạo bài thi mới
exports.createExam = (req, res) => {
  const { title, subject, courseId, date, time, duration, totalQuestions, maxScore, classroom, instructions } = req.body;
  const userId = req.user.id;

  if (!title || !subject || !courseId) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: title, subject, courseId' });
  }

  // Validate courseId exists
  const validateCourseSql = 'SELECT id FROM courses WHERE id = ?';
  db.query(validateCourseSql, [courseId], (err, results) => {
    if (err) {
      console.error('Error validating course:', err);
      return res.status(500).json({ error: 'Lỗi kiểm tra khóa học' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ error: `Khóa học với ID ${courseId} không tồn tại` });
    }

    const sql = `
      INSERT INTO exams (title, subject, course_id, date, time, duration, total_questions, max_score, classroom, instructions, teacher_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(sql, [title, subject, courseId, date || null, time || null, duration || 60, totalQuestions || 0, maxScore || 100, classroom || '', instructions || '', userId], (err, result) => {
      if (err) {
        console.error('Error creating exam:', err);
        return res.status(500).json({ error: 'Lỗi tạo bài thi: ' + err.message });
      }
      res.json({ id: result.insertId, title, subject, courseId });
    });
  });
};

// Lấy tất cả bài thi của giáo viên
exports.getAllExams = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT e.*, c.title as course_name 
    FROM exams e
    LEFT JOIN courses c ON e.course_id = c.id
    WHERE e.teacher_id = ?
    ORDER BY e.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching exams:', err);
      return res.status(500).json({ error: 'Lỗi lấy danh sách bài thi' });
    }
    res.json(results);
  });
};

// Lấy chi tiết bài thi
exports.getExamById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id || req.user.id;
  const userRole = req.user.role;

  console.log(`🔍 DEBUG getExamById: id=${id}, userId=${userId}, role=${userRole}`);

  // ✅ Lấy exam và kiểm tra quyền truy cập
  const sql = `
    SELECT e.*, c.title as course_name, c.id as course_id
    FROM exams e
    LEFT JOIN courses c ON e.course_id = c.id
    WHERE e.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching exam:', err);
      return res.status(500).json({ status: 'error', message: 'Lỗi lấy chi tiết bài thi' });
    }
    
    console.log(`🔍 Exam found: ${results.length} results`);
    
    if (results.length === 0) {
      console.warn(`⚠️ Exam ${id} not found in DB`);
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy bài thi' });
    }

    const exam = results[0];
    console.log(`🔍 Exam data: id=${exam.id}, course_id=${exam.course_id}, teacher_id=${exam.teacher_id}`);

    // ✅ Kiểm tra quyền truy cập
    // - Giáo viên: phải là tác giả của bài thi
    // - Học sinh: phải đã đăng ký + thanh toán khóa học
    if (userRole === 'teacher') {
      console.log(`🔍 User is TEACHER, checking if teacher_id=${exam.teacher_id} === userId=${userId}`);
      if (exam.teacher_id !== userId) {
        console.warn(`⚠️ Teacher ${userId} not owner of exam ${id}`);
        return res.status(403).json({ status: 'error', message: 'Bạn không có quyền xem bài thi này' });
      }
      console.log(`✅ Teacher authorized`);
    } else if (userRole === 'student') {
      console.log(`🔍 User is STUDENT, checking enrollment for course_id=${exam.course_id}`);
      if (!exam.course_id) {
        console.warn(`⚠️ Exam ${id} has no course_id`);
        return res.status(403).json({ status: 'error', message: 'Bài thi không được gán cho khóa học' });
      }
      // Kiểm tra enrollment
      const checkEnrollmentSql = `
        SELECT status FROM user_courses 
        WHERE user_id = ? AND course_id = ? AND status = 'paid'
      `;
      db.query(checkEnrollmentSql, [userId, exam.course_id], (err2, enrollResults) => {
        console.log(`🔍 Enrollment check: err=${err2 ? 'YES' : 'NO'}, results=${enrollResults.length}`);
        if (err2 || !enrollResults.length) {
          console.warn(`⚠️ Student ${userId} not enrolled/paid for course ${exam.course_id}`);
          return res.status(403).json({ status: 'error', message: 'Bạn chưa đăng ký hoặc chưa thanh toán khóa học này' });
        }
        console.log(`✅ Student authorized`);
        // ✅ Có quyền, lấy câu hỏi
        fetchQuestions();
      });
      return;
    } else {
      console.warn(`⚠️ Unknown role: ${userRole}`);
      return res.status(403).json({ status: 'error', message: 'Bạn không có quyền xem bài thi' });
    }

    // ✅ Lấy câu hỏi
    fetchQuestions();

    function fetchQuestions() {
      const questionsSql = `
        SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY created_at ASC
      `;
      db.query(questionsSql, [id], (err, questions) => {
        if (err) {
          console.error('❌ Error fetching questions:', err);
          return res.status(500).json({ status: 'error', message: 'Lỗi lấy câu hỏi' });
        }
        
        // Parse options và correctAnswer từ JSON string
        const parsedQuestions = questions.map(q => {
          try {
            return {
              ...q,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              correct_answer: typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer,
            };
          } catch (e) {
            console.error('❌ Error parsing question data:', e);
            return q;
          }
        });
        
        console.log(`✅ Lấy exam ${id} với ${parsedQuestions.length} câu hỏi`);
        res.json({ status: 'success', data: { ...exam, questions: parsedQuestions } });
      });
    }
  });
};

// Cập nhật bài thi
exports.updateExam = (req, res) => {
  const { id } = req.params;
  const { title, subject, courseId, date, time, duration, totalQuestions, maxScore, classroom, instructions } = req.body;
  const userId = req.user.user_id || req.user.id;

  const sql = `
    UPDATE exams 
    SET title = ?, subject = ?, course_id = ?, date = ?, time = ?, duration = ?, total_questions = ?, max_score = ?, classroom = ?, instructions = ?
    WHERE id = ? AND teacher_id = ?
  `;

  db.query(sql, [title, subject, courseId, date || null, time || null, duration || 60, totalQuestions || 0, maxScore || 100, classroom || '', instructions || '', id, userId], (err) => {
    if (err) {
      console.error('Error updating exam:', err);
      return res.status(500).json({ error: 'Lỗi cập nhật bài thi' });
    }
    res.json({ message: 'Cập nhật bài thi thành công' });
  });
};

// Xoá bài thi
exports.deleteExam = (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id || req.user.id;

  // Xoá câu hỏi trước
  const deleteQuestionsSQL = 'DELETE FROM exam_questions WHERE exam_id = ?';
  db.query(deleteQuestionsSQL, [id], (err) => {
    if (err) {
      console.error('Error deleting questions:', err);
      return res.status(500).json({ error: 'Lỗi xoá câu hỏi' });
    }

    // Xoá bài thi
    const deleteExamSQL = 'DELETE FROM exams WHERE id = ? AND teacher_id = ?';
    db.query(deleteExamSQL, [id, userId], (err) => {
      if (err) {
        console.error('Error deleting exam:', err);
        return res.status(500).json({ error: 'Lỗi xoá bài thi' });
      }
      res.json({ message: 'Xoá bài thi thành công' });
    });
  });
};

// Lấy bài thi theo course
exports.getExamsByCourse = (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.user_id || req.user.id;

  const sql = `
    SELECT e.*, c.title as course_name 
    FROM exams e
    LEFT JOIN courses c ON e.course_id = c.id
    WHERE e.course_id = ? AND e.teacher_id = ?
    ORDER BY e.created_at DESC
  `;

  db.query(sql, [courseId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching exams by course:', err);
      return res.status(500).json({ error: 'Lỗi lấy bài thi' });
    }
    res.json(results);
  });
};

// Thêm câu hỏi vào bài thi
exports.addQuestionToExam = (req, res) => {
  const { examId } = req.params;
  const { question, type, options, correctAnswer, explanation } = req.body;
  const userId = req.user.user_id || req.user.id;

  // Kiểm tra exam thuộc về teacher
  const checkSQL = 'SELECT id FROM exams WHERE id = ? AND teacher_id = ?';
  db.query(checkSQL, [examId, userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    const sql = `
      INSERT INTO exam_questions (exam_id, question, type, options, correct_answer, explanation, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(sql, [examId, question, type, JSON.stringify(options), JSON.stringify(correctAnswer), explanation || ''], (err, result) => {
      if (err) {
        console.error('Error adding question:', err);
        return res.status(500).json({ error: 'Lỗi thêm câu hỏi' });
      }
      res.json({ id: result.insertId, question, type });
    });
  });
};

// Xoá câu hỏi khỏi bài thi
exports.deleteQuestionFromExam = (req, res) => {
  const { examId, questionId } = req.params;
  const userId = req.user.user_id || req.user.id;

  // Kiểm tra quyền
  const checkSQL = 'SELECT id FROM exams WHERE id = ? AND teacher_id = ?';
  db.query(checkSQL, [examId, userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    const sql = 'DELETE FROM exam_questions WHERE id = ? AND exam_id = ?';
    db.query(sql, [questionId, examId], (err) => {
      if (err) {
        console.error('Error deleting question:', err);
        return res.status(500).json({ error: 'Lỗi xoá câu hỏi' });
      }
      res.json({ message: 'Xoá câu hỏi thành công' });
    });
  });
};

// Cập nhật câu hỏi
exports.updateQuestion = (req, res) => {
  const { examId, questionId } = req.params;
  const { question, type, options, correctAnswer, explanation } = req.body;
  const userId = req.user.user_id || req.user.id;

  // Kiểm tra quyền
  const checkSQL = 'SELECT id FROM exams WHERE id = ? AND teacher_id = ?';
  db.query(checkSQL, [examId, userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    const sql = `
      UPDATE exam_questions 
      SET question = ?, type = ?, options = ?, correct_answer = ?, explanation = ?
      WHERE id = ? AND exam_id = ?
    `;

    db.query(sql, [question, type, JSON.stringify(options), JSON.stringify(correctAnswer), explanation || '', questionId, examId], (err) => {
      if (err) {
        console.error('Error updating question:', err);
        return res.status(500).json({ error: 'Lỗi cập nhật câu hỏi' });
      }
      res.json({ message: 'Cập nhật câu hỏi thành công' });
    });
  });
};
// ========================
// 🆕 LẤY EXAMS CHO HỌC SINH
// ========================
// Lấy bài thi của các khóa học mà học sinh đã đăng ký + thanh toán
exports.getStudentExams = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT DISTINCT e.*, c.title as course_name, c.id as course_id
    FROM exams e
    LEFT JOIN courses c ON e.course_id = c.id
    LEFT JOIN user_courses uc ON c.id = uc.course_id
    WHERE uc.user_id = ? AND uc.status = 'paid'
    ORDER BY e.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching student exams:', err);
      return res.status(500).json({ status: 'error', message: 'Lỗi lấy danh sách bài thi' });
    }
    
    console.log(`✅ Lấy ${results.length} bài thi cho học sinh ${userId}`);
    res.json({ status: 'success', data: results });
  });
};