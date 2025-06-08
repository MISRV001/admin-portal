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
  private mockDataCache: Record<string, any> = {};

  static getInstance(): MockAPIService {
    if (!MockAPIService.instance) {
      MockAPIService.instance = new MockAPIService();
    }
    return MockAPIService.instance;
  }

  constructor() {
    this.apiIdentifier = this.getStoredApiIdentifier();
    this.initializeMockData();
  }

  private getStoredApiIdentifier(): string {
    try {
      return localStorage.getItem('api-identifier') || 'default';
    } catch (error) {
      console.warn('localStorage not available, using default API identifier');
      return 'default';
    }
  }

  private setStoredApiIdentifier(identifier: string): void {
    try {
      localStorage.setItem('api-identifier', identifier);
      this.apiIdentifier = identifier;
      console.log(`API Identifier set to: ${identifier}`);
    } catch (error) {
      console.warn('localStorage not available, cannot persist API identifier');
    }
  }

  private async loadMockFile(filename: string): Promise<any> {
    if (this.mockDataCache[filename]) {
      return this.mockDataCache[filename];
    }

    try {
      // Import the JSON files as modules
      let data;
      switch (filename) {
        case 'auth':
          data = await import('../mocks/responses/auth.json');
          break;
        case 'dashboard':
          data = await import('../mocks/responses/dashboard.json');
          break;
        case 'campaigns':
          data = await import('../mocks/responses/campaigns.json');
          break;
        default:
          return {};
      }
      
      this.mockDataCache[filename] = data.default || data;
      return this.mockDataCache[filename];
    } catch (error) {
      console.error(`Failed to load mock file: ${filename}`, error);
      return {};
    }
  }

  private async initializeMockData() {
    try {
      const [authData, dashboardData, campaignData] = await Promise.all([
        this.loadMockFile('auth'),
        this.loadMockFile('dashboard'),
        this.loadMockFile('campaigns')
      ]);

      this.responses = {
        ...authData,
        ...dashboardData,
        ...campaignData
      };
    } catch (error) {
      console.error('Failed to initialize mock data:', error);
      // Fallback to minimal data
      this.responses = {
        'auth/login': {
          default: {
            admin: {
              token: 'fallback-token',
              user: { id: 1, name: 'Fallback User', email: 'user@example.com', role: 'admin', permissions: [] }
            }
          }
        }
      };
    }
  }

  public setNetworkConfig(config: Partial<NetworkConfig>): void {
    this.networkConfig = { ...this.networkConfig, ...config };
    console.log('Network config updated:', this.networkConfig);
  }

  public getNetworkConfig(): NetworkConfig {
    return { ...this.networkConfig };
  }

  public simulateNetworkConditions(condition: 'fast' | 'normal' | 'slow' | 'unstable' | 'offline'): void {
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
      case 'offline':
        this.setNetworkConfig({
          latency: { min: 0, max: 0 },
          timeout: 1000,
          failureRate: 1.0
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

  private getResponseForIdentifier(endpoint: string, credentials?: any): any {
    const mockResponse = this.responses[endpoint];
    if (!mockResponse) return null;

    // Get response for current identifier, fallback to default
    const identifierResponse = mockResponse[this.apiIdentifier] || mockResponse['default'];
    
    if (endpoint === 'auth/login' && credentials) {
      let role: string = credentials.role || 'admin';
      
      if (credentials.email.includes('campaign')) {
        role = 'campaign_manager';
      } else if (credentials.email.includes('analyst') || credentials.email.includes('reports')) {
        role = 'reports_only';
      }

      return identifierResponse[role] || identifierResponse.admin;
    }
    
    return identifierResponse;
  }

  async makeRequest(endpoint: string, data?: any, config: MockConfig = {}): Promise<any> {
    const { 
      delay,
      shouldFail = false,
      customResponse,
      simulateTimeout = false,
      simulateSlowResponse = false
    } = config;

    // Ensure mock data is loaded
    if (Object.keys(this.responses).length === 0) {
      await this.initializeMockData();
    }

    // Simulate offline condition
    if (this.networkConfig.failureRate >= 1.0) {
      throw new Error('Network error: No internet connection');
    }

    // Simulate timeout
    if (simulateTimeout) {
      throw new Error('Request timeout');
    }

    // Calculate delay
    const requestDelay = delay || this.getRandomLatency();
    const finalDelay = simulateSlowResponse ? 
      Math.max(requestDelay, this.networkConfig.slowResponseThreshold) : 
      requestDelay;

    // Log network simulation for debugging
    console.log(`API Request: ${endpoint} | Identifier: ${this.apiIdentifier} | Delay: ${finalDelay.toFixed(0)}ms`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, finalDelay));

    // Simulate random network failures
    if (!shouldFail && this.shouldSimulateFailure()) {
      throw new Error('Network error: Connection lost');
    }

    // Use custom response if provided
    if (customResponse) {
      return customResponse;
    }

    const mockResponse = this.getResponseForIdentifier(endpoint, data);
    
    if (!mockResponse) {
      throw new Error(`Mock endpoint ${endpoint} not found for identifier ${this.apiIdentifier}`);
    }

    // Handle error scenarios
    if (shouldFail && mockResponse.error) {
      throw new Error(mockResponse.error.message);
    }

    // Return success response
    return mockResponse;
  }

  public setApiIdentifier(identifier: string): void {
    this.setStoredApiIdentifier(identifier);
    console.log(`Switched to API identifier: ${identifier}`);
  }

  public getApiIdentifier(): string {
    return this.apiIdentifier;
  }

  public getAvailableIdentifiers(): string[] {
    return ['default', 'staging', 'development', 'testing'];
  }

  // New method to get available identifiers for a specific endpoint
  public getEndpointIdentifiers(endpoint: string): string[] {
    const mockResponse = this.responses[endpoint];
    if (!mockResponse) return [];
    return Object.keys(mockResponse);
  }

  // Method to preview response for different identifiers
  public previewResponse(endpoint: string, identifier: string): any {
    const mockResponse = this.responses[endpoint];
    return mockResponse ? mockResponse[identifier] : null;
  }
}

export { MockAPIService };
export type { NetworkConfig, MockConfig };