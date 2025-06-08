import React, { useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { DashboardLayout } from './DashboardLayout';
import { NetworkSimulator } from './NetworkSimulator';
import { useAuthStore } from '../stores/authStore';

// Main App Component
const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      {isAuthenticated ? <DashboardLayout /> : <LoginForm />}
      <NetworkSimulator />
    </div>
  );
};

export default App;