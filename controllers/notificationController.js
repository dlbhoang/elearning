const db = require("../config/db.js");
const jwt = require("jsonwebtoken");

// ==========================
// LẤY DANH SÁCH THÔNG BÁO CỦA USER
// ==========================
exports.getNotifications = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    const { limit = 50, offset = 0 } = req.query;

    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    db.query(sql, [user_id, parseInt(limit), parseInt(offset)], (err, results) => {
      if (err) {
        console.error("❌ Lỗi lấy thông báo:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
      }

      // Đếm số thông báo chưa đọc
      const countSql = `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE`;
      db.query(countSql, [user_id], (err2, countResults) => {
        if (err2) {
          console.error("❌ Lỗi đếm thông báo:", err2);
        }

        const unreadCount = countResults[0]?.unread_count || 0;

        res.json({
          status: "success",
          data: results,
          unread_count: unreadCount
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// ĐÁNH DẤU THÔNG BÁO ĐÃ ĐỌC
// ==========================
exports.markAsRead = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({ status: "error", message: "Thiếu notification_id" });
    }

      // Send message to parent (teacher triggers)
      exports.sendToParent = (req, res) => {
        try {
          const authHeader = req.headers["authorization"];
          if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

          const token = authHeader.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.role !== 'teacher') return res.status(403).json({ status: 'error', message: 'Bạn không có quyền' });

          const { student_id, title, message } = req.body;
          if (!student_id || !message) return res.status(400).json({ status: 'error', message: 'Thiếu student_id hoặc message' });

          // Lấy thông tin học sinh và parent field
          db.query('SELECT id, name, parent FROM users WHERE id = ?', [student_id], (err, results) => {
            if (err) return res.status(500).json({ status: 'error', message: 'Lỗi server', error: err.message });
            if (!results || results.length === 0) return res.status(404).json({ status: 'error', message: 'Không tìm thấy học sinh' });

            const student = results[0];

            // Tạo notification cho học sinh
            const createSql = `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) VALUES (?, 'parent_message', ?, ?, ?, 'parent_message')`;
            db.query(createSql, [student.id, title || 'Thông báo từ giáo viên', message, null], (err2) => {
              if (err2) console.error('❌ Lỗi tạo notification cho học sinh:', err2);
            });

            // Nếu trường parent lưu user_id (số) thì tạo notification cho parent user nếu tồn tại
            if (student.parent) {
              // Nếu parent là số (user id)
              const parentCandidate = String(student.parent).trim();
              if (/^\d+$/.test(parentCandidate)) {
                db.query('SELECT id FROM users WHERE id = ?', [parentCandidate], (err3, parentRes) => {
                  if (!err3 && parentRes && parentRes.length > 0) {
                    const parentId = parentRes[0].id;
                    db.query(createSql, [parentId, title || 'Thông báo từ giáo viên', message, null], (err4) => {
                      if (err4) console.error('❌ Lỗi tạo notification cho phụ huynh:', err4);
                    });
                  }
                });
              } else {
                // Nếu parent có thể là số điện thoại, attempt external Zalo API if configured
                if (process.env.ZALO_API_URL && process.env.ZALO_ACCESS_TOKEN) {
                  const axios = require('axios');
                  axios.post(process.env.ZALO_API_URL, {
                    to: parentCandidate,
                    message
                  }, {
                    headers: { Authorization: `Bearer ${process.env.ZALO_ACCESS_TOKEN}` }
                  }).then(() => {
                    console.log('✅ Sent message to parent via Zalo API');
                  }).catch((err5) => {
                    console.error('❌ Zalo API error:', err5?.message || err5);
                  });
                }
              }
            }

            return res.json({ status: 'success', message: 'Đã gửi thông báo tới học sinh/phụ huynh (nếu có)' });
          });

        } catch (error) {
          console.error(error);
          res.status(401).json({ status: 'error', message: 'Token không hợp lệ' });
        }
      };
    // Kiểm tra notification có thuộc user này không
    const checkSql = `SELECT id FROM notifications WHERE id = ? AND user_id = ?`;
    db.query(checkSql, [notification_id, user_id], (err, results) => {
      if (err) {
        console.error("❌ Lỗi kiểm tra notification:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: "error", message: "Không tìm thấy thông báo" });
      }

      // Đánh dấu đã đọc
      const updateSql = `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`;
      db.query(updateSql, [notification_id, user_id], (err2) => {
        if (err2) {
          console.error("❌ Lỗi cập nhật notification:", err2);
          return res.status(500).json({ status: "error", message: "Lỗi server", error: err2.message });
        }

        res.json({ status: "success", message: "Đã đánh dấu đã đọc" });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
// ==========================
exports.markAllAsRead = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ status: "error", message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    const updateSql = `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`;
    db.query(updateSql, [user_id], (err) => {
      if (err) {
        console.error("❌ Lỗi cập nhật notifications:", err);
        return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
      }

      res.json({ status: "success", message: "Đã đánh dấu tất cả đã đọc" });
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

// ==========================
// KIỂM TRA VÀ TẠO THÔNG BÁO EXAM (CÓ THỂ GỌI ĐỊNH KỲ)
// ==========================
exports.checkAndCreateExamNotifications = (req, res) => {
  try {
    // Lấy tất cả exams sắp diễn ra (trong vòng 24 giờ tới và chưa tạo thông báo hôm nay)
    const sql = `
      SELECT DISTINCT e.id, e.title, e.date, e.time, e.course_id, c.title as course_name
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.date IS NOT NULL 
        AND e.time IS NOT NULL
        AND CONCAT(e.date, ' ', e.time) >= NOW()
        AND CONCAT(e.date, ' ', e.time) <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.type = 'exam_reminder' 
            AND n.related_id = e.id 
            AND n.related_type = 'exam'
            AND DATE(n.created_at) = CURDATE()
        )
    `;

    db.query(sql, [], (err, exams) => {
      if (err) {
        console.error("❌ Lỗi lấy exams:", err);
        if (res) {
          return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
        }
        return;
      }

      if (exams.length === 0) {
        if (res) {
          return res.json({ status: "success", message: "Không có exam nào cần tạo thông báo", count: 0 });
        }
        return;
      }

      let processedExams = 0;
      let notificationCount = 0;
      let totalStudents = 0;

      // Helper function để xử lý từng exam
      const processExam = (examIndex) => {
        if (examIndex >= exams.length) {
          if (res) {
            res.json({ 
              status: "success", 
              message: `Đã xử lý ${exams.length} exam, tạo ${notificationCount} thông báo`,
              count: notificationCount 
            });
          }
          return;
        }

        const exam = exams[examIndex];
        if (!exam.course_id) {
          processExam(examIndex + 1);
          return;
        }

        // Lấy danh sách học sinh đã đăng ký và thanh toán khóa học này
        const getStudentsSql = `
          SELECT DISTINCT user_id FROM user_courses 
          WHERE course_id = ? AND status = 'paid'
        `;

        db.query(getStudentsSql, [exam.course_id], (err2, students) => {
          if (err2) {
            console.error("❌ Lỗi lấy học sinh:", err2);
            processExam(examIndex + 1);
            return;
          }

          if (students.length === 0) {
            processExam(examIndex + 1);
            return;
          }

          let processedStudents = 0;

          students.forEach(student => {
            // Kiểm tra xem đã có thông báo chưa
            const checkNotificationSql = `
              SELECT id FROM notifications 
              WHERE user_id = ? AND type = 'exam_reminder' AND related_id = ? AND related_type = 'exam'
              AND DATE(created_at) = CURDATE()
              LIMIT 1
            `;

            db.query(checkNotificationSql, [student.user_id, exam.id], (err3, existingNotifs) => {
              if (err3) {
                console.error("❌ Lỗi kiểm tra notification:", err3);
                processedStudents++;
                if (processedStudents === students.length) {
                  processExam(examIndex + 1);
                }
                return;
              }

              // Nếu đã có thông báo rồi thì skip
              if (existingNotifs.length > 0) {
                processedStudents++;
                if (processedStudents === students.length) {
                  processExam(examIndex + 1);
                }
                return;
              }

              // Tạo thông báo mới
              const createNotificationSql = `
                INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
                VALUES (?, 'exam_reminder', ?, ?, ?, 'exam')
              `;
              
              const examDateTime = exam.date && exam.time ? `${exam.date} ${exam.time}` : 'sắp tới';
              const title = 'Nhắc nhở bài thi';
              const message = `Bài thi "${exam.title}" của khóa học "${exam.course_name || 'khóa học'}" sẽ diễn ra vào ${examDateTime}`;

              db.query(createNotificationSql, [student.user_id, title, message, exam.id], (err4) => {
                if (err4) {
                  console.error("❌ Lỗi tạo thông báo exam:", err4);
                } else {
                  notificationCount++;
                  console.log(`✅ Đã tạo thông báo exam cho user ${student.user_id}`);
                }

                processedStudents++;
                if (processedStudents === students.length) {
                  processExam(examIndex + 1);
                }
              });
            });
          });
        });
      };

      // Bắt đầu xử lý
      if (exams.length > 0) {
        processExam(0);
      } else if (res) {
        res.json({ status: "success", message: "Không có exam nào cần tạo thông báo", count: 0 });
      }
    });
  } catch (error) {
    console.error(error);
    if (res) {
      res.status(500).json({ status: "error", message: "Lỗi server" });
    }
  }
};

