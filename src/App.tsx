
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { CallbackHandler } from './components/CallbackHandler';
import { ProtectedClinicianApp } from './components/ProtectedClinicianApp';
import { ProtectedClientApp } from './components/ProtectedClientApp';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackHandler />} />
        <Route path="/ehr/*" element={<ProtectedClinicianApp />} />
        <Route path="/intake/*" element={<ProtectedClientApp />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
