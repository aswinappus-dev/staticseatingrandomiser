import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';

const BellIcon = () => <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>;

const Notifications: React.FC = () => {
    const { examSlots, classGroups } = useAppContext();

    const upcomingExams = useMemo(() => {
        return examSlots
            .filter(slot => slot.status === 'PENDING' || slot.status === 'GENERATED')
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [examSlots]);

    const getDepartmentNames = (ids: string[]) => {
        return ids.map(id => classGroups.find(d => d.id === id)?.name).filter(Boolean).join(', ');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Here are the upcoming scheduled exams.</p>
            </div>

            {upcomingExams.length > 0 ? (
                <div className="space-y-4">
                    {upcomingExams.map(slot => (
                        <div key={slot.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${slot.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-800' : 'bg-blue-100 dark:bg-blue-800'}`}>
                                    <svg className={`w-6 h-6 ${slot.status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-200' : 'text-blue-600 dark:text-blue-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{slot.name}</h2>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${slot.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' : 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'}`}>
                                        {slot.status === 'PENDING' ? 'Awaiting Generation' : 'Generated'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Starts on: <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(slot.startTime).toLocaleString()}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Student Groups: <span className="font-medium text-gray-700 dark:text-gray-300">{getDepartmentNames(slot.classGroupIds)}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
                    <BellIcon />
                    <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">All Clear!</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">There are no upcoming exams scheduled.</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;