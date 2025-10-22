export interface Student {
  id: string;
  registerNumber: string; // e.g., CEC24CS111
  name: string;
  departmentId: string; // Represents a unique class, e.g., "24-CS"
}

export interface Hall {
  id: string;
  name: string; // e.g., "101"
  capacity: number; // Represents number of benches
  block: string; // e.g., "Main Block", "CS Block"
  columns: 2 | 3 | 4;
}

export interface ClassGroup {
  id: string;
  name: string; // e.g., "24-CS", "22-EC"
}

export interface Seating {
  studentId: string;
  hallId: string;
  seatNumber: string; // e.g., A1-1, A1-2 (Col-Row-SeatOnBench)
  attendance?: 'PRESENT' | 'ABSENT';
}

export type ExamSlotStatus = 'PENDING' | 'GENERATED' | 'ACTIVE' | 'COMPLETED';

export interface ExamSlot {
  id: string;
  name:string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  status: ExamSlotStatus;
  seatingPlan: Seating[];
  classGroupIds: string[];
  hallIds: string[];
}