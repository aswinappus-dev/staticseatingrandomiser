
import React from 'react';
import { Link } from 'react-router-dom';
import InfoCard from '../components/InfoCard';
import { useAppContext } from '../contexts/AppContext';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197" /></svg>
);
const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-11h1m-1 4h1m-1 4h1" /></svg>
);
const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);

const Dashboard: React.FC = () => {
  // FIX: Destructure 'examSlots' instead of 'arrangements' as it's the correct property from the context.
  const { students, halls, examSlots } = useAppContext();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Welcome to ExamFlow</h1>
        <p className="mt-2 text-lg text-slate-600">Your one-stop solution for exam seating management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard title="Total Students" value={students.length} icon={<UserIcon />} />
        <InfoCard title="Total Halls" value={halls.length} icon={<BuildingIcon />} />
        {/* FIX: Use examSlots.length to display the count and update the title to be more accurate. */}
        <InfoCard title="Exam Slots" value={examSlots.length} icon={<DocumentIcon />} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Get Started</h2>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          <Link to="/students" className="px-6 py-3 w-full md:w-auto text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors">
            Manage Students
          </Link>
          <Link to="/halls" className="px-6 py-3 w-full md:w-auto text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors">
            Manage Halls
          </Link>
          <Link to="/create" className="px-6 py-3 w-full md:w-auto text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
            Create New Arrangement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
