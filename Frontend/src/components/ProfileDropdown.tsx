import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import InsightsIcon from '@mui/icons-material/Insights';

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
    setIsOpen(false);
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page when implemented
    setIsOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button - GitHub-like */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-satoshi transition-colors"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border-color)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'; }}
      >
        {getInitials(user?.username)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border shadow-xl z-50"
             style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
          {/* User Info */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm font-medium font-satoshi">
              {user?.username || 'User'}
            </p>
            <p className="text-xs font-satoshi truncate" style={{ color: '#9ca3af' }}>
              {user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleEditProfile}
              className="w-full text-left px-3 py-2 text-sm font-satoshi flex items-center gap-3 transition-colors"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border-color)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'; }}
            >
              <PersonIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              Profile
            </button>

            <button
              onClick={() => { navigate('/stats'); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-satoshi flex items-center gap-3 transition-colors"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border-color)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'; }}
            >
              <InsightsIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              View stats
            </button>

            <button
              onClick={handleSettings}
              className="w-full text-left px-3 py-2 text-sm font-satoshi flex items-center gap-3 transition-colors"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border-color)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'; }}
            >
              <SettingsIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              Settings
            </button>

            <button
              onClick={() => navigate('/welcome')}
              className="w-full text-left px-3 py-2 text-sm font-satoshi flex items-center gap-3 transition-colors"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border-color)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'; }}
            >
              <HomeIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              Welcome Page
            </button>

            <div className="my-1 border-t" style={{ borderColor: 'var(--border-color)' }} />

            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-red-400 font-satoshi flex items-center gap-3 transition-colors"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border-color)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'; }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;