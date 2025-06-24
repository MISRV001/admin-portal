import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Edit, Trash2, Plus, Monitor, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { MockAPIService } from '../services/mockApiService';
import { Button } from './ui/button';

interface Placement {
  id: string;
  name: string;
  displayType: string;
  orientation: string;
  resolution: string;
  dimensions: {
    width: number;
    height: number;
  };
  supportedFormats: string[];
  maxFileSize: string;
  refreshRate: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlacementFormData {
  name: string;
  displayType: string;
  orientation: string;
  resolution: string;
}

export const AddPlacements: React.FC = () => {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState<PlacementFormData>({
    name: '',
    displayType: '',
    orientation: '',
    resolution: ''
  });

  const displayTypes = [
    { value: 'image_video', label: 'Image/Video' },
    { value: 'digital_signage', label: 'Digital Signage' },
    { value: 'interactive_display', label: 'Interactive Display' },
    { value: 'led_screen', label: 'LED Screen' }
  ];

  const orientations = [
    { value: 'landscape', label: 'Landscape' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'square', label: 'Square' }
  ];

  const resolutions = [
    { value: '1920x1080', label: '1920x1080 (Full HD)' },
    { value: '1280x720', label: '1280x720 (HD)' },
    { value: '3840x2160', label: '3840x2160 (4K)' },
    { value: '1080x1920', label: '1080x1920 (Portrait HD)' },
    { value: '720x1280', label: '720x1280 (Portrait)' },
    { value: '1080x1080', label: '1080x1080 (Square)' }
  ];

  useEffect(() => {
    loadPlacements();
  }, []);

  const loadPlacements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mockAPI = MockAPIService.getInstance();
      const response = await mockAPI.makeRequest('admin/placements', {}, { method: 'GET' });
      setPlacements(response.placements || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load placements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayType: '',
      orientation: '',
      resolution: ''
    });
    setEditingId(null);
    setSubmitStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setMessage('');

    try {
      const mockAPI = MockAPIService.getInstance();
      
      if (editingId) {
        // Update existing placement
        await mockAPI.makeRequest('admin/placements/update', {
          id: editingId,
          ...formData
        }, { method: 'PUT' });
        setMessage('Placement updated successfully!');
      } else {
        // Create new placement
        await mockAPI.makeRequest('admin/placements/create', formData, { method: 'POST' });
        setMessage('Placement created successfully!');
      }
      
      setSubmitStatus('success');
      resetForm();
      loadPlacements(); // Reload the list
      
    } catch (error: any) {
      setSubmitStatus('error');
      setMessage(error.message || 'Failed to save placement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (placement: Placement) => {
    setFormData({
      name: placement.name,
      displayType: placement.displayType,
      orientation: placement.orientation,
      resolution: placement.resolution
    });
    setEditingId(placement.id);
    setSubmitStatus('idle');
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this placement?')) return;

    try {
      const mockAPI = MockAPIService.getInstance();
      await mockAPI.makeRequest('admin/placements/delete', { id }, { method: 'DELETE' });
      loadPlacements(); // Reload the list
    } catch (error: any) {
      setError(error.message || 'Failed to delete placement');
    }
  };

  const renderStatus = () => {
    if (submitStatus === 'success') {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">{message}</AlertDescription>
        </Alert>
      );
    }
    
    if (submitStatus === 'error') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">{message}</AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-500">Loading placements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <Card className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-blue-700">Add Placements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Add/View Placements</h2>
              <p className="text-gray-500">Create and manage placement configurations for your campaigns.</p>
            </div>

            {/* Current Placements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>Current Placements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}
                
                {placements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No placements found. Create your first placement below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {placements.map((placement) => (
                      <div key={placement.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{placement.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              placement.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {placement.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Type: {placement.displayType.replace('_', '/')} • {placement.resolution} • {placement.orientation}
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            Location: {placement.location} • Formats: {placement.supportedFormats.join(', ')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(placement)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(placement.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Placement Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>{editingId ? 'Edit Placement' : 'Add New Placement'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {renderStatus()}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placement Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., POS_Small_Screen"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Type
                    </label>
                    <select
                      name="displayType"
                      value={formData.displayType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Type</option>
                      {displayTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      name="orientation"
                      value={formData.orientation}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Orientation</option>
                      {orientations.map((orientation) => (
                        <option key={orientation.value} value={orientation.value}>
                          {orientation.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution
                    </label>
                    <select
                      name="resolution"
                      value={formData.resolution}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Resolution</option>
                      {resolutions.map((resolution) => (
                        <option key={resolution.value} value={resolution.value}>
                          {resolution.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end w-full mt-4">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg shadow hover:scale-105 transition-transform font-semibold text-lg"
                    >
                      Add Placement
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};