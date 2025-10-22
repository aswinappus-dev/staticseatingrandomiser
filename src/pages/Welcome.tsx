import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LiveBackground from '../components/LiveBackground';
import Sidebar from '../components/Sidebar';

const Welcome: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize state based on sessionStorage. This runs only once.
  // If 'hasVisitedWelcome' is not present, it's the first visit.
  const [isFirstVisit] = useState(() => !sessionStorage.getItem('hasVisitedWelcome'));

  // On the first visit, set the flag in sessionStorage for subsequent visits.
  useEffect(() => {
    if (isFirstVisit) {
      sessionStorage.setItem('hasVisitedWelcome', 'true');
    }
  }, [isFirstVisit]);


  const tagline = "The seamless solution for exam seating.";
  const taglineSpans = useMemo(() => {
    return tagline.split('').map((char, index) => (
      <span key={index} style={{ animationDelay: `${2.5 + index * 0.03}s` }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!contentRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / 50;
      const y = (clientY - innerHeight / 2) / 50;
      contentRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Determine classes based on first visit
  const introTextClass = isFirstVisit ? 'welcome-intro-text' : 'revisit-intro-text';
  const brandTextClass = isFirstVisit ? 'welcome-brand-text' : 'revisit-brand-text';
  const taglineClass = isFirstVisit ? 'welcome-tagline' : 'revisit-tagline';
  const buttonClass = isFirstVisit ? 'welcome-button' : 'revisit-button';

  return (
    <div className="min-h-screen">
      <LiveBackground />
      {/* Hover zone for desktop */}
      <div
        className="fixed top-0 left-0 h-full w-4 z-40 hidden md:block"
        onMouseEnter={() => setIsSidebarOpen(true)}
      />
      <div onMouseLeave={() => setIsSidebarOpen(false)}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>


      {/* Sidebar Toggle Button for mobile */}
      <button 
        onClick={() => setIsSidebarOpen(true)} 
        aria-label="Open sidebar"
        className="fixed top-4 left-4 z-20 p-2 rounded-md text-gray-300 hover:text-white bg-gray-800 bg-opacity-50 hover:bg-gray-700 md:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-16 6h16" />
        </svg>
      </button>
      
      <div className={`min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden ${isFirstVisit ? 'cinematic-welcome-container' : 'revisit-welcome-container'}`}>
        <main ref={contentRef} style={{ transition: 'transform 0.1s ease-out' }}>
          <h2 className={`text-3xl md:text-5xl text-gray-600 dark:text-gray-300 mb-2 font-light ${introTextClass}`}>
            Welcome to
          </h2>
          <h1 className={`font-bold text-7xl md:text-8xl ${brandTextClass}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
            ExamFlow
          </h1>
          {isFirstVisit ? (
             <p className={`text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-4 max-w-2xl ${taglineClass}`}>
                {taglineSpans}
             </p>
          ) : (
             <p className={`text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-4 max-w-2xl ${taglineClass}`}>
                {tagline}
             </p>
          )}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/student"
              className={`w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 ${buttonClass}`}
              style={isFirstVisit ? { animationDelay: '2.8s' } : {}}
            >
              I'm a Student
            </Link>
            <Link 
              to="/invigilator"
              className={`w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 ${buttonClass}`}
              style={isFirstVisit ? { animationDelay: '3s' } : {}}
            >
              I'm an Invigilator
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Welcome;