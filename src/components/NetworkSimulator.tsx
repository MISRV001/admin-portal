import React, { useState } from 'react';
import { MockAPIService } from '@/services/mockApiService';
import { Wifi, WifiOff, Settings } from 'lucide-react';

export const NetworkSimulator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mockAPI] = useState(() => MockAPIService.getInstance());
  const [currentCondition, setCurrentCondition] = useState('normal');
  const [currentIdentifier, setCurrentIdentifier] = useState(mockAPI.getApiIdentifier());

  const networkConditions = [
    { key: 'fast', name: 'Fast (5G)', latency: '50-150ms', color: 'text-green-600' },
    { key: 'normal', name: 'Normal', latency: '200-700ms', color: 'text-blue-600' },
    { key: 'slow', name: 'Slow (3G)', latency: '1-3s', color: 'text-yellow-600' },
    { key: 'unstable', name: 'Unstable', latency: 'Variable', color: 'text-orange-600' },
    { key: 'offline', name: 'Offline', latency: 'No connection', color: 'text-red-600' }
  ];

  const apiIdentifiers = mockAPI.getAvailableIdentifiers();

  const handleConditionChange = (condition: string) => {
    setCurrentCondition(condition);
    mockAPI.simulateNetworkConditions(condition as any);
  };

  const handleIdentifierChange = (identifier: string) => {
    setCurrentIdentifier(identifier);
    mockAPI.setApiIdentifier(identifier);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:shadow-xl transition-shadow"
        title="Network Simulator"
      >
        {currentCondition === 'offline' ? (
          <WifiOff className="w-5 h-5 text-red-500" />
        ) : (
          <Wifi className="w-5 h-5 text-green-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-4 h-4" />
            <h3 className="font-semibold">Network Simulator</h3>
          </div>

          {/* Network Conditions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Network Condition</h4>
            <div className="space-y-1">
              {networkConditions.map((condition) => (
                <button
                  key={condition.key}
                  onClick={() => handleConditionChange(condition.key)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    currentCondition === condition.key
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className={condition.color}>{condition.name}</span>
                    <span className="text-gray-500 text-xs">{condition.latency}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Identifier */}
          <div>
            <h4 className="text-sm font-medium mb-2">API Environment</h4>
            <select
              value={currentIdentifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              {apiIdentifiers.map((identifier) => (
                <option key={identifier} value={identifier}>
                  {identifier.charAt(0).toUpperCase() + identifier.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};