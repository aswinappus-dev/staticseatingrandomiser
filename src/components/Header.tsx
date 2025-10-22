
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const linkClass = "px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors";
  const activeLinkClass = "bg-slate-900 text-white";

  return (
    <header className="bg-slate-800 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="text-white font-bold text-xl">
              ExamFlow
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`} end>
                Dashboard
              </NavLink>
              <NavLink to="/students" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
                Students
              </NavLink>
              <NavLink to="/halls" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
                Halls
              </NavLink>
              <NavLink to="/create" className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500">
                New Arrangement
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
