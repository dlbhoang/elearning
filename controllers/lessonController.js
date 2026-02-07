const db = require("../config/db.js");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary.js");

// ==========================
// TẠO CHAPTER
// ==========================
exports.createChapter = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền tạo chapter" });
    }

    const { course_id, title } = req.body;
    if (!course_id || !title) return res.status(400).json({ status: "error", message: "Thiếu thông tin" });

    // Kiểm tra course tồn tại
    db.query("SELECT id FROM courses WHERE id = ?", [course_id], (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: err });
      if (result.length === 0) return res.status(404).json({ status: "error", message: "Course không tồn tại" });

      const id = `CH_${Date.now()}`;
      const sql = "INSERT INTO chapters (id, course_id, title) VALUES (?, ?, ?)";
      db.query(sql, [id, course_id, title], (err2) => {
        if (err2) return res.status(500).json({ status: "error", message: err2 });
        res.json({ status: "success", data: { id, course_id, title } });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// LẤY CHAPTER THEO COURSE
// ==========================
exports.getChaptersByCourse = (req, res) => {
  const { course_id } = req.params;
  const user_id = req.user?.id;
  const user_role = req.user?.role;

  // ✅ Kiểm tra user_id
  if (!user_id) {
    console.error("❌ Không có user_id, req.user:", req.user);
    return res.status(401).json({ status: "error", message: "Chưa xác thực, vui lòng đăng nhập" });
  }

  // ✅ Teacher: kiểm tra nếu là tác giả course
  // ✅ Student: kiểm tra enrollment + payment
  if (user_role === 'teacher') {
    console.log(`🔍 Teacher ${user_id} accessing course ${course_id}`);
    // Kiểm tra teacher có tạo course này không
      db.query("SELECT id FROM courses WHERE id = ? AND teacher = ?", [course_id, user_id], (err, results) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra course:", err);
        return res.status(500).json({ status: "error", message: "Lỗi kiểm tra quyền" });
      }
      if (results.length === 0) {
        console.warn(`⚠️ Teacher ${user_id} không phải tác giả course ${course_id}`);
        return res.status(403).json({ status: "error", message: "Bạn không phải tác giả của khóa học này" });
      }
      console.log(`✅ Teacher ${user_id} authorized`);
      fetchChapters();
    });
  } else {
    // Student: kiểm tra enrollment
    const checkSql = `
      SELECT uc.status FROM user_courses uc
      WHERE uc.user_id = ? AND uc.course_id = ?
    `;

    db.query(checkSql, [user_id, course_id], (err, results) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra quyền:", err);
        return res.status(500).json({ status: "error", message: "Lỗi kiểm tra quyền" });
      }

      console.log("🔍 user_id:", user_id, "course_id:", course_id, "results:", results);

      // Không tìm thấy enrollment hoặc status không phải 'paid'
      if (results.length === 0 || results[0].status !== "paid") {
        const errorMsg = results.length === 0 
          ? "Bạn chưa đăng ký khóa học này" 
          : `Bạn chưa thanh toán (trạng thái: ${results[0].status})`;
        
        console.warn("⚠️ Không có quyền:", errorMsg);
        return res.status(403).json({
          status: "error",
          message: errorMsg,
        });
      }
      console.log(`✅ Student ${user_id} authorized for course ${course_id}`);
      fetchChapters();
    });
  }

  function fetchChapters() {
    const sql = "SELECT * FROM chapters WHERE course_id = ? ORDER BY created_at ASC";
    db.query(sql, [course_id], (err, results) => {
      if (err) return res.status(500).json({ status: "error", message: err });
      res.json({ status: "success", data: results });
    });
  }
};

// ==========================
// TẠO LESSON + UPLOAD VIDEO LÊN CLOUDINARY
// ==========================

// ==========================
// TẠO LESSON + UPLOAD VIDEO/PPT
// ==========================
const uploadToCloudinary = (buffer, resource_type) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type, folder: "lessons" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

exports.createLesson = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher")
      return res.status(403).json({ status: "error", message: "Bạn không có quyền tạo lesson" });

    const { chapter_id, title, duration } = req.body;
    if (!chapter_id || !title)
      return res.status(400).json({ status: "error", message: "Thiếu thông tin" });

    let media_url = null;
    let media_type = null;

    // Upload video
    if (req.files?.videoFile?.[0]) {
      media_url = await uploadToCloudinary(req.files.videoFile[0].buffer, "video");
      media_type = "video";
    } 
    // Upload PPT
    else if (req.files?.pptFile?.[0]) {
      media_url = await uploadToCloudinary(req.files.pptFile[0].buffer, "auto");
      media_type = "ppt";
    }

    const id = `LE_${Date.now()}`;
    const sql = `
  INSERT INTO lessons 
  (id, chapter_id, title, duration, media_url, media_type) 
  VALUES (?, ?, ?, ?, ?, ?)
`;
db.query(sql, [id, chapter_id, title, duration || null, media_url, media_type], (err) => {
  if (err) return res.status(500).json({ status: "error", message: err });

  // Tạo thông báo cho học sinh đã đăng ký khóa học này
  // Lấy course_id từ chapter_id
  const getCourseSql = `SELECT course_id FROM chapters WHERE id = ?`;
  db.query(getCourseSql, [chapter_id], (err2, courseResults) => {
    if (!err2 && courseResults.length > 0) {
      const course_id = courseResults[0].course_id;
      
      // Lấy danh sách học sinh đã đăng ký và thanh toán khóa học này
      const getStudentsSql = `
        SELECT DISTINCT user_id FROM user_courses 
        WHERE course_id = ? AND status = 'paid'
      `;
      db.query(getStudentsSql, [course_id], (err3, studentResults) => {
        if (!err3 && studentResults.length > 0) {
          // Lấy tên khóa học
          const getCourseNameSql = `SELECT title FROM courses WHERE id = ?`;
          db.query(getCourseNameSql, [course_id], (err4, courseNameResults) => {
            const courseName = courseNameResults[0]?.title || 'khóa học';
            
            // Tạo thông báo cho từng học sinh
            studentResults.forEach(student => {
              createNotification(student.user_id, {
                type: 'new_lesson',
                title: 'Bài học mới',
                message: `Khóa học "${courseName}" có bài học mới: "${title}"`,
                related_id: id,
                related_type: 'lesson'
              }, (notifErr) => {
                if (notifErr) {
                  console.error("❌ Lỗi tạo thông báo bài học mới:", notifErr);
                }
              });
            });
          });
        }
      });
    }
  });

  res.json({
    status: "success",
    data: { id, chapter_id, title, duration, media_url, media_type }
  });
});
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};


