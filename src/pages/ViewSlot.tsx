import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Student, Hall, ClassGroup } from '../types';

interface SeatInfo {
    student: Student;
    department: ClassGroup;
    seatNumber: string;
    attendance?: 'PRESENT' | 'ABSENT';
}

interface GroupedSeating {
  hall: Hall;
  seats: SeatInfo[];
}

interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    absentees: Student[];
}

type SortableKeys = 'seatNumber' | 'registerNumber' | 'name' | 'classGroup';
type SortDirection = 'asc' | 'desc';

const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = targetDate.getTime() - new Date().getTime();
        let timeLeft = { hours: 0, minutes: 0, seconds: 0};
        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="text-center font-mono text-2xl sm:text-3xl md:text-4xl text-yellow-500 dark:text-yellow-300">
            <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
    );
};


const ViewSlot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getSlotById, students, halls, classGroups } = useAppContext();
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const printMenuRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: SortDirection } | null>(null);

  const slot = getSlotById(id || '');
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (printMenuRef.current && !printMenuRef.current.contains(event.target as Node)) {
            setIsPrintMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [printMenuRef]);

  const groupedSeating = useMemo<GroupedSeating[]>(() => {
    if (!slot || slot.status === 'PENDING') return [];
    
    const seatingMap = new Map<string, GroupedSeating>();
    const usedHalls = halls.filter(h => slot.hallIds.includes(h.id));

    for (const hall of usedHalls) {
        seatingMap.set(hall.id, { hall, seats: [] });
    }
    
    for (const seat of slot.seatingPlan) {
      const student = students.find(s => s.id === seat.studentId);
      if (student) {
        const department = classGroups.find(d => d.id === student.departmentId);
        const hallGroup = seatingMap.get(seat.hallId);
        if (department && hallGroup) {
          hallGroup.seats.push({ student, department, seatNumber: seat.seatNumber, attendance: seat.attendance });
        }
      }
    }

    return Array.from(seatingMap.values()).map(group => {
        const sortedSeats = [...group.seats];

        if (sortConfig !== null) {
            sortedSeats.sort((a, b) => {
                let aValue: string;
                let bValue: string;

                switch (sortConfig.key) {
                    case 'registerNumber':
                        aValue = a.student.registerNumber;
                        bValue = b.student.registerNumber;
                        break;
                    case 'name':
                        aValue = a.student.name;
                        bValue = b.student.name;
                        break;
                    case 'classGroup':
                        aValue = a.department.name;
                        bValue = b.department.name;
                        break;
                    case 'seatNumber':
                    default:
                        const seatCompare = a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true });
                        return sortConfig.direction === 'asc' ? seatCompare : -seatCompare;
                }
                
                const textCompare = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
                return sortConfig.direction === 'asc' ? textCompare : -textCompare;
            });
        } else {
             sortedSeats.sort((a,b) => a.seatNumber.localeCompare(b.seatNumber, undefined, {numeric: true}));
        }

        return { ...group, seats: sortedSeats };
    });
  }, [slot, students, halls, classGroups, sortConfig]);

  const attendanceStats = useMemo<AttendanceStats | null>(() => {
      if (!slot || slot.status === 'PENDING' || slot.status === 'GENERATED') return null;

      const total = slot.seatingPlan.length;
      let present = 0;
      const absentees: Student[] = [];

      slot.seatingPlan.forEach(seat => {
        if(seat.attendance === 'PRESENT') {
            present++;
        } else {
             const student = students.find(s => s.id === seat.studentId);
             if(student) absentees.push(student);
        }
      });
      const absent = total - present;

      return { total, present, absent, absentees };
  }, [slot, students]);

  if (!slot) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Exam Slot not found</h1>
        <p>The requested exam slot could not be located.</p>
      </div>
    );
  }
  
  const handlePrint = (type: 'seating-plan' | 'attendance' | 'all') => {
      setIsPrintMenuOpen(false);
      
      const printClass = `printing-${type}`;
      document.body.classList.add(printClass);

      const afterPrint = () => {
        document.body.classList.remove(printClass);
        window.removeEventListener('afterprint', afterPrint);
      };
      window.addEventListener('afterprint', afterPrint);

      window.print();
  };

  const getStatusIndicator = (status?: 'PRESENT' | 'ABSENT') => {
    if (status === 'PRESENT') {
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">Present</span>;
    }
     if (status === 'ABSENT') {
        return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">Absent</span>;
    }
    return <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Pending</span>;
  }

  const requestSort = (key: SortableKeys) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode }> = ({ sortKey, children }) => {
    const isSorted = sortConfig?.key === sortKey;
    const icon = isSorted ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '';

    return (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <button onClick={() => requestSort(sortKey)} className="w-full flex items-center justify-start focus:outline-none">
          {children}
          <span className="ml-2 text-indigo-400">{icon}</span>
        </button>
      </th>
    );
  };


  return (
    <div className="space-y-6 sm:space-y-8" id="print-area">
      <div className="flex justify-between items-start flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{slot.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">Scheduled for: {new Date(slot.startTime).toLocaleString()}</p>
        </div>
        <div ref={printMenuRef} className="relative inline-block text-left no-print">
            <div>
                <button
                type="button"
                onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                disabled={slot.status === 'PENDING'}
                className="inline-flex items-center justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                >
                <PrintIcon />
                Print Options
                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                </button>
            </div>
            {isPrintMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button onClick={() => handlePrint('seating-plan')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">
                    Print Seating Plan
                    </button>
                    {attendanceStats && (
                        <button onClick={() => handlePrint('attendance')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">
                            Print Attendance Summary
                        </button>
                    )}
                    <button onClick={() => handlePrint('all')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">
                    Print All
                    </button>
                </div>
                </div>
            )}
        </div>

      </div>
      
      {slot.status === 'PENDING' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Seating Plan Not Generated Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The seating plan will be automatically generated 3 minutes before the exam starts.</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">Time until generation:</p>
            <CountdownTimer targetDate={new Date(new Date(slot.startTime).getTime() - 3 * 60 * 1000)} />
        </div>
      )}

      {attendanceStats && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md no-print printable-attendance-summary">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Live Attendance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{attendanceStats.total}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{attendanceStats.total > 0 ? `${Math.round((attendanceStats.present/attendanceStats.total)*100)}%` : 'N/A'}</p>
                </div>
            </div>
            {attendanceStats.absentees.length > 0 && (
                <div>
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">Absent / Not Marked</h3>
                    <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 columns-2 md:columns-4">
                        {attendanceStats.absentees.map(s => <li key={s.id}>{s.registerNumber}</li>)}
                    </ul>
                </div>
            )}
        </div>
      )}
      
      <div className="printable-seating-plan">
        {groupedSeating.map(({ hall, seats }) => (
            <div key={hall.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md printable-section">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{hall.block} - {hall.name} ({seats.length} Students)</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <SortableHeader sortKey="seatNumber">Seat Number</SortableHeader>
                      <SortableHeader sortKey="registerNumber">Register Number</SortableHeader>
                      <SortableHeader sortKey="name">Name</SortableHeader>
                      <SortableHeader sortKey="classGroup">Class Group</SortableHeader>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {seats.map(({ student, department, seatNumber, attendance }) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-cyan-600 dark:text-cyan-400">{seatNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{student.registerNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 flex items-center">{student.name} {getStatusIndicator(attendance)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{department.name}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        ))}
      </div>

    </div>
  );
};

export default ViewSlot;
