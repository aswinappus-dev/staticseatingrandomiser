import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { ExamSlot } from '../types';
import Modal from '../components/Modal';
import SlotForm from '../components/SlotForm';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const ManageSlots: React.FC = () => {
    const { examSlots, deleteExamSlot } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const getStatusChip = (status: ExamSlot['status']) => {
        const base = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'PENDING': return `${base} bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200`;
            case 'GENERATED': return `${base} bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200`;
            case 'ACTIVE': return `${base} bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200`;
            case 'COMPLETED': return `${base} bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-300`;
            default: return "";
        }
    };

    const handleDelete = (slotId: string) => {
        if (window.confirm('Are you sure you want to delete this exam slot? This action cannot be undone.')) {
            deleteExamSlot(slotId);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Exam Slots</h1>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-transform transform hover:scale-105">
                    <PlusIcon />
                    Create New Slot
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slot Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {examSlots.map((slot) => (
                            <tr key={slot.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{slot.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(slot.startTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusChip(slot.status)}>{slot.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-4">
                                    <Link to={`/admin/slot/${slot.id}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">View Details</Link>
                                    <button onClick={() => handleDelete(slot.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-transform transform hover:scale-110"><TrashIcon/></button>
                                </td>
                            </tr>
                        ))}
                         {examSlots.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">No exam slots created yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Exam Slot" size="2xl">
                <SlotForm onSubmit={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ManageSlots;