import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Menu, Target, Store, User, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigationStore } from '../stores/navigationStore';
import { Sidebar } from './Sidebar';
import { CreateCampaign } from './CreateCampaign';
import { Report1 } from './Report1';
import { AddUsers } from './AddUsers';
import { AddPlacements } from './AddPlacements';
import { FeaturePermissions} from './FeaturePermissions';
import { canAccessRoute } from '../lib/permissionUtils';

// Helper function to get page title from route
const getPageTitle = (route: string) => {
  if (route === '/') return 'Dashboard';
  
  const routeMap: Record<string, string> = {
    '/emailinvites': 'Email Invites',
    '/rolestofeaturemapping': 'Roles to Feature Mapping',
    '/addusers': 'Add Users',
    '/rolepermissions': 'Role Permissions',
    '/featurepermissions': 'Feature Permissions',
    '/addplacements': 'Add Placements',
    '/campaignconditions': 'Campaign Conditions',
    '/createcampaign': 'Create Campaign',
    '/publishcampaign': 'Publish Campaign',
    '/previewcampaign': 'Preview Campaign',
    '/posstoresdevice': 'POS Stores/Device',
    '/devicehealth': 'Device Health',
    '/report1': 'Campaign Performance Report',
    '/report2': 'Store Performance Report',
    '/report3': 'Inventory Report',
  };
  
  return routeMap[route] || 'Page';
};

// Dashboard content component
const DashboardContent: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <div className="text-6xl mb-4">📊</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Dashboard Overview</h2>
      <p className="text-gray-500">Monitor your campaigns, stores, and performance metrics</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
              <p className="text-3xl font-bold text-blue-600">24</p>
            </div>
            <Target className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Stores</p>
              <p className="text-3xl font-bold text-green-600">156</p>
            </div>
            <Store className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-purple-600">1.2K</p>
            </div>
            <User className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-3xl font-bold text-orange-600">$2.4M</p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Default fallback component
const DefaultContent: React.FC<{ pageName: string; userRole?: string }> = ({ pageName, userRole }) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">🚀</div>
    <h2 className="text-xl font-bold text-gray-700 mb-2">Welcome to {pageName}</h2>
    <p className="text-gray-500">This is the {pageName} section of BoostTrade.</p>
    <p className="text-sm text-gray-400 mt-4">
      Navigate using the sidebar menu. Available options are based on your role: 
      <span className="font-semibold capitalize"> {userRole?.replace('_', ' ')}</span>
    </p>
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
      <h3 className="text-sm font-semibold text-blue-700 mb-2">Page Status</h3>
      <p className="text-xs text-blue-600">
        This page is using the default template. A custom component for "{pageName}" can be created.
      </p>
    </div>
  </div>
);

// Route content renderer with detailed debugging
const getRouteContent = (routePath: string, pageName: string, userRole?: string) => {
  console.log('=== ROUTE MATCHING DEBUG ===');
  console.log('routePath (asPath):', routePath);
  console.log('pageName:', pageName);
  console.log('userRole:', userRole);
  
  // Clean the pathname
  const cleanPath = routePath.toLowerCase().trim();
  console.log('cleanPath:', cleanPath);
  
  // Route matching
  if (cleanPath === '/') {
    console.log('✅ Matched: Dashboard');
    return <DashboardContent />;
  }
  
  if (cleanPath === '/createcampaign') {
    console.log('✅ Matched: CreateCampaign');
    return <CreateCampaign />;
  }
  
  if (cleanPath === '/report1') {
    console.log('✅ Matched: Report1');
    return <Report1 />;
  }
  
  if (cleanPath === '/addusers') {
    console.log('✅ Matched: AddUsers');
    return <AddUsers />;
  }

  if (cleanPath === '/addplacements') {
    console.log('✅ Loading AddPlacements');
    return <AddPlacements />;
  }
  
  if (cleanPath === '/featurepermissions') {
    console.log('✅ Matched: FeaturePermissions');
    return <FeaturePermissions />;
  }
  
  console.log('⚠️ No match found, using DefaultContent');
  return <DefaultContent pageName={pageName} userRole={userRole} />;
};

// Mobile Header Component
export const MobileHeader: React.FC = () => {
  const { toggleMobileMenu } = useNavigationStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const currentPage = getPageTitle(router.asPath); // Use asPath instead of pathname

  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{currentPage}</h1>
          {user && (
            <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
          )}
        </div>
      </div>
      <div className="text-sm font-bold text-blue-600">BoostTrade</div>
    </div>
  );
};

// Main Content Component
export const MainContent: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const currentPage = getPageTitle(router.asPath); // Use asPath instead of pathname

  console.log('=== MAIN CONTENT RENDER ===');
  console.log('router.pathname:', router.pathname);
  console.log('router.asPath:', router.asPath); // This shows the actual URL
  console.log('currentPage:', currentPage);
  console.log('user:', user);

  return (
    <div className="flex-1 bg-gray-50 p-4 lg:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="text-xl lg:text-2xl">{currentPage}</CardTitle>
            <CardDescription className="text-blue-100">
              {user && `${user.role.replace('_', ' ')} access`} • BoostTrade Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 lg:p-8">
            {getRouteContent(router.asPath, currentPage, user?.role)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Dashboard Layout Component
export function DashboardLayout() {
  const { user } = useAuthStore();
  const router = useRouter();
  const routePath = router.asPath.split('?')[0].toLowerCase();

  // Default: allow access if route is not mapped (fallback to '/')
  const isAllowed = !user || canAccessRoute(user, routePath) || routePath === '/';

  if (user && !isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-6">You do not have permission to view this page.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  console.log('=== DASHBOARD LAYOUT RENDER ===');
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        <MainContent />
      </div>
    </div>
  );
}