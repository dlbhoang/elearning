import mockExercises from '../data/mockExercises.json';

export const getAllExercises = () => mockExercises;

export const searchExercises = (query) => {
  if (!query) return mockExercises;
  return mockExercises.filter(ex =>
    ex.title.toLowerCase().includes(query.toLowerCase()) ||
    ex.course.toLowerCase().includes(query.toLowerCase()) ||
    ex.teacher.toLowerCase().includes(query.toLowerCase())
  );
}; 