import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './DataContext';
import { UserProvider } from './UserContext';
import { ApprovedStudentsProvider } from './components/ApprovedStudentsContext';
import Dashboard from './components/Dashboard';
import NursingPage from './components/NursingPage';
import FinanceAdminPage from './components/FinanceAdminPage';
import NursesPortal from './components/NursesPortal';
import AdminRegister from './components/AdminRegister';
import ResetPassword from './components/ResetPassword';
import SuperAdminPage from './components/SuperAdminPage'; 
import './App.css';
import ApplicationForm from './components/ApplicationForm';

const App = () => {
  return (
    <DataProvider>
      <UserProvider>
        <ApprovedStudentsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<NursesPortal />} />
              <Route path="/application-form" element={<ApplicationForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/nursing-admin" element={<NursingPage />} />
              <Route path="/finance-admin" element={<FinanceAdminPage />} />
              <Route path="/register" element={<AdminRegister />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/super-admin" element={<SuperAdminPage />} /> 
            </Routes>
          </Router>
        </ApprovedStudentsProvider>
      </UserProvider>
    </DataProvider>
  );
};

export default App;
