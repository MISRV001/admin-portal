import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Menu, Target, Store, User, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { Sidebar } from './Sidebar';

// Mobile Header Component
export const MobileHeader: React.FC = () => {
  const { toggleMobileMenu, currentPage } = useNavigationStore();
  const { user } = useAuthStore();

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
  const { currentPage } = useNavigationStore();
  const { user } = useAuthStore();

  return (
    <div className="flex-1 bg-gray-50 p-4 lg:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="text-xl lg:text-2xl">{currentPage}</CardTitle>
            <CardDescription className="text-blue-100">
              Currently viewing: {currentPage} {user && `(${user.role.replace('_', ' ')} access)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 lg:p-8">
            <div className="text-center py-8 lg:py-12">
              <div className="text-4xl lg:text-6xl mb-4">🚀</div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-700 mb-2">Welcome to {currentPage}</h2>
              <p className="text-gray-500">This is the {currentPage} section of BoostTrade.</p>
              <p className="text-sm text-gray-400 mt-4">
                Navigate using the sidebar menu. Available options are based on your role: <span className="font-semibold capitalize">{user?.role.replace('_', ' ')}</span>
              </p>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-700 mb-2">Your Access Level</h3>
                <div className="text-xs text-blue-600 space-y-1">
                  {user?.role === 'admin' && (
                    <p>✅ Full system access including user management, campaigns, stores, and reports</p>
                  )}
                  {user?.role === 'campaign_manager' && (
                    <p>✅ Campaign creation, editing, publishing, and campaign-related reports</p>
                  )}
                  {user?.role === 'reports_only' && (
                    <p>✅ Read-only access to all reports and analytics</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentPage === 'Dashboard' && (
          <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-600">24</p>
                  </div>
                  <Target className="w-8 h-8 lg:w-12 lg:h-12 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Stores</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600">156</p>
                  </div>
                  <Store className="w-8 h-8 lg:w-12 lg:h-12 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-600">1.2K</p>
                  </div>
                  <User className="w-8 h-8 lg:w-12 lg:h-12 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <p className="text-2xl lg:text-3xl font-bold text-orange-600">$2.4M</p>
                  </div>
                  <BarChart3 className="w-8 h-8 lg:w-12 lg:h-12 text-orange-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Layout Component
export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        <MainContent />
      </div>
    </div>
  );
};