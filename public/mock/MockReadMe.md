# 🚀 BoostTrade API Management Utility

A powerful development utility that provides seamless switching between **Live APIs**, **Mock responses**, and **JSON-based datasets** with granular per-endpoint control.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🔧 Quick Setup](#-quick-setup)
- [📂 Project Structure](#-project-structure)
- [🎮 Usage Guide](#-usage-guide)
- [🆕 Adding New Endpoints](#-adding-new-endpoints)
- [📝 Managing Mock Files](#-managing-mock-files)
- [🔍 API Modes Explained](#-api-modes-explained)
- [🧪 Testing Scenarios](#-testing-scenarios)
- [🐛 Troubleshooting](#-troubleshooting)
- [📚 Advanced Usage](#-advanced-usage)

## 🎯 Overview

This utility solves common development challenges by providing:

- **🔄 Seamless API Switching**: Toggle between live backend and mock data instantly
- **🎛️ Per-Endpoint Control**: Mix live and mock APIs for different endpoints
- **📁 File-Based Mocks**: Organize mock responses in JSON files for easy management
- **🖥️ Visual Interface**: Intuitive UI for real-time API configuration
- **🧪 Testing Modes**: Simulate different network conditions and scenarios

Perfect for:
- **Frontend Development** when backend is unavailable
- **Testing** with predictable mock data
- **Demo Environments** with controlled responses
- **Debugging** API integration issues

## ✨ Features

### 🌐 Multiple API Modes
- **Live API**: Connect to real backend services
- **Mock API**: Use predefined inline responses
- **JSON Dataset**: Load responses from organized JSON files
- **Hybrid Mode**: Mix live and mock on a per-endpoint basis

### 🎛️ Granular Control
- Global mode switching for all endpoints
- Individual endpoint configuration override
- Real-time mode switching without app restart
- Configuration persistence during session

### 📱 Developer Experience
- Visual API mode selector interface
- Network condition simulation
- Comprehensive debug logging
- Error handling and fallback mechanisms

## 🔧 Quick Setup

### 1. Install Dependencies

```bash
npm install zustand  # If not already installed
```

### 2. Copy Core Files

```bash
# Copy these files to your project:
src/
├── services/mockApiService.ts          # Enhanced API service
├── config/apiEndpoints.ts              # API configuration
└── components/EnhancedApiModeSelector.tsx  # UI component
```

### 3. Create Mock Files Directory

```bash
mkdir -p public/mock/responses
```

### 4. Add to Your App

```typescript
// In your main App component
import { EnhancedApiModeSelector } from './components/EnhancedApiModeSelector';

function App() {
  return (
    <div className="app">
      {/* Your existing app content */}
      
      {/* Add at the bottom */}
      <EnhancedApiModeSelector />
    </div>
  );
}
```

### 5. Test the Setup

1. Start your app: `npm run dev`
2. Look for the **database icon** in the bottom-right corner
3. Click to open the API Mode Selector
4. Switch between different modes and test API calls

## 📂 Project Structure

```
src/
├── services/
│   └── mockApiService.ts              # Core API service with mode switching
├── config/
│   └── apiEndpoints.ts                # Central endpoint configuration
├── components/
│   ├── EnhancedApiModeSelector.tsx    # Visual mode selector UI
│   └── [your-components].tsx          # Your route components
public/
└── mock/
    └── responses/                     # JSON mock response files
        ├── auth-login.json
        ├── campaigns-create.json
        ├── users-create.json
        └── [endpoint-name].json
```

## 🎮 Usage Guide

### Basic API Calls

```typescript
import { MockAPIService } from '../services/mockApiService';

// In your component
const handleSubmit = async (formData: any) => {
  try {
    const mockAPI = MockAPIService.getInstance();
    
    // This automatically uses the configured mode (Live/Mock/JSON)
    const response = await mockAPI.makeRequest('campaigns/create', formData, {
      method: 'POST'
    });
    
    console.log('Campaign created:', response);
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

### Mode Switching

#### Via UI (Recommended)
1. Click the **database icon** in bottom-right
2. Select desired mode: Live, Mock, JSON, or Hybrid
3. For Hybrid mode, configure individual endpoints

#### Via Code
```typescript
const mockAPI = MockAPIService.getInstance();

// Switch all endpoints to Live API
mockAPI.setGlobalApiMode('live');

// Switch all endpoints to Mock
mockAPI.setGlobalApiMode('mock');

// Enable per-endpoint control
mockAPI.setGlobalApiMode('hybrid');

// Configure specific endpoint in Hybrid mode
mockAPI.setEndpointMode('auth/login', 'live');
mockAPI.setEndpointMode('campaigns/create', 'mock');
```

### Force Mode Override

```typescript
// Override global/endpoint settings for a specific request
await mockAPI.makeRequest('users/create', userData, {
  method: 'POST',
  forceMode: 'live'  // Always use Live API for this call
});
```

## 🆕 Adding New Endpoints

### Step 1: Add Endpoint Configuration

Edit `src/config/apiEndpoints.ts`:

```typescript
// Add to the endpoints array
{
  endpoint: 'products/create',
  name: 'Create Product',
  description: 'Add new product to catalog',
  defaultMode: 'mock',                    // Default to mock for development
  mockFile: 'products-create.json',       // JSON file name
  category: 'products',                   // Organization category
  methods: ['POST'],                      // Supported HTTP methods
  requiresAuth: true,                     // Requires authentication
  permissions: ['products.create']        // Required permissions
}
```

### Step 2: Create Mock Response File

Create `public/mock/responses/products-create.json`:

```json
{
  "success": {
    "id": "prod_${Date.now()}",
    "message": "Product created successfully",
    "product": {
      "id": "prod_${Date.now()}",
      "name": "Generated Product",
      "status": "draft",
      "createdAt": "${new Date().toISOString()}",
      "category": "electronics",
      "price": 99.99
    }
  },
  "error": {
    "message": "Failed to create product",
    "code": "PRODUCT_CREATE_FAILED",
    "details": {
      "validationErrors": [
        "Product name is required",
        "Price must be greater than 0"
      ]
    }
  }
}
```

### Step 3: Use in Your Component

```typescript
const createProduct = async (productData: any) => {
  const mockAPI = MockAPIService.getInstance();
  
  return await mockAPI.makeRequest('products/create', productData, {
    method: 'POST'
  });
};
```

### Step 4: Add to Navigation (Optional)

If you have a route component, add it to your sidebar navigation:

```typescript
// In roleBasedNavigation.tsx
{
  name: 'Create Product',
  icon: <PlusCircle className="w-4 h-4" />,
  permission: 'products.create'
}
```

## 📝 Managing Mock Files

### File Naming Convention

```
[category]-[action].json

Examples:
- auth-login.json
- campaigns-create.json  
- users-list.json
- reports-dashboard.json
```

### JSON File Structure

All mock files should follow this structure:

```json
{
  "success": {
    // Successful response data
  },
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {
      // Additional error information
    }
  }
}
```

### Dynamic Content

Use template literals for dynamic data:

```json
{
  "success": {
    "id": "item_${Date.now()}",
    "timestamp": "${new Date().toISOString()}",
    "userId": "${Math.floor(Math.random() * 1000)}"
  }
}
```

### Role-Based Responses

For authentication endpoints, use role-based structure:

```json
{
  "success": {
    "admin": {
      "token": "admin-token",
      "user": { "role": "admin", "permissions": [...] }
    },
    "campaign_manager": {
      "token": "campaign-token", 
      "user": { "role": "campaign_manager", "permissions": [...] }
    }
  }
}
```

## 🔍 API Modes Explained

### 🌐 Live API Mode
- **Use Case**: Production-like testing with real backend
- **Benefits**: Real data, actual API validation
- **When to Use**: Integration testing, staging environment

```typescript
// All endpoints use live backend
mockAPI.setGlobalApiMode('live');
mockAPI.setLiveApiBaseUrl('https://api.yourdomain.com');
```

### 🗄️ Mock API Mode  
- **Use Case**: Development when backend is unavailable
- **Benefits**: Fast, predictable responses
- **When to Use**: Frontend development, unit testing

```typescript
// All endpoints use predefined mock responses
mockAPI.setGlobalApiMode('mock');
```

### 📁 JSON Dataset Mode
- **Use Case**: Organized mock data from files
- **Benefits**: Easy to modify, version controlled
- **When to Use**: Demo environments, complex test scenarios

```typescript
// All endpoints load responses from JSON files
mockAPI.setGlobalApiMode('json');
```

### ⚡ Hybrid Mode
- **Use Case**: Mix of live and mock endpoints
- **Benefits**: Test integration while mocking slow/unreliable services
- **When to Use**: Complex testing scenarios, partial backend availability

```typescript
mockAPI.setGlobalApiMode('hybrid');

// Configure each endpoint individually
mockAPI.setEndpointMode('auth/login', 'live');      // Use real auth
mockAPI.setEndpointMode('campaigns/create', 'mock'); // Mock campaign creation
mockAPI.setEndpointMode('reports/dashboard', 'mock'); // Mock reports
```

## 🧪 Testing Scenarios

### Scenario 1: Frontend Development (Backend Not Ready)

```typescript
// Set all endpoints to mock mode
mockAPI.setGlobalApiMode('mock');

// Develop your frontend with predictable data
// All API calls return immediate mock responses
```

### Scenario 2: Integration Testing

```typescript
// Use hybrid mode for realistic testing
mockAPI.setGlobalApiMode('hybrid');

// Use live APIs for core functionality
mockAPI.setEndpointMode('auth/login', 'live');
mockAPI.setEndpointMode('users/profile', 'live');

// Mock external services that are slow/unreliable
mockAPI.setEndpointMode('reports/analytics', 'mock');
mockAPI.setEndpointMode('notifications/send', 'mock');
```

### Scenario 3: Demo Environment

```typescript
// Use JSON dataset mode for consistent demo data
mockAPI.setGlobalApiMode('json');

// Create polished demo data in JSON files
// Responses are professional and showcase features well
```

### Scenario 4: Error Testing

```typescript
// Test error handling with specific mock responses
await mockAPI.makeRequest('campaigns/create', data, {
  shouldFail: true,  // Force error response
  customResponse: {
    error: { message: 'Custom error for testing' }
  }
});
```

### Scenario 5: Network Condition Testing

```typescript
// Simulate slow network
mockAPI.simulateNetworkConditions('slow');

// Test with high latency
await mockAPI.makeRequest('users/list', {}, {
  delay: 3000,  // 3 second delay
  simulateSlowResponse: true
});
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "getApiMode is not a function" Error

**Solution**: Ensure you've replaced the old `mockApiService.ts` with the enhanced version.

```typescript
// Check if these methods exist
const mockAPI = MockAPIService.getInstance();
console.log(typeof mockAPI.getApiMode); // Should be 'function'
```

#### 2. Mock Files Not Loading

**Solution**: Check file path and structure.

```bash
# Ensure files are in the correct location
public/mock/responses/your-file.json

# Check browser network tab for 404 errors
# Verify JSON syntax is valid
```

#### 3. API Mode Selector Not Appearing

**Solution**: Verify component is imported and rendered.

```typescript
// Make sure this is added to your main app
import { EnhancedApiModeSelector } from './components/EnhancedApiModeSelector';

// And rendered in JSX
<EnhancedApiModeSelector />
```

#### 4. Live API Calls Failing

**Solution**: Check Live API URL and network connectivity.

```typescript
// Verify base URL is correct
mockAPI.setLiveApiBaseUrl('https://your-correct-api-url.com');

// Check browser console for CORS or network errors
```

### Debug Information

```typescript
// Get detailed debug information
const mockAPI = MockAPIService.getInstance();
const debugInfo = mockAPI.getDebugInfo();
console.log('API Debug Info:', debugInfo);

/*
Output example:
{
  globalApiMode: 'hybrid',
  endpointOverrides: { 'auth/login': { mode: 'live' } },
  mockFileCacheSize: 5,
  configuredEndpoints: 23,
  availableEndpoints: ['auth/login', 'campaigns/create', ...]
}
*/
```

### Enable Verbose Logging

The service automatically logs API requests:

```
API Request: POST campaigns/create { globalMode: 'hybrid', endpointMode: 'mock', data: {...} }
✅ Matched: CreateCampaign
Mock file loaded: campaigns-create.json
```

## 📚 Advanced Usage

### Custom Headers for Live API

```typescript
// Add custom headers for specific endpoints
// In apiEndpoints.ts configuration:
{
  endpoint: 'secure/data',
  liveApiUrl: 'https://api.special.com',  // Override base URL
  headers: {
    'X-API-Key': 'your-api-key',
    'Authorization': 'Bearer token'
  }
}
```

### Environment-Based Configuration

```typescript
// Use environment variables for API URLs
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://api.prod.com'
  : 'https://api.staging.com';

mockAPI.setLiveApiBaseUrl(baseUrl);
```

### Conditional API Mode

```typescript
// Auto-switch based on environment
const apiMode = process.env.NODE_ENV === 'development' ? 'mock' : 'live';
mockAPI.setGlobalApiMode(apiMode);
```

### Batch Endpoint Configuration

```typescript
// Configure multiple endpoints at once
const endpointModes = {
  'auth/login': 'live',
  'auth/refresh': 'live', 
  'campaigns/create': 'mock',
  'reports/dashboard': 'mock'
};

Object.entries(endpointModes).forEach(([endpoint, mode]) => {
  mockAPI.setEndpointMode(endpoint, mode);
});
```

### Performance Monitoring

```typescript
// Monitor API performance
const startTime = Date.now();
const response = await mockAPI.makeRequest('users/list');
const duration = Date.now() - startTime;

console.log(`API call took ${duration}ms`);
```

### Custom Mock Response Processing

```typescript
// Process mock responses before returning
const response = await mockAPI.makeRequest('campaigns/list', {}, {
  customResponse: {
    success: {
      campaigns: generateDynamicCampaigns(50), // Generate 50 campaigns
      timestamp: new Date().toISOString()
    }
  }
});
```

---

## 🎯 Best Practices

1. **Development Workflow**
   - Start with mock mode for rapid frontend development
   - Switch to hybrid mode when backend becomes available
   - Use live mode for final integration testing

2. **Mock Data Quality**
   - Create realistic mock data that represents actual use cases
   - Include edge cases and error scenarios
   - Keep mock files up to date with API changes

3. **Team Collaboration**
   - Share mock files in version control
   - Document endpoint configurations
   - Use consistent naming conventions

4. **Performance**
   - Cache mock file contents for better performance
   - Use appropriate network simulation for realistic testing
   - Monitor API call patterns in development

5. **Security**
   - Never commit real API keys to mock files
   - Use placeholder credentials in development
   - Validate data in both mock and live modes

---

## 🤝 Contributing

To add new features or improve existing functionality:

1. **Adding New API Modes**: Extend the `ApiMode` type and update the service
2. **New Mock File Formats**: Modify the file loading logic
3. **UI Enhancements**: Update the `EnhancedApiModeSelector` component
4. **Configuration Options**: Extend the `ApiEndpointConfig` interface

---

**Happy coding! 🚀**

*This utility is designed to make API development and testing seamless. For questions or issues, check the troubleshooting section or review the debug logs.*