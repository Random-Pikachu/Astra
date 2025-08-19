import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  googleId?: string;
}

const Welcome = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user data in URL parameters (from Google OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
        // Store in localStorage for future visits
        localStorage.setItem('user', JSON.stringify(userData));
        // Clean up URL
        window.history.replaceState({}, document.title, '/welcome');
      } catch (error) {
        console.error('Error parsing user data from URL:', error);
        navigate('/login');
      }
    } else {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // If no user data, redirect to login
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-satoshi" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-20 h-20" viewBox="0 0 256 256" fill="none">
              <circle cx="128" cy="128" r="120" fill="#47848F" />
              <circle cx="128" cy="128" r="100" fill="#9FEAF9" />
              <circle cx="128" cy="128" r="85" fill="#47848F" />
              <circle cx="128" cy="128" r="70" fill="#9FEAF9" />
              <circle cx="128" cy="128" r="55" fill="#47848F" />
              <circle cx="128" cy="128" r="40" fill="#9FEAF9" />
              <circle cx="128" cy="128" r="25" fill="#47848F" />
            </svg>
          </div>
        </div>

        {/* Welcome Card */}
        <div 
          className="rounded-2xl p-8 shadow-2xl border backdrop-blur-sm"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--border-color)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 
                className="text-3xl font-bold mb-2 font-satoshi"
                style={{ color: 'var(--text-primary)' }}
              >
                Welcome to Astra
              </h1>
              <div 
                className="text-lg font-medium font-satoshi"
                style={{ color: '#9FEAF9' }}
              >
                Hello, {user?.username || 'User'}! 👋
              </div>
            </div>
            
            <div 
              className="text-sm font-satoshi mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              You've successfully signed in to your account
            </div>
          </div>

          {/* User Info Card */}
          <div 
            className="rounded-xl p-6 mb-8 border"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-satoshi"
                style={{ 
                  backgroundColor: '#47848F',
                  color: 'white'
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* User Details */}
              <div className="flex-1">
                <div 
                  className="font-medium font-satoshi"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user?.username}
                </div>
                <div 
                  className="text-sm font-satoshi"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user?.email}
                </div>
              </div>
              
            
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Continue Button */}
            <button
              className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 font-satoshi"
              style={{
                backgroundColor: '#47848F',
                color: 'white',
                border: 'none'
              }}
            >
              Continue to Dashboard
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80 font-satoshi"
              style={{
                backgroundColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                border: 'none'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p 
            className="text-xs font-satoshi"
            style={{ color: 'var(--text-secondary)' }}
          >
            Welcome to the future of productivity
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;