================================================================================
                    E-LEARNING SERVER API DOCUMENTATION
================================================================================

BASE URL: http://localhost:5001 (Development)
         http://81.17.103.180 (Production)

================================================================================
1. AUTH ROUTES (/api/auth)
================================================================================

✅ REGISTER (Public)
POST /api/auth/register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456","fullName":"John Doe"}'

✅ LOGIN (Public)
POST /api/auth/login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'

✅ GET PROFILE (Protected)
GET /api/auth/profile
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer TOKEN"

✅ UPDATE PROFILE (Protected - supports avatar upload)
PUT /api/auth/update
curl -X PUT http://localhost:5001/api/auth/update \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@avatar.jpg"

✅ GOOGLE LOGIN (Public)
POST /api/auth/google
curl -X POST http://localhost:5001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"GOOGLE_TOKEN"}'

✅ CHECK ENROLLMENT (Protected)
GET /api/auth/check-enrollment/:courseId
curl -X GET http://localhost:5001/api/auth/check-enrollment/1 \
  -H "Authorization: Bearer TOKEN"

================================================================================
2. COURSE ROUTES (/api/courses)
================================================================================

✅ CREATE COURSE (Protected - Admin/Teacher only)
POST /api/courses/create
curl -X POST http://localhost:5001/api/courses/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"JS Basics","description":"Learn JS","grade":"10"}'

✅ GET ALL COURSES (Protected)
GET /api/courses/list
curl -X GET http://localhost:5001/api/courses/list \
  -H "Authorization: Bearer TOKEN"

✅ GET MY COURSES (Protected)
GET /api/courses/me/mine
curl -X GET http://localhost:5001/api/courses/me/mine \
  -H "Authorization: Bearer TOKEN"

✅ GET COURSES BY GRADE (Protected)
GET /api/courses/grade/:grade
curl -X GET http://localhost:5001/api/courses/grade/10 \
  -H "Authorization: Bearer TOKEN"

✅ GET STUDENTS COUNT & PROGRESS (Protected)
GET /api/courses/:id/students-count
curl -X GET http://localhost:5001/api/courses/1/students-count \
  -H "Authorization: Bearer TOKEN"

✅ GET COURSE PROGRESS (Protected)
GET /api/courses/:id/progress
curl -X GET http://localhost:5001/api/courses/1/progress \
  -H "Authorization: Bearer TOKEN"

✅ GET COURSE DETAILS (Protected)
GET /api/courses/:id
curl -X GET http://localhost:5001/api/courses/1 \
  -H "Authorization: Bearer TOKEN"

✅ UPDATE COURSE (Protected - Admin/Teacher only)
PUT /api/courses/:id
curl -X PUT http://localhost:5001/api/courses/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

✅ DELETE COURSE (Protected - Admin/Teacher only)
DELETE /api/courses/:id
curl -X DELETE http://localhost:5001/api/courses/1 \
  -H "Authorization: Bearer TOKEN"

================================================================================
3. LESSON ROUTES (/api/lessons)
================================================================================

🔹 CHAPTER MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━

CREATE CHAPTER (Protected - Teacher only)
POST /api/lessons/chapter/create
curl -X POST http://localhost:5001/api/lessons/chapter/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"1","title":"Chapter 1"}'

GET CHAPTERS BY COURSE (Protected)
GET /api/lessons/course/:course_id/chapters
curl -X GET http://localhost:5001/api/lessons/course/1/chapters \
  -H "Authorization: Bearer TOKEN"

UPDATE CHAPTER (Protected - Teacher only)
PUT /api/lessons/chapter/:chapter_id
curl -X PUT http://localhost:5001/api/lessons/chapter/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Chapter"}'

DELETE CHAPTER (Protected - Teacher only)
DELETE /api/lessons/chapter/:chapter_id
curl -X DELETE http://localhost:5001/api/lessons/chapter/1 \
  -H "Authorization: Bearer TOKEN"

🔹 LESSON (BÀI HỌC)
━━━━━━━━━━━━━━━━━━━━━

CREATE LESSON - Upload Video & PPT (Protected - Teacher only)
POST /api/lessons/lesson/create
curl -X POST http://localhost:5001/api/lessons/lesson/create \
  -H "Authorization: Bearer TOKEN" \
  -F "videoFile=@video.mp4" \
  -F "pptFile=@slides.pptx" \
  -F "chapterId=1" \
  -F "title=Lesson 1"

GET LESSONS BY CHAPTER (Protected)
GET /api/lessons/chapter/:chapter_id/lessons
curl -X GET http://localhost:5001/api/lessons/chapter/1/lessons \
  -H "Authorization: Bearer TOKEN"

GET LESSON DETAILS (Protected)
GET /api/lessons/:lesson_id
curl -X GET http://localhost:5001/api/lessons/1 \
  -H "Authorization: Bearer TOKEN"

