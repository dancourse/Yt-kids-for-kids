import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import Login from '../../components/parent/Login';
import Dashboard from '../../components/parent/Dashboard';

export default function ParentDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
}
