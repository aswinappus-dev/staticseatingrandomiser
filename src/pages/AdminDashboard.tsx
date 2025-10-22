import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const StudentsIcon = () => <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const HallsIcon = () => <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-11h1m-1 4h1m-1 4h1"></path></svg>;
const SlotsIcon = () => <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;


const AdminDashboard: React.FC = () => {
  const { students, halls, examSlots, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Manage exam resources and generate seating plans.</p>
        </div>
         <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-red-500 transition-transform transform hover:scale-105"
        >
            <LogoutIcon />
            Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{students.length}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Halls</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{halls.length}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam Slots Created</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{examSlots.length}</p>
         </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/students" className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <StudentsIcon />
                <span className="ml-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Manage Students</span>
            </Link>
             <Link to="/admin/halls" className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <HallsIcon />
                <span className="ml-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Manage Halls</span>
            </Link>
             <Link to="/admin/slots" className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <SlotsIcon />
                <span className="ml-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Manage Slots</span>
            </Link>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;