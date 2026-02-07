const db = require("../config/db.js");

/**
 * =========================
 * STUDENT ENROLL COURSE
 * =========================
 */
exports.enrollCourse = (req, res) => {
  const { course_id } = req.body;
  const user_id = req.user.id;  // ✅ JWT payload có 'id' chứ không phải 'user_id'

  if (!course_id) {
    return res.status(400).json({
      status: "error",
      message: "Thiếu course_id",
    });
  }

  // 1️⃣ Enroll (pending)
  const sqlEnroll = `
    INSERT INTO user_courses (user_id, course_id, status, enrolled_at)
    VALUES (?, ?, 'pending', CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      status='pending',
      enrolled_at=CURRENT_TIMESTAMP
  `;

  db.query(sqlEnroll, [user_id, course_id], (err, result) => {
    if (err) {
      console.error("❌ Enroll error:", err);
      return res.status(500).json({
        status: "error",
        message: "Enroll thất bại",
      });
    }

    const resolveEnrollmentId = () =>
      new Promise((resolve, reject) => {
        if (result.insertId) return resolve(result.insertId);

        const sqlGetId = `
          SELECT id FROM user_courses
          WHERE user_id = ? AND course_id = ?
          LIMIT 1
        `;
        db.query(sqlGetId, [user_id, course_id], (err2, rows) => {
          if (err2 || !rows.length) return reject(err2);
          resolve(rows[0].id);
        });
      });

    resolveEnrollmentId()
      .then((enrollment_id) => {
        // 2️⃣ Create / reset payment
        const sqlPayment = `
          INSERT INTO payments (enrollment_id, amount, method, status)
          SELECT ?, price, 'online', 'pending'
          FROM courses WHERE id = ?
          ON DUPLICATE KEY UPDATE status='pending'
        `;

        db.query(sqlPayment, [enrollment_id, course_id], (err3) => {
          if (err3) {
            console.error("❌ Payment error:", err3);
            return res.status(500).json({
              status: "error",
              message: "Tạo payment thất bại",
            });
          }

          // 3️⃣ Fetch course + teacher + enrollment
          const sqlCourse = `
            SELECT 
              c.id, c.title, c.subject, c.grade, c.duration,
              c.price, c.description, c.image, c.created_at,

              CASE WHEN uc.status='paid' THEN 1 ELSE 0 END AS is_enrolled,

              t.id AS teacher_id,
              t.name AS teacher_name,
              t.email AS teacher_email,
              t.avatar AS teacher_avatar,
              t.experience AS teacher_experience,
              t.bio AS teacher_bio,

              uc.status AS enrollment_status,
              p.id AS payment_id,
              p.status AS payment_status
            FROM courses c
            JOIN users t ON c.teacher = t.id
            LEFT JOIN user_courses uc
              ON uc.course_id = c.id AND uc.user_id = ?
            LEFT JOIN payments p
              ON p.enrollment_id = uc.id
            WHERE c.id = ?
            LIMIT 1
          `;

          db.query(sqlCourse, [user_id, course_id], (err4, rows) => {
            if (err4 || !rows.length) {
              console.error("❌ Fetch course error:", err4);
              return res.status(500).json({
                status: "error",
                message: "Không lấy được dữ liệu khóa học",
              });
            }

            const c = rows[0];

            return res.json({
              status: "success",
              message: "Enroll thành công",
              data: {
                course: {
                  id: c.id,
                  title: c.title,
                  subject: c.subject,
                  grade: c.grade,
                  duration: c.duration,
                  price: c.price,
                  description: c.description,
                  image: c.image,
                  created_at: c.created_at,
                  is_enrolled: !!c.is_enrolled,
                },
                teacher: {
                  id: c.teacher_id,
                  name: c.teacher_name,
                  email: c.teacher_email,
                  avatar: c.teacher_avatar,
                  experience: c.teacher_experience,
                  bio: c.teacher_bio,
                },
                enrollment: {
                  status: c.enrollment_status,
                },
                payment: {
                  id: c.payment_id,
                  status: c.payment_status,
                },
              },
            });
          });
        });
      })
      .catch((e) => {
        console.error("❌ Resolve enrollment error:", e);
        res.status(500).json({
          status: "error",
          message: "Enroll thất bại",
        });
      });
  });
};

/**
 * =========================
 * TEACHER – GET STUDENTS
 * =========================
 */
exports.getTeacherStudents = (req, res) => {
  const teacher_id = req.user.id;  // ✅ JWT payload có 'id' chứ không phải 'user_id'

  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.avatar,

      c.id AS course_id,
      c.title AS course_title,
      c.grade,

      uc.status AS enrollment_status,
      uc.enrolled_at,

      p.status AS payment_status
    FROM user_courses uc
    JOIN users u ON u.id = uc.user_id
    JOIN courses c ON c.id = uc.course_id
    LEFT JOIN payments p ON p.enrollment_id = uc.id
    WHERE c.teacher = ?
    ORDER BY uc.enrolled_at DESC
  `;

  db.query(sql, [teacher_id], (err, rows) => {
    if (err) {
      console.error("❌ Get students error:", err);
      return res.status(500).json({
        status: "error",
        message: "Lấy danh sách học sinh thất bại",
      });
    }

    res.json({
      status: "success",
      data: rows,
    });
  });
};

/**
 * =========================
 * TEACHER – STUDENT COURSES
 * =========================
 */
exports.getStudentCourses = (req, res) => {
  const student_id = req.params.studentId;
  const teacher_id = req.user.id;  // ✅ JWT payload có 'id' chứ không phải 'user_id'

  if (!student_id) {
    return res.status(400).json({
      status: "error",
      message: "Thiếu student_id",
    });
  }

  const sql = `
    SELECT
      u.id AS student_id,
      u.name AS student_name,
      u.email AS student_email,
      u.avatar AS student_avatar,

      c.id AS course_id,
      c.title AS course_title,
      c.subject,
      c.grade,
      c.price,

      uc.id AS enrollment_id,
      uc.status AS enrollment_status,
      uc.enrolled_at,

      p.status AS payment_status
    FROM users u
    JOIN user_courses uc ON uc.user_id = u.id
    JOIN courses c ON c.id = uc.course_id
    LEFT JOIN payments p ON p.enrollment_id = uc.id
    WHERE u.id = ? AND c.teacher = ?
    ORDER BY uc.enrolled_at DESC
  `;

  db.query(sql, [student_id, teacher_id], (err, rows) => {
    if (err) {
      console.error("❌ Get student courses error:", err);
      return res.status(500).json({
        status: "error",
        message: "Lấy khóa học thất bại",
      });
    }

    res.json({
      status: "success",
      data: rows,
    });
  });
};
