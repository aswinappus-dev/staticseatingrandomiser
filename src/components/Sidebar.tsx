import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import AnimatedLogo from './AnimatedLogo';

// Icons for sidebar links
const HomeIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const SearchIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const UserGroupIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const DashboardIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const NotificationIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>;
const AboutIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const SupportIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 1.846-1.21 3.4-3 3.86-1.02.28-2 .28-2 .28m0 0s-1 0-1 1v2m0 0s-1 0-1-1-1.405-2.28-2.288-3.162C4.305 10.22 4 9.477 4 8.64C4 6.63 5.63 5 7.64 5c1.29 0 2.48.53 3.36 1.36"></path></svg>;
const LoginIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>;

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { isAuthenticated } = useAppContext();

  const linkClass = "flex items-center mt-2 py-2 px-6 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 rounded-md transition-all transform hover:scale-105";
  const activeLinkClass = "bg-gray-200/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100";

  const publicNav = (
    <>
      <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`} end>
          <HomeIcon /> Home
      </NavLink>
      <NavLink to="/student" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <SearchIcon /> Find My Seat
      </NavLink>
      <NavLink to="/invigilator" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <UserGroupIcon /> Invigilator Dashboard
      </NavLink>
      <hr className="my-3 border-gray-200 dark:border-gray-700" />
      <NavLink to="/about" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <AboutIcon /> About
      </NavLink>
      <NavLink to="/support" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <SupportIcon /> Support
      </NavLink>
       <hr className="my-3 border-t border-gray-200 dark:border-gray-700" />
       <NavLink to="/admin/login" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <LoginIcon /> Admin Login
      </NavLink>
    </>
  );

  const adminNav = (
    <>
      <NavLink to="/admin/dashboard" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`} end>
          <DashboardIcon /> Admin Panel
      </NavLink>
      <hr className="my-3 border-gray-200 dark:border-gray-700" />
      <NavLink to="/admin/notifications" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <NotificationIcon /> Notifications
      </NavLink>
      <NavLink to="/about" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <AboutIcon /> About
      </NavLink>
      <NavLink to="/support" onClick={closeSidebar} className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}>
          <SupportIcon /> Support
      </NavLink>
    </>
  );

  return (
     <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
        ></div>
      )}

      <div className={`
        fixed inset-y-0 left-0 z-30
        flex flex-col w-64 bg-white dark:bg-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 bg-gray-100 dark:bg-gray-900">
          <NavLink to="/" onClick={closeSidebar}>
            <AnimatedLogo />
          </NavLink>
        </div>
        
        <div className="flex flex-col justify-between flex-1 overflow-y-auto">
          <nav className="px-2 py-4">
            {isAuthenticated ? adminNav : publicNav}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;