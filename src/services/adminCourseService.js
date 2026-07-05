import mockCourses from '../data/mockCourses.json';

export const getAllCourses = () => mockCourses;

export const searchCourses = (query) => {
  if (!query) return mockCourses;
  return mockCourses.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.teacher.toLowerCase().includes(query.toLowerCase())
  );
}; 