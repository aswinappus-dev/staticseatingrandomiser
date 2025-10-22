import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AnimatedLogo from '../components/AnimatedLogo';
import LiveBackground from '../components/LiveBackground';

const UniversalLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <LiveBackground />
      {/* Hover zone for desktop */}
      <div
        className="fixed top-0 left-0 h-full w-4 z-40 hidden md:block"
        onMouseEnter={() => setIsSidebarOpen(true)}
      />
      
      <div onMouseLeave={() => setIsSidebarOpen(false)}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pl-64' : 'pl-0'}`}>
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 md:hidden flex justify-between items-center">
            <NavLink to="/">
              <AnimatedLogo />
            </NavLink>
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-16 6h16" />
                 </svg>
            </button>
        </header>
        <main className="flex-1 flex flex-col overflow-y-auto bg-transparent">
          <div className="w-full container mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col items-center justify-start md:justify-center">
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UniversalLayout;