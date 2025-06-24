import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

type UserRole = 'admin' | 'campaign_manager' | 'reports_only';

export const LoginForm: React.FC = () => {
  const [loginData, setLoginData] = useState({ 
    email: '', 
    password: '', 
    role: 'admin' as UserRole 
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { login, forgotPassword, isLoading, error, loginStatus, clearError } = useAuthStore();

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
                <option value="pos_admin">POS-Admin</option>
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