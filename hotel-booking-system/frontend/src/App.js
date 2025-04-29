import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import LoginPage from './components/LoginPage';
import './styles.css';

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentGuestId, setCurrentGuestId] = useState(null);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LoginPage 
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            setCurrentGuestId={setCurrentGuestId}
          />} />
          <Route path="/admin" element={
            isAdminAuthenticated ? 
              <AdminDashboard setIsAdminAuthenticated={setIsAdminAuthenticated} /> : 
              <Navigate to="/" />
          } />
          <Route path="/user" element={
            currentGuestId ? 
              <UserDashboard guestId={currentGuestId} setCurrentGuestId={setCurrentGuestId} /> : 
              <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;