import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const Report1: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📈</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Campaign Performance Report</h2>
        <p className="text-gray-500">Analyze campaign metrics and performance data</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">2.4M</div>
            <p className="text-sm text-green-600">↑ 12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">3.2%</div>
            <p className="text-sm text-green-600">↑ 0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">1,250</div>
            <p className="text-sm text-red-600">↓ 2% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Chart visualization would go here</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};