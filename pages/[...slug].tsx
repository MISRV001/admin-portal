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
  const sidebarPermissionsRaw = fs.readFileSync(sidebarPath, 'utf-8');
  console.log('[SSR] Raw sidebar-permissions.json:', sidebarPermissionsRaw);
  const sidebarPermissions = JSON.parse(sidebarPermissionsRaw);
  console.log('[SSR] Parsed sidebar-permissions.json:', sidebarPermissions);
  return { props: { sidebarPermissions } };
}

export default function HomePage({ sidebarPermissions }: { sidebarPermissions: any }) {
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
        {isAuthenticated ? <DashboardLayout sidebarPermissions={sidebarPermissions} /> : <LoginForm />}
        <NetworkSimulator />
        <EnhancedApiModeSelector />
      </div>
    </>
  );
}