UPDATE LESSON (Protected - Teacher only)
PUT /api/lessons/lesson/:lesson_id
curl -X PUT http://localhost:5001/api/lessons/lesson/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Lesson"}'

DELETE LESSON (Protected - Teacher only)
DELETE /api/lessons/lesson/:lesson_id
curl -X DELETE http://localhost:5001/api/lessons/lesson/1 \
  -H "Authorization: Bearer TOKEN"

🔹 EXERCISE (BÀI TẬP)
━━━━━━━━━━━━━━━━━━━━━

CREATE EXERCISE (Protected - Teacher only)
POST /api/lessons/exercise/create
curl -X POST http://localhost:5001/api/lessons/exercise/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"1","title":"Exercise 1","description":"Do this exercise"}'

GET EXERCISES BY LESSON (Protected)
GET /api/lessons/:lesson_id/exercises
curl -X GET http://localhost:5001/api/lessons/1/exercises \
  -H "Authorization: Bearer TOKEN"

UPDATE EXERCISE (Protected - Teacher only)
PUT /api/lessons/exercise/:exercise_id
curl -X PUT http://localhost:5001/api/lessons/exercise/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Exercise"}'

DELETE EXERCISE (Protected - Teacher only)
DELETE /api/lessons/exercise/:exercise_id
curl -X DELETE http://localhost:5001/api/lessons/exercise/1 \
  -H "Authorization: Bearer TOKEN"

🔹 LESSON PROGRESS & SCORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UPDATE LESSON PROGRESS (Protected - Student only)
POST /api/lessons/progress/update
curl -X POST http://localhost:5001/api/lessons/progress/update \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"1","progress":"50"}'

GET LESSON PROGRESS (Protected)
GET /api/lessons/:lesson_id/progress
curl -X GET http://localhost:5001/api/lessons/1/progress \
  -H "Authorization: Bearer TOKEN"

CREATE LESSON SCORE (Protected - Student only)
POST /api/lessons/score
curl -X POST http://localhost:5001/api/lessons/score \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"1","score":"8.5"}'

🔹 COURSE CONTENT & GRADING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET COURSE CONTENT (Protected)
GET /api/lessons/course/:course_id/content
curl -X GET http://localhost:5001/api/lessons/course/1/content \
  -H "Authorization: Bearer TOKEN"

GET PENDING SUBMISSIONS (Protected - Teacher only)
GET /api/lessons/pending-submissions
curl -X GET http://localhost:5001/api/lessons/pending-submissions \
  -H "Authorization: Bearer TOKEN"

GRADE SUBMISSION (Protected - Teacher only)
POST /api/lessons/grade-submission
curl -X POST http://localhost:5001/api/lessons/grade-submission \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"submissionId":"1","score":"8"}'

================================================================================
4. ENROLLMENT ROUTES (/api/enrollments)
================================================================================

✅ ENROLL COURSE (Protected - Student only)
POST /api/enrollments/
curl -X POST http://localhost:5001/api/enrollments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"1"}'

✅ GET TEACHER STUDENTS (Protected - Teacher only)
GET /api/enrollments/students
curl -X GET http://localhost:5001/api/enrollments/students \
  -H "Authorization: Bearer TOKEN"

✅ GET STUDENT COURSES (Protected - Teacher only)
GET /api/enrollments/student/:studentId/courses
curl -X GET http://localhost:5001/api/enrollments/student/2/courses \
  -H "Authorization: Bearer TOKEN"

================================================================================
5. EXAM ROUTES (/api/exams)
================================================================================

✅ CREATE EXAM (Protected)
POST /api/exams/
curl -X POST http://localhost:5001/api/exams \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"1","title":"Midterm Exam","duration":"90"}'

✅ GET ALL EXAMS (Protected)
GET /api/exams/
curl -X GET http://localhost:5001/api/exams \
  -H "Authorization: Bearer TOKEN"

✅ GET STUDENT EXAMS (Protected - Student only)
GET /api/exams/student/my-exams
curl -X GET http://localhost:5001/api/exams/student/my-exams \
  -H "Authorization: Bearer TOKEN"

✅ GET EXAMS BY COURSE (Protected)
GET /api/exams/course/:courseId
curl -X GET http://localhost:5001/api/exams/course/1 \
  -H "Authorization: Bearer TOKEN"

✅ GET EXAM DETAILS (Protected)
GET /api/exams/:id
curl -X GET http://localhost:5001/api/exams/1 \
  -H "Authorization: Bearer TOKEN"

✅ UPDATE EXAM (Protected)
PUT /api/exams/:id
curl -X PUT http://localhost:5001/api/exams/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Exam"}'

✅ DELETE EXAM (Protected)
DELETE /api/exams/:id
curl -X DELETE http://localhost:5001/api/exams/1 \
  -H "Authorization: Bearer TOKEN"

🔹 QUESTION MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━

ADD QUESTION (Protected)
POST /api/exams/:examId/questions
curl -X POST http://localhost:5001/api/exams/1/questions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is 2+2?","answers":["3","4","5"],"correctAnswer":"4"}'

UPDATE QUESTION (Protected)
PUT /api/exams/:examId/questions/:questionId
curl -X PUT http://localhost:5001/api/exams/1/questions/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"Updated question"}'

DELETE QUESTION (Protected)
DELETE /api/exams/:examId/questions/:questionId
curl -X DELETE http://localhost:5001/api/exams/1/questions/1 \
  -H "Authorization: Bearer TOKEN"

================================================================================
6. PAYMENT ROUTES (/api/payments)
================================================================================

✅ CREATE PAYMENT (Protected)
POST /api/payments/
curl -X POST http://localhost:5001/api/payments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enrollmentId":"1","amount":"100000"}'

✅ GET USER PAYMENTS (Protected)
GET /api/payments/
curl -X GET http://localhost:5001/api/payments \
  -H "Authorization: Bearer TOKEN"

✅ UPDATE PAYMENT STATUS (Protected - Teacher only)
PUT /api/payments/:id/status
curl -X PUT http://localhost:5001/api/payments/1/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

✅ APPROVE PAYMENT (Protected - Teacher only)
PUT /api/payments/approve/:enrollmentId
curl -X PUT http://localhost:5001/api/payments/approve/1 \
  -H "Authorization: Bearer TOKEN"

================================================================================
7. NOTIFICATION ROUTES (/api/notifications)
================================================================================

✅ GET NOTIFICATIONS (Protected)
GET /api/notifications/
curl -X GET http://localhost:5001/api/notifications \
  -H "Authorization: Bearer TOKEN"

✅ MARK NOTIFICATION AS READ (Protected)
POST /api/notifications/mark-read
curl -X POST http://localhost:5001/api/notifications/mark-read \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notificationId":"1"}'

✅ MARK ALL NOTIFICATIONS AS READ (Protected)
POST /api/notifications/mark-all-read
curl -X POST http://localhost:5001/api/notifications/mark-all-read \
  -H "Authorization: Bearer TOKEN"

✅ CHECK & CREATE EXAM NOTIFICATIONS (Protected)
POST /api/notifications/check-exam-notifications
curl -X POST http://localhost:5001/api/notifications/check-exam-notifications \
  -H "Authorization: Bearer TOKEN"

================================================================================
8. FILE UPLOAD ROUTES (/api/upload)
================================================================================

✅ UPLOAD FILE (Protected)
POST /api/upload
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@video.mp4"

Supports:
- Video files (MP4, WebM, etc.)
- Images (JPG, PNG, etc.)
- PowerPoint files (PPTX)
- Max size: 50MB

================================================================================
AUTHENTICATION
================================================================================

All protected routes require JWT token in the Authorization header:

Format:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

How to get token:
1. Call POST /api/auth/login or POST /api/auth/register
2. Response will include: {"token": "JWT_TOKEN_HERE"}
3. Use this token for all protected requests

Token expires after: (Check your .env file for JWT_EXPIRES configuration)

================================================================================
USER ROLES & PERMISSIONS
================================================================================

1. ADMIN
   - Can create, update, delete courses
   - Can view all students and courses
   - Can create/update/delete exams

2. TEACHER
   - Can create/update courses (only own)
   - Can create chapters, lessons, exercises
   - Can view enrolled students
   - Can grade submissions
   - Can approve payments

3. STUDENT
   - Can enroll in courses
   - Can view lessons and exercises
   - Can submit assignments
   - Can take exams
   - Can view notifications

================================================================================
ERROR RESPONSES
================================================================================

401 Unauthorized
{
  "message": "No token provided" / "Invalid token"
}

403 Forbidden
{
  "message": "Access denied. Insufficient permissions."
}

404 Not Found
{
  "message": "Resource not found"
}

400 Bad Request
{
  "message": "Validation error",
  "errors": [...]
}

500 Server Error
{
  "message": "Internal server error"
}

================================================================================
SUCCESS RESPONSE FORMAT
================================================================================

Most endpoints return:
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}

List endpoints return:
{
  "success": true,
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 20
}

================================================================================
TESTING TIPS
================================================================================

1. Use tools like Postman, cURL, or VS Code REST Client
2. Always include Authorization header for protected routes
3. Use Content-Type: application/json for JSON data
4. Use multipart/form-data for file uploads (form-data in Postman)
5. Check server logs for detailed error messages
6. Test with valid IDs (courses, lessons, users exist in database)

================================================================================
SCHEDULED JOBS
================================================================================

Exam Notifications:
- Runs every 60 minutes
- Checks for upcoming exams and creates notifications
- First check: 10 seconds after server startup
- Automatic cleanup of old notifications

================================================================================
