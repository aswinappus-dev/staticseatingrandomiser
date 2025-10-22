import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../contexts/AppContext';
import { Hall } from '../types';
import Modal from '../components/Modal';
import HallForm from '../components/HallForm';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

const BenchLayoutTooltip: React.FC<{ capacity: number; columns: 2 | 3 | 4; }> = ({ capacity, columns }) => {
  const rows = Math.ceil(capacity / columns);
  const grid = Array.from({ length: rows * columns }, (_, i) => i < capacity);

  const getGridColsClass = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridColsClass()} gap-1 p-2`}>
      {grid.map((isBench, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-sm ${isBench ? 'bg-indigo-400' : 'bg-gray-500 dark:bg-gray-700'}`}
        />
      ))}
    </div>
  );
};


const ManageHalls: React.FC = () => {
  const { halls, addHall, updateHall, deleteHall } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [tooltip, setTooltip] = useState<{
    hall: Hall;
    top: number;
    left: number;
  } | null>(null);


  const handleOpenModal = (hall: Hall | null = null) => {
    setEditingHall(hall);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingHall(null);
    setIsModalOpen(false);
  };

  const handleSaveHall = (hall: Hall | Omit<Hall, 'id'>) => {
    if ('id' in hall) {
      updateHall(hall);
    } else {
      addHall(hall);
    }
    handleCloseModal();
  };

  const handleDelete = (hallId: string) => {
    if (window.confirm('Are you sure you want to delete this hall?')) {
      deleteHall(hallId);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, hall: Hall) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      hall,
      top: rect.top + window.scrollY - 10,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Halls</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          <PlusIcon />
          Add New Hall
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Block</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hall Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Benches</th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bench Layout</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {halls.map((hall) => (
              <tr key={hall.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{hall.block}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{hall.name}</td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 cursor-pointer hidden md:table-cell"
                  onMouseEnter={(e) => handleMouseEnter(e, hall)}
                  onMouseLeave={handleMouseLeave}
                >
                  {hall.capacity}
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 md:hidden">{hall.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{hall.columns} Columns</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => handleOpenModal(hall)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-transform transform hover:scale-110"><EditIcon/></button>
                  <button onClick={() => handleDelete(hall.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-transform transform hover:scale-110"><TrashIcon/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tooltip && createPortal(
        <div
          className="absolute z-50 bg-gray-100 dark:bg-gray-900 text-white p-2 rounded-md shadow-lg tooltip-bubble border border-gray-300 dark:border-gray-700"
          style={{ top: tooltip.top, left: tooltip.left }}
        >
          <BenchLayoutTooltip capacity={tooltip.hall.capacity} columns={tooltip.hall.columns} />
        </div>,
        document.body
      )}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingHall ? 'Edit Hall' : 'Add New Hall'}>
        <HallForm onSubmit={handleSaveHall} hall={editingHall} />
      </Modal>
    </div>
  );
};

export default ManageHalls;