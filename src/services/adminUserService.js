import mockUsers from '../data/mockUsers.json';

export const getAllUsers = () => mockUsers;

export const searchUsers = (query) => {
  if (!query) return mockUsers;
  return mockUsers.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );
}; 