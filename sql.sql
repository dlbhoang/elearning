-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th12 29, 2025 lúc 09:00 AM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `CREATE DATABASE course_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'elearning_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON course_db.* TO 'elearning_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chapters`
--

CREATE TABLE `chapters` (
  `id` varchar(20) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chapters`
--

INSERT INTO `chapters` (`id`, `course_id`, `title`, `description`, `created_at`, `updated_at`) VALUES
('CH_1761034404860', 1, 'Chương 2: Toán là gì?', NULL, '2025-10-21 08:13:24', '2025-10-21 08:13:24'),
('CH_1765194682256', 2, 'bài tập', '1', '2025-12-08 11:51:22', '2025-12-25 02:57:56'),
('CH_1766563115195', 3, '1', NULL, '2025-12-24 07:58:35', '2025-12-24 07:58:35');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `teacher` int(11) NOT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `students` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `price` decimal(10,2) DEFAULT 0.00,
  `progress` int(11) DEFAULT 0,
  `is_enrolled` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `courses`
--

INSERT INTO `courses` (`id`, `title`, `subject`, `grade`, `teacher`, `duration`, `students`, `rating`, `price`, `progress`, `is_enrolled`, `description`, `image`, `created_at`, `updated_at`) VALUES
(1, 'Toán lớp 10 - Hình', 'Toán', '10', 1, '40 giờ', 0, 0.00, 199000.00, 0, 0, 'Khóa học Toán 10 cơ bản phần Hình học.', NULL, '2025-10-21 08:01:51', '2025-10-21 08:01:51'),
(2, 'C1', 'Toán', '10', 8, '10 giờ', 0, 0.00, 3.00, 0, 0, '1', 'https://res.cloudinary.com/dh3yakvnb/image/upload/v1765194669/courses/sbrmlqs2ehlvdkvrcrmx.png', '2025-12-08 11:51:10', '2025-12-08 11:51:10'),
(3, 'C2', 'Toán', '10', 8, '10 giờ', NULL, NULL, 3.00, NULL, NULL, '1', 'https://res.cloudinary.com/dh3yakvnb/image/upload/v1765194670/courses/dbwcxcguio4kpmcf1ceh.png', '2025-12-08 11:51:11', '2025-12-27 21:05:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) NOT NULL,
  `date` varchar(50) DEFAULT NULL,
  `time` varchar(50) DEFAULT NULL,
  `duration` int(11) DEFAULT 60,
  `total_questions` int(11) DEFAULT 0,
  `max_score` int(11) DEFAULT 100,
  `classroom` varchar(255) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `exams`
--

INSERT INTO `exams` (`id`, `title`, `subject`, `course_id`, `teacher_id`, `date`, `time`, `duration`, `total_questions`, `max_score`, `classroom`, `instructions`, `created_at`, `updated_at`) VALUES
(2, 'Bài thi', 'Toán', 3, 8, '2025-12-29', '15:00', 60, 0, 100, '', '', '2025-12-29 07:23:13', '2025-12-29 07:23:13');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `exam_questions`
--

CREATE TABLE `exam_questions` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `options` longtext DEFAULT NULL,
  `correct_answer` longtext DEFAULT NULL,
  `explanation` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `exam_questions`
--

INSERT INTO `exam_questions` (`id`, `exam_id`, `question`, `type`, `options`, `correct_answer`, `explanation`, `created_at`, `updated_at`) VALUES
(8, 2, 'Câu hỏi 1', 'single', '[{\"id\":\"A\",\"text\":\"a\"},{\"id\":\"B\",\"text\":\"b\"},{\"id\":\"C\",\"text\":\"c\"},{\"id\":\"D\",\"text\":\"d\"}]', '\"a\"', '', '2025-12-29 07:25:40', '2025-12-29 07:25:40');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lessons`
--

CREATE TABLE `lessons` (
  `id` varchar(20) NOT NULL,
  `chapter_id` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `media_url` text DEFAULT NULL,
  `media_type` enum('video','ppt','other') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lessons`
--

INSERT INTO `lessons` (`id`, `chapter_id`, `title`, `duration`, `media_url`, `media_type`, `created_at`, `updated_at`) VALUES
('LE_1761034501424', 'CH_1761034404860', 'Bài học 1', '45 phút', NULL, NULL, '2025-10-21 08:15:01', '2025-10-21 08:15:01'),
('LE_1766563553313', 'CH_1766563115195', 'video mẫu ', '11', 'https://res.cloudinary.com/dh3yakvnb/video/upload/v1766563550/lessons/opcclx4ebaqqpivqrcfu.mp4', 'video', '2025-12-24 08:05:53', '2025-12-24 08:05:53'),
('LE_1766563819202', 'CH_1765194682256', 'Tiêu đề 1', '10', 'https://res.cloudinary.com/dh3yakvnb/video/upload/v1766563815/lessons/jaxejagxcq9oy1mftfsd.mp4', 'video', '2025-12-24 08:10:19', '2025-12-25 02:58:10'),
('LE_1766910485022', 'CH_1766563115195', 'Bài học 2 ', '10', 'https://res.cloudinary.com/dh3yakvnb/video/upload/v1766910484/lessons/okhtbsvkvntte2ja71c2.mp4', 'video', '2025-12-28 08:28:05', '2025-12-28 08:28:05'),
('LE_1766910561534', 'CH_1765194682256', 'Bài học 2 ', '10', 'https://res.cloudinary.com/dh3yakvnb/video/upload/v1766910560/lessons/ti7i7epremdv8vhi3ban.mp4', 'video', '2025-12-28 08:29:21', '2025-12-28 08:29:21'),
('LE_1766910894421', 'CH_1765194682256', 'Bài Học 3', '10', 'https://res.cloudinary.com/dh3yakvnb/video/upload/v1766910893/lessons/vjxe1vk1aoydmtwxja74.mp4', 'video', '2025-12-28 08:34:54', '2025-12-28 08:34:54');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lesson_exercises`
--

CREATE TABLE `lesson_exercises` (
  `id` int(11) NOT NULL,
  `lesson_id` varchar(20) NOT NULL,
  `type` enum('multiple_choice','fill_blank','essay','matching') NOT NULL,
  `question` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `answer` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `timestamp` int(11) DEFAULT 0,
  `show_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lesson_exercises`
--

INSERT INTO `lesson_exercises` (`id`, `lesson_id`, `type`, `question`, `options`, `answer`, `image`, `timestamp`, `show_at`) VALUES
(1, 'LE_1761034501424', 'multiple_choice', 'Câu hỏi ví dụ', '[\"A\",\"B\",\"C\",\"D\"]', 'A', NULL, 5, NULL),
(11, 'LE_1766563819202', 'multiple_choice', 'Câu hỏi 1 ', '{\"a\":\"a\",\"b\":\"b\",\"c\":\"c\",\"d\":\"d\"}', 'a', NULL, 5, NULL),
(13, 'LE_1766563819202', 'matching', 'nối từ', '[\"data:image/png;base64,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\",\"data:image/png;base64,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\"]', '[\"Con chuột\",\"Con mèo\"]', NULL, 7, NULL),
(14, 'LE_1766910485022', 'multiple_choice', 'Câu hỏi vui vẻ ', '{\"a\":\"Câu trả lời 1\",\"b\":\"Câu trả lời 2\",\"c\":\"câu trả lời 3\",\"d\":\"Câu trả lời 4\"}', 'a', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lesson_id` varchar(20) NOT NULL,
  `course_id` int(11) NOT NULL,
  `video_watched` tinyint(1) DEFAULT 0,
  `exercises_completed` tinyint(1) DEFAULT 0,
  `progress_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lesson_progress`
--

INSERT INTO `lesson_progress` (`id`, `user_id`, `lesson_id`, `course_id`, `video_watched`, `exercises_completed`, `progress_percentage`, `created_at`, `updated_at`) VALUES
(1, 3, 'LE_1766563819202', 2, 1, 1, 100, '2025-12-28 07:48:51', '2025-12-28 07:48:57'),
(3, 3, 'LE_1766910561534', 2, 1, 1, 100, '2025-12-28 08:32:24', '2025-12-28 08:32:24');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lesson_score_comments`
--

CREATE TABLE `lesson_score_comments` (
  `id` int(11) NOT NULL,
  `lesson_id` varchar(20) NOT NULL,
  `student_id` int(11) NOT NULL,
  `total_score` decimal(5,2) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','graded','auto_graded') DEFAULT 'auto_graded',
  `teacher_comment` text DEFAULT NULL,
  `teacher_graded_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lesson_score_details`
--

CREATE TABLE `lesson_score_details` (
  `id` int(11) NOT NULL,
  `lesson_score_comment_id` int(11) NOT NULL,
  `lesson_exercise_id` int(11) NOT NULL,
  `student_answer` text DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `teacher_score` decimal(5,2) DEFAULT NULL,
  `teacher_comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `enrollment_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `status` enum('pending','success','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `enrollment_id`, `amount`, `method`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 199000.00, 'unknown', 'pending', '2025-11-24 11:56:40', '2025-11-24 11:56:40'),
(2, 5, 3.00, 'unknown', 'pending', '2025-12-08 12:04:44', '2025-12-08 12:04:44'),
(3, 8, 3.00, 'online', 'success', '2025-12-26 10:19:09', '2025-12-26 10:38:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `phone` varchar(20) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `parent` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `phone`, `gender`, `birthday`, `address`, `grade`, `school`, `parent`, `note`, `subject`, `experience`, `bio`, `facebook`, `instagram`, `linkedin`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'teacher1@gmail.com', '$2b$10$2jZP4bj9xN9ewrRVYlXiAe8MBeNrWEWjDeJbv2WrjqVimbZR3RLlK', 'Nguyen Van D', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-21 08:01:31', '2025-10-21 08:01:31'),
(2, 'dlb.hoang0603@gmail.com', '$2b$10$00FWgSSIXNpxJGjgSZOO2OjxYIhIW94YkicgLi1NsLqFb8Ap0Qm.e', 'Hoàng Đặng Lê Bảo', 'student', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKXuCTrWedXmWriP3vEss9StT-3rsgnCHSP-FkKKRIMUYvKd0A=s96-c', '2025-10-24 07:50:21', '2025-10-24 07:50:21'),
(3, 'admin@email.com', '$2b$10$nqrY.pJoEuwu2pDzKvnrmeleXZL9zczZM3jY8Xj3mYo9yRXhG0bZq', 'Hoàng Đặng', 'student', '+84379107177', 'male', '2002-03-06', '31 Trịnh ĐÌnh Thảo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-01 05:46:38', '2025-11-01 05:46:38'),
(5, 'dlb.hoang060301@gmail.com', '$2b$10$qZy1BBAGhtAJf5f36Nh0e.72mzAe6s8hHDWgIouWgb7qC6Bjvn82a', 'Hoàng Đặng', 'student', '+84379107177', 'male', '2002-03-06', '31 Trịnh ĐÌnh Thảo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 05:48:08', '2025-11-23 05:48:08'),
(6, 'user@gmail.com', '$2b$10$MIBqJF1PcA2APPejFUKpye7rivF0mKZAG1p7ja0W5UI36NPn2SOM6', 'Nguyen Van D', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 11:17:54', '2025-11-24 11:17:54'),
(7, 'user1@gmail.com', '$2b$10$rpnGJ1JXT.Qcvyhg3rYLkO6Se9HLS8b1/m/3IFJMkNwVW/SMcT2y2', 'Nguyen Van D', 'student', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 11:18:38', '2025-11-24 11:18:38'),
(8, 'teacher@gmail.com', '$2b$10$8bA1taYVEvC.5W//6H27Q.YM3bGBgtJtfa2wri3woTxc01LuG/Em6', 'Nguyen Van D', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-08 11:49:51', '2025-12-08 11:49:51');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_courses`
--

CREATE TABLE `user_courses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` enum('pending','paid','completed','cancelled') DEFAULT 'pending',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `progress` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_courses`
--

INSERT INTO `user_courses` (`id`, `user_id`, `course_id`, `status`, `enrolled_at`, `progress`) VALUES
(1, 2, 1, 'pending', '2025-11-24 11:04:48', 0),
(2, 7, 1, 'pending', '2025-11-24 11:56:40', 0),
(5, 2, 2, 'pending', '2025-12-08 12:04:44', 0),
(6, 3, 3, 'pending', '2025-12-26 10:16:16', 0),
(7, 3, 1, 'pending', '2025-12-26 10:16:46', 0),
(8, 3, 2, 'paid', '2025-12-26 10:19:09', 67);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `chapters`
--
ALTER TABLE `chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Chỉ mục cho bảng `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher` (`teacher`);

--
-- Chỉ mục cho bảng `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Chỉ mục cho bảng `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Chỉ mục cho bảng `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chapter_id` (`chapter_id`);

--
-- Chỉ mục cho bảng `lesson_exercises`
--
ALTER TABLE `lesson_exercises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Chỉ mục cho bảng `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_lesson` (`user_id`,`lesson_id`),
  ADD KEY `fk_lp_lesson` (`lesson_id`),
  ADD KEY `fk_lp_course` (`course_id`);

--
-- Chỉ mục cho bảng `lesson_score_comments`
--
ALTER TABLE `lesson_score_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Chỉ mục cho bảng `lesson_score_details`
--
ALTER TABLE `lesson_score_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_score_comment_id` (`lesson_score_comment_id`),
  ADD KEY `lesson_exercise_id` (`lesson_exercise_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollment_id` (`enrollment_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `user_courses`
--
ALTER TABLE `user_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `exam_questions`
--
ALTER TABLE `exam_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `lesson_exercises`
--
ALTER TABLE `lesson_exercises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `lesson_score_comments`
--
ALTER TABLE `lesson_score_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lesson_score_details`
--
ALTER TABLE `lesson_score_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `user_courses`
--
ALTER TABLE `user_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chapters`
--
ALTER TABLE `chapters`
  ADD CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lesson_exercises`
--
ALTER TABLE `lesson_exercises`
  ADD CONSTRAINT `lesson_exercises_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `fk_lp_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lp_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lesson_score_comments`
--
ALTER TABLE `lesson_score_comments`
  ADD CONSTRAINT `lesson_score_comments_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_score_comments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lesson_score_details`
--
ALTER TABLE `lesson_score_details`
  ADD CONSTRAINT `lesson_score_details_ibfk_1` FOREIGN KEY (`lesson_score_comment_id`) REFERENCES `lesson_score_comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_score_details_ibfk_2` FOREIGN KEY (`lesson_exercise_id`) REFERENCES `lesson_exercises` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `user_courses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_courses`
--
ALTER TABLE `user_courses`
  ADD CONSTRAINT `user_courses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
