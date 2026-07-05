import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
const Home = React.lazy(() => import('./pages/Home'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const Lecturer = React.lazy(() => import('./pages/Lecturer'));
const AllCourses = React.lazy(() => import('./pages/AllCourses'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const TeacherProfile = React.lazy(() => import('./pages/TeacherProfile'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const LessonDetail = React.lazy(() => import('./pages/LessonDetail'));
const Profile = React.lazy(() => import('./pages/Profile'));
const MyCourses = React.lazy(() => import('./pages/MyCourses'));
const ManageStudents = React.lazy(() => import('./pages/ManageStudents'));
const TeachingCourses = React.lazy(() => import('./pages/TeachingCourses'));
const TeacherCourses = React.lazy(() => import('./pages/TeacherCourses'));
const StudentDetail = React.lazy(() => import('./pages/StudentDetail'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const AdminCourses = React.lazy(() => import('./pages/AdminCourses'));
const AdminExercises = React.lazy(() => import('./pages/AdminExercises'));
const ManageLessonsNew = React.lazy(() => import('./pages/ManageLessonsNew'));
const ManageExercises = React.lazy(() => import('./pages/ManageExercises'));
const Courses = React.lazy(() => import('./pages/Courses'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const Exams = React.lazy(() => import('./pages/Exams'));
const ExamTaking = React.lazy(() => import('./pages/ExamTaking'));
import Header from './components/Header';
import DarkModeToggle from './components/DarkModeToggle';
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const ManageExams = React.lazy(() => import('./pages/ManageExams'));
const ManageChapters = React.lazy(() => import('./pages/ManageChapters'));

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header - ẩn ở trang admin */}
      {!isAdminRoute && <Header />}
      
      {/* Nút chuyển dark mode, ẩn ở trang admin */}
      {!isAdminRoute && (
        <div className="fixed top-5 right-5 z-[9999]">
          <DarkModeToggle />
        </div>
      )}
      
      <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/terms-of-service" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<TermsOfService />} />
        <Route path="/lecturer" element={<Lecturer />} />
        <Route path="/all-courses" element={<AllCourses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/teachers/:id" element={<TeacherProfile />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exam/:examId" element={<ExamTaking />} />
        <Route path="/manage-students" element={<ManageStudents />} />
        <Route path="/teaching-courses" element={<TeachingCourses />} />
        <Route path="/teacher-courses" element={<TeacherCourses />} />
        <Route path="/teacher-courses/:id" element={<TeacherCourses />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/exercises" element={<AdminExercises />} />
        <Route path="/manage-lessons/:courseId" element={<ManageLessonsNew />} />
        <Route path="/manage-exams" element={<ManageExams />} />
        <Route path="/my-courses/:id" element={<CourseDetail />} />
        <Route path="/lesson/:lessonId" element={<LessonDetail />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/manage-chapters/:courseId" element={<ManageChapters />} />

      </Routes>
      </Suspense>
    </div>
  );
};

export default AppRoutes;