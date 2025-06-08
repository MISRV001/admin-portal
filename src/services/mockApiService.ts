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
}

class MockAPIService {
  private static instance: MockAPIService;
  private responses: Record<string, any> = {};
  private apiIdentifier: string;
  private networkConfig: NetworkConfig = {
    latency: { min: 200, max: 700 },
    timeout: 30000,
    failureRate: 0.01,
    slowResponseThreshold: 2000
  };

  static getInstance(): MockAPIService {
    if (!MockAPIService.instance) {
      MockAPIService.instance = new MockAPIService();
    }
    return MockAPIService.instance;
  }

  constructor() {
    this.apiIdentifier = 'default';
    this.initializeMockData();
  }

  private initializeMockData() {
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
      'dashboard/stats': {
        campaigns: 24,
        stores: 156,
        activeUsers: 1250,
        revenue: '$2.4M'
      }
    };
  }

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

  private getRandomLatency(): number {
    const { min, max } = this.networkConfig.latency;
    return Math.random() * (max - min) + min;
  }

  private shouldSimulateFailure(): boolean {
    return Math.random() < this.networkConfig.failureRate;
  }

  private getRoleBasedResponse(endpoint: string, credentials?: any): any {
    if (endpoint === 'auth/login' && credentials) {
      let role: string = credentials.role || 'admin';
      
      if (credentials.email.includes('campaign')) {
        role = 'campaign_manager';
      } else if (credentials.email.includes('analyst') || credentials.email.includes('reports')) {
        role = 'reports_only';
      }

      const response = this.responses[endpoint];
      return response.success[role] || response.success.admin;
    }
    
    return this.responses[endpoint];
  }

  async makeRequest(endpoint: string, data?: any, config: MockConfig = {}): Promise<any> {
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

    const mockResponse = this.getRoleBasedResponse(endpoint, data);
    
    if (!mockResponse) {
      throw new Error(`Mock endpoint ${endpoint} not found`);
    }

    if (shouldFail && mockResponse.error) {
      throw new Error(mockResponse.error.message);
    }

    return mockResponse.success || mockResponse;
  }

  public setApiIdentifier(identifier: string): void {
    this.apiIdentifier = identifier;
  }

  public getApiIdentifier(): string {
    return this.apiIdentifier;
  }

  public getAvailableIdentifiers(): string[] {
    return ['default', 'staging', 'development', 'testing'];
  }
}

export { MockAPIService };
export type { NetworkConfig, MockConfig };
