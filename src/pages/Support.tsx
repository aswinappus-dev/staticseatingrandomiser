import React from 'react';

const Support: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md text-gray-700 dark:text-gray-300">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Support & Help</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Contact Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Us</h2>
          <p>
            If you encounter any issues or have questions that are not answered in the FAQ, please feel free to reach out to our support team.
          </p>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Email Support</h3>
            <a href="mailto:support@examflow.com" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">support@examflow.com</a>
            <p className="text-sm text-gray-500">Best for non-urgent issues. We typically respond within 24 hours.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Phone Support</h3>
            <p className="text-indigo-600 dark:text-indigo-400">+1 (800) 555-EXAM</p>
            <p className="text-sm text-gray-500">Available from 9 AM to 5 PM on business days for urgent matters.</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Q: How do I perform a bulk upload of students?</h3>
              <p className="text-sm">A: On the 'Manage Students' page, click the 'Bulk Upload (.csv)' button. Ensure your CSV file has columns for 'registerNumber', 'name', and 'departmentId'. The system will parse this file to add students.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Q: The seating plan was not generated for a scheduled slot. What should I do?</h3>
              <p className="text-sm">A: Seating plans are automatically generated 3 minutes before the scheduled start time. If this time has passed, first check that the total student count does not exceed the maximum capacity of the selected halls. If capacity is sufficient and it still fails, please contact support.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Q: Can I edit an exam slot after it has been created?</h3>
              <p className="text-sm">A: Currently, exam slots cannot be edited once created to ensure data integrity. You would need to delete the incorrect slot and create a new one with the correct details. This feature is planned for a future update.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;