const jwt = require("jsonwebtoken");

// Kiểm tra token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "fail", message: "Thiếu hoặc sai định dạng token" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: "fail", message: "Token hết hạn hoặc không hợp lệ" });
    }

    req.user = decoded; // payload gồm { id, email, role }
    next();
  });
};

// Kiểm tra role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: "fail", message: "Bạn không có quyền truy cập" });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
