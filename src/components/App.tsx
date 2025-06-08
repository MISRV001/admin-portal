import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Target, 
  Store, 
  BarChart3,
  Mail,
  UserPlus,
  MapPin,
  Filter,
  PlusCircle,
  Eye,
  Play,
  Monitor,
  Activity,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { MockAPIService } from '@/services/mockApiService';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { getNavigationItems } from '@/utils/roleBasedNavigation';

type UserRole = 'admin' | 'campaign_manager' | 'reports_only';

// Login Form Component
const LoginForm: React.FC = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '', role: 'admin' as UserRole });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { login, forgotPassword, isLoading, error, loginStatus, clearError } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(loginData);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess('');

    try {
      await forgotPassword(forgotPasswordEmail);
      setSuccess('Password reset email sent successfully');
      setForgotPasswordEmail('');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const renderLoginStatus = () => {
    switch (loginStatus) {
      case 'loading':
        return (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Authenticating...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Login successful! Redirecting...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>Login failed. Please try again.</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
            <CardDescription>Enter your email address and we'll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword(e)}
                />
              </div>
              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Login
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">BoostTrade</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            
            {loginStatus !== 'idle' && (
              <div className="p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200">
                {renderLoginStatus()}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                disabled={loginStatus === 'loading'}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                disabled={loginStatus === 'loading'}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Demo Role</label>
              <select
                value={loginData.role}
                onChange={(e) => setLoginData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loginStatus === 'loading'}
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="campaign_manager">Campaign Manager</option>
                <option value="reports_only">Reports Analyst</option>
              </select>
            </div>

            <button
              onClick={handleLogin}
              disabled={loginStatus === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginStatus === 'loading' ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-2 font-medium">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p><strong>Any email/password</strong> - Role determines access</p>
                <p><strong>Admin:</strong> Full system access</p>
                <p><strong>Campaign Manager:</strong> Campaign + Reports</p>
                <p><strong>Reports Only:</strong> Analytics only</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot your password?
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Sidebar Components
interface CollapsibleMenuItemProps {
  title: string;
  icon: React.ReactNode;
  children: { name: string; icon: React.ReactNode }[];
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
  const [isOpen, setIsOpen] = useState(false);
  const { setCurrentPage } = useNavigation();

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
        <div className="ml-6 space-y-1">
          {children.map((child, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(child.name)}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              {child.icon}
              <span className="text-sm text-gray-600">{child.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC = () => {
  const { sidebarCollapsed, mobileMenuOpen, toggleSidebar, closeMobileMenu } = useNavigation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigationItems = user ? getNavigationItems(user.role, user.permissions) : [];

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

// Mobile Header Component
const MobileHeader: React.FC = () => {
  const { toggleMobileMenu, currentPage } = useNavigation();
  const { user } = useAuth();

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
const MainContent: React.FC = () => {
  const { currentPage } = useNavigation();
  const { user } = useAuth();

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
const DashboardLayout: React.FC = () => {
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

// Main App Component
const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

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
    </div>
  );
};

const AppWithProviders: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </AuthProvider>
  );
};

export default AppWithProviders;