// ==========================
// TẠO EXERCISE
// ==========================
exports.createLessonExercise = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền tạo exercise" });
    }

    const { lesson_id, type, question, options, answer, image } = req.body;
    if (!lesson_id || !type || !question) 
      return res.status(400).json({ status: "error", message: "Thiếu thông tin" });

    // Validate exercise type
    const validTypes = ['multiple_choice', 'fill_blank', 'essay', 'matching'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ status: "error", message: "Loại exercise không hợp lệ. Phải là: multiple_choice, fill_blank, essay hoặc matching" });
    }

    // For multiple_choice, options là bắt buộc (object hoặc array với dữ liệu)
    if (type === 'multiple_choice') {
      if (!options) {
        return res.status(400).json({ status: "error", message: "multiple_choice phải có options" });
      }
      
      // Validate object format {a: "...", b: "...", c: "...", d: "..."}
      if (typeof options === 'object' && !Array.isArray(options)) {
        const optionValues = Object.values(options).filter(v => v && String(v).trim() !== '');
        if (optionValues.length === 0) {
          return res.status(400).json({ status: "error", message: "multiple_choice phải có ít nhất 1 option" });
        }
      } 
      // Validate array format
      else if (Array.isArray(options)) {
        const optionValues = options.filter(v => v && String(v).trim() !== '');
        if (optionValues.length === 0) {
          return res.status(400).json({ status: "error", message: "multiple_choice phải có ít nhất 1 option" });
        }
      } else {
        return res.status(400).json({ status: "error", message: "multiple_choice options phải là object hoặc array" });
      }
    }

    // For matching, options và answer là bắt buộc (filter out empty strings)
    if (type === 'matching') {
      const leftItems = Array.isArray(options) ? options.filter(o => o && String(o).trim() !== '') : [];
      const rightItems = Array.isArray(answer) ? answer.filter(a => a && String(a).trim() !== '') : [];
      
      if (leftItems.length === 0 || rightItems.length === 0) {
        return res.status(400).json({ status: "error", message: "Matching phải có ít nhất 1 cặp nối (không được để trống)" });
      }
      
      // Update với dữ liệu đã filter
      req.body.options = leftItems;
      req.body.answer = rightItems;
    }

    // Chuyển options sang JSON nếu có
    const optionsJson = options ? JSON.stringify(options) : null;
    const answerJson = answer && typeof answer === 'object' ? JSON.stringify(answer) : answer;

    const sql = `
      INSERT INTO lesson_exercises 
      (lesson_id, type, question, options, answer, image, timestamp) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const timestamp = req.body.timestamp || 0;
    db.query(sql, [lesson_id, type, question, optionsJson, answerJson || null, image || null, timestamp], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ status: "error", message: "Lỗi tạo exercise", error: err.message });
      }

      res.json({
        status: "success",
        message: "Tạo exercise thành công",
        data: { 
          id: result.insertId, 
          lesson_id, 
          type, 
          question, 
          options: options || null, 
          answer: answer || null, 
          image: image || null,
          timestamp: timestamp
        }
      });
    });

  } catch (error) {
    console.error("Token error:", error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// LẤY EXERCISE THEO LESSON
// ==========================
exports.getExercisesByLesson = (req, res) => {
  const { lesson_id } = req.params;
  const sql = "SELECT * FROM lesson_exercises WHERE lesson_id = ?";
  
  db.query(sql, [lesson_id], (err, results) => {
    if (err) return res.status(500).json({ status: "error", message: err });

    const parsed = results.map(r => ({
      id: r.id,
      lesson_id: r.lesson_id,
      type: r.type,
      question: r.question,
      options: r.options ? JSON.parse(r.options) : null,
      answer: r.answer ? (r.type === 'matching' ? JSON.parse(r.answer) : r.answer) : null,
      image: r.image || null,
      timestamp: r.timestamp || 0
    }));

    // Nếu chỉ có 1 exercise, trả về object thay vì mảng
    const data = parsed.length === 1 ? parsed[0] : parsed;

    res.json({ status: "success", data });
  });
};

// ==========================
// CẬP NHẬT EXERCISE
// ==========================
exports.updateLessonExercise = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền cập nhật exercise" });
    }

    const { exercise_id } = req.params;
    const { type, question, options, answer, image } = req.body;

    if (!type || !question) 
      return res.status(400).json({ status: "error", message: "Thiếu thông tin" });

    // Validate exercise type
    const validTypes = ['multiple_choice', 'fill_blank', 'essay', 'matching'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ status: "error", message: "Loại exercise không hợp lệ" });
    }

    // For multiple_choice, options là bắt buộc (object hoặc array với dữ liệu)
    if (type === 'multiple_choice') {
      if (!options) {
        return res.status(400).json({ status: "error", message: "multiple_choice phải có options" });
      }
      
      // Validate object format {a: "...", b: "...", c: "...", d: "..."}
      if (typeof options === 'object' && !Array.isArray(options)) {
        const optionValues = Object.values(options).filter(v => v && String(v).trim() !== '');
        if (optionValues.length === 0) {
          return res.status(400).json({ status: "error", message: "multiple_choice phải có ít nhất 1 option" });
        }
      } 
      // Validate array format
      else if (Array.isArray(options)) {
        const optionValues = options.filter(v => v && String(v).trim() !== '');
        if (optionValues.length === 0) {
          return res.status(400).json({ status: "error", message: "multiple_choice phải có ít nhất 1 option" });
        }
      } else {
        return res.status(400).json({ status: "error", message: "multiple_choice options phải là object hoặc array" });
      }
    }

    // For matching, options và answer là bắt buộc (filter out empty strings)
    if (type === 'matching') {
      const leftItems = Array.isArray(options) ? options.filter(o => o && String(o).trim() !== '') : [];
      const rightItems = Array.isArray(answer) ? answer.filter(a => a && String(a).trim() !== '') : [];
      
      if (leftItems.length === 0 || rightItems.length === 0) {
        return res.status(400).json({ status: "error", message: "Matching phải có ít nhất 1 cặp nối (không được để trống)" });
      }
      
      // Update với dữ liệu đã filter
      req.body.options = leftItems;
      req.body.answer = rightItems;
    }

    const optionsJson = options ? JSON.stringify(options) : null;
    const answerJson = answer && typeof answer === 'object' ? JSON.stringify(answer) : answer;
    const timestamp = req.body.timestamp || 0;

    const sql = `
      UPDATE lesson_exercises 
      SET type = ?, question = ?, options = ?, answer = ?, image = ?, timestamp = ?
      WHERE id = ?
    `;
    db.query(sql, [type, question, optionsJson, answerJson || null, image || null, timestamp, exercise_id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ status: "error", message: "Lỗi cập nhật exercise", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ status: "error", message: "Exercise không tồn tại" });
      }

      res.json({
        status: "success",
        message: "Cập nhật exercise thành công",
        data: { id: exercise_id, type, question, options: options || null, answer: answer || null, image: image || null, timestamp }
      });
    });

  } catch (error) {
    console.error("Token error:", error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// XÓA EXERCISE
// ==========================
exports.deleteLessonExercise = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền xóa exercise" });
    }

    const { exercise_id } = req.params;
    const sql = "DELETE FROM lesson_exercises WHERE id = ?";

    db.query(sql, [exercise_id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ status: "error", message: "Lỗi xóa exercise", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ status: "error", message: "Exercise không tồn tại" });
      }

      res.json({ status: "success", message: "Xóa exercise thành công" });
    });

  } catch (error) {
    console.error("Token error:", error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// LẤY LESSON THEO CHAPTER
// ==========================
exports.getLessonsByChapter = (req, res) => {
  const { chapter_id } = req.params;
  const user_id = req.user?.id;
  const user_role = req.user?.role;

  // ✅ Kiểm tra user_id
  if (!user_id) {
    console.error("❌ Không có user_id, req.user:", req.user);
    return res.status(401).json({ status: "error", message: "Chưa xác thực, vui lòng đăng nhập" });
  }

  // 1️⃣ Lấy course_id từ chapter
  const getCourseSql = `SELECT course_id FROM chapters WHERE id = ?`;
  db.query(getCourseSql, [chapter_id], (err, courseResults) => {
    if (err || courseResults.length === 0) {
      console.error("❌ Chapter không tồn tại:", chapter_id);
      return res.status(404).json({ status: "error", message: "Chapter không tồn tại" });
    }

    const course_id = courseResults[0].course_id;

    // ✅ Teacher: kiểm tra nếu là tác giả course
    // ✅ Student: kiểm tra enrollment + payment
    if (user_role === 'teacher') {
      console.log(`🔍 Teacher ${user_id} accessing chapter ${chapter_id} of course ${course_id}`);
      // Kiểm tra teacher có tạo course này không
      db.query("SELECT id FROM courses WHERE id = ? AND teacher = ?", [course_id, user_id], (err2, results) => {
        if (err2) {
          console.error("❌ Lỗi kiểm tra course:", err2);
          return res.status(500).json({ status: "error", message: "Lỗi kiểm tra quyền" });
        }
        if (results.length === 0) {
          console.warn(`⚠️ Teacher ${user_id} không phải tác giả course ${course_id}`);
          return res.status(403).json({ status: "error", message: "Bạn không phải tác giả của khóa học này" });
        }
        console.log(`✅ Teacher ${user_id} authorized`);
        fetchLessons();
      });
    } else {
      // Student: kiểm tra enrollment
      const checkSql = `
        SELECT uc.status FROM user_courses uc
        WHERE uc.user_id = ? AND uc.course_id = ?
      `;

      db.query(checkSql, [user_id, course_id], (err2, results) => {
        if (err2) {
          console.error("❌ Lỗi kiểm tra quyền:", err2);
          return res.status(500).json({ status: "error", message: "Lỗi kiểm tra quyền" });
        }

        console.log("🔍 chapter_id:", chapter_id, "user_id:", user_id, "course_id:", course_id, "results:", results);

        // Không tìm thấy enrollment hoặc status không phải 'paid'
        if (results.length === 0 || results[0].status !== "paid") {
          const errorMsg = results.length === 0 
            ? "Bạn chưa đăng ký khóa học này" 
            : `Bạn chưa thanh toán (trạng thái: ${results[0].status})`;
          
          console.warn("⚠️ Không có quyền:", errorMsg);
          return res.status(403).json({
            status: "error",
            message: errorMsg,
          });
        }
        console.log(`✅ Student ${user_id} authorized for course ${course_id}`);
        fetchLessons();
      });
    }

    function fetchLessons() {
      const sql = "SELECT * FROM lessons WHERE chapter_id = ? ORDER BY created_at ASC";
      db.query(sql, [chapter_id], (err3, results) => {
        if (err3) return res.status(500).json({ status: "error", message: err3 });

        const data = results.map(r => ({
          id: r.id,
          chapter_id: r.chapter_id,
          title: r.title,
          duration: r.duration,
          media_url: r.media_url,   // ✅ bây giờ sẽ có dữ liệu
          media_type: r.media_type,
          created_at: r.created_at
        }));

        res.json({ status: "success", data });
      });
    }
  });
};


// ==========================
// LẤY THÔNG TIN LESSON THEO ID
// ==========================
exports.getLessonById = (req, res) => {
  const { lesson_id } = req.params;

  const sqlLesson = `
    SELECT l.*, c.course_id 
    FROM lessons l
    INNER JOIN chapters c ON l.chapter_id = c.id
    WHERE l.id = ?
  `;
  db.query(sqlLesson, [lesson_id], (errLesson, lessons) => {
    if (errLesson) return res.status(500).json({ status: "error", message: errLesson });
    if (lessons.length === 0) return res.status(404).json({ status: "error", message: "Lesson không tồn tại" });

    const lesson = lessons[0];

    // Lấy exercises kèm theo lesson
    const sqlExercises = "SELECT * FROM lesson_exercises WHERE lesson_id = ?";
    db.query(sqlExercises, [lesson_id], (errEx, exercises) => {
      if (errEx) return res.status(500).json({ status: "error", message: errEx });

      const parsedExercises = exercises.map(ex => ({
        id: ex.id,
        lesson_id: ex.lesson_id,
        type: ex.type,
        question: ex.question,
        options: ex.options ? JSON.parse(ex.options) : null,
        answer: ex.answer,
        image: ex.image || null,
      }));

      res.json({
        status: "success",
        data: {
          id: lesson.id,
          chapter_id: lesson.chapter_id,
          course_id: lesson.course_id,
          title: lesson.title,
          duration: lesson.duration,
          media_url: lesson.media_url,
          media_type: lesson.media_type,
          created_at: lesson.created_at,
          exercises: parsedExercises
        },
      });
    });
  });
};


// ==========================
// GHI ĐIỂM BÀI HỌC (STUDENT)
// ==========================
exports.createLessonScore = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { lesson_id, total_score, comment, details, exercises } = req.body;
    if (!lesson_id || total_score == null) return res.status(400).json({ status: "error", message: "Thiếu thông tin" });

    const student_id = decoded.id;

    // Kiểm tra xem có bài essay cần giáo viên chấm không
    let needsGrading = false;
    if (Array.isArray(exercises)) {
      needsGrading = exercises.some(ex => ex.type === 'essay');
    }

    // Nếu có essay, status = 'pending', ngược lại = 'auto_graded'
    const status = needsGrading ? 'pending' : 'auto_graded';

    const sql = "INSERT INTO lesson_score_comments (lesson_id, student_id, total_score, comment, status) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [lesson_id, student_id, total_score, comment || null, status], (err, result) => {
      if (err) {
        console.error("❌ Lỗi tạo lesson_score:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
      }

      const scoreCommentId = result.insertId;

      if (Array.isArray(details) && details.length > 0) {
        const sqlDetails = "INSERT INTO lesson_score_details (lesson_score_comment_id, lesson_exercise_id, student_answer, score) VALUES ?";
        const values = details.map(d => [scoreCommentId, d.lesson_exercise_id, d.student_answer || null, d.score || null]);
        db.query(sqlDetails, [values], (err2) => {
          if (err2) {
            console.error("❌ Lỗi tạo lesson_score_details:", err2);
            return res.status(500).json({ status: "error", message: "Lỗi server", error: err2.message });
          }
          res.json({ 
            status: "success", 
            data: { 
              scoreCommentId, 
              details,
              needsGrading,
              message: needsGrading 
                ? "Bài nộp của bạn đã được gửi và đang chờ giáo viên chấm điểm" 
                : "Đã nộp bài thành công"
            } 
          });
        });
      } else {
        res.json({ 
          status: "success", 
          data: { 
            scoreCommentId,
            needsGrading,
            message: needsGrading 
              ? "Bài nộp của bạn đã được gửi và đang chờ giáo viên chấm điểm" 
              : "Đã nộp bài thành công"
          } 
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// LẤY TOÀN BỘ NỘI DUNG COURSE + ĐIỂM HỌC SINH
// ==========================
exports.getCourseContent = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    const { course_id } = req.params;
    if (!course_id) return res.status(400).json({ status: "error", message: "Thiếu course_id" });

    const sqlChapters = "SELECT * FROM chapters WHERE course_id = ? ORDER BY created_at ASC";
    db.query(sqlChapters, [course_id], (errChapters, chapters) => {
      if (errChapters) return res.status(500).json({ status: "error", message: errChapters });
      if (chapters.length === 0) return res.json({ status: "success", data: [] });

      const chapterIds = chapters.map(ch => ch.id);
      const sqlLessons = "SELECT * FROM lessons WHERE chapter_id IN (?) ORDER BY created_at ASC";
      db.query(sqlLessons, [chapterIds], (errLessons, lessons) => {
        if (errLessons) return res.status(500).json({ status: "error", message: errLessons });

        const lessonIds = lessons.map(l => l.id);
        if (lessonIds.length === 0) {
          const result = chapters.map(ch => ({ ...ch, lessons: [] }));
          return res.json({ status: "success", data: result });
        }

        const sqlExercises = "SELECT * FROM lesson_exercises WHERE lesson_id IN (?)";
        db.query(sqlExercises, [lessonIds], (errExercises, exercises) => {
          if (errExercises) return res.status(500).json({ status: "error", message: errExercises });

          const parsedExercises = exercises.map(ex => ({ ...ex, options: ex.options ? JSON.parse(ex.options) : null }));

          const sqlScores = `
            SELECT lsd.lesson_score_comment_id, lsd.lesson_exercise_id, lsd.student_answer, lsd.score, lsc.lesson_id
            FROM lesson_score_details lsd
            JOIN lesson_score_comments lsc ON lsd.lesson_score_comment_id = lsc.id
            WHERE lsc.student_id = ? AND lsc.lesson_id IN (?)
          `;
          db.query(sqlScores, [studentId, lessonIds], (errScores, scores) => {
            if (errScores) return res.status(500).json({ status: "error", message: errScores });

            const exercisesWithScore = parsedExercises.map(ex => {
              const scoreObj = scores.find(s => s.lesson_exercise_id === ex.id);
              return { ...ex, student_score: scoreObj ? scoreObj.score : null, student_answer: scoreObj ? scoreObj.student_answer : null };
            });

            const lessonsWithExercises = lessons.map(l => ({
              ...l,
              exercises: exercisesWithScore.filter(ex => ex.lesson_id === l.id)
            }));

            const result = chapters.map(ch => ({
              ...ch,
              lessons: lessonsWithExercises.filter(l => l.chapter_id === ch.id)
            }));

            res.json({ status: "success", data: result });
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};


// ==========================
// SỬA CHAPTER
// ==========================
exports.updateChapter = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền sửa chapter" });
    }

    const { chapter_id } = req.params;
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ status: "error", message: "Thiếu tiêu đề" });

    const sql = "UPDATE chapters SET title = ?, description = ? WHERE id = ?";
    db.query(sql, [title, description || null, chapter_id], (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: err });
      if (result.affectedRows === 0) return res.status(404).json({ status: "error", message: "Chapter không tồn tại" });

      res.json({ status: "success", message: "Cập nhật chapter thành công" });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// XOÁ CHAPTER
// ==========================
exports.deleteChapter = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền xoá chapter" });
    }

    const { chapter_id } = req.params;
    const sql = "DELETE FROM chapters WHERE id = ?";
    db.query(sql, [chapter_id], (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: err });
      if (result.affectedRows === 0) return res.status(404).json({ status: "error", message: "Chapter không tồn tại" });

      res.json({ status: "success", message: "Xoá chapter thành công" });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// SỬA LESSON
// ==========================
exports.updateLesson = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền sửa lesson" });
    }

    const { lesson_id } = req.params;
    const { title, duration } = req.body;

    const sql = "UPDATE lessons SET title = ?, duration = ? WHERE id = ?";
    db.query(sql, [title, duration || null, lesson_id], (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: err });
      if (result.affectedRows === 0) return res.status(404).json({ status: "error", message: "Lesson không tồn tại" });

      res.json({ status: "success", message: "Cập nhật lesson thành công" });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// XOÁ LESSON
// ==========================
exports.deleteLesson = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền xoá lesson" });
    }

    const { lesson_id } = req.params;
    const sql = "DELETE FROM lessons WHERE id = ?";
    db.query(sql, [lesson_id], (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: err });
      if (result.affectedRows === 0) return res.status(404).json({ status: "error", message: "Lesson không tồn tại" });

      res.json({ status: "success", message: "Xoá lesson thành công" });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// CẬP NHẬT TIẾN ĐỘ BƯỚC HỌC
// ==========================
exports.updateLessonProgress = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ status: "error", message: "Thiếu token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    if (decoded.role !== "student") {
      return res.status(403).json({ status: "error", message: "Chỉ học viên mới có thể cập nhật tiến độ" });
    }

    const { lesson_id, course_id, progress_type } = req.body;
    // progress_type: 'video_watched' (50%) hoặc 'exercises_completed' (100%)

    if (!lesson_id || !course_id || !progress_type) {
      return res.status(400).json({ status: "error", message: "Thiếu thông tin (lesson_id, course_id, progress_type)" });
    }

    const validTypes = ['video_watched', 'exercises_completed'];
    if (!validTypes.includes(progress_type)) {
      return res.status(400).json({ status: "error", message: "progress_type phải là 'video_watched' hoặc 'exercises_completed'" });
    }

    // Kiểm tra học viên đã đăng ký và thanh toán course này chưa
    const checkSql = `
      SELECT id FROM user_courses 
      WHERE user_id = ? AND course_id = ? AND status = 'paid'
    `;

    db.query(checkSql, [user_id, course_id], (err, checkResults) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra enrollment:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server" });
      }

      if (checkResults.length === 0) {
        return res.status(403).json({ status: "error", message: "Bạn chưa đăng ký hoặc chưa thanh toán khóa học này" });
      }

      // Tính progress_percentage
      let progress_percentage = 0;
      let updateFields = {};

      if (progress_type === 'video_watched') {
        progress_percentage = 50; // Xem video = 50%
        updateFields.video_watched = true;
      } else if (progress_type === 'exercises_completed') {
        progress_percentage = 100; // Hoàn thành exercise = 100%
        updateFields.exercises_completed = true;
        updateFields.video_watched = true; // Giả định đã xem video
      }

      // Upsert vào lesson_progress
      const upsertSql = `
        INSERT INTO lesson_progress 
        (user_id, lesson_id, course_id, video_watched, exercises_completed, progress_percentage)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        ${Object.keys(updateFields).map(key => `${key} = VALUES(${key})`).join(', ')},
        progress_percentage = VALUES(progress_percentage),
        updated_at = NOW()
      `;
      const values = [
        user_id,
        lesson_id,
        course_id,
        progress_type === 'exercises_completed' ? 1 : (progress_type === 'video_watched' ? 1 : 0),
        progress_type === 'exercises_completed' ? 1 : 0,
        progress_percentage
      ];

      db.query(upsertSql, values, (err2, upsertResult) => {
        if (err2) {
          console.error("❌ Lỗi cập nhật progress:", err2);
          // Nếu table chưa tồn tại, tạo bảng và thử lại
          if (err2.code === 'ER_NO_SUCH_TABLE') {
            const createTableSql = `
              CREATE TABLE IF NOT EXISTS lesson_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                lesson_id VARCHAR(20) NOT NULL,
                course_id INT NOT NULL,
                video_watched BOOLEAN DEFAULT FALSE,
                exercises_completed BOOLEAN DEFAULT FALSE,
                progress_percentage INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_lesson (user_id, lesson_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
              )
            `;
            
            db.query(createTableSql, (err3) => {
              if (err3) {
                console.error("❌ Lỗi tạo bảng:", err3);
                return res.status(500).json({ status: "error", message: "Lỗi tạo cơ sở dữ liệu" });
              }

              // Thử lại insert
              db.query(upsertSql, values, (err4) => {
                if (err4) {
                  console.error("❌ Lỗi insert sau khi tạo bảng:", err4);
                  return res.status(500).json({ status: "error", message: "Lỗi cập nhật tiến độ" });
                }

                // Cập nhật course progress tổng thể
                updateCourseProgress(user_id, course_id, res);
              });
            });
          } else {
            return res.status(500).json({ status: "error", message: "Lỗi cập nhật tiến độ", details: err2.message });
          }
        } else {
          console.log(`✅ Cập nhật progress cho user ${user_id}, lesson ${lesson_id}: ${progress_type}`);
          // Cập nhật course progress tổng thể
          updateCourseProgress(user_id, course_id, res);
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// Helper function: Cập nhật course progress dựa trên lesson progress
function updateCourseProgress(user_id, course_id, res) {
  console.log(`📊 updateCourseProgress: user_id=${user_id}, course_id=${course_id}`);
  
  const courseSql = `
    SELECT COUNT(*) as total_lessons FROM lessons l
    INNER JOIN chapters c ON l.chapter_id = c.id
    WHERE c.course_id = ?
  `;

  db.query(courseSql, [course_id], (err1, courseResults) => {
    if (err1) {
      console.error("❌ Lỗi lấy số lessons:", err1);
      return res.status(500).json({ status: "error", message: "Lỗi tính toán tiến độ" });
    }

    const total_lessons = courseResults[0]?.total_lessons || 0;
    console.log(`📚 Tổng số lessons: ${total_lessons}`);
    
    if (total_lessons === 0) {
      return res.json({ status: "success", message: "Cập nhật tiến độ thành công", progress: 0 });
    }

    const progressSql = `
      SELECT COUNT(*) as completed_lessons FROM lesson_progress
      WHERE user_id = ? AND course_id = ? AND exercises_completed = TRUE
    `;

    db.query(progressSql, [user_id, course_id], (err2, progressResults) => {
      if (err2) {
        console.error("❌ Lỗi tính tiến độ:", err2);
        return res.status(500).json({ status: "error", message: "Lỗi tính toán tiến độ" });
      }

      const completed_lessons = progressResults[0]?.completed_lessons || 0;
      const course_progress = Math.round((completed_lessons / total_lessons) * 100);

      console.log(`✏️  Completed: ${completed_lessons}/${total_lessons} = ${course_progress}%`);

      // Cập nhật progress vào user_courses
      const updateCourseSql = `
        UPDATE user_courses SET progress = ? WHERE user_id = ? AND course_id = ?
      `;

      db.query(updateCourseSql, [course_progress, user_id, course_id], (err3) => {
        if (err3) {
          console.error("❌ Lỗi cập nhật user_courses progress:", err3);
          // Nếu column progress chưa tồn tại, thêm column
          if (err3.code === 'ER_BAD_FIELD_ERROR') {
            const addColumnSql = `
              ALTER TABLE user_courses 
              ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0
            `;

            db.query(addColumnSql, (err4) => {
              if (err4) {
                console.error("❌ Lỗi thêm column progress:", err4);
                return res.json({
                  status: "success",
                  message: "Cập nhật tiến độ thành công",
                  progress: course_progress,
                  warning: "Chưa cập nhật được progress tổng khóa học"
                });
              }

              // Thử lại update
              db.query(updateCourseSql, [course_progress, user_id, course_id], (err5) => {
                if (err5) {
                  console.error("❌ Lỗi cập nhật sau khi thêm column:", err5);
                  return res.json({
                    status: "success",
                    message: "Cập nhật tiến độ thành công",
                    progress: course_progress,
                    warning: "Chưa cập nhật được progress tổng khóa học"
                  });
                }

                return res.json({
                  status: "success",
                  message: "Cập nhật tiến độ thành công",
                  progress: course_progress
                });
              });
            });
          } else {
            return res.json({
              status: "success",
              message: "Cập nhật tiến độ thành công",
              progress: course_progress,
              warning: "Chưa cập nhật được progress tổng khóa học"
            });
          }
        } else {
          console.log(`✅ Cập nhật course progress cho user ${user_id}: ${course_progress}%`);
          return res.json({
            status: "success",
            message: "Cập nhật tiến độ thành công",
            progress: course_progress
          });
        }
      });
    });
  });
};

// ==========================
// LẤY TIẾN ĐỘ BÀI HỌC CỦA HỌC SINH
// ==========================
exports.getLessonProgress = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ status: "error", message: "Thiếu token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    if (decoded.role !== "student") {
      return res.status(403).json({ status: "error", message: "Chỉ học viên mới có thể xem tiến độ" });
    }

    const { lesson_id } = req.params;
    if (!lesson_id) {
      return res.status(400).json({ status: "error", message: "Thiếu lesson_id" });
    }

    const sql = `
      SELECT 
        id,
        user_id,
        lesson_id,
        course_id,
        video_watched,
        exercises_completed,
        progress_percentage,
        created_at,
        updated_at
      FROM lesson_progress
      WHERE user_id = ? AND lesson_id = ?
      LIMIT 1
    `;

    db.query(sql, [user_id, lesson_id], (err, results) => {
      if (err) {
        console.error("❌ Lỗi lấy tiến độ:", err);
        // Nếu table chưa tồn tại, trả về progress mặc định
        if (err.code === 'ER_NO_SUCH_TABLE') {
          return res.json({
            status: "success",
            data: {
              video_watched: false,
              exercises_completed: false,
              progress_percentage: 0,
              lesson_id: lesson_id
            }
          });
        }
        return res.status(500).json({ status: "error", message: "Lỗi server" });
      }

      if (results.length === 0) {
        // Chưa có tiến độ nào
        return res.json({
          status: "success",
          data: {
            video_watched: false,
            exercises_completed: false,
            progress_percentage: 0,
            lesson_id: lesson_id
          }
        });
      }

      const progress = results[0];
      return res.json({
        status: "success",
        data: {
          id: progress.id,
          lesson_id: progress.lesson_id,
          course_id: progress.course_id,
          video_watched: progress.video_watched ? true : false,
          exercises_completed: progress.exercises_completed ? true : false,
          progress_percentage: progress.progress_percentage,
          created_at: progress.created_at,
          updated_at: progress.updated_at
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
}

// ==========================
// LẤY DANH SÁCH BÀI NỘP CẦN CHẤM (TEACHER)
// ==========================
exports.getPendingSubmissions = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Chỉ giáo viên mới có quyền xem bài nộp" });
    }

    const teacher_id = decoded.id;

    // Lấy tất cả bài nộp pending từ các course mà giáo viên này dạy
    const sql = `
      SELECT 
        lsc.id,
        lsc.lesson_id,
        lsc.student_id,
        lsc.total_score,
        lsc.comment,
        lsc.status,
        lsc.created_at,
        l.title as lesson_title,
        c.id as course_id,
        c.title as course_title,
        u.name as student_name,
        u.email as student_email
      FROM lesson_score_comments lsc
      INNER JOIN lessons l ON lsc.lesson_id = l.id
      INNER JOIN chapters ch ON l.chapter_id = ch.id
      INNER JOIN courses c ON ch.course_id = c.id
      INNER JOIN users u ON lsc.student_id = u.id
      WHERE c.teacher = ? AND lsc.status = 'pending'
      ORDER BY lsc.created_at DESC
    `;

    db.query(sql, [teacher_id], (err, results) => {
      if (err) {
        console.error("❌ Lỗi lấy danh sách bài nộp:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
      }

      // Lấy chi tiết bài tập cho mỗi submission
      if (results.length === 0) {
        return res.json({ status: "success", data: [] });
      }

      const submissionIds = results.map(r => r.id);
      const detailsSql = `
        SELECT 
          lsd.*,
          le.type as exercise_type,
          le.question as exercise_question,
          le.options as exercise_options
        FROM lesson_score_details lsd
        INNER JOIN lesson_exercises le ON lsd.lesson_exercise_id = le.id
        WHERE lsd.lesson_score_comment_id IN (?)
      `;

      db.query(detailsSql, [submissionIds], (err2, details) => {
        if (err2) {
          console.error("❌ Lỗi lấy chi tiết bài nộp:", err2);
          return res.status(500).json({ status: "error", message: "Lỗi server", error: err2.message });
        }

        // Nhóm details theo submission_id
        const detailsMap = {};
        details.forEach(d => {
          if (!detailsMap[d.lesson_score_comment_id]) {
            detailsMap[d.lesson_score_comment_id] = [];
          }
          detailsMap[d.lesson_score_comment_id].push({
            id: d.id,
            exercise_id: d.lesson_exercise_id,
            exercise_type: d.exercise_type,
            exercise_question: d.exercise_question,
            exercise_options: d.exercise_options ? JSON.parse(d.exercise_options) : null,
            student_answer: d.student_answer,
            score: d.score,
            teacher_score: d.teacher_score,
            teacher_comment: d.teacher_comment
          });
        });

        // Gắn details vào mỗi submission
        const submissions = results.map(sub => ({
          id: sub.id,
          lesson_id: sub.lesson_id,
          lesson_title: sub.lesson_title,
          course_id: sub.course_id,
          course_title: sub.course_title,
          student: {
            id: sub.student_id,
            name: sub.student_name,
            email: sub.student_email
          },
          total_score: sub.total_score,
          comment: sub.comment,
          status: sub.status,
          created_at: sub.created_at,
          details: detailsMap[sub.id] || []
        }));

        res.json({ status: "success", data: submissions });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// CHẤM ĐIỂM BÀI NỘP (TEACHER)
// ==========================
exports.gradeSubmission = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher") {
      return res.status(403).json({ status: "error", message: "Chỉ giáo viên mới có quyền chấm điểm" });
    }

    const teacher_id = decoded.id;
    const { submission_id, total_score, teacher_comment, details } = req.body;

    if (!submission_id || total_score == null) {
      return res.status(400).json({ status: "error", message: "Thiếu thông tin submission_id hoặc total_score" });
    }

    // Kiểm tra submission có tồn tại và thuộc course của giáo viên này không
    const checkSql = `
      SELECT lsc.*, c.teacher as course_teacher, lsc.student_id
      FROM lesson_score_comments lsc
      INNER JOIN lessons l ON lsc.lesson_id = l.id
      INNER JOIN chapters ch ON l.chapter_id = ch.id
      INNER JOIN courses c ON ch.course_id = c.id
      WHERE lsc.id = ?
    `;

    db.query(checkSql, [submission_id], (err, results) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra submission:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: "error", message: "Không tìm thấy bài nộp" });
      }

      const submission = results[0];
      if (submission.course_teacher != teacher_id) {
        return res.status(403).json({ status: "error", message: "Bạn không có quyền chấm bài nộp này" });
      }

      if (submission.status !== 'pending') {
        return res.status(400).json({ status: "error", message: "Bài nộp này đã được chấm rồi" });
      }

      // Cập nhật lesson_score_comments
      const updateSql = `
        UPDATE lesson_score_comments 
        SET total_score = ?, teacher_comment = ?, status = 'graded', teacher_graded_at = NOW()
        WHERE id = ?
      `;

      db.query(updateSql, [total_score, teacher_comment || null, submission_id], (err2) => {
        if (err2) {
          console.error("❌ Lỗi cập nhật submission:", err2);
          return res.status(500).json({ status: "error", message: "Lỗi server", error: err2.message });
        }

        // Cập nhật chi tiết điểm cho từng bài tập (nếu có)
        if (Array.isArray(details) && details.length > 0) {
          let updateCount = 0;
          const updatePromises = details.map(detail => {
            return new Promise((resolve, reject) => {
              const detailSql = `
                UPDATE lesson_score_details 
                SET teacher_score = ?, teacher_comment = ?
                WHERE lesson_score_comment_id = ? AND lesson_exercise_id = ?
              `;
              db.query(detailSql, [
                detail.teacher_score || null,
                detail.teacher_comment || null,
                submission_id,
                detail.exercise_id
              ], (err3) => {
                if (err3) {
                  console.error("❌ Lỗi cập nhật detail:", err3);
                  reject(err3);
                } else {
                  updateCount++;
                  resolve();
                }
              });
            });
          });

          Promise.all(updatePromises).then(() => {
            // Tạo thông báo cho học sinh
            createNotification(submission.student_id, {
              type: 'grading',
              title: 'Bài tập đã được chấm điểm',
              message: `Giáo viên đã chấm điểm bài tập của bạn. Điểm số: ${total_score}/10`,
              related_id: submission_id,
              related_type: 'lesson_score'
            }, (notifErr) => {
              if (notifErr) {
                console.error("❌ Lỗi tạo thông báo:", notifErr);
              }
            });

            res.json({ 
              status: "success", 
              message: "Chấm điểm thành công",
              data: { submission_id, total_score, details_updated: updateCount }
            });
          }).catch((promiseErr) => {
            console.error("❌ Lỗi cập nhật details:", promiseErr);
            return res.status(500).json({ status: "error", message: "Lỗi cập nhật chi tiết điểm" });
          });
        } else {
          // Tạo thông báo cho học sinh
          createNotification(submission.student_id, {
            type: 'grading',
            title: 'Bài tập đã được chấm điểm',
            message: `Giáo viên đã chấm điểm bài tập của bạn. Điểm số: ${total_score}/10`,
            related_id: submission_id,
            related_type: 'lesson_score'
          }, (notifErr) => {
            if (notifErr) {
              console.error("❌ Lỗi tạo thông báo:", notifErr);
            }
          });

          res.json({ 
            status: "success", 
            message: "Chấm điểm thành công",
            data: { submission_id, total_score }
          });
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// Helper function để tạo notification
function createNotification(user_id, notificationData, callback) {
  const { type, title, message, related_id, related_type } = notificationData;
  
  const sql = `
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, type, title, message, related_id || null, related_type || null], (err) => {
    if (callback) callback(err);
  });
}
