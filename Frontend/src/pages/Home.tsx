import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

function Home() {
  const [backendMessage, setBackendMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getHello();
        setBackendMessage(data.message);
      } catch (error) {
        setBackendMessage('Backend not connected');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white mb-8 drop-shadow-2xl">
          Hello World
        </h1>
        <p className="text-2xl text-blue-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          Welcome to your Electron + React + TypeScript application with Tailwind CSS
        </p>
        <div className="mb-8 p-4 bg-black bg-opacity-30 rounded-lg">
          <p className="text-lg text-green-300">
            Backend Status: {isLoading ? 'Connecting...' : backendMessage}
          </p>
        </div>
        <div className="flex gap-6 justify-center">
          <Link 
            to="/about"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            About Kiro
          </Link>
          <Link 
            to="/pokemon"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-900 transition-all duration-200"
          >
            Pokemon Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;