-- Migration: Add grading system and notifications
-- Run this SQL file to add the necessary columns and tables

-- 1. Add status, teacher_comment, and teacher_graded_at to lesson_score_comments
ALTER TABLE lesson_score_comments 
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'graded', 'auto_graded') DEFAULT 'auto_graded',
ADD COLUMN IF NOT EXISTS teacher_comment TEXT NULL,
ADD COLUMN IF NOT EXISTS teacher_graded_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Add teacher_score and teacher_comment to lesson_score_details
ALTER TABLE lesson_score_details
ADD COLUMN IF NOT EXISTS teacher_score DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS teacher_comment TEXT NULL;

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'grading', 'announcement', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INT NULL, -- lesson_score_comment_id, course_id, etc.
    related_type VARCHAR(50) NULL, -- 'lesson_score', 'course', etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
);

