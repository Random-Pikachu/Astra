import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile page when implemented
    console.log('Edit profile clicked');
    setIsOpen(false);
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page when implemented
    console.log('Settings clicked');
    setIsOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold font-satoshi hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {getInitials(user?.username)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-medium text-white font-satoshi">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-400 font-satoshi truncate">
              {user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleEditProfile}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white font-satoshi flex items-center gap-3 transition-colors duration-150"
            >
              <PersonIcon sx={{ fontSize: 16 }} />
              Edit Profile
            </button>

            <button
              onClick={handleSettings}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white font-satoshi flex items-center gap-3 transition-colors duration-150"
            >
              <SettingsIcon sx={{ fontSize: 16 }} />
              Settings
            </button>

            <button
              onClick={() => navigate('/welcome')}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white font-satoshi flex items-center gap-3 transition-colors duration-150"
            >
              <HomeIcon sx={{ fontSize: 16 }} />
              Welcome Page
            </button>

            <div className="border-t border-gray-700 mt-1 pt-1">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 font-satoshi flex items-center gap-3 transition-colors duration-150"
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;