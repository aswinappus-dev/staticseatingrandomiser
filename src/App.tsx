import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Welcome from './pages/Welcome';
import StudentFinder from './pages/StudentFinder';
import InvigilatorDashboard from './pages/InvigilatorDashboard';
import UniversalLayout from './layouts/UniversalLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageHalls from './pages/ManageHalls';
import ManageSlots from './pages/ManageSlots';
import ViewSlot from './pages/ViewSlot';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Support from './pages/Support';

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            {/* Standalone routes for a full-screen experience */}
            <Route index element={<Welcome />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* All other routes are wrapped in the universal layout with a sidebar */}
            <Route element={<UniversalLayout />}>
              {/* Public Routes */}
              <Route path="/student" element={<StudentFinder />} />
              <Route path="/invigilator" element={<InvigilatorDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/support" element={<Support />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="halls" element={<ManageHalls />} />
                <Route path="slots" element={<ManageSlots />} />
                <Route path="slot/:id" element={<ViewSlot />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;