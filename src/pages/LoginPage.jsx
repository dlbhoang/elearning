import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/login'); }, [navigate]);
  return null;
};

export default LoginPage;