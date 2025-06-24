import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronDown, ChevronRight, Menu, X, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigationStore } from '../stores/navigationStore';
import { useNavigationItems } from '../utils/roleBasedNavigation';

interface CollapsibleMenuItemProps {
  title: string;
  icon: React.ReactNode;
  children: { name: string; icon: React.ReactNode; route: string }[];
  isCollapsed: boolean;
  isMobile?: boolean;
}

const CollapsibleMenuItem: React.FC<CollapsibleMenuItemProps> = ({ 
  title, 
  icon, 
  children, 
  isCollapsed, 
  isMobile = false 
}) => {
  const router = useRouter();

  // Determine if any child is active
  const isAnyChildActive = children.some(child => child.route === router.asPath);

  // Open if any child is active
  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  // Keep open when route changes and a child is active
  React.useEffect(() => {
    if (isAnyChildActive) setIsOpen(true);
  }, [router.asPath]);

  if (isCollapsed && !isMobile) {
    return (
      <div className="relative group">
        <button className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          {icon}
        </button>
        <div className="absolute left-full ml-2 invisible group-hover:visible bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50">
          {title}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <span className="font-medium text-gray-700">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="pl-8 space-y-1">
          {children.map(child => {
            const isActive = router.asPath === child.route;
            return (
              <button
                key={child.route}
                onClick={() => router.push(child.route)}
                className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {child.icon}
                <span className="ml-2">{child.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<{ permissions?: Record<string, string>, sidebarRoutes?: any[] }> = ({ permissions: serverPermissions, sidebarRoutes }) => {
  const { sidebarCollapsed, mobileMenuOpen, toggleSidebar, closeMobileMenu } = useNavigationStore();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Use permissions from server (SSR/SSG) or fallback to empty object
  const sidebarPermissions = serverPermissions || {};

  // Only render navigationItems when user and sidebarRoutes are available
  const ready = !!user && Array.isArray(sidebarRoutes) && sidebarRoutes.length > 0;
  const sidebarApiFailed = !sidebarRoutes || !Array.isArray(sidebarRoutes) || sidebarRoutes.length === 0;

  // Detect if the sidebar-permissions.json file is missing (ENOENT error)
  // This should be handled in getServerSideProps/pages, but if SSR passes empty or undefined, treat as API error here
  if (sidebarApiFailed) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
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

  const navigationItems = ready ? useNavigationItems(user?.role || 'admin', sidebarPermissions, sidebarRoutes) : [];

  const DesktopSidebar = () => (
    <div className={`hidden lg:flex bg-white h-screen shadow-lg transition-all duration-300 flex-col ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-blue-600">BoostTrade</h1>
            {user && (
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')} Portal</p>
            )}
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <CollapsibleMenuItem
            key={index}
            title={item.title}
            icon={item.icon}
            children={item.children}
            isCollapsed={sidebarCollapsed}
          />
        ))}
      </div>

      <div className="border-t border-gray-200 p-4 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-700">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
              <div className="text-xs text-blue-600 capitalize">{user?.role.replace('_', ' ')}</div>
            </div>
          )}
        </button>

        {showUserMenu && (
          <div className={`absolute ${sidebarCollapsed ? 'left-full ml-2 bottom-0' : 'bottom-full mb-2'} bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48 z-50`}>
            <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left">
              <User className="w-4 h-4" />
              <span className="text-sm">Account</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MobileSidebar = () => (
    <>
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      <div className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-600">BoostTrade</h1>
            {user && (
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')} Portal</p>
            )}
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto h-full pb-24">
          {navigationItems.map((item, index) => (
            <CollapsibleMenuItem
              key={index}
              title={item.title}
              icon={item.icon}
              children={item.children}
              isCollapsed={false}
              isMobile={true}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-white">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
                <div className="text-xs text-blue-600 capitalize">{user?.role.replace('_', ' ')}</div>
              </div>
            </div>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <User className="w-4 h-4" />
              <span className="text-sm">Account</span>
            </button>
            <button
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};