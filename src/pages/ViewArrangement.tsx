import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Student, Hall, ClassGroup, ExamSlot } from '../types';

interface GroupedSeating {
  hall: Hall;
  seats: { student: Student; department: ClassGroup; seatNumber: string }[];
}

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
        <div className="text-center font-mono text-2xl md:text-4xl text-yellow-300">
            <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
    );
};


const ViewSlot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getSlotById, students, halls, classGroups } = useAppContext();

  const slot = getSlotById(id || '');

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
          hallGroup.seats.push({ student, department, seatNumber: seat.seatNumber });
        }
      }
    }

    return Array.from(seatingMap.values()).map(group => {
        group.seats.sort((a,b) => a.seatNumber.localeCompare(b.seatNumber, undefined, {numeric: true}));
        return group;
    });
  }, [slot, students, halls, classGroups]);

  if (!slot) {
    return (
      <div className="text-center text-gray-400">
        <h1 className="text-2xl font-bold text-gray-100">Exam Slot not found</h1>
        <p>The requested exam slot could not be located.</p>
      </div>
    );
  }
  
  const printPage = () => {
    window.print();
  }

  return (
    <div className="space-y-8" id="print-area">
      <div className="flex justify-between items-start flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">{slot.name}</h1>
          <p className="text-gray-400">Scheduled for: {new Date(slot.startTime).toLocaleString()}</p>
        </div>
        <button
          onClick={printPage}
          disabled={slot.status === 'PENDING'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <PrintIcon />
          Print All
        </button>
      </div>
      
      {slot.status === 'PENDING' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold text-gray-100 mb-2">Seating Plan Not Generated Yet</h2>
            <p className="text-gray-400 mb-4">The seating plan will be automatically generated 3 minutes before the exam starts.</p>
            <p className="text-sm text-yellow-400 mb-2">Time until generation:</p>
            <CountdownTimer targetDate={new Date(new Date(slot.startTime).getTime() - 3 * 60 * 1000)} />
        </div>
      )}

      {groupedSeating.map(({ hall, seats }) => (
        <div key={hall.id} className="bg-gray-800 p-6 rounded-lg shadow-md printable-section">
          <h2 className="text-xl font-bold text-gray-100 mb-4">{hall.block} - {hall.name} ({seats.length} Students)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Seat Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Register Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Class Group</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {seats.map(({ student, department, seatNumber }) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-cyan-400">{seatNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{student.registerNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{department.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewSlot;