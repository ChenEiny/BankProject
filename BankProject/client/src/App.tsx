import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import api from './api/axios';
import { User } from './types';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'
import HealthBadge from './components/HealthBadge';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <BrowserRouter>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 20px', 
        background: '#1976d2', 
        color: 'white' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>Safe Bank</h2>
          <HealthBadge />
        </div>
        <div>
          {user ? (
            <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer' }}>
              Logout
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" style={{ color: 'white' }}>Login</Link>
              <Link to="/register" style={{ color: 'white' }}>Register</Link>
            </div>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/api/auth/verify-email" element={<VerifyEmail />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}