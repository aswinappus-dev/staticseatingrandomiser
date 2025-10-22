import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Seating, Student, Hall } from '../types';
import Modal from '../components/Modal';

const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;

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
            <p className="text-gray-600 dark:text-gray-400 mt-4">Exam details will be revealed in:</p>
            <div className="font-mono text-4xl text-cyan-600 dark:text-cyan-400 mt-2">
                <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
        </div>
    );
};

interface StudentWithSeat extends Student {
    seatNumber: string;
    attendance?: 'PRESENT' | 'ABSENT';
}

interface AttendanceModalState {
    isOpen: boolean;
    student: StudentWithSeat | null;
}

const InvigilatorDashboard: React.FC = () => {
    const { getPublicSlotDetails, halls, students, updateStudentAttendance } = useAppContext();
    const [selectedBlock, setSelectedBlock] = useState<string>('');
    const [selectedHallId, setSelectedHallId] = useState<string>('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [modalState, setModalState] = useState<AttendanceModalState>({ isOpen: false, student: null });

    const slotDetails = useMemo(() => getPublicSlotDetails(), [getPublicSlotDetails, refreshKey]);
    
    const refreshSlotDetails = () => setRefreshKey(key => key + 1);

    const arrangement = slotDetails.slot;
    
    const uniqueBlocks = useMemo(() => {
        if(!arrangement) return [];
        const blockSet = new Set(halls.filter(h => arrangement.hallIds.includes(h.id)).map(h => h.block));
        return Array.from(blockSet);
    }, [halls, arrangement]);

    const availableHalls = useMemo(() => {
        if (!selectedBlock || !arrangement) return [];
        return halls.filter(h => h.block === selectedBlock && arrangement.hallIds.includes(h.id));
    }, [selectedBlock, halls, arrangement]);
    
    const { hallSeating, attendanceSummary, selectedHall } = useMemo(() => {
        if (!selectedHallId || !arrangement) return { hallSeating: null, attendanceSummary: null, selectedHall: null };
        
        const hall = halls.find(h => h.id === selectedHallId);
        if(!hall) return { hallSeating: null, attendanceSummary: null, selectedHall: null };
        
        const seatingInHall = arrangement.seatingPlan.filter(s => s.hallId === selectedHallId);
        
        let present = 0;
        let absent = 0;
        seatingInHall.forEach(s => {
            if (s.attendance === 'PRESENT') present++;
            if (s.attendance === 'ABSENT') absent++;
        });

        const benches: Record<string, { student1?: StudentWithSeat, student2?: StudentWithSeat }> = {};

        for (const seat of arrangement.seatingPlan) {
            if (seat.hallId !== selectedHallId) continue;
            
            const student = students.find(s => s.id === seat.studentId);
            if(!student) continue;

            const studentWithSeat: StudentWithSeat = { ...student, seatNumber: seat.seatNumber, attendance: seat.attendance };

            const [benchId, seatPos] = seat.seatNumber.split('-');
            if(!benches[benchId]) benches[benchId] = {};

            if(seatPos === '1') benches[benchId].student1 = studentWithSeat;
            if(seatPos === '2') benches[benchId].student2 = studentWithSeat;
        }

        const hallColumns = hall.columns || 4;
        const layout = [];
        const totalRows = Math.ceil(hall.capacity / hallColumns);
        for(let r=1; r<=totalRows; r++){
            for(let c=0; c<hallColumns; c++){
                const benchNum = (r - 1) * hallColumns + c + 1;
                if(benchNum > hall.capacity) {
                    layout.push(null); // empty spot
                    continue;
                };
                const colName = String.fromCharCode(65+c);
                const benchId = `${colName}${r}`;
                layout.push({ benchId, seating: benches[benchId] || {} });
            }
        }
        
        return { 
            hallSeating: layout, 
            attendanceSummary: { total: seatingInHall.length, present, absent },
            selectedHall: hall,
        };

    }, [selectedHallId, arrangement, students, halls]);

    const sortedStudentsForHall = useMemo(() => {
        if (!hallSeating) return [];
        
        const studentList: StudentWithSeat[] = [];
        hallSeating.forEach(bench => {
            if (bench) {
                if (bench.seating.student1) studentList.push(bench.seating.student1);
                if (bench.seating.student2) studentList.push(bench.seating.student2);
            }
        });

        return studentList.sort((a, b) => 
            a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })
        );
    }, [hallSeating]);
    
    const handleStudentClick = (student: StudentWithSeat) => {
        setModalState({ isOpen: true, student });
    };

    const handleMarkAttendance = (status: 'PRESENT' | 'ABSENT') => {
        if (modalState.student && arrangement) {
            updateStudentAttendance(arrangement.id, modalState.student.id, status);
        }
        setModalState({ isOpen: false, student: null });
    };

    const handlePrint = () => {
        window.print();
    };

    const getStudentSeatClass = (student?: StudentWithSeat) => {
        if (!student) return "invisible";
        
        let baseClass = "text-[10px] md:text-sm font-semibold mt-1 break-all p-1 rounded-md cursor-pointer transition-all";
        if (!student.attendance) {
            return `${baseClass} hover:bg-gray-200 dark:hover:bg-gray-600`;
        }
        if (student.attendance === 'PRESENT') {
            return `${baseClass} bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200`;
        }
        if (student.attendance === 'ABSENT') {
            return `${baseClass} bg-red-200 text-red-800 dark:bg-red-800 dark:bg-opacity-60 dark:text-red-200`;
        }
    };
    
    const getGridColsClass = (cols: number) => {
        switch (cols) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            default: return 'grid-cols-4';
        }
    };
    
    const inputClass = "w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

    const renderContent = () => {
        switch(slotDetails.status) {
            case 'UPCOMING':
                return <CountdownTimer targetDate={slotDetails.revealTime!} onComplete={refreshSlotDetails} />;
            case 'ACTIVE':
                 return (
                    <div className="mt-6 space-y-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={selectedBlock} onChange={e => {setSelectedBlock(e.target.value); setSelectedHallId('');}} className={inputClass}>
                                <option value="">-- Select Block --</option>
                                {uniqueBlocks.map(block => <option key={block} value={block}>{block}</option>)}
                            </select>
                             <select value={selectedHallId} onChange={e => setSelectedHallId(e.target.value)} className={inputClass} disabled={!selectedBlock}>
                                <option value="">-- Select Hall --</option>
                                {availableHalls.map(hall => <option key={hall.id} value={hall.id}>{hall.name}</option>)}
                            </select>
                        </div>
                         {selectedHallId && (
                            <button
                                onClick={handlePrint}
                                className="w-full md:w-auto mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                            >
                                <PrintIcon />
                                Print View
                            </button>
                        )}

                        {attendanceSummary && (
                            <div className="mt-4 flex justify-center gap-2 sm:gap-4 text-center p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                <div><span className="font-bold text-lg">{attendanceSummary.total}</span> <span className="text-sm text-gray-500 dark:text-gray-400">Total</span></div>
                                <div><span className="font-bold text-lg text-green-600 dark:text-green-400">{attendanceSummary.present}</span> <span className="text-sm text-gray-500 dark:text-gray-400">Present</span></div>
                                <div><span className="font-bold text-lg text-red-600 dark:text-red-400">{attendanceSummary.absent}</span> <span className="text-sm text-gray-500 dark:text-gray-400">Absent</span></div>
                            </div>
                        )}

                        {hallSeating && selectedHall && (
                           <div className="mt-6 p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                             <h2 className="text-xl font-bold mb-4">Seating Layout</h2>
                             <div className={`grid ${getGridColsClass(selectedHall.columns)} gap-2 md:gap-4`}>
                                {hallSeating.map((bench, idx) => (
                                    bench ? (
                                        <div key={idx} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-600 text-center h-28 sm:h-auto sm:aspect-square flex flex-col justify-center">
                                            <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold">{bench.benchId}</div>
                                            <div onClick={() => bench.seating.student1 && handleStudentClick(bench.seating.student1)} className={getStudentSeatClass(bench.seating.student1)}>{bench.seating.student1?.registerNumber}</div>
                                            <div onClick={() => bench.seating.student2 && handleStudentClick(bench.seating.student2)} className={`${getStudentSeatClass(bench.seating.student2)} text-yellow-600 dark:text-yellow-400`}>{bench.seating.student2?.registerNumber}</div>
                                        </div>
                                    ) : (
                                        <div key={idx}></div> // Empty cell
                                    )
                                ))}
                             </div>
                           </div>
                        )}
                    </div>
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
        <>
            <div className="flex flex-col items-center text-center no-print">
                <div className="w-full max-w-4xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center relative">
                    <Link 
                      to="/" 
                      aria-label="Go back to homepage"
                      className="absolute top-4 left-4 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110 transition-all duration-200"
                    >
                      <BackArrowIcon />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Invigilator Dashboard</h1>
                    {renderContent()}
                </div>
                <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, student: null })} title="Mark Attendance">
                    {modalState.student && (
                        <div className="text-gray-700 dark:text-gray-300">
                            <p className="mb-1">Student: <span className="font-bold text-gray-900 dark:text-white">{modalState.student.name}</span></p>
                            <p className="mb-4">Seat: <span className="font-bold text-cyan-600 dark:text-cyan-400">{modalState.student.seatNumber}</span></p>
                            <div className="flex justify-around mt-6">
                                <button onClick={() => handleMarkAttendance('PRESENT')} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-transform transform hover:scale-105">
                                    Mark as Present
                                </button>
                                <button onClick={() => handleMarkAttendance('ABSENT')} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-transform transform hover:scale-105">
                                    Mark as Absent
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>

            <div className="print-only printable-section">
                {arrangement && selectedHallId && (
                    <div className="p-4">
                        <header className="text-center mb-6">
                            <h1 className="text-2xl font-bold">ExamFlow - Invigilator Attendance Sheet</h1>
                            <p className="text-lg mt-2">{arrangement.name}</p>
                            <div className="flex justify-around mt-1 text-sm">
                                <span><b>Hall:</b> {halls.find(h => h.id === selectedHallId)?.block} - {halls.find(h => h.id === selectedHallId)?.name}</span>
                                <span><b>Date:</b> {new Date(arrangement.startTime).toLocaleDateString()}</span>
                                <span><b>Time:</b> {new Date(arrangement.startTime).toLocaleTimeString()}</span>
                            </div>
                        </header>
                        <table className="printable-table">
                            <thead>
                                <tr>
                                    <th>Seat No.</th>
                                    <th>Register No.</th>
                                    <th>Student Name</th>
                                    <th>Signature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStudentsForHall.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.seatNumber}</td>
                                        <td>{student.registerNumber}</td>
                                        <td>{student.name}</td>
                                        <td><div className="signature-box"></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default InvigilatorDashboard;