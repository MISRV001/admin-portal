import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../src/stores/authStore';
import { DashboardLayout } from '../src/components/DashboardLayout';
import { LoginForm } from '../src/components/LoginForm';
import { NetworkSimulator } from '../src/components/NetworkSimulator';
import { EnhancedApiModeSelector } from '../src/components//ApiModeSelector';
import fs from 'fs';
import path from 'path';

export async function getServerSideProps() {
  const sidebarPath = path.join(process.cwd(), 'public/mock/responses/sidebar-permissions.json');
  console.log('[SSR] Fetching sidebar-permissions.json from:', sidebarPath);
  let sidebarPermissions = null;
  try {
    const sidebarPermissionsRaw = fs.readFileSync(sidebarPath, 'utf-8');
    console.log('[SSR] Raw sidebar-permissions.json:', sidebarPermissionsRaw);
    sidebarPermissions = JSON.parse(sidebarPermissionsRaw);
    console.log('[SSR] Parsed sidebar-permissions.json:', sidebarPermissions);
  } catch (err) {
    console.error('[SSR] Failed to load sidebar-permissions.json:', err);
    // Return empty sidebarPermissions to trigger error UI in Sidebar
    sidebarPermissions = {};
  }
  return { props: { sidebarPermissions } };
}

export default function HomePage({ sidebarPermissions }: { sidebarPermissions: any }) {
  // Defensive: If sidebarPermissions is not an object or missing expected keys, treat as API error
  const isSidebarApiError = !sidebarPermissions || typeof sidebarPermissions !== 'object' || !sidebarPermissions.sidebar || !Array.isArray(sidebarPermissions.sidebar);

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

  if (isSidebarApiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-4xl mb-4 text-blue-600">⚠️</div>
        <div className="text-xl font-bold mb-2">Technical Issue</div>
        <div className="text-gray-600 mb-6 text-center">
          We are unable to load required permissions or navigation data.<br />
          This may be due to a missing or unavailable API/mocks file.<br />
          Please contact support or try again later.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - BoostTrade</title>
      </Head>
      <div className="min-h-screen bg-gray-50" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
        {isAuthenticated ? <DashboardLayout sidebarPermissions={sidebarPermissions} /> : <LoginForm />}
        <NetworkSimulator />
        <EnhancedApiModeSelector />
      </div>
    </>
  );
}