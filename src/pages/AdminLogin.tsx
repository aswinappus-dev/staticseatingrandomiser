import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import LiveBackground from '../components/LiveBackground';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, logout, isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    logout();
  };
  
  const inputClass = "w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <>
      <LiveBackground />
      <div className="min-h-screen flex items-center justify-center px-4 bg-transparent">
        <div className="w-full max-w-sm">
          {isAuthenticated ? (
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Already Logged In</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">You are already logged in as an administrator.</p>
              <div className="space-y-4">
                <Link to="/admin/dashboard" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105">
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">Admin Login</h1>
              {error && <p className="bg-red-200 dark:bg-red-900 bg-opacity-50 text-red-800 dark:text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="password"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
              >
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLogin;