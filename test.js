const bcrypt = require("bcryptjs");

const password = "123456";
const saltRounds = 10;

// Tạo hash cho mật khẩu
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("❌ Lỗi mã hoá mật khẩu:", err);
  } else {
    console.log("🔑 Mật khẩu gốc:", password);
    console.log("✅ Mật khẩu đã mã hoá:", hash);

    // Thử kiểm tra lại hash vừa tạo
    bcrypt.compare(password, hash, (err, result) => {
      if (result) {
        console.log("🟢 Xác thực thành công — mật khẩu khớp!");
      } else {
        console.log("🔴 Xác thực thất bại!");
      }
    });
  }
});
