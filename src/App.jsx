import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppContent = () => {
  return (
    <DarkModeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <AppRoutes />
        </Router>
      </GoogleOAuthProvider>
    </DarkModeProvider>
  );
};

const App = () => <AppContent />;

export default App;
