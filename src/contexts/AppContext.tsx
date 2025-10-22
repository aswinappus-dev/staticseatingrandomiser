import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Student, Hall, ClassGroup, ExamSlot, Seating } from '../types';

// --- MOCK DATA ---
const initialClassGroups: ClassGroup[] = [
  { id: 'd1', name: '24-CS' },
  { id: 'd2', name: '24-EC' },
  { id: 'd3', name: '23-AD' },
  { id: 'd4', name: '22-EE' },
];

const generateStudents = (): Student[] => {
  const students: Student[] = [];
  let idCounter = 1;
  initialClassGroups.forEach(group => {
    const [year, branch] = group.name.split('-');
    for(let i=1; i<=35; i++){
       students.push({
        id: `s${idCounter}`,
        registerNumber: `CEC${year}${branch}${String(i).padStart(3, '0')}`,
        name: `${branch} Student ${i}`,
        departmentId: group.id,
      });
      idCounter++;
    }
  });
  return students;
}

const initialStudents: Student[] = generateStudents();

const initialHalls: Hall[] = [
  { id: 'h1', name: '101', capacity: 30, block: 'Main Block', columns: 4 },
  { id: 'h2', name: '102', capacity: 30, block: 'Main Block', columns: 4 },
  { id: 'h3', name: '201', capacity: 40, block: 'Main Block', columns: 4 },
  { id: 'h4', name: '101', capacity: 25, block: 'CS Block', columns: 3 },
  { id: 'h5', name: '102', capacity: 25, block: 'CS Block', columns: 3 },
  { id: 'h6', name: '101', capacity: 30, block: 'EEE Block', columns: 3 },
];

interface PublicSlotDetails {
    status: 'UPCOMING' | 'ACTIVE' | 'NONE' | 'COMPLETED';
    slot: ExamSlot | null;
    revealTime?: Date;
}


