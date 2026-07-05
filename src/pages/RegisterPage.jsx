import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/register'); }, [navigate]);
  return null;
};

export default RegisterPage;