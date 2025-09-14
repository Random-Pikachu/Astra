import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Check for user data in URL parameters (from Google OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        login(userData);
        // Redirect to welcome page after successful OAuth login
        navigate('/welcome', { replace: true });
      } catch (error) {
        navigate('/login', { replace: true });
      }
    } else {
      // No user data in URL, redirect to login
      navigate('/login', { replace: true });
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-satoshi" style={{ color: 'var(--text-secondary)' }}>
          Completing sign in...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;