interface AppContextType {
  classGroups: ClassGroup[];
  students: Student[];
  halls: Hall[];
  examSlots: ExamSlot[];
  isAuthenticated: boolean;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addHall: (hall: Omit<Hall, 'id'>) => void;
  updateHall: (hall: Hall) => void;
  deleteHall: (hallId: string) => void;
  addExamSlot: (slotData: Omit<ExamSlot, 'id' | 'status' | 'seatingPlan'>) => void;
  deleteExamSlot: (slotId: string) => void;
  getSlotById: (id: string) => ExamSlot | undefined;
  getPublicSlotDetails: () => PublicSlotDetails;
  findStudentSeat: (registerNumber: string, slot: ExamSlot) => { student: Student, hall: Hall, seatNumber: string } | null;
  updateStudentAttendance: (slotId: string, studentId: string, status: 'PRESENT' | 'ABSENT') => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classGroups] = useState<ClassGroup[]>(initialClassGroups);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [halls, setHalls] = useState<Hall[]>(initialHalls);
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('isAuthenticated') === 'true');

  const login = useCallback((user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'password') {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  }, []);

  const addStudent = useCallback((studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...studentData, id: `s${Date.now()}` };
    setStudents(prev => [...prev, newStudent]);
  }, []);

  const updateStudent = useCallback((updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  }, []);

  const deleteStudent = useCallback((studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  }, []);

  const addHall = useCallback((hallData: Omit<Hall, 'id'>) => {
    const newHall: Hall = { ...hallData, id: `h${Date.now()}` };
    setHalls(prev => [...prev, newHall]);
  }, []);

  const updateHall = useCallback((updatedHall: Hall) => {
    setHalls(prev => prev.map(h => h.id === updatedHall.id ? updatedHall : h));
  }, []);

  const deleteHall = useCallback((hallId: string) => {
    setHalls(prev => prev.filter(h => h.id !== hallId));
  }, []);
  
  const addExamSlot = useCallback((slotData: Omit<ExamSlot, 'id' | 'status' | 'seatingPlan'>) => {
    const newSlot: ExamSlot = {
        ...slotData,
        id: `slot-${Date.now()}`,
        status: 'PENDING',
        seatingPlan: []
    };
    setExamSlots(prev => [...prev, newSlot]);
  }, []);

  const deleteExamSlot = useCallback((slotId: string) => {
    setExamSlots(prevSlots => {
        const newSlots = prevSlots.filter(slot => slot.id !== slotId);
        return newSlots;
    });
  }, []);

  const getSlotById = useCallback((id: string) => {
    return examSlots.find(s => s.id === id);
  }, [examSlots]);

  const generateSeatingForSlot = useCallback((slotId: string) => {
    setExamSlots(prevSlots => {
      const slotIndex = prevSlots.findIndex(s => s.id === slotId);
      if (slotIndex === -1 || prevSlots[slotIndex].status !== 'PENDING') return prevSlots;

      const slot = prevSlots[slotIndex];
      const studentsToArrange = students.filter(s => slot.classGroupIds.includes(s.departmentId));
      const hallsToUse = halls.filter(h => slot.hallIds.includes(h.id)).sort((a, b) => a.block.localeCompare(b.block) || a.name.localeCompare(b.name));
      
      const studentsByDept: Record<string, Student[]> = {};
      studentsToArrange.forEach(student => {
        if (!studentsByDept[student.departmentId]) studentsByDept[student.departmentId] = [];
        studentsByDept[student.departmentId].push(student);
      });

      Object.values(studentsByDept).forEach(deptStudents => {
        for (let i = deptStudents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deptStudents[i], deptStudents[j]] = [deptStudents[j], deptStudents[i]];
        }
      });

      const interleavedStudents: Student[] = [];
      let maxDeptSize = Math.max(...Object.values(studentsByDept).map(l => l.length));
      for(let i=0; i<maxDeptSize; i++) {
          Object.values(studentsByDept).forEach(list => {
              if(i < list.length) interleavedStudents.push(list[i]);
          });
      }

      const seatingPlan: Seating[] = [];
      const totalBenches = hallsToUse.reduce((sum, hall) => sum + hall.capacity, 0);
      const totalStudents = interleavedStudents.length;

      const isSparseSeating = totalBenches >= totalStudents * 2;

      if (isSparseSeating && totalStudents > 0) {
        console.log("Using sparse seating logic.");
        const studentPool = [...interleavedStudents];
        
        const hallAssignments: { hall: Hall, students: Student[] }[] = [];

        for (const hall of hallsToUse) {
            const proportion = hall.capacity / totalBenches;
            const studentCountForHall = Math.floor(proportion * totalStudents);
            hallAssignments.push({ hall, students: studentPool.splice(0, studentCountForHall) });
        }
        
        let hallIdx = 0;
        while(studentPool.length > 0) {
            hallAssignments[hallIdx % hallAssignments.length].students.push(studentPool.shift()!);
            hallIdx++;
        }

        for (const { hall, students: studentsForThisHall } of hallAssignments) {
            if (studentsForThisHall.length === 0) continue;

            const benchesInHall = hall.capacity;
            const step = benchesInHall / studentsForThisHall.length;

            for (let i = 0; i < studentsForThisHall.length; i++) {
                const benchNum = Math.floor(i * step) + 1;
                
                const col = String.fromCharCode(65 + ((benchNum - 1) % hall.columns));
                const row = Math.floor((benchNum - 1) / hall.columns) + 1;
                const student = studentsForThisHall[i];
                
                seatingPlan.push({
                    studentId: student.id,
                    hallId: hall.id,
                    seatNumber: `${col}${row}-1`
                });
            }
        }
      } else {
        console.log("Using dense seating logic.");
        const studentPool = [...interleavedStudents];
        const useDoubleSeating = totalStudents > totalBenches;

        if (totalStudents > totalBenches * 2) {
            console.error("Not enough capacity even with double seating.");
            return prevSlots;
        }

        for (const hall of hallsToUse) {
            const studentsToPlaceInHall = useDoubleSeating ? hall.capacity * 2 : hall.capacity;
            const studentsForThisHall = studentPool.splice(0, studentsToPlaceInHall);

            if (studentsForThisHall.length === 0) break;
            
            let studentHallIndex = 0;
            for (let benchNum = 1; benchNum <= hall.capacity; benchNum++) {
                if (studentHallIndex >= studentsForThisHall.length) break;
                
                const col = String.fromCharCode(65 + ((benchNum - 1) % hall.columns));
                const row = Math.floor((benchNum - 1) / hall.columns) + 1;

                const student1 = studentsForThisHall[studentHallIndex++];
                seatingPlan.push({ studentId: student1.id, hallId: hall.id, seatNumber: `${col}${row}-1` });

                if (useDoubleSeating && studentHallIndex < studentsForThisHall.length) {
                    const student2 = studentsForThisHall[studentHallIndex++];
                    seatingPlan.push({ studentId: student2.id, hallId: hall.id, seatNumber: `${col}${row}-2` });
                }
            }
        }
      }
      
      const updatedSlots = [...prevSlots];
      updatedSlots[slotIndex] = { ...slot, seatingPlan, status: 'GENERATED' };
      console.log(`Generated seating for slot ${slotId}`);
      return updatedSlots;
    });
  }, [students, halls]);

  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        examSlots.forEach(slot => {
            const startTime = new Date(slot.startTime);
            const endTime = new Date(slot.endTime);

            // Generate seating 3 minutes before start time
            if (slot.status === 'PENDING' && startTime.getTime() - now.getTime() <= 3 * 60 * 1000) {
                generateSeatingForSlot(slot.id);
            }
            // Update status to ACTIVE or COMPLETED based on time
            else if (slot.status === 'GENERATED' && now >= startTime) {
                 setExamSlots(prev => prev.map(s => s.id === slot.id ? {...s, status: 'ACTIVE'} : s));
            } else if (slot.status === 'ACTIVE' && now >= endTime) {
                 setExamSlots(prev => prev.map(s => s.id === slot.id ? {...s, status: 'COMPLETED'} : s));
            }
        });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(timer);
  }, [examSlots, generateSeatingForSlot]);
  
  const getPublicSlotDetails = useCallback((): PublicSlotDetails => {
      const now = new Date().getTime();
      const upcomingOrActive = examSlots.find(slot => {
          const endTime = new Date(slot.endTime).getTime();
          return endTime > now && slot.status !== 'PENDING';
      });

      if(!upcomingOrActive) return { status: 'NONE', slot: null };
      
      const startTime = new Date(upcomingOrActive.startTime).getTime();
      const revealTime = new Date(startTime - 2 * 60 * 1000);

      if(now < revealTime.getTime()){
          return { status: 'UPCOMING', slot: upcomingOrActive, revealTime };
      }

      if(now >= revealTime.getTime() && now < new Date(upcomingOrActive.endTime).getTime()) {
           return { status: 'ACTIVE', slot: upcomingOrActive };
      }
      
      if (now >= new Date(upcomingOrActive.endTime).getTime()) {
           return { status: 'COMPLETED', slot: upcomingOrActive };
      }

      return { status: 'NONE', slot: null };
  }, [examSlots]);

  const findStudentSeat = useCallback((registerNumber: string, slot: ExamSlot) => {
    if (!slot) return null;

    const studentToFind = students.find(s => s.registerNumber.toLowerCase() === registerNumber.toLowerCase());
    if (!studentToFind) return null;

    const seatInfo = slot.seatingPlan.find(s => s.studentId === studentToFind.id);
    if (!seatInfo) return null;
    
    const hallInfo = halls.find(h => h.id === seatInfo.hallId);
    if (!hallInfo) return null;

    return { student: studentToFind, hall: hallInfo, seatNumber: seatInfo.seatNumber };
  }, [students, halls]);

  const updateStudentAttendance = useCallback((slotId: string, studentId: string, status: 'PRESENT' | 'ABSENT') => {
    setExamSlots(prevSlots => {
        return prevSlots.map(slot => {
            if (slot.id === slotId) {
                const updatedSeatingPlan = slot.seatingPlan.map(seat => {
                    if (seat.studentId === studentId) {
                        return { ...seat, attendance: status };
                    }
                    return seat;
                });
                return { ...slot, seatingPlan: updatedSeatingPlan };
            }
            return slot;
        });
    });
  }, []);

  const value = {
    classGroups,
    students,
    halls,
    examSlots,
    isAuthenticated,
    addStudent,
    updateStudent,
    deleteStudent,
    addHall,
    updateHall,
    deleteHall,
    addExamSlot,
    deleteExamSlot,
    getSlotById,
    getPublicSlotDetails,
    findStudentSeat,
    updateStudentAttendance,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};