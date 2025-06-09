// Enhanced API Mode Selector with Per-Endpoint Configuration
// File: src/components/EnhancedApiModeSelector.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Database, 
  Globe, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { MockAPIService, ApiMode, EndpointOverride } from '../services/mockApiService';
import { ApiEndpointConfig, getAllCategories, getEndpointsByCategory } from '../config/apiEndpoints';

export const EnhancedApiModeSelector: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<ApiMode>('mock');
  const [isApplying, setIsApplying] = useState(false);
  const [liveApiUrl, setLiveApiUrl] = useState('');
  const [showEndpointDetails, setShowEndpointDetails] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [endpointOverrides, setEndpointOverrides] = useState<Map<string, EndpointOverride>>(new Map());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const mockAPI = MockAPIService.getInstance();
    setCurrentMode(mockAPI.getGlobalApiMode());
    setLiveApiUrl(mockAPI.getLiveApiBaseUrl());
    setEndpointOverrides(mockAPI.getEndpointOverrides());
  }, []);

  const applyGlobalMode = async (mode: ApiMode, apiUrl?: string) => {
    setIsApplying(true);
    
    try {
      const mockAPI = MockAPIService.getInstance();
      
      mockAPI.setGlobalApiMode(mode);
      setCurrentMode(mode);
      
      if (mode === 'live' && apiUrl) {
        mockAPI.setLiveApiBaseUrl(apiUrl);
        setLiveApiUrl(apiUrl);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to apply API mode:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const applyEndpointMode = async (endpoint: string, mode: 'live' | 'mock', mockFile?: string) => {
    try {
      const mockAPI = MockAPIService.getInstance();
      mockAPI.setEndpointMode(endpoint, mode, mockFile);
      setEndpointOverrides(mockAPI.getEndpointOverrides());
    } catch (error) {
      console.error('Failed to apply endpoint mode:', error);
    }
  };

  const resetAllOverrides = async () => {
    setIsApplying(true);
    try {
      const mockAPI = MockAPIService.getInstance();
      mockAPI.resetEndpointOverrides();
      setEndpointOverrides(mockAPI.getEndpointOverrides());
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Failed to reset overrides:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getModeInfo = (mode: ApiMode) => {
    const modes = {
      live: { 
        label: 'Live API', 
        description: 'Real backend services',
        icon: <Globe className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      mock: { 
        label: 'Mock API', 
        description: 'Predefined responses',
        icon: <Database className="w-4 h-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      json: { 
        label: 'JSON Dataset', 
        description: 'File-based responses',
        icon: <FileText className="w-4 h-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      hybrid: {
        label: 'Hybrid Mode',
        description: 'Mix of live and mock per endpoint',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    };
    return modes[mode];
  };

  const currentInfo = getModeInfo(currentMode);
  const categories = getAllCategories();

  const getEndpointModeInfo = (endpoint: string): { mode: 'live' | 'mock'; isOverridden: boolean } => {
    const override = endpointOverrides.get(endpoint);
    if (override) {
      return { mode: override.mode, isOverridden: true };
    }
    
    const mockAPI = MockAPIService.getInstance();
    const config = mockAPI.getEndpointConfiguration(endpoint);
    return { 
      mode: config?.defaultMode || 'mock', 
      isOverridden: false 
    };
  };

  const renderEndpointControls = (config: ApiEndpointConfig) => {
    const { mode, isOverridden } = getEndpointModeInfo(config.endpoint);
    const override = endpointOverrides.get(config.endpoint);
    
    return (
      <div className="ml-4 p-3 bg-gray-50 rounded border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{config.name}</span>
              {isOverridden && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Overridden
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">{config.endpoint}</div>
            <div className="text-xs text-gray-400">{config.description}</div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => applyEndpointMode(config.endpoint, 'live')}
              className={`px-3 py-1 rounded text-xs border transition-all ${
                mode === 'live'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => applyEndpointMode(config.endpoint, 'mock', config.mockFile)}
              className={`px-3 py-1 rounded text-xs border transition-all ${
                mode === 'mock'
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Mock
            </button>
          </div>
        </div>
        
        {config.mockFile && (
          <div className="text-xs text-gray-500">
            Mock file: <code className="bg-gray-200 px-1 rounded">{config.mockFile}</code>
          </div>
        )}
        
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex flex-wrap gap-1">
            {config.methods.map(method => (
              <span 
                key={method}
                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
              >
                {method}
              </span>
            ))}
          </div>
          {config.requiresAuth && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
              Auth Required
            </span>
          )}
        </div>
      </div>
    );
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 relative"
          title="API Mode Selector"
        >
          <Database className="w-5 h-5 text-gray-600" />
          {currentMode === 'hybrid' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Card className="w-[480px] max-h-[600px] shadow-xl border-0 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>API Configuration</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEndpointDetails(!showEndpointDetails)}
                className="p-1 rounded hover:bg-gray-100"
                title={showEndpointDetails ? "Hide endpoint details" : "Show endpoint details"}
              >
                {showEndpointDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
          {/* Current Mode Status */}
          <div className={`p-3 rounded-lg ${currentInfo.bgColor} ${currentInfo.borderColor} border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={currentInfo.color}>{currentInfo.icon}</span>
                <span className={`text-sm font-medium ${currentInfo.color}`}>
                  Current: {currentInfo.label}
                </span>
              </div>
              {isApplying && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <div>{currentInfo.description}</div>
              {currentMode === 'live' && (
                <div className="mt-1 font-medium">URL: {liveApiUrl}</div>
              )}
              {currentMode === 'hybrid' && (
                <div className="mt-1 font-medium">
                  {endpointOverrides.size} endpoint{endpointOverrides.size !== 1 ? 's' : ''} configured
                </div>
              )}
            </div>
          </div>

          {/* Global Mode Selection */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 mb-2">Global Mode:</div>
            
            {/* Mode Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {['live', 'mock', 'json', 'hybrid'].map((mode) => {
                const modeInfo = getModeInfo(mode as ApiMode);
                const isActive = currentMode === mode;
                
                return (
                  <button
                    key={mode}
                    onClick={() => applyGlobalMode(mode as ApiMode, liveApiUrl)}
                    disabled={isApplying || isActive}
                    className={`p-2 text-left rounded-lg border transition-all text-xs ${
                      isActive
                        ? `${modeInfo.bgColor} ${modeInfo.borderColor} ${modeInfo.color} cursor-default`
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700'
                    } ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {modeInfo.icon}
                        <span className="font-medium">{modeInfo.label}</span>
                      </div>
                      {isActive && <span className="text-xs">✓</span>}
                    </div>
                    <div className="text-xs opacity-75 mt-1">{modeInfo.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Live API URL Configuration */}
            {currentMode === 'live' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Live API Base URL:</label>
                <input
                  type="url"
                  value={liveApiUrl}
                  onChange={(e) => setLiveApiUrl(e.target.value)}
                  placeholder="https://api.boosttrade.com"
                  className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onBlur={() => applyGlobalMode('live', liveApiUrl)}
                />
              </div>
            )}
          </div>

          {/* Per-Endpoint Configuration (Hybrid Mode) */}
          {(currentMode === 'hybrid' || showEndpointDetails) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-700">Endpoint Configuration:</div>
                <button
                  onClick={resetAllOverrides}
                  disabled={isApplying}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Endpoint Categories */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories
                  .filter(category => filterCategory === 'all' || category === filterCategory)
                  .map(category => {
                    const endpoints = getEndpointsByCategory(category);
                    const isExpanded = expandedCategories.has(category);
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 text-left"
                        >
                          <div className="flex items-center space-x-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            <span className="text-sm font-medium capitalize">{category}</span>
                            <span className="text-xs text-gray-500">({endpoints.length})</span>
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-2 space-y-2">
                            {endpoints.map(config => renderEndpointControls(config))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {currentMode === 'hybrid' 
                ? `Managing ${endpointOverrides.size} endpoint overrides`
                : `Global ${currentMode} mode active for all endpoints`
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};