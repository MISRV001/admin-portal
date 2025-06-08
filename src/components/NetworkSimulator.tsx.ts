import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, Activity, Settings } from 'lucide-react';
import { MockAPIService } from '@/services/mockApiService';

type NetworkCondition = 'fast' | 'normal' | 'slow' | 'unstable';

export const NetworkSimulator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCondition, setCurrentCondition] = useState<NetworkCondition>('normal');
  const [isApplying, setIsApplying] = useState(false);

  const applyNetworkCondition = async (condition: NetworkCondition) => {
    setIsApplying(true);
    
    try {
      const mockAPI = MockAPIService.getInstance();
      mockAPI.simulateNetworkConditions(condition);
      setCurrentCondition(condition);
      
      // Show feedback animation
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to apply network condition:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getConditionInfo = (condition: NetworkCondition) => {
    const conditions = {
      fast: { 
        label: 'Fast (5G/Fiber)', 
        latency: '50-150ms', 
        reliability: '99.9%',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      normal: { 
        label: 'Normal (Broadband)', 
        latency: '200-700ms', 
        reliability: '99%',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      slow: { 
        label: 'Slow (3G/Rural)', 
        latency: '1-3s', 
        reliability: '95%',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      unstable: { 
        label: 'Unstable (Poor)', 
        latency: '0.5-5s', 
        reliability: '85%',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    };
    return conditions[condition];
  };

  const currentInfo = getConditionInfo(currentCondition);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
          title="Network Simulator"
        >
          <Activity className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-xl border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Network Simulator</span>
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`p-3 rounded-lg ${currentInfo.bgColor} ${currentInfo.borderColor} border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className={`w-4 h-4 ${currentInfo.color}`} />
                <span className={`text-sm font-medium ${currentInfo.color}`}>
                  Current: {currentInfo.label}
                </span>
              </div>
              {isApplying && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <div>Latency: {currentInfo.latency}</div>
              <div>Reliability: {currentInfo.reliability}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 mb-2">Switch Network Condition:</div>
            {(['fast', 'normal', 'slow', 'unstable'] as const).map((condition) => {
              const info = getConditionInfo(condition);
              const isActive = currentCondition === condition;
              
              return (
                <button
                  key={condition}
                  onClick={() => !isActive && applyNetworkCondition(condition)}
                  disabled={isApplying || isActive}
                  className={`w-full p-2 text-left rounded-lg border transition-all text-xs ${
                    isActive 
                      ? `${info.bgColor} ${info.borderColor} ${info.color} cursor-default`
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700'
                  } ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{info.label}</span>
                    {isActive && <span className="text-xs">✓ Active</span>}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {info.latency} • {info.reliability}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Test app behavior under different network conditions
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};