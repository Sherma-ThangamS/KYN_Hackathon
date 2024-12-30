import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { googleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await googleSignIn();
      navigate('/');
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-screen animated background */}
      <div className="fixed inset-0 bg-white">
        {/* Animated blobs with enhanced animations and colors */}
        <div 
          className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
        />
        <div 
          className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob-reverse"
          style={{ animationDelay: '-2s' }}
        />
        <div 
          className="absolute -bottom-1/2 left-1/4 w-[1000px] h-[1000px] bg-pink-500/50 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ animationDelay: '-4s' }}
        />
        <div 
          className="absolute -top-1/4 left-1/3 w-[800px] h-[800px] bg-blue-300/50 rounded-full mix-blend-multiply filter blur-3xl animate-blob-spin"
          style={{ animationDelay: '-3s' }}
        />
        </div>
      <div className="bg-white rounded-lg  shadow-xl p-8  relative min-h-screen  max-w-md flex flex-col items-center justify-center z-10">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="bg-indigo-100 p-4 rounded-full">
            <svg
              className="w-12 h-12 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Insights Hub</h1>
          <p className="text-gray-600 text-center text-sm">
            Your personalized news experience awaits
          </p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <p className="text-gray-700">Real-time updates</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <p className="text-gray-700">AI-powered summaries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
