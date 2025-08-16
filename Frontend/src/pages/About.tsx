import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white mb-8 drop-shadow-2xl">
          Hi I am Kiro
        </h1>
        <p className="text-2xl text-green-200 mb-12 max-w-2xl mx-auto leading-relaxed">
          I'm your AI assistant and IDE built to help developers create amazing applications!
        </p>
        <div className="flex gap-6 justify-center">
          <Link 
            to="/"
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Back to Home
          </Link>
          <Link 
            to="/pokemon"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-teal-900 transition-all duration-200"
          >
            Pokemon Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;