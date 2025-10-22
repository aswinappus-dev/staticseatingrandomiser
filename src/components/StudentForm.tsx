import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface StudentFormProps {
  student: Student | null;
  onSubmit: (student: Student | Omit<Student, 'id'>) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit }) => {
  const { classGroups } = useAppContext();
  const [registerNumber, setRegisterNumber] = useState('');
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    if (student) {
      setRegisterNumber(student.registerNumber);
      setName(student.name);
      setDepartmentId(student.departmentId);
    } else {
      setRegisterNumber('');
      setName('');
      setDepartmentId(classGroups.length > 0 ? classGroups[0].id : '');
    }
  }, [student, classGroups]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerNumber && name && departmentId) {
      const studentData = { registerNumber, name, departmentId };
      if (student) {
        onSubmit({ ...student, ...studentData });
      } else {
        onSubmit(studentData);
      }
    } else {
        alert("Please fill in all fields.");
    }
  };
  
  const inputClass = "mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Register Number</label>
        <input
          type="text"
          id="registerNumber"
          value={registerNumber}
          onChange={(e) => setRegisterNumber(e.target.value)}
          required
          className={inputClass}
          placeholder="e.g., CEC24CS111"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>
       <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Class Group</label>
        <select
          id="department"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          required
          className={inputClass}
        >
          {classGroups.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
          Save Student
        </button>
      </div>
    </form>
  );
};

export default StudentForm;