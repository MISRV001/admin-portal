// Enhanced Mock API Service with per-endpoint configuration
// File: src/services/mockApiService.ts

import { apiEndpointsConfig, ApiEndpointConfig } from '../config/apiEndpoints';

interface NetworkConfig {
  latency: { min: number; max: number };
  timeout: number;
  failureRate: number;
  slowResponseThreshold: number;
}

interface MockConfig {
  delay?: number;
  shouldFail?: boolean;
  customResponse?: any;
  simulateTimeout?: boolean;
  simulateSlowResponse?: boolean;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  forceMode?: 'live' | 'mock'; // Override global mode for specific request
}

type ApiMode = 'live' | 'mock' | 'json' | 'hybrid';

interface JsonDataset {
  id: string;
  name: string;
  description: string;
}

interface EndpointOverride {
  endpoint: string;
  mode: 'live' | 'mock';
  mockFile?: string;
}

class MockAPIService {
  private static instance: MockAPIService;
  private responses: Record<string, any> = {};
  private apiIdentifier: string;
  private globalApiMode: ApiMode = 'mock';
  private selectedJsonDataset: string = 'default';
  private liveApiBaseUrl: string = 'https://api.boosttrade.com';
  private endpointOverrides: Map<string, EndpointOverride> = new Map();
  
  private networkConfig: NetworkConfig = {
    latency: { min: 200, max: 700 },
    timeout: 30000,
    failureRate: 0.01,
    slowResponseThreshold: 2000
  };

  // Cache for loaded mock files
  private mockFileCache: Map<string, any> = new Map();

  static getInstance(): MockAPIService {
    if (!MockAPIService.instance) {
      MockAPIService.instance = new MockAPIService();
    }
    return MockAPIService.instance;
  }

  constructor() {
    this.apiIdentifier = 'default';
    this.initializeMockData();
    this.loadEndpointConfigurations();
  }

  private initializeMockData() {
    // Default inline responses (fallback)
    this.responses = {
      'auth/login': {
        success: { 
          admin: {
            token: 'admin-jwt-token-123', 
            user: { 
              id: 1, 
              name: 'John Doe', 
              email: 'admin@boosttrade.com', 
              role: 'admin',
              permissions: [
                'admin.users.manage',
                'admin.roles.manage', 
                'admin.placements.manage',
                'admin.conditions.manage',
                'campaigns.create',
                'campaigns.edit',
                'campaigns.delete',
                'campaigns.publish',
                'campaigns.preview',
                'stores.manage',
                'stores.health',
                'reports.view_all',
                'reports.export'
              ]
            } 
          },
          campaign_manager: {
            token: 'campaign-jwt-token-456',
            user: {
              id: 2,
              name: 'Alice Johnson',
              email: 'campaign@boosttrade.com',
              role: 'campaign_manager',
              permissions: [
                'campaigns.create',
                'campaigns.edit',
                'campaigns.publish',
                'campaigns.preview',
                'stores.view',
                'reports.view_campaigns'
              ]
            }
          },
          reports_only: {
            token: 'reports-jwt-token-789',
            user: {
              id: 3,
              name: 'Bob Smith',
              email: 'analyst@boosttrade.com',
              role: 'reports_only',
              permissions: [
                'reports.view_all',
                'reports.export',
                'dashboard.view'
              ]
            }
          }
        },
        error: { message: 'Invalid credentials' }
      },
      'auth/forgot-password': {
        success: { message: 'Password reset email sent successfully' },
        error: { message: 'Email not found' }
      },
      'reports/campaigns': {
        success: {
          overview: {
            totalRevenue: "$2,847,392",
            totalCampaigns: 24,
            activeUsers: 1247,
            conversionRate: 3.2
          },
          chartData: {
            performance: [
              { month: "Jan", impressions: 120000, conversions: 1250, revenue: 145000 },
              { month: "Feb", impressions: 145000, conversions: 1680, revenue: 189000 },
              { month: "Mar", impressions: 189000, conversions: 2150, revenue: 234000 },
              { month: "Apr", impressions: 203000, conversions: 2890, revenue: 287000 },
              { month: "May", impressions: 245000, conversions: 3250, revenue: 312000 },
              { month: "Jun", impressions: 287000, conversions: 3780, revenue: 356000 }
            ],
            categories: [
              { "name": "Beauty", "value": 35, "color": "#3b82f6" },
              { "name": "Personnel Care", "value": 28, "color": "#10b981" },
              { "name": "Grocery", "value": 18, "color": "#f59e0b" },
              { "name": "Baby&Kids", "value": 12, "color": "#ef4444" },
              { "name": "Photo", "value": 7, "color": "#8b5cf6" }
            ]
          }
        },
        error: { message: 'Failed to load campaign reports' }
      }
    };
  }

  private loadEndpointConfigurations() {
    // Load endpoint configurations from config
    apiEndpointsConfig.endpoints.forEach(config => {
      this.endpointOverrides.set(config.endpoint, {
        endpoint: config.endpoint,
        mode: config.defaultMode,
        mockFile: config.mockFile
      });
    });
  }

  // API Mode Management (Global)
  public setGlobalApiMode(mode: ApiMode): void {
    this.globalApiMode = mode;
    console.log(`Global API Mode changed to: ${mode}`);
  }

  public getGlobalApiMode(): ApiMode {
    return this.globalApiMode;
  }

  public getApiMode(): ApiMode {
    // For backward compatibility
    return this.globalApiMode;
  }

  public setApiMode(mode: ApiMode): void {
    // For backward compatibility
    this.setGlobalApiMode(mode);
  }

  // Per-Endpoint Configuration
  public setEndpointMode(endpoint: string, mode: 'live' | 'mock', mockFile?: string): void {
    this.endpointOverrides.set(endpoint, {
      endpoint,
      mode,
      mockFile
    });
    console.log(`Endpoint ${endpoint} mode changed to: ${mode}`, mockFile ? `(Mock file: ${mockFile})` : '');
  }

  public getEndpointMode(endpoint: string): 'live' | 'mock' {
    const override = this.endpointOverrides.get(endpoint);
    if (override) {
      return override.mode;
    }
    
    // Check config file
    const config = apiEndpointsConfig.endpoints.find(c => c.endpoint === endpoint);
    if (config) {
      return config.defaultMode;
    }
    
    // Fallback to global mode
    return this.globalApiMode === 'live' ? 'live' : 'mock';
  }

  public getEndpointConfiguration(endpoint: string): ApiEndpointConfig | undefined {
    return apiEndpointsConfig.endpoints.find(c => c.endpoint === endpoint);
  }

  public getAllEndpointConfigurations(): ApiEndpointConfig[] {
    return apiEndpointsConfig.endpoints;
  }

  public getEndpointOverrides(): Map<string, EndpointOverride> {
    return new Map(this.endpointOverrides);
  }

  public resetEndpointOverrides(): void {
    this.endpointOverrides.clear();
    this.loadEndpointConfigurations();
    console.log('All endpoint overrides reset to config defaults');
  }

  // Mock File Management
  public async loadMockFile(fileName: string): Promise<any> {
    if (this.mockFileCache.has(fileName)) {
      return this.mockFileCache.get(fileName);
    }

    try {
      // In a real implementation, you would fetch from mock/responses/
      // For now, we'll simulate loading from files
      const mockData = await this.simulateFileLoad(fileName);
      this.mockFileCache.set(fileName, mockData);
      return mockData;
    } catch (error) {
      console.error(`Failed to load mock file: ${fileName}`, error);
      throw new Error(`Mock file not found: ${fileName}`);
    }
  }

  private async simulateFileLoad(fileName: string): Promise<any> {
    // Try to load from public/mock/responses/ first
    try {
      const response = await fetch(`/mock/responses/${fileName}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log(`File ${fileName} not found in public folder, using fallback`);
    }

    // Fallback to simulated files
    const mockFiles: Record<string, any> = {
      'auth-login.json': {
        success: {
          admin: {
            token: 'file-admin-token',
            user: { id: 1, name: 'File Admin', email: 'admin@file.com', role: 'admin' }
          }
        }
      },
      'campaigns-create.json': {
        success: {
          id: 'camp_file_' + Date.now(),
          message: 'Campaign created from file',
          campaign: { id: 'camp_file_' + Date.now(), status: 'draft' }
        }
      },
      'campaigns-list.json': {
        success: {
          campaigns: [
            { id: 'file_camp_001', name: 'File Campaign 1', status: 'active' },
            { id: 'file_camp_002', name: 'File Campaign 2', status: 'draft' }
          ]
        }
      },
      'users-create.json': {
        success: {
          id: 'user_file_' + Date.now(),
          message: 'User created from file'
        }
      },
      'reports-dashboard.json': {
        success: {
          metrics: {
            campaigns: 42,
            stores: 198,
            users: 1847,
            revenue: '$3.2M'
          }
        }
      },
      'reports-campaigns.json': {
        success: {
          overview: {
            totalRevenue: "$2,847,392",
            totalCampaigns: 24,
            activeUsers: 1247,
            conversionRate: 3.2
          },
          chartData: {
            performance: [
              { month: "Jan", impressions: 120000, conversions: 1250, revenue: 145000 },
              { month: "Feb", impressions: 145000, conversions: 1680, revenue: 189000 },
              { month: "Mar", impressions: 189000, conversions: 2150, revenue: 234000 },
              { month: "Apr", impressions: 203000, conversions: 2890, revenue: 287000 },
              { month: "May", impressions: 245000, conversions: 3250, revenue: 312000 },
              { month: "Jun", impressions: 287000, conversions: 3780, revenue: 356000 }
            ],
            categories: [
              { name: "Electronics", value: 35, color: "#3b82f6" },
              { name: "Clothing", value: 28, color: "#10b981" },
              { name: "Home & Garden", value: 18, color: "#f59e0b" },
              { name: "Sports", value: 12, color: "#ef4444" },
              { name: "Books", value: 7, color: "#8b5cf6" }
            ]
          }
        }
      }
    };

    if (mockFiles[fileName]) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockFiles[fileName];
    }

    throw new Error(`Mock file not found: ${fileName}`);
  }

  public clearMockFileCache(): void {
    this.mockFileCache.clear();
    console.log('Mock file cache cleared');
  }

  // JSON Dataset Management (for backward compatibility)
  public setJsonDataset(datasetId: string): void {
    this.selectedJsonDataset = datasetId;
    console.log(`JSON Dataset changed to: ${datasetId}`);
  }

  public getSelectedJsonDataset(): string {
    return this.selectedJsonDataset;
  }

  public getAvailableJsonDatasets(): JsonDataset[] {
    return [
      { id: 'default', name: 'Default Dataset', description: 'Standard mock responses' },
      { id: 'testing', name: 'Testing Dataset', description: 'Data for testing scenarios' },
      { id: 'performance', name: 'Performance Dataset', description: 'High volume data for performance testing' }
    ];
  }

  // Network Configuration
  public setNetworkConfig(config: Partial<NetworkConfig>): void {
    this.networkConfig = { ...this.networkConfig, ...config };
  }

  public getNetworkConfig(): NetworkConfig {
    return { ...this.networkConfig };
  }

  public simulateNetworkConditions(condition: 'fast' | 'normal' | 'slow' | 'unstable'): void {
    switch (condition) {
      case 'fast':
        this.setNetworkConfig({
          latency: { min: 50, max: 150 },
          timeout: 5000,
          failureRate: 0.001
        });
        break;
      case 'normal':
        this.setNetworkConfig({
          latency: { min: 200, max: 700 },
          timeout: 10000,
          failureRate: 0.01
        });
        break;
      case 'slow':
        this.setNetworkConfig({
          latency: { min: 1000, max: 3000 },
          timeout: 15000,
          failureRate: 0.05
        });
        break;
      case 'unstable':
        this.setNetworkConfig({
          latency: { min: 500, max: 5000 },
          timeout: 8000,
          failureRate: 0.15
        });
        break;
    }
  }

  // Live API Configuration
  public setLiveApiBaseUrl(url: string): void {
    this.liveApiBaseUrl = url;
  }

  public getLiveApiBaseUrl(): string {
    return this.liveApiBaseUrl;
  }

  // Main API method
  async makeRequest(endpoint: string, data: any, options?: any) {
    if (endpoint === 'auth/login') {
      const res = await fetch('/mock/responses/auth-login.json');
      const usersByRole = await res.json();
      const role = data.role || 'admin';
      return usersByRole[role];
    }
    const { 
      delay,
      shouldFail = false,
      customResponse,
      simulateTimeout = false,
      simulateSlowResponse = false,
      method = 'GET',
      forceMode
    } = options || {};

    // Determine which mode to use for this specific endpoint
    let endpointMode: 'live' | 'mock';
    
    if (forceMode) {
      endpointMode = forceMode;
    } else if (this.globalApiMode === 'hybrid') {
      endpointMode = this.getEndpointMode(endpoint);
    } else {
      endpointMode = this.globalApiMode === 'live' ? 'live' : 'mock';
    }

    console.log(`API Request: ${method} ${endpoint}`, { 
      globalMode: this.globalApiMode, 
      endpointMode, 
      data 
    });

    // Handle different API modes
    switch (endpointMode) {
      case 'live':
        return this.makeLiveRequest(endpoint, data, method);
      
      case 'mock':
      default:
        return this.makeMockRequest(endpoint, data, { 
          delay, 
          shouldFail, 
          customResponse, 
          simulateTimeout, 
          simulateSlowResponse 
        });
    }
  }

  private async makeLiveRequest(endpoint: string, data?: any, method: string = 'GET'): Promise<any> {
    const config = this.getEndpointConfiguration(endpoint);
    const baseUrl = config?.liveApiUrl || this.liveApiBaseUrl;
    const url = `${baseUrl}/${endpoint}`;
    
    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {})
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestConfig.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Live API Error:', error);
      throw new Error(`Live API request failed: ${error}`);
    }
  }

  private async makeMockRequest(endpoint: string, data?: any, config: Partial<MockConfig> = {}): Promise<any> {
    const { 
      delay,
      shouldFail = false,
      customResponse,
      simulateTimeout = false,
      simulateSlowResponse = false
    } = config;

    if (simulateTimeout) {
      throw new Error('Request timeout');
    }

    const requestDelay = delay || this.getRandomLatency();
    const finalDelay = simulateSlowResponse ? 
      Math.max(requestDelay, this.networkConfig.slowResponseThreshold) : 
      requestDelay;

    await new Promise(resolve => setTimeout(resolve, finalDelay));

    if (!shouldFail && this.shouldSimulateFailure()) {
      throw new Error('Network error: Connection lost');
    }

    if (customResponse) {
      return customResponse;
    }

    // Try to get response from mock file first
    const endpointConfig = this.getEndpointConfiguration(endpoint);
    if (endpointConfig?.mockFile) {
      try {
        const mockFileData = await this.loadMockFile(endpointConfig.mockFile);
        const response = this.getRoleBasedResponse(endpoint, data, mockFileData);
        if (response) {
          return this.processResponse(response, shouldFail, data);
        }
      } catch (error) {
        console.warn(`Failed to load mock file for ${endpoint}, falling back to inline response`);
      }
    }

    // Fallback to inline mock responses
    const mockResponse = this.getRoleBasedResponse(endpoint, data);
    
    if (!mockResponse) {
      throw new Error(`Mock endpoint ${endpoint} not found`);
    }

    return this.processResponse(mockResponse, shouldFail, data);
  }

  private processResponse(mockResponse: any, shouldFail: boolean, data?: any): any {
    if (shouldFail && mockResponse.error) {
      throw new Error(mockResponse.error.message);
    }

    // For POST/PUT/PATCH requests, return success response
    if (data && mockResponse.success) {
      return mockResponse.success;
    }

    return mockResponse.success || mockResponse;
  }

  private getRandomLatency(): number {
    const { min, max } = this.networkConfig.latency;
    return Math.random() * (max - min) + min;
  }

  private shouldSimulateFailure(): boolean {
    return Math.random() < this.networkConfig.failureRate;
  }

  private getRoleBasedResponse(endpoint: string, credentials?: any, mockData?: any): any {
    // If mockData is provided (from JSON file), use it directly
    if (mockData) {
      console.log('🎯 Using loaded mock data for endpoint:', endpoint, mockData);
      return mockData;
    }

    const responseData = this.responses;
    
    if (endpoint === 'auth/login' && credentials) {
      let role: string = credentials.role || 'admin';
      
      if (credentials.email.includes('campaign')) {
        role = 'campaign_manager';
      } else if (credentials.email.includes('analyst') || credentials.email.includes('reports')) {
        role = 'reports_only';
      }

      const response = responseData[endpoint];
      return response?.success?.[role] || response?.success?.admin || response;
    }
    
    return responseData[endpoint];
  }

  // Utility methods
  public setApiIdentifier(identifier: string): void {
    this.apiIdentifier = identifier;
  }

  public getApiIdentifier(): string {
    return this.apiIdentifier;
  }

  public getAvailableIdentifiers(): string[] {
    return ['default', 'staging', 'development', 'testing'];
  }

  public getAvailableApiModes(): { id: ApiMode; name: string; description: string }[] {
    return [
      { id: 'live', name: 'Live API', description: 'Connect to real backend services' },
      { id: 'mock', name: 'Mock API', description: 'Use predefined mock responses' },
      { id: 'json', name: 'JSON Dataset', description: 'Load responses from JSON datasets' },
      { id: 'hybrid', name: 'Hybrid Mode', description: 'Mix of live and mock per endpoint' }
    ];
  }

  // Debug methods
  public getDebugInfo(): any {
    return {
      globalApiMode: this.globalApiMode,
      selectedJsonDataset: this.selectedJsonDataset,
      networkConfig: this.networkConfig,
      liveApiBaseUrl: this.liveApiBaseUrl,
      endpointOverrides: Object.fromEntries(this.endpointOverrides),
      availableEndpoints: Object.keys(this.responses),
      mockFileCacheSize: this.mockFileCache.size,
      configuredEndpoints: apiEndpointsConfig.endpoints.length
    };
  }
}

export { MockAPIService };
export type { NetworkConfig, MockConfig, ApiMode, JsonDataset, EndpointOverride };