import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Hall } from '../types';

const CheckCircleIcon = () => <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>;
const CalendarIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
const ClockIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
    return isMobile;
};

const SlotForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const { classGroups, students, halls, addExamSlot } = useAppContext();
  const isMobile = useIsMobile();

  const [slotName, setSlotName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [selectedClassGroupIds, setSelectedClassGroupIds] = useState<Set<string>>(new Set());
  const [selectedHallIds, setSelectedHallIds] = useState<Set<string>>(new Set());

  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number, left: number, width: number }>({ top: 0, left: 0, width: 200 });

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

  const combineDateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    return new Date(`${date}T${time}`).toISOString();
  }

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setExamDate(newDate);
    if (newDate) {
        if (!startTime) setStartTime('09:00');
        if (!endTime) setEndTime('11:00');
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setStartTime(newTime);
    if (newTime && !examDate) {
        setExamDate(getTodayDateString());
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setEndTime(newTime);
    if (newTime && !examDate) {
        setExamDate(getTodayDateString());
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStartTime = combineDateTime(examDate, startTime);
    let finalEndTime = combineDateTime(examDate, endTime);

    if (!slotName || !finalStartTime || selectedClassGroupIds.size === 0 || selectedHallIds.size === 0) {
      alert("Please provide a slot name, exam date, start time, and select at least one class group and hall.");
      return;
    }
    
    if (finalEndTime) {
      if (new Date(finalStartTime) >= new Date(finalEndTime)) {
        alert("End time must be after start time.");
        return;
      }
    } else {
      const startTimeDate = new Date(finalStartTime);
      startTimeDate.setHours(startTimeDate.getHours() + 2);
      finalEndTime = startTimeDate.toISOString();
    }

    if (capacityWarning) {
      alert("Cannot create slot: Total students exceeds maximum hall capacity (2 per bench).");
      return;
    }

    addExamSlot({
        name: slotName,
        startTime: finalStartTime,
        endTime: finalEndTime,
        classGroupIds: Array.from(selectedClassGroupIds),
        hallIds: Array.from(selectedHallIds)
    });
    onSubmit();
  };

  const hallsByBlock = useMemo(() => {
    return halls.reduce((acc, hall) => {
        if (!acc[hall.block]) acc[hall.block] = [];
        acc[hall.block].push(hall);
        return acc;
    }, {} as Record<string, Hall[]>);
  }, [halls]);

  const handleBlockClick = (e: React.MouseEvent<HTMLButtonElement>, blockName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width });
    setActiveBlock(blockName);
  };
  
  const selectedHallsCountByBlock = (blockName: string) => {
    const hallIdsInBlock = hallsByBlock[blockName].map(h => h.id);
    return Array.from(selectedHallIds).filter(id => hallIdsInBlock.includes(id)).length;
  };

  const inputClass = "w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const cardBaseClass = "p-3 border-2 rounded-lg cursor-pointer transition-all flex justify-between items-center";
  const cardInactiveClass = "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500";
  const cardActiveClass = "bg-gray-200 dark:bg-gray-700 border-indigo-500";


  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
            <label htmlFor="slotName" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Exam Slot Name</label>
            <input type="text" id="slotName" value={slotName} onChange={e => setSlotName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., Midterm Exam - Day 1"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
                <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Exam Date</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon/></div>
                    <input id="examDate" type="date" value={examDate} onChange={handleDateChange} required className={inputClass} />
                </div>
            </div>
            <div className="space-y-1">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Start Time</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClockIcon/></div>
                    <input id="startTime" type="time" value={startTime} onChange={handleStartTimeChange} required className={inputClass} />
                </div>
            </div>
            <div className="space-y-1">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-400">End Time <span className="text-xs text-gray-500">(Optional)</span></label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClockIcon/></div>
                    <input id="endTime" type="time" value={endTime} onChange={handleEndTimeChange} className={inputClass} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Select Class Groups</h3>
                <div className="space-y-2 max-h-32 md:max-h-48 overflow-y-auto p-1 pr-2">
                    {classGroups.map(dept => (
                        <div key={dept.id} onClick={() => handleDeptChange(dept.id)} className={`${cardBaseClass} transform hover:scale-105 ${selectedClassGroupIds.has(dept.id) ? cardActiveClass : cardInactiveClass}`}>
                            <span className="font-medium text-gray-800 dark:text-gray-300">{dept.name}</span>
                            {selectedClassGroupIds.has(dept.id) && <CheckCircleIcon />}
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Select Halls by Block</h3>
                <div className="space-y-2 max-h-32 md:max-h-48 overflow-y-auto p-1 pr-2">
                    {Object.keys(hallsByBlock).map(blockName => {
                        const selectedCount = selectedHallsCountByBlock(blockName);
                        return (
                            <button key={blockName} type="button" onClick={(e) => handleBlockClick(e, blockName)} className={`${cardBaseClass} w-full transform hover:scale-105 ${selectedCount > 0 ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-700'} ${activeBlock === blockName ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className="font-medium text-gray-800 dark:text-gray-300">{blockName}</span>
                                {selectedCount > 0 && <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-200 dark:bg-indigo-800 bg-opacity-50 px-2 py-1 rounded-full">{selectedCount} selected</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className={`p-3 mt-2 rounded-lg border text-sm text-center ${capacityWarning ? 'bg-red-100 dark:bg-red-900 bg-opacity-50 border-red-400 dark:border-red-500 text-red-700 dark:text-red-300' : 'bg-indigo-100 dark:bg-indigo-900 bg-opacity-50 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300'}`}>
            <span>Selected Students: <b className="font-semibold">{totalStudents}</b></span>
            <span className="mx-2">|</span>
            <span>Maximum Capacity: <b className="font-semibold">{totalCapacity}</b></span>
            {capacityWarning && <p className="font-bold mt-1">Warning: Not enough seats for the selected students!</p>}
        </div>

        <div className="flex justify-end pt-2">
            <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
            Confirm & Create Slot
            </button>
      </div>
      
      {activeBlock && (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setActiveBlock(null)}></div>
            <div 
              style={isMobile ? {} : { top: `${popupPosition.top}px`, left: `${popupPosition.left}px`, width: `${popupPosition.width}px` }} 
              className={`fixed bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg z-50 p-4 animate-popup shadow-2xl ${isMobile ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm' : ''}`}
            >
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 text-center">Halls in {activeBlock}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {hallsByBlock[activeBlock].map(hall => {
                        const isSelected = selectedHallIds.has(hall.id);
                        return (
                            <button
                                key={hall.id}
                                type="button"
                                onClick={() => handleHallChange(hall.id)}
                                className={`p-2 rounded-md text-center transition-all transform hover:scale-105 text-sm font-semibold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300'}`}
                            >
                                {hall.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
      )}

    </form>
  );
};

export default SlotForm;