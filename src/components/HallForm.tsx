import React, { useState, useEffect } from 'react';
import { Hall } from '../types';

interface HallFormProps {
  hall: Hall | null;
  onSubmit: (hall: Hall | Omit<Hall, 'id'>) => void;
}

const HallForm: React.FC<HallFormProps> = ({ hall, onSubmit }) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [block, setBlock] = useState('');
  const [columns, setColumns] = useState<2 | 3 | 4>(4);

  useEffect(() => {
    if (hall) {
      setName(hall.name);
      setCapacity(hall.capacity.toString());
      setBlock(hall.block);
      setColumns(hall.columns);
    } else {
      setName('');
      setCapacity('');
      setBlock('');
      setColumns(4);
    }
  }, [hall]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capacityNum = parseInt(capacity, 10);
    if (name && block && !isNaN(capacityNum) && capacityNum > 0) {
      const hallData = { name, capacity: capacityNum, block, columns };
      if (hall) {
        onSubmit({ ...hall, ...hallData });
      } else {
        onSubmit(hallData);
      }
    } else {
        alert("Please provide a valid name, block, and a positive number for capacity.");
    }
  };
  
  const inputClass = "mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  const ColumnSelector: React.FC = () => {
    const options: (2 | 3 | 4)[] = [2, 3, 4];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Bench Layout (Columns)</label>
        <div className="mt-2 flex w-full bg-gray-200 dark:bg-gray-900 p-1 rounded-lg">
          {options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setColumns(option)}
              className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${columns === option ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-800'}`}
            >
              {option} Columns
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="block" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Block Name</label>
          <input
            type="text"
            id="block"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            required
            className={inputClass}
            placeholder="e.g., Main Block"
          />
        </div>
        <div>
          <label htmlFor="hallName" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Hall Number</label>
          <input
            type="text"
            id="hallName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
            placeholder="e.g., 101"
          />
        </div>
      </div>
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Number of Benches</label>
        <input
          type="number"
          id="capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          required
          min="1"
          className={inputClass}
          placeholder="e.g., 30"
        />
      </div>
       <ColumnSelector />
      <div className="flex justify-end pt-2">
        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
          Save Hall
        </button>
      </div>
    </form>
  );
};

export default HallForm;