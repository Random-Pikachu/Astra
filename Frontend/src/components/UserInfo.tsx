import React from 'react';
import { useUser } from '../hooks/useUser';

// Example component showing how to access user data anywhere in the app
const UserInfo: React.FC = () => {
  const { userRedux, isAuthenticated, userId, userEmail, username, userCode } = useUser();

  if (!isAuthenticated) {
    return <div>User not logged in</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-semibold mb-2">User Information</h3>
      <div className="space-y-1 text-sm">
        <p className="text-gray-300">ID: {userId}</p>
        <p className="text-gray-300">Email: {userEmail}</p>
        <p className="text-gray-300">Username: {username || 'Not set'}</p>
        <p className="text-gray-300">User Code: {userCode || 'Not set'}</p>
      </div>
    </div>
  );
};

export default UserInfo;