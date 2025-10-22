import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">About ExamFlow</h1>
      <div className="space-y-4 prose prose-gray dark:prose-invert max-w-none">
        <p>
          ExamFlow is a modern, web-based utility designed to automate and streamline the entire process of exam hall administration. From managing student and hall data to generating complex seating arrangements, ExamFlow provides a comprehensive solution for educational institutions.
        </p>
        <p>
          Our core mission is to reduce the manual workload of administrators, minimize the potential for academic malpractice through intelligent randomization, and provide a seamless experience for students and invigilators alike.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white pt-4">Key Features</h2>
        <ul>
          <li><strong>Centralized Data Management:</strong> Easily add, update, and manage student lists, class groups, and exam hall details in one place.</li>
          <li><strong>Intelligent Seating Generation:</strong> Our algorithm creates randomized, interleaved seating plans to separate students from the same class, ensuring exam integrity. It automatically handles single or double seating based on capacity.</li>
          <li><strong>Real-time Dashboards:</strong> Separate, purpose-built interfaces for students to find their seats and for invigilators to manage attendance live during the exam.</li>
          <li><strong>Automated Scheduling:</strong> Exam slots can be scheduled in advance, and seating plans are generated automatically just before the exam begins.</li>
          <li><strong>Printable Reports:</strong> Generate clean, printable attendance sheets and full seating plans for administrative use.</li>
        </ul>
        <p>
          Built with modern web technologies, ExamFlow is designed to be fast, reliable, and user-friendly, transforming a traditionally stressful process into a smooth and efficient operation.
        </p>
      </div>
    </div>
  );
};

export default About;