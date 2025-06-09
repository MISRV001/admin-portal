// API Endpoints Configuration
// File: src/config/apiEndpoints.ts

export interface ApiEndpointConfig {
  endpoint: string;
  name: string;
  description: string;
  defaultMode: 'live' | 'mock';
  mockFile?: string;
  liveApiUrl?: string; // Override base URL for specific endpoints
  headers?: Record<string, string>; // Custom headers for live API
  category: 'auth' | 'campaigns' | 'users' | 'stores' | 'reports' | 'admin';
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[];
  requiresAuth: boolean;
  permissions?: string[]; // Required permissions
}

export interface ApiEndpointsConfiguration {
  version: string;
  lastUpdated: string;
  defaultLiveApiUrl: string;
  mockResponsesPath: string;
  endpoints: ApiEndpointConfig[];
}

export const apiEndpointsConfig: ApiEndpointsConfiguration = {
  version: '1.0.0',
  lastUpdated: '2024-01-15',
  defaultLiveApiUrl: 'https://api.boosttrade.com',
  mockResponsesPath: 'mock/responses',
  
  endpoints: [
    // ========================================
    // AUTHENTICATION ENDPOINTS
    // ========================================
    {
      endpoint: 'auth/login',
      name: 'User Login',
      description: 'Authenticate user credentials and return JWT token',
      defaultMode: 'mock',
      mockFile: 'auth-login.json',
      category: 'auth',
      methods: ['POST'],
      requiresAuth: false,
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      endpoint: 'auth/logout',
      name: 'User Logout',
      description: 'Invalidate user session and JWT token',
      defaultMode: 'mock',
      mockFile: 'auth-logout.json',
      category: 'auth',
      methods: ['POST'],
      requiresAuth: true
    },
    {
      endpoint: 'auth/forgot-password',
      name: 'Forgot Password',
      description: 'Send password reset email to user',
      defaultMode: 'mock',
      mockFile: 'auth-forgot-password.json',
      category: 'auth',
      methods: ['POST'],
      requiresAuth: false
    },
    {
      endpoint: 'auth/reset-password',
      name: 'Reset Password',
      description: 'Reset user password with token',
      defaultMode: 'mock',
      mockFile: 'auth-reset-password.json',
      category: 'auth',
      methods: ['POST'],
      requiresAuth: false
    },
    {
      endpoint: 'auth/refresh',
      name: 'Refresh Token',
      description: 'Refresh JWT token',
      defaultMode: 'live',
      mockFile: 'auth-refresh.json',
      category: 'auth',
      methods: ['POST'],
      requiresAuth: true
    },

    // ========================================
    // CAMPAIGN MANAGEMENT ENDPOINTS
    // ========================================
    {
      endpoint: 'campaigns/create',
      name: 'Create Campaign',
      description: 'Create a new marketing campaign',
      defaultMode: 'mock',
      mockFile: 'campaigns-create.json',
      category: 'campaigns',
      methods: ['POST'],
      requiresAuth: true,
      permissions: ['campaigns.create']
    },
    {
      endpoint: 'campaigns/list',
      name: 'List Campaigns',
      description: 'Get list of all campaigns with pagination',
      defaultMode: 'mock',
      mockFile: 'campaigns-list.json',
      category: 'campaigns',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['campaigns.view']
    },
    {
      endpoint: 'campaigns/{id}',
      name: 'Get Campaign',
      description: 'Get specific campaign details by ID',
      defaultMode: 'mock',
      mockFile: 'campaigns-get.json',
      category: 'campaigns',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['campaigns.view']
    },
    {
      endpoint: 'campaigns/{id}/update',
      name: 'Update Campaign',
      description: 'Update existing campaign',
      defaultMode: 'mock',
      mockFile: 'campaigns-update.json',
      category: 'campaigns',
      methods: ['PUT', 'PATCH'],
      requiresAuth: true,
      permissions: ['campaigns.edit']
    },
    {
      endpoint: 'campaigns/{id}/delete',
      name: 'Delete Campaign',
      description: 'Delete campaign by ID',
      defaultMode: 'live', // Prefer live for destructive operations
      mockFile: 'campaigns-delete.json',
      category: 'campaigns',
      methods: ['DELETE'],
      requiresAuth: true,
      permissions: ['campaigns.delete']
    },
    {
      endpoint: 'campaigns/{id}/publish',
      name: 'Publish Campaign',
      description: 'Publish campaign to make it active',
      defaultMode: 'mock',
      mockFile: 'campaigns-publish.json',
      category: 'campaigns',
      methods: ['POST'],
      requiresAuth: true,
      permissions: ['campaigns.publish']
    },
    {
      endpoint: 'campaigns/{id}/preview',
      name: 'Preview Campaign',
      description: 'Get campaign preview data',
      defaultMode: 'mock',
      mockFile: 'campaigns-preview.json',
      category: 'campaigns',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['campaigns.preview']
    },

    // ========================================
    // USER MANAGEMENT ENDPOINTS
    // ========================================
    {
      endpoint: 'users/create',
      name: 'Create User',
      description: 'Create new user account',
      defaultMode: 'mock',
      mockFile: 'users-create.json',
      category: 'users',
      methods: ['POST'],
      requiresAuth: true,
      permissions: ['admin.users.manage']
    },
    {
      endpoint: 'users/list',
      name: 'List Users',
      description: 'Get paginated list of users',
      defaultMode: 'mock',
      mockFile: 'users-list.json',
      category: 'users',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['admin.users.manage', 'users.view']
    },
    {
      endpoint: 'users/{id}',
      name: 'Get User',
      description: 'Get user details by ID',
      defaultMode: 'mock',
      mockFile: 'users-get.json',
      category: 'users',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['admin.users.manage', 'users.view']
    },
    {
      endpoint: 'users/{id}/update',
      name: 'Update User',
      description: 'Update user profile and settings',
      defaultMode: 'live',
      mockFile: 'users-update.json',
      category: 'users',
      methods: ['PUT', 'PATCH'],
      requiresAuth: true,
      permissions: ['admin.users.manage']
    },
    {
      endpoint: 'users/invite',
      name: 'Invite User',
      description: 'Send email invitation to new user',
      defaultMode: 'live', // Email sending should be live
      mockFile: 'users-invite.json',
      category: 'users',
      methods: ['POST'],
      requiresAuth: true,
      permissions: ['admin.users.manage']
    },

    // ========================================
    // STORE MANAGEMENT ENDPOINTS
    // ========================================
    {
      endpoint: 'stores/list',
      name: 'List Stores',
      description: 'Get all POS stores and devices',
      defaultMode: 'mock',
      mockFile: 'stores-list.json',
      category: 'stores',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['stores.view', 'stores.manage']
    },
    {
      endpoint: 'stores/{id}/health',
      name: 'Store Health Check',
      description: 'Get device health status for store',
      defaultMode: 'live', // Real-time data preferred
      mockFile: 'stores-health.json',
      category: 'stores',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['stores.health', 'stores.manage']
    },
    {
      endpoint: 'stores/create',
      name: 'Create Store',
      description: 'Add new POS store location',
      defaultMode: 'mock',
      mockFile: 'stores-create.json',
      category: 'stores',
      methods: ['POST'],
      requiresAuth: true,
      permissions: ['stores.manage']
    },
    {
      endpoint: 'stores/{id}/devices',
      name: 'Store Devices',
      description: 'Get all devices for specific store',
      defaultMode: 'mock',
      mockFile: 'stores-devices.json',
      category: 'stores',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['stores.view', 'stores.manage']
    },

    // ========================================
    // REPORTS AND ANALYTICS ENDPOINTS
    // ========================================
    {
      endpoint: 'reports/dashboard',
      name: 'Dashboard Metrics',
      description: 'Get main dashboard statistics',
      defaultMode: 'mock',
      mockFile: 'reports-dashboard.json',
      category: 'reports',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['reports.view_all', 'dashboard.view']
    },
    {
      endpoint: 'reports/campaigns',
      name: 'Campaign Performance Reports',
      description: 'Get detailed campaign analytics and performance metrics',
      defaultMode: 'mock',
      mockFile: 'reports-campaigns.json',
      category: 'reports',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['reports.view_all', 'reports.view_campaigns']
    },
    {
      endpoint: 'reports/stores',
      name: 'Store Performance Reports',
      description: 'Get store analytics and performance data',
      defaultMode: 'mock',
      mockFile: 'reports-stores.json',
      category: 'reports',
      methods: ['GET'],
      requiresAuth: true,
      permissions: ['reports.view_all']
    },
    {
      endpoint: 'reports/export',
      name: 'Export Reports',
      description: 'Export reports in various formats (CSV, PDF, Excel)',
      defaultMode: 'live', // File generation should be live
      mockFile: 'reports-export.json',
      category: 'reports',
      methods: ['POST'],
      requiresAuth: true,
      permissions: ['reports.export']
    },

    // ========================================
    // ADMIN CONFIGURATION ENDPOINTS
    // ========================================
    {
      endpoint: 'admin/roles',
      name: 'Role Management',
      description: 'Manage user roles and permissions',
      defaultMode: 'mock',
      mockFile: 'admin-roles.json',
      category: 'admin',
      methods: ['GET', 'POST', 'PUT'],
      requiresAuth: true,
      permissions: ['admin.roles.manage']
    },
    {
      endpoint: 'admin/placements',
      name: 'Ad Placements',
      description: 'Manage advertisement placement configurations',
      defaultMode: 'mock',
      mockFile: 'admin-placements.json',
      category: 'admin',
      methods: ['GET', 'POST', 'PUT'],
      requiresAuth: true,
      permissions: ['admin.placements.manage']
    },
    {
      endpoint: 'admin/conditions',
      name: 'Campaign Conditions',
      description: 'Configure campaign targeting conditions',
      defaultMode: 'mock',
      mockFile: 'admin-conditions.json',
      category: 'admin',
      methods: ['GET', 'POST', 'PUT'],
      requiresAuth: true,
      permissions: ['admin.conditions.manage']
    },
    {
      endpoint: 'admin/settings',
      name: 'System Settings',
      description: 'Global system configuration settings',
      defaultMode: 'live', // System settings should be live
      mockFile: 'admin-settings.json',
      category: 'admin',
      methods: ['GET', 'PUT'],
      requiresAuth: true,
      permissions: ['admin.settings.manage']
    }
  ]
};

// Helper functions to work with the configuration
export const getEndpointsByCategory = (category: string): ApiEndpointConfig[] => {
  return apiEndpointsConfig.endpoints.filter(endpoint => endpoint.category === category);
};

export const getEndpointByName = (endpoint: string): ApiEndpointConfig | undefined => {
  return apiEndpointsConfig.endpoints.find(e => e.endpoint === endpoint);
};

export const getEndpointsByMode = (mode: 'live' | 'mock'): ApiEndpointConfig[] => {
  return apiEndpointsConfig.endpoints.filter(endpoint => endpoint.defaultMode === mode);
};

export const getEndpointsByPermission = (permission: string): ApiEndpointConfig[] => {
  return apiEndpointsConfig.endpoints.filter(endpoint => 
    endpoint.permissions?.includes(permission)
  );
};

export const getAllCategories = (): string[] => {
  return [...new Set(apiEndpointsConfig.endpoints.map(endpoint => endpoint.category))];
};

export const getMockFilesList = (): string[] => {
  return apiEndpointsConfig.endpoints
    .filter(endpoint => endpoint.mockFile)
    .map(endpoint => endpoint.mockFile!)
    .filter((file, index, arr) => arr.indexOf(file) === index); // Remove duplicates
};

// Validation functions
export const validateEndpointConfig = (config: ApiEndpointConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.endpoint || !config.endpoint.trim()) {
    errors.push('Endpoint path is required');
  }
  
  if (!config.name || !config.name.trim()) {
    errors.push('Endpoint name is required');
  }
  
  if (!['live', 'mock'].includes(config.defaultMode)) {
    errors.push('Default mode must be either "live" or "mock"');
  }
  
  if (config.methods.length === 0) {
    errors.push('At least one HTTP method must be specified');
  }
  
  return errors;
};

export default apiEndpointsConfig;