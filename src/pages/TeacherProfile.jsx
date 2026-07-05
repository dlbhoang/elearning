import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import ReviewItem from '../components/ReviewItem';
import TeacherIntro from '../components/TeacherIntro';
import teachers from '../data/teacher.json';
import teacherCourses from '../data/teacherCourses.json';
import { FaChalkboardTeacher, FaEnvelope } from 'react-icons/fa';

const TeacherProfile = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Lấy dữ liệu giáo viên theo id
    const t = teachers.find(t => String(t.id) === String(id));
    setTeacher(t || null);
    // Lấy khoá học của giáo viên
    setCourses(teacherCourses.filter(c => String(c.teacherId) === String(id)));
  }, [id]);

  if (!teacher) return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="flex-1 pt-28 pb-16 px-2 flex items-center justify-center">
        <div className="text-center text-lg text-gray-600 dark:text-gray-300">Không tìm thấy giáo viên.</div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="flex-1 pt-28 pb-16 px-2">
        <div className="max-w-4xl mx-auto">
          {/* Thay thế phần giới thiệu giáo viên bằng TeacherIntro */}
          <div className="mb-10">
            <TeacherIntro teacher={teacher} />
          </div>
          {/* Khoá học giáo viên dạy */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Khoá học đang dạy</h2>
            {courses.length === 0 ? (
              <div className="text-gray-500 italic">Chưa có khoá học nào.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {courses.map((course) => {
                  // Đồng bộ các trường cho CourseCard
                  let badge = course.badge;
                  let isFree = false, isHot = false, isNew = false;
                  if (badge === 'Miễn phí') isFree = true;
                  if (badge === 'Hot') isHot = true;
                  if (badge === 'Mới') isNew = true;
                  return (
                    <CourseCard
                      key={course.id}
                      course={{
                        ...course,
                        teacher,
                        startDate: course.startDate || undefined,
                        badge,
                        isFree,
                        isHot,
                        isNew,
                        image: course.image || teacher.avatar
                      }}
                      onRegister={() => {}}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Đánh giá của học sinh/phụ huynh */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Phản hồi học viên & phụ huynh</h2>
            {teacher.feedbacks && teacher.feedbacks.length > 0 ? (
              <div className="space-y-4">
                {teacher.feedbacks.map((fb, i) => (
                  <ReviewItem key={i} review={{
                    studentName: fb.name,
                    rating: fb.rating,
                    comment: fb.comment
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">Chưa có phản hồi.</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeacherProfile;
