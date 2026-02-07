const db = require("../config/db.js");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // lưu tạm trong RAM

// -------------------------
// Tạo course
// -------------------------
exports.createCourse = [
  upload.single("imageFile"),
  async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ status: "error", message: "Thiếu token" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const teacherId = decoded.id;
      if (!teacherId || decoded.role !== "teacher") {
        return res.status(403).json({ status: "error", message: "Bạn không có quyền tạo khóa học" });
      }

      const {
        title,
        subject,
        grade,
        duration,
        students,
        rating,
        price,
        progress,
        is_enrolled,
        description,
      } = req.body;

      if (!title || !subject) {
        return res.status(400).json({ status: "error", message: "Thiếu thông tin bắt buộc" });
      }

      // Check trùng
      const checkSql = `SELECT * FROM courses WHERE title = ? AND teacher = ?`;
      db.query(checkSql, [title, teacherId], async (err, results) => {
        if (err) {
          console.error("❌ Lỗi check trùng course:", err);
          return res.status(500).json({ status: "error", message: "Lỗi server khi kiểm tra course", error: err });
        }

        if (results.length > 0)
          return res.status(400).json({ status: "error", message: "Bạn đã có khóa học với tiêu đề này rồi" });

        // Upload ảnh lên Cloudinary nếu có
        let imageUrl = null;
        if (req.file) {
          try {
            const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            const uploadRes = await cloudinary.uploader.upload(dataUri, { folder: "courses" });
            imageUrl = uploadRes.secure_url;
          } catch (uploadErr) {
            console.error("❌ Lỗi upload Cloudinary:", uploadErr);
            // Không dừng tạo course, nhưng log chi tiết
          }
        }

        // Insert vào DB
        const sql = `
          INSERT INTO courses 
          (title, subject, grade, teacher, duration, students, rating, price, progress, is_enrolled, description, image) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            title,
            subject,
            grade,
            teacherId,
            duration,
            students || 0,
            rating || 0,
            price || 0,
            progress || 0,
            is_enrolled || false,
            description,
            imageUrl,
          ],
          (err, result) => {
            if (err) {
              console.error("❌ Lỗi insert course vào DB:", err);
              console.log("Dữ liệu gửi vào DB:", {
                title,
                subject,
                grade,
                teacherId,
                duration,
                students,
                rating,
                price,
                progress,
                is_enrolled,
                description,
                imageUrl,
              });
              return res.status(500).json({ status: "error", message: "Lỗi server khi tạo course", error: err });
            }

            res.json({
              status: "success",
              message: "Tạo course thành công",
              course: {
                id: result.insertId,
                title,
                subject,
                grade,
                teacher: teacherId,
                duration,
                students: students || 0,
                rating: rating || 0,
                price: price || 0,
                progress: progress || 0,
                is_enrolled: is_enrolled || false,
                description,
                image: imageUrl,
              },
            });
          }
        );
      });
    } catch (error) {
      console.error("❌ Lỗi JWT hoặc lỗi khác:", error);
      return res.status(401).json({ status: "error", message: "Token không hợp lệ hoặc lỗi server", error });
    }
  },
];




// -------------------------
// Lấy danh sách course
// -------------------------
exports.getAllCourses = (req, res) => {
  const { page = 1, limit = 12, grade, subject, search } = req.query;
  const offset = (page - 1) * limit;

  let baseSql = `
    SELECT c.*, 
           u.id AS teacher_id, 
           u.name AS teacher_name, 
           u.email AS teacher_email, 
           u.avatar AS teacher_avatar, 
           u.experience AS teacher_experience, 
           u.bio AS teacher_bio
    FROM courses c
    JOIN users u ON c.teacher = u.id
    WHERE 1=1
  `;
  const params = [];

  if (grade) {
    baseSql += " AND c.grade = ?";
    params.push(grade);
  }

  if (subject) {
    baseSql += " AND c.subject LIKE ?";
    params.push(`%${subject}%`);
  }

  if (search) {
    baseSql += " AND (c.title LIKE ? OR c.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  const sqlData = `${baseSql} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const sqlCount = `SELECT COUNT(*) as total FROM (${baseSql}) as sub`;

  db.query(sqlData, params, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi lấy danh sách course:", err);
      return res.status(500).json({
        status: "error",
        message: "Lỗi server khi lấy danh sách course",
      });
    }

    // Convert teacher info thành JSON object
    const formattedResults = results.map((course) => ({
      id: course.id,
      title: course.title,
      subject: course.subject,
      grade: course.grade,
      duration: course.duration,
      students: course.students,
      rating: course.rating,
      price: course.price,
      progress: course.progress,
      is_enrolled: course.is_enrolled,
      description: course.description,
      image: course.image,
      created_at: course.created_at,
      teacher: {
        id: course.teacher_id,
        name: course.teacher_name,
        email: course.teacher_email,
        avatar: course.teacher_avatar,
        experience: course.teacher_experience,
        bio: course.teacher_bio,
      },
    }));

    db.query(sqlCount, params.slice(0, -2), (err2, countResult) => {
      if (err2) {
        console.error("❌ Lỗi khi đếm course:", err2);
        return res.status(500).json({
          status: "error",
          message: "Lỗi server khi đếm course",
        });
      }

      const total = countResult[0].total;
      return res.json({
        status: "success",
        data: formattedResults,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
        },
      });
    });
  });
};


// -------------------------
// Lấy course theo ID
// -------------------------
exports.getCourseById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT c.id, c.title, c.subject, c.grade, c.duration, c.students, c.rating, 
           c.price, c.progress, c.is_enrolled, c.description, c.image, c.created_at,
           u.id AS teacher_id, u.name AS teacher_name, u.email AS teacher_email, 
           u.avatar AS teacher_avatar, u.experience AS teacher_experience, u.bio AS teacher_bio
    FROM courses c
    LEFT JOIN users u ON c.teacher = u.id
    WHERE c.id = ?;
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi lấy course:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Lỗi server khi lấy course" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "Course không tồn tại" });
    }

    // Format dữ liệu trả về
    const formatted = results.map((row) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      grade: row.grade,
      duration: row.duration,
      students: row.students || 0,
      rating: row.rating || 0,
      price: row.price,
      progress: row.progress || 0,
      is_enrolled: row.is_enrolled || 0,
      description: row.description,
      image: row.image,
      created_at: row.created_at,
      teacher: {
        id: row.teacher_id,
        name: row.teacher_name,
        email: row.teacher_email,
        avatar: row.teacher_avatar,
        experience: row.teacher_experience,
        bio: row.teacher_bio,
      },
    }));

    res.json({
      status: "success",
      data: formatted,
      pagination: {
        total: formatted.length,
        page: 1,
        totalPages: 1,
      },
    });
  });
};

// ------------------------
// Cập nhật course
// -------------------------
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    subject,
    grade,
    teacher,
    duration,
    students,
    rating,
    price,
    progress,
    is_enrolled,
    description,
    imageBase64, // 🆕
  } = req.body;

  let imageUrl = null;
  if (imageBase64) {
    try {
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: "courses",
      });
      imageUrl = uploadRes.secure_url;
    } catch (uploadErr) {
      console.error("❌ Lỗi upload Cloudinary:", uploadErr);
    }
  }

  // ✅ Nếu teacher NULL, lấy từ token
  let teacherId = teacher;
  if (!teacherId && req.user?.id) {
    teacherId = req.user.id;
  }

  const sql = `
    UPDATE courses SET 
      title = ?, subject = ?, grade = ?, teacher = ?, duration = ?, 
      students = ?, rating = ?, price = ?, progress = ?, is_enrolled = ?, 
      description = ?, image = COALESCE(?, image)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      subject,
      grade,
      teacherId || null,  // ✅ Nếu vẫn NULL, kiểm tra sau
      duration,
      students,
      rating,
      price,
      progress,
      is_enrolled,
      description,
      imageUrl,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi khi cập nhật course:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Lỗi server khi cập nhật course: " + err.message });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ status: "fail", message: "Course không tồn tại" });
      }
      res.json({
        status: "success",
        message: "Cập nhật course thành công",
      });
    }
  );
};

// -------------------------
// Lấy course theo user (teacher / student)
// -------------------------
// -------------------------
// Lấy course theo user (teacher / student)
// -------------------------
exports.getMyCourses = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ status: "error", message: "Thiếu token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;
    const role = decoded.role;

    let sql = "";
    let params = [];

    if (role === "teacher") {
      // 👉 Giáo viên: lấy course + info chính họ
      sql = `
        SELECT 
          c.*,
          u.id AS teacher_id,
          u.name AS teacher_name,
          u.avatar AS teacher_avatar,
          u.email AS teacher_email,
          u.experience AS teacher_experience,
          u.bio AS teacher_bio
        FROM courses c
        JOIN users u ON c.teacher = u.id
        WHERE c.teacher = ?
        ORDER BY c.created_at DESC
      `;
      params = [userId];

    } else if (role === "student") {
      // 👉 Học sinh: lấy course + payment + info giáo viên
      sql = `
        SELECT 
          c.*,
          p.status AS payment_status,
          uc.progress AS stored_progress,
          u.id AS teacher_id,
          u.name AS teacher_name,
          u.avatar AS teacher_avatar,
          u.email AS teacher_email,
          u.experience AS teacher_experience,
          u.bio AS teacher_bio
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        JOIN users u ON c.teacher = u.id
        LEFT JOIN payments p ON p.enrollment_id = uc.id
        WHERE uc.user_id = ?
        ORDER BY c.created_at DESC
      `;
      params = [userId];

    } else {
      return res.status(403).json({ status: "error", message: "Role không hợp lệ" });
    }

    // Helper function để format course
    const formatCourse = (course, progress, userRole) => ({
      id: course.id,
      title: course.title,
      subject: course.subject,
      grade: course.grade,
      duration: course.duration,
      students: course.students,
      rating: course.rating,
      price: course.price,
      progress: progress,
      is_enrolled: course.is_enrolled,
      description: course.description,
      image: course.image,
      created_at: course.created_at,
      payment_status: course.payment_status || null,
      teacher: {
        id: course.teacher_id,
        name: course.teacher_name,
        email: course.teacher_email,
        avatar: course.teacher_avatar,
        experience: course.teacher_experience,
        bio: course.teacher_bio,
      },
    });

    // Helper function để format và gửi response
    const formatAndSend = (courses, userRole, res) => {
      const formatted = courses.map((course) => {
        const progress = userRole === "student" 
          ? (course.stored_progress || course.progress || 0)
          : (course.progress || 0);
        return formatCourse(course, progress, userRole);
      });

      res.json({
        status: "success",
        data: formatted,
      });
    };

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("❌ Lỗi khi lấy course:", err);
        return res.status(500).json({
          status: "error",
          message: "Lỗi server khi lấy course",
        });
      }

      // Nếu là student, tính toán tiến độ động dựa trên tổng số bài học đã hoàn thành
      if (role === "student" && results.length > 0) {
        const courseIds = results.map(c => c.id);
        
        // Lấy tổng số lessons cho mỗi course
        const totalLessonsSql = `
          SELECT 
            c.id AS course_id,
            COUNT(*) AS total_lessons
          FROM courses c
          INNER JOIN chapters ch ON ch.course_id = c.id
          INNER JOIN lessons l ON l.chapter_id = ch.id
          WHERE c.id IN (${courseIds.map(() => '?').join(',')})
          GROUP BY c.id
        `;

          db.query(totalLessonsSql, courseIds, (err1, totalResults) => {
          if (err1) {
            console.error("❌ Lỗi lấy tổng số lessons:", err1);
            // Fallback: sử dụng stored progress
            return formatAndSend(results, role, res);
          }

          // Lấy số lessons đã hoàn thành cho user
          const completedLessonsSql = `
            SELECT 
              course_id,
              COUNT(*) AS completed_lessons
            FROM lesson_progress
            WHERE user_id = ? AND course_id IN (${courseIds.map(() => '?').join(',')}) AND exercises_completed = TRUE
            GROUP BY course_id
          `;

          db.query(completedLessonsSql, [userId, ...courseIds], (err2, completedResults) => {
            if (err2) {
              console.error("❌ Lỗi lấy số lessons đã hoàn thành:", err2);
              // Fallback: sử dụng stored progress
              return formatAndSend(results, role, res);
            }

            // Tạo map cho total và completed lessons
            const totalMap = {};
            totalResults.forEach(row => {
              totalMap[row.course_id] = row.total_lessons || 0;
            });

            const completedMap = {};
            completedResults.forEach(row => {
              completedMap[row.course_id] = row.completed_lessons || 0;
            });

            // Tính toán progress cho mỗi course
            const formatted = results.map((course) => {
              const totalLessons = totalMap[course.id] || 0;
              const completedLessons = completedMap[course.id] || 0;
              const calculatedProgress = totalLessons > 0 
                ? Math.round((completedLessons / totalLessons) * 100)
                : (course.stored_progress || 0);

              return formatCourse(course, calculatedProgress, role);
            });

            return res.json({
              status: "success",
              data: formatted,
            });
          });
        });
      } else {
        // Teacher hoặc không có courses
        formatAndSend(results, role, res);
      }
    });
  } catch (error) {
    console.error("❌ Lỗi JWT:", error);
    return res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};


// -------------------------
// Xóa course
// -------------------------
exports.deleteCourse = (req, res) => {
  const { id } = req.params;

  // 1️⃣ Xóa chapters
  const deleteChapters = "DELETE FROM chapters WHERE course_id = ?";
  db.query(deleteChapters, [id], (err) => {
    if (err) return res.status(500).json({ status: "error", message: "Lỗi khi xóa chapters" });

    // 2️⃣ Xóa payments
    const deletePayments = "DELETE FROM payments WHERE course_id = ?";
    db.query(deletePayments, [id], (err2) => {
      if (err2) return res.status(500).json({ status: "error", message: "Lỗi khi xóa payments" });

      // 3️⃣ Xóa user_courses
      const deleteUserCourses = "DELETE FROM user_courses WHERE course_id = ?";
      db.query(deleteUserCourses, [id], (err3) => {
        if (err3) return res.status(500).json({ status: "error", message: "Lỗi khi xóa user_courses" });

        // 4️⃣ Xóa course
        const deleteCourseSql = "DELETE FROM courses WHERE id = ?";
        db.query(deleteCourseSql, [id], (err4, result) => {
          if (err4) return res.status(500).json({ status: "error", message: "Lỗi khi xóa course" });
          if (result.affectedRows === 0)
            return res.status(404).json({ status: "fail", message: "Course không tồn tại" });

          res.json({ status: "success", message: "Xóa course thành công" });
        });
      });
    });
  });
};

// -------------------------
// Lấy course theo lớp với phân trang
// -------------------------
exports.getCoursesByGrade = (req, res) => {
  const { grade } = req.params;
  const page = parseInt(req.query.page) || 1; // default page = 1
  const limit = parseInt(req.query.limit) || 10; // default limit = 10
  const offset = (page - 1) * limit;

  if (!grade) {
    return res.status(400).json({ status: "error", message: "Thiếu thông tin lớp" });
  }

  const sql = "SELECT * FROM courses WHERE grade = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
  db.query(sql, [grade, limit, offset], (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi lấy course theo lớp:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Lỗi server khi lấy course theo lớp" });
    }

    // Lấy tổng số course để tính totalPages
    const countSql = "SELECT COUNT(*) as total FROM courses WHERE grade = ?";
    db.query(countSql, [grade], (err2, countResult) => {
      if (err2) {
        console.error("❌ Lỗi khi đếm course:", err2);
        return res
          .status(500)
          .json({ status: "error", message: "Lỗi server khi đếm course" });
      }

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        status: "success",
        data: results,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    });
  });
};

// ✅ Lấy số học sinh đã đăng ký và tiến độ trung bình của course
// -------------------------
// ✅ Lấy số học sinh & tiến độ trung bình của course
// -------------------------
exports.getStudentsCount = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Thiếu token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "teacher") {
      return res
        .status(403)
        .json({ status: "error", message: "Không có quyền truy cập" });
    }

    const teacherId = decoded.id;
    const { id: courseId } = req.params;

    // 🔒 Kiểm tra course có thuộc giáo viên không
    const checkSql = `
      SELECT id FROM courses WHERE id = ? AND teacher = ?
    `;

    db.query(checkSql, [courseId, teacherId], (err, checkResult) => {
      if (err) {
        console.error("❌ Lỗi check course:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Lỗi server" });
      }

      if (checkResult.length === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "Course không tồn tại hoặc không thuộc quyền bạn" });
      }

      // ✅ Query students count
      const sql = `
        SELECT 
          COUNT(DISTINCT user_id) as count
        FROM user_courses
        WHERE course_id = ? AND status = 'paid'
      `;

      db.query(sql, [courseId], (err2, results) => {
        if (err2) {
          console.error("❌ Lỗi lấy students count:", err2);
          return res
            .status(500)
            .json({ status: "error", message: "Lỗi server", error: err2.message });
        }

        const count = results[0]?.count || 0;
        const avgProgress = 0; // Hiện tại không tính progress
        
        console.log(`✅ Course ${courseId}: ${count} students`);

        return res.json({
          status: "success",
          count,
          avgProgress,
        });
      });
    });
  } catch (error) {
    console.error("❌ Lỗi JWT:", error.message);
    return res
      .status(401)
      .json({ status: "error", message: "Token không hợp lệ", error: error.message });
  }
};

// ===========================
// LẤY TIẾN ĐỘ KHÓA HỌC CỦA HỌC SINH
// ===========================
exports.getCourseProgress = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ status: "error", message: "Thiếu token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    const { id: course_id } = req.params;

    if (!course_id) {
      return res.status(400).json({ status: "error", message: "Thiếu course_id" });
    }

    console.log(`🔍 Lấy progress: user_id=${user_id}, course_id=${course_id}`);

    // Kiểm tra xem user đã đăng ký khóa học chưa
    const checkSql = `
      SELECT id FROM user_courses 
      WHERE user_id = ? AND course_id = ?
      LIMIT 1
    `;

    db.query(checkSql, [user_id, course_id], (err, checkResults) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra enrollment:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server" });
      }

      if (checkResults.length === 0) {
        // Chưa đăng ký khóa học
        console.warn(`⚠️ User ${user_id} chưa đăng ký course ${course_id}`);
        return res.json({
          status: "success",
          data: { progress: 0, course_id, user_id }
        });
      }

      // Tính toán tiến độ dựa trên tổng số bài học đã hoàn thành
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
          return res.json({
            status: "success",
            data: { progress: 0, course_id, user_id }
          });
        }

        // Đếm số bài học đã hoàn thành (exercises_completed = TRUE)
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

          // Cập nhật progress vào user_courses để đồng bộ
          const updateCourseSql = `
            UPDATE user_courses SET progress = ? WHERE user_id = ? AND course_id = ?
          `;

          db.query(updateCourseSql, [course_progress, user_id, course_id], (err3) => {
            if (err3) {
              console.warn("⚠️ Lỗi cập nhật progress (không ảnh hưởng kết quả):", err3);
            } else {
              console.log(`✅ Đã cập nhật course progress cho user ${user_id}: ${course_progress}%`);
            }

            return res.json({
              status: "success",
              data: { progress: course_progress, course_id, user_id }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Lỗi JWT:", error.message);
    return res
      .status(401)
      .json({ status: "error", message: "Token không hợp lệ", error: error.message });
  }
};
