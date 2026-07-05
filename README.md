# E-Learning App

Một nền tảng học trực tuyến hiện đại, giao diện đẹp, hỗ trợ nhiều vai trò (học sinh, giáo viên, admin), sử dụng ReactJS + Tailwind CSS + Framer Motion.

## 🚀 Tính năng nổi bật
- **Giao diện hiện đại, responsive, hỗ trợ dark mode**
- **Trang chủ, danh sách khoá học, chi tiết khoá học, bài học, bài tập**
- **Đăng nhập, đăng ký, phân quyền học sinh/giáo viên/admin**
- **Quản lý khoá học, bài học, bài tập, học sinh, giáo viên (admin/teacher)**
- **Đăng ký khoá học, theo dõi tiến độ học, feedback, testimonials**
- **Mock data lưu trữ ở file JSON, không cần backend**
- **Chuyển đổi dark/light mode toàn cục**
- **Hiệu ứng động đẹp với Framer Motion**

## 🛠️ Công nghệ sử dụng
- [ReactJS](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router DOM](https://reactrouter.com/)
- [SweetAlert2](https://sweetalert2.github.io/) (popup)

## 📁 Cấu trúc thư mục
```
e-learning-app/
├── public/
│   └── assets/           # Ảnh logo, poster, icon
├── src/
│   ├── components/       # Các component UI (CourseCard, Header, Footer, ...)
│   ├── data/             # Mock data JSON (allCourses, teacher, ...)
│   ├── pages/            # Các trang chính (Home, Courses, Profile, ...)
│   ├── services/         # Xử lý logic mock data, auth, ...
│   ├── App.jsx           # Cấu hình router
│   └── AppRoutes.jsx     # Logic dark mode, route
├── tailwind.config.js    # Cấu hình Tailwind
├── package.json          # Thông tin package, scripts
└── README.md             # File này
```

## ⚡ Hướng dẫn chạy local
1. **Clone repo:**
   ```bash
   git clone <repo-url>
   cd e-learning-app
   ```
2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```
3. **Chạy dev:**
   ```bash
   npm run dev
   ```
4. **Mở trình duyệt:**
   Truy cập [http://localhost:5173](http://localhost:5173)

## 🖼️ Demo giao diện
- Giao diện đẹp, màu chủ đạo vàng (#F4A300), hỗ trợ dark mode
- Card khoá học hiện đại, badge nổi bật, ảnh online chất lượng cao
- Trang profile, quản lý khoá học, testimonials, feedback học viên

## 📦 Mock data
- Tất cả dữ liệu (khoá học, giáo viên, feedback, ...) lấy từ file JSON trong `src/data/`
- Ảnh khoá học, giáo viên, feedback đều là link online (Unsplash, randomuser.me)

## 💡 Tuỳ biến
- Có thể mở rộng thêm chức năng, thêm API backend, hoặc tích hợp thanh toán dễ dàng
- Dễ dàng đổi màu chủ đạo, thêm nhiều khoá học, giáo viên, bài tập mới

---

# elearning-fe
