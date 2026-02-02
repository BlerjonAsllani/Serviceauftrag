import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import AuftragListe from './components/AuftragListe';
import AuftragErfassen from './components/AuftragErfassen';
import AuftragDetails from './components/AuftragDetails';
import { checkAuth, logout } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const verifyAuth = async () => {
    try {
      const response = await checkAuth();
      console.log('Auth Check:', response.data);
      
      // Prüfen ob user-Objekt vorhanden ist
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        // Keine User-Daten -> ausloggen
        setUser(null);
      }
    } catch (error) {
      console.log('Nicht angemeldet:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  verifyAuth();
}, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Logout fehlgeschlagen:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <>
          <Navigation user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/auftraege" element={<AuftragListe user={user} />} />
            <Route path="/auftrag/neu" element={<AuftragErfassen user={user} />} />
            <Route path="/auftrag/:id" element={<AuftragDetails user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;