import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Student, Hall, ExamSlot } from '../types';

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CountdownTimer: React.FC<{ targetDate: Date, onComplete: () => void }> = ({ targetDate, onComplete }) => {
    const calculateTimeLeft = () => {
        const difference = targetDate.getTime() - new Date().getTime();
        if (difference <= 0) {
            onComplete();
            return { hours: 0, minutes: 0, seconds: 0};
        }
        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mt-4">Your seating details will be revealed in:</p>
            <div className="font-mono text-4xl text-cyan-600 dark:text-cyan-400 mt-2">
                <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
        </div>
    );
};


const StudentFinder: React.FC = () => {
  const { getPublicSlotDetails, findStudentSeat } = useAppContext();
  const [registerNumber, setRegisterNumber] = useState('');
  const [searchResult, setSearchResult] = useState<{ student: Student, hall: Hall, seatNumber: string } | null | 'not_found'>(null);
  const [slotDetails, setSlotDetails] = useState(getPublicSlotDetails());

  useEffect(() => {
    // Proactively request notification permission when the user sees the countdown.
    if (slotDetails.status === 'UPCOMING' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [slotDetails.status]);

  const refreshSlotDetails = () => setSlotDetails(getPublicSlotDetails());

  const showNotification = () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications.');
      return;
    }
    if (Notification.permission === 'granted') {
      new Notification('Seating Details Ready!', {
        body: 'Your exam seating information is now available. Enter your register number to find your seat.',
        icon: '/vite.svg',
      });
    }
  };

  const handleCountdownComplete = () => {
    refreshSlotDetails();
    showNotification();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerNumber || !slotDetails.slot) return;
    const result = findStudentSeat(registerNumber, slotDetails.slot);
    setSearchResult(result || 'not_found');
  };

  const renderResult = () => {
    if (searchResult === 'not_found') {
      return <p className="text-red-500 dark:text-red-400 mt-4">Register number not found in the current seating plan.</p>;
    }
    if (searchResult) {
      return (
        <div className="mt-6 text-left bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 w-full animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-bold text-lg">{searchResult.student.name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Register No.</p>
                    <p className="font-bold text-lg">{searchResult.student.registerNumber}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Block</p>
                    <p className="font-bold text-lg">{searchResult.hall.block}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hall</p>
                    <p className="font-bold text-lg">{searchResult.hall.name}</p>
                </div>
            </div>
             <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Seat Number</p>
                <p className="font-extrabold text-3xl sm:text-4xl text-cyan-600 dark:text-cyan-400">{searchResult.seatNumber}</p>
            </div>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    switch(slotDetails.status) {
        case 'UPCOMING':
            return <CountdownTimer targetDate={slotDetails.revealTime!} onComplete={handleCountdownComplete} />;
        case 'ACTIVE':
            return (
                 <>
                    <form onSubmit={handleSearch} className="mt-6 w-full">
                        <input
                            type="text"
                            value={registerNumber}
                            onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                            placeholder="Enter Your Register No."
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                        />
                        <button
                            type="submit"
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
                        >
                            Search
                        </button>
                    </form>
                    {renderResult()}
                </>
            );
        default:
             return (
                 <>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">There are no active exams right now.</p>
                    <p className="text-sm text-gray-500 mt-1">Please check back closer to the exam time.</p>
                 </>
            );
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 relative">
        <Link 
          to="/" 
          aria-label="Go back to homepage"
          className="absolute top-4 left-4 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110 transition-all duration-200"
        >
          <BackArrowIcon />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Find Your Seat</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentFinder;