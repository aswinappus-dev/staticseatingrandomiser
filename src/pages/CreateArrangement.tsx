import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { ExamSlot } from '../types';
import Modal from '../components/Modal';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

const SlotForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const { classGroups, students, halls, addExamSlot } = useAppContext();

  const [slotName, setSlotName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedClassGroupIds, setSelectedClassGroupIds] = useState<Set<string>>(new Set());
  const [selectedHallIds, setSelectedHallIds] = useState<Set<string>>(new Set());

  const handleDeptChange = (deptId: string) => {
    setSelectedClassGroupIds(prev => {
      const newSet = new Set(prev);
      newSet.has(deptId) ? newSet.delete(deptId) : newSet.add(deptId);
      return newSet;
    });
  };

  const handleHallChange = (hallId: string) => {
    setSelectedHallIds(prev => {
      const newSet = new Set(prev);
      newSet.has(hallId) ? newSet.delete(hallId) : newSet.add(hallId);
      return newSet;
    });
  };
  
  const { totalStudents, totalCapacity } = useMemo(() => {
    const studentCount = students.filter(s => selectedClassGroupIds.has(s.departmentId)).length;
    const capacityCount = halls.filter(h => selectedHallIds.has(h.id)).reduce((sum, hall) => sum + hall.capacity, 0);
    return { totalStudents: studentCount, totalCapacity: capacityCount * 2 }; // Max capacity is 2 per bench
  }, [selectedClassGroupIds, selectedHallIds, students, halls]);

  const capacityWarning = totalStudents > 0 && totalStudents > totalCapacity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotName || !startTime || !endTime || selectedClassGroupIds.size === 0 || selectedHallIds.size === 0) {
      alert("Please fill all fields and select at least one class and hall.");
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
        alert("End time must be after start time.");
        return;
    }
    if (capacityWarning) {
      alert("Cannot create slot: Total students exceeds maximum hall capacity (2 per bench).");
      return;
    }

    addExamSlot({
        name: slotName,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        classGroupIds: Array.from(selectedClassGroupIds),
        hallIds: Array.from(selectedHallIds)
    });
    onSubmit(); // Close modal
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="slotName" className="block text-sm font-medium text-gray-400">Exam Slot Name</label>
            <input type="text" id="slotName" value={slotName} onChange={e => setSlotName(e.target.value)} required className={inputClass} placeholder="e.g., Midterm Exam - Day 1"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-400">Start Time</label>
                <input type="datetime-local" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required className={inputClass} />
             </div>
             <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-400">End Time</label>
                <input type="datetime-local" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required className={inputClass} />
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Select Class Groups</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto p-2 bg-gray-900 border border-gray-600 rounded-md">
                    {classGroups.map(dept => (
                    <label key={dept.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
                        checked={selectedClassGroupIds.has(dept.id)} onChange={() => handleDeptChange(dept.id)} />
                        <span className="text-sm text-gray-300">{dept.name}</span>
                    </label>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Select Halls</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto p-2 bg-gray-900 border border-gray-600 rounded-md">
                    {halls.map(hall => (
                    <label key={hall.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
                        checked={selectedHallIds.has(hall.id)} onChange={() => handleHallChange(hall.id)} />
                        <span className="text-sm text-gray-300">{hall.block} - {hall.name} ({hall.capacity} benches)</span>
                    </label>
                    ))}
                </div>
            </div>
        </div>

        <div className={`p-2 mt-2 rounded-md border text-xs ${capacityWarning ? 'bg-red-900 bg-opacity-50 border-red-500 text-red-300' : 'bg-indigo-900 bg-opacity-50 border-indigo-500 text-indigo-300'}`}>
            <p>Students: <span className="font-semibold">{totalStudents}</span> | Max Capacity: <span className="font-semibold">{totalCapacity}</span></p>
            {capacityWarning && <p className="font-bold">Warning: Not enough seats for the selected students!</p>}
        </div>

        <div className="flex justify-end pt-2">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Confirm Slot
            </button>
      </div>
    </form>
  );
};

const ManageSlots: React.FC = () => {
    const { examSlots } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const getStatusChip = (status: ExamSlot['status']) => {
        const base = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'PENDING': return `${base} bg-yellow-800 text-yellow-200`;
            case 'GENERATED': return `${base} bg-blue-800 text-blue-200`;
            case 'ACTIVE': return `${base} bg-green-800 text-green-200`;
            case 'COMPLETED': return `${base} bg-gray-600 text-gray-300`;
            default: return "";
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-100">Manage Exam Slots</h1>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    <PlusIcon />
                    Create New Slot
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Slot Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {examSlots.map((slot) => (
                            <tr key={slot.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{slot.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(slot.startTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusChip(slot.status)}>{slot.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Link to={`/admin/slot/${slot.id}`} className="text-indigo-400 hover:text-indigo-300">View Details</Link>
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Exam Slot">
                <SlotForm onSubmit={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ManageSlots;