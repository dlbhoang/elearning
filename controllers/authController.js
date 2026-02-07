// controllers/authController.js
const db = require("../config/db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary.js");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// -------------------------
// Register
// -------------------------
exports.register = (req, res) => {
  console.log("📩 Register API called", req.body);
  const { email, password, full_name, role, phone, gender, birthday, address } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ status: "fail", message: "Thiếu thông tin bắt buộc" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = `
    INSERT INTO users (email, password, name, role, phone, gender, birthday, address) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [email, hashedPassword, full_name, role, phone || null, gender || null, birthday || null, address || null], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ status: "fail", message: "Email đã tồn tại" });
      }
      return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
    }

    res.status(201).json({
      status: "success",
      message: "Đăng ký thành công",
      data: { userId: result.insertId, email, full_name, role, phone, gender, birthday, address }
    });
  });
};

// -------------------------
// Login
// -------------------------
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ status: "fail", message: "Vui lòng nhập email và mật khẩu" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
    if (results.length === 0) return res.status(404).json({ status: "fail", message: "Không tìm thấy user" });

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ status: "fail", message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Trả toàn bộ thông tin user ngoại trừ password
    const { password: pwd, ...userWithoutPassword } = user;

    res.status(200).json({
      status: "success",
      message: "Đăng nhập thành công",
      data: { token, user: userWithoutPassword }
    });
  });
};

// -------------------------
// Google Login
// -------------------------
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) return res.status(500).json({ status: "error", message: err.message });

      let user = results[0];

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(randomPassword, 10);

        db.query(
          "INSERT INTO users (email, password, name, role, avatar) VALUES (?, ?, ?, ?, ?)",
          [email, hashedPassword, name, "student", picture],
          (err, result) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });

            user = { id: result.insertId, email, name, role: "student", avatar: picture };
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            res.json({ status: "success", data: { token, user } });
          }
        );
      } else {
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const { password: pwd, ...userWithoutPassword } = user;
        res.json({ status: "success", data: { token, user: userWithoutPassword } });
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: "Google login thất bại", error: err.message });
  }
};

// -------------------------
// Get Profile
// -------------------------
exports.profile = (req, res) => {
  const userId = req.user.id;

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ status: "error", message: "Lỗi server", error: err.message });
    if (results.length === 0) return res.status(404).json({ status: "fail", message: "User không tồn tại" });

    const { password: pwd, ...userWithoutPassword } = results[0];
    res.status(200).json({
      status: "success",
      message: "Lấy thông tin user thành công",
      data: userWithoutPassword
    });
  });
};

// -------------------------
// Update Profile
// -------------------------
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let { name, birthday, gender, address, grade, school, parent, note, subject, experience, bio, facebook, instagram, linkedin } = req.body;

    // Convert birthday về yyyy-MM-dd
    if (birthday) birthday = new Date(birthday).toISOString().split("T")[0];

    let avatar = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "avatars" });
      avatar = result.secure_url;
    }

    // Cập nhật các trường user, nếu avatar null thì giữ nguyên
    const query = `
      UPDATE users SET
        name = COALESCE(?, name),
        birthday = COALESCE(?, birthday),
        gender = COALESCE(?, gender),
        address = COALESCE(?, address),
        grade = COALESCE(?, grade),
        school = COALESCE(?, school),
        parent = COALESCE(?, parent),
        note = COALESCE(?, note),
        subject = COALESCE(?, subject),
        experience = COALESCE(?, experience),
        bio = COALESCE(?, bio),
        facebook = COALESCE(?, facebook),
        instagram = COALESCE(?, instagram),
        linkedin = COALESCE(?, linkedin),
        avatar = COALESCE(?, avatar)
      WHERE id = ?
    `;

    db.query(query, [name, birthday, gender, address, grade, school, parent, note, subject, experience, bio, facebook, instagram, linkedin, avatar, userId], (err, result) => {
      if (err) return res.status(500).json({ status: "error", message: "Lỗi server khi cập nhật thông tin", error: err.message });

      // Lấy lại toàn bộ thông tin user sau khi cập nhật
      db.query("SELECT * FROM users WHERE id = ?", [userId], (err2, results) => {
        if (err2) return res.status(500).json({ status: "error", message: "Lỗi server khi lấy thông tin", error: err2.message });
        res.status(200).json({ status: "success", message: "Cập nhật thông tin thành công", data: results[0] });
      });
    });

  } catch (err) {
    res.status(500).json({ status: "error", message: "Lỗi server khi cập nhật thông tin", error: err.message });
  }
};


// -------------------------
// Check Enrollment
// -------------------------
exports.checkEnrollment = (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({
      status: "fail",
      message: "Thiếu courseId",
    });
  }

  // Lấy trạng thái từ user_courses và cả payment status
  const query = `
    SELECT uc.status, p.status AS payment_status
    FROM user_courses uc
    LEFT JOIN payments p ON p.enrollment_id = uc.id
    WHERE uc.user_id = ? AND uc.course_id = ?
  `;

  db.query(query, [userId, courseId], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Lỗi server khi kiểm tra đăng ký",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(200).json({
        status: "success",
        enrollment_status: null,
        message: "User chưa đăng ký khóa học này",
      });
    }

    const { status, payment_status } = results[0];
    
    // Nếu user_courses là 'pending', kiểm tra payment status
    let final_status = status;
    if (status === "pending" && payment_status === "success") {
      // Nếu payment success nhưng user_courses chưa cập nhật, tự cập nhật
      const updateQuery = `UPDATE user_courses SET status = 'paid' WHERE user_id = ? AND course_id = ?`;
      db.query(updateQuery, [userId, courseId], (err2) => {
        if (!err2) {
          console.log("✅ Tự động cập nhật user_courses thành 'paid'");
          final_status = "paid";
        }
      });
      final_status = "paid";
    }

    return res.status(200).json({
      status: "success",
      enrollment_status: final_status,
      payment_status: payment_status,
      message: results.length > 0 
        ? "User đã đăng ký khóa học này" 
        : "User chưa đăng ký khóa học này",
    });
  });
};
