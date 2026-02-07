const multer = require("multer");
const path = require("path");

// Lưu file tạm thời trên server trước khi upload lên Cloudinary
const storage = multer.memoryStorage(); // dùng memoryStorage để dễ upload lên Cloudinary

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "video/mp4",
    "video/avi",
    "video/mov",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload ảnh, video hoặc PPT"), false);
  }
};

// Giới hạn size: video có thể lớn, ví dụ 100MB
const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = upload;
