import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../src/stores/authStore';
import { DashboardLayout } from '../src/components/DashboardLayout';
import { LoginForm } from '../src/components/LoginForm';
import { NetworkSimulator } from '../src/components/NetworkSimulator';
import { EnhancedApiModeSelector } from '../src/components//ApiModeSelector';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for Zustand persist to hydrate
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - BoostTrade</title>
      </Head>
      <div className="min-h-screen bg-gray-50" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
        {isAuthenticated ? <DashboardLayout /> : <LoginForm />}
        <NetworkSimulator />
        <EnhancedApiModeSelector />
      </div>
    </>
  );
}