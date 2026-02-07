const db = require("../config/db.js");

// Tạo thanh toán
exports.createPayment = (req, res) => {
  const { enrollment_id, amount, method } = req.body;
  const user_id = req.user.id;

  if (!enrollment_id || !amount || !method) {
    return res.status(400).json({ status: "error", message: "Thiếu dữ liệu" });
  }

  const sql = `
    INSERT INTO payments (enrollment_id, amount, method, status)
    VALUES (?, ?, ?, 'pending')
  `;

  db.query(sql, [enrollment_id, amount, method], (err, result) => {
    if (err) {
      console.error("❌ Lỗi createPayment:", err);
      return res.status(500).json({ status: "error", message: "Không tạo được payment" });
    }
    return res.json({
      status: "success",
      message: "Tạo payment thành công",
      data: { id: result.insertId, enrollment_id, amount, method, status: "pending" },
    });
  });
};

// Cập nhật trạng thái thanh toán (admin/cổng thanh toán gọi về)
exports.updatePaymentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "success", "failed"].includes(status)) {
    return res.status(400).json({ status: "error", message: "Trạng thái không hợp lệ" });
  }

  // 1️⃣ Cập nhật payment status
  const sqlPayment = `UPDATE payments SET status = ? WHERE id = ?`;

  db.query(sqlPayment, [status, id], (err) => {
    if (err) {
      console.error("❌ Lỗi updatePaymentStatus:", err);
      return res.status(500).json({ status: "error", message: "Không update được payment" });
    }

    // 2️⃣ Nếu payment thành công, cập nhật user_courses thành 'paid'
    if (status === "success") {
      const sqlGetEnrollment = `SELECT enrollment_id FROM payments WHERE id = ?`;
      db.query(sqlGetEnrollment, [id], (err2, results) => {
        if (err2 || !results.length) {
          console.error("❌ Lỗi lấy enrollment_id:", err2);
          return res.json({ status: "success", message: "Cập nhật payment thành công nhưng chưa cập nhật user_courses" });
        }

        const enrollment_id = results[0].enrollment_id;
        const sqlUpdateEnrollment = `UPDATE user_courses SET status = 'paid' WHERE id = ?`;
        
        db.query(sqlUpdateEnrollment, [enrollment_id], (err3) => {
          if (err3) {
            console.error("❌ Lỗi cập nhật user_courses:", err3);
            return res.json({ status: "success", message: "Cập nhật payment thành công nhưng chưa cập nhật user_courses" });
          }
          
          console.log("✅ Cập nhật payment thành success và user_courses thành paid");
          return res.json({ status: "success", message: "Cập nhật trạng thái thành công" });
        });
      });
    } else {
      return res.json({ status: "success", message: "Cập nhật trạng thái thành công" });
    }
  });
};

// Lấy tất cả payments của user
exports.getUserPayments = (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT p.id, p.amount, p.method, p.status, p.created_at, c.title as course_title
    FROM payments p
    JOIN user_courses uc ON p.enrollment_id = uc.id
    JOIN courses c ON uc.course_id = c.id
    WHERE uc.user_id = ?
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("❌ Lỗi getUserPayments:", err);
      return res.status(500).json({ status: "error", message: "Không lấy được payments" });
    }
    return res.json({ status: "success", data: rows });
  });
};

// Duyệt thanh toán bằng tiền mặt
exports.approvePayment = (req, res) => {
  const { enrollmentId } = req.params;
  const teacher_id = req.user.id;

  if (!enrollmentId) {
    return res.status(400).json({ status: "error", message: "Thiếu enrollment ID" });
  }

  console.log("🔍 approvePayment - enrollmentId:", enrollmentId, "teacher_id:", teacher_id);

  // Kiểm tra xem teacher có quyền duyệt hay không (lấy khóa học của enrollment này)
  const checkSql = `
    SELECT p.id, uc.course_id
    FROM payments p
    JOIN user_courses uc ON p.enrollment_id = uc.id
    JOIN courses c ON uc.course_id = c.id
    WHERE uc.id = ? AND c.teacher = ?
  `;

  db.query(checkSql, [enrollmentId, teacher_id], (err, results) => {
    if (err) {
      console.error("❌ Lỗi kiểm tra quyền:", err);
      return res.status(500).json({ status: "error", message: "Lỗi kiểm tra quyền" });
    }

    if (!results.length) {
      return res.status(403).json({ status: "error", message: "Bạn không có quyền duyệt thanh toán này" });
    }

    const paymentId = results[0].id;

    // Cập nhật payment thành success
    const updateSql = `UPDATE payments SET status = 'success' WHERE id = ?`;

    db.query(updateSql, [paymentId], (err) => {
      if (err) {
        console.error("❌ Lỗi cập nhật payment:", err);
        return res.status(500).json({ status: "error", message: "Không thể duyệt thanh toán" });
      }

      console.log("✅ Duyệt thanh toán thành công - Payment ID:", paymentId);
      return res.json({ status: "success", message: "Duyệt thanh toán thành công" });
    });
  });
};
