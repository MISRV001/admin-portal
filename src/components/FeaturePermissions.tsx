import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectContent } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ALL_ROLES = [
  { label: 'Admin', value: 'admin' },
  { label: 'Campaign Manager', value: 'campaign_manager' },
  { label: 'Report Analyst', value: 'reports_only' },
  { label: 'Create New Role...', value: 'new' }
];

const ALL_FEATURES = [
  { name: 'Email Invites', key: 'admin.users.manage', description: 'Invite users via email.' },
  { name: 'Feature Permissions', key: 'admin.roles.manage', description: 'Manage feature access for roles.' },
  { name: 'Add Users', key: 'admin.users.manage', description: 'Add new users to the system.' },
  { name: 'Add Placements', key: 'admin.placements.manage', description: 'Add new ad placements.' },
  { name: 'Create Campaign', key: 'campaigns.create', description: 'Create a new marketing campaign.' },
  { name: 'Publish Campaign', key: 'campaigns.publish', description: 'Publish a campaign.' },
  { name: 'Preview Campaign', key: 'campaigns.preview', description: 'Preview campaign details.' },
  { name: 'POS Stores/Device', key: 'stores.manage', description: 'Manage POS stores and devices.' },
  { name: 'Device Health', key: 'stores.health', description: 'Monitor device health.' },
  { name: 'Report 1', key: 'reports.view_all', description: 'View all reports.' },
];

const PERMISSION_LEVELS = [
  { label: 'Edit-Access', value: 'edit' },
  { label: 'View-Only', value: 'view' },
  { label: 'No-Access', value: 'none' }
];

export const FeaturePermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [newRoleName, setNewRoleName] = useState('');
  const [permissions, setPermissions] = useState<{ [feature: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch permissions for selected role
  useEffect(() => {
    setSuccess('');
    setError('');
    if (selectedRole === 'new') {
      setPermissions(Object.fromEntries(ALL_FEATURES.map(f => [f.key, 'none'])));
      return;
    }
    setLoading(true);
    fetch('/mock/responses/admin-roles.json')
      .then(res => res.json())
      .then(data => {
        const role = data.roles.find((r: any) => r.name === selectedRole);
        if (role) {
          setPermissions({
            ...Object.fromEntries(ALL_FEATURES.map(f => [f.key, 'none'])),
            ...role.permissions
          });
        } else {
          setPermissions(Object.fromEntries(ALL_FEATURES.map(f => [f.key, 'none'])));
        }
      })
      .catch(() => setError('Failed to load permissions'))
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const handlePermissionChange = (featureKey: string, value: string) => {
    setPermissions(prev => ({ ...prev, [featureKey]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 800));
      // Here you would POST/PUT to your API or update your mock
      setSuccess('Permissions saved successfully!');
    } catch (e) {
      setError('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-0">
      <CardHeader>
        <CardTitle>Feature Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <Label htmlFor="role">Role:</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole} id="role">
            <SelectTrigger className="w-56">
              {ALL_ROLES.find(r => r.value === selectedRole)?.label ?? ''}
            </SelectTrigger>
            <SelectContent>
              {ALL_ROLES.map(role => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRole === 'new' && (
            <Input
              placeholder="New Role Name"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="ml-2 w-56"
            />
          )}
        </div>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Feature</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Permission</th>
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map(feature => (
                  <tr key={feature.key} className="border-t">
                    <td className="p-2">{feature.name}</td>
                    <td className="p-2 text-gray-500">{feature.description}</td>
                    <td className="p-2">
                      <Select
                          value={permissions[feature.key] || 'none'}
                          onValueChange={value => handlePermissionChange(feature.key, value)}
                        >
                          <SelectTrigger className="w-36">
                            {PERMISSION_LEVELS.find(l => l.value === (permissions[feature.key] || 'none'))?.label ?? 'No-Access'}
                          </SelectTrigger>
                          <SelectContent>
                            {PERMISSION_LEVELS.map(level => (
                              <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(success || error) && (
          <Alert className={`mt-4 ${success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={success ? 'text-green-700' : 'text-red-700'}>
              {success || error}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleSave}
            disabled={saving || loading || (selectedRole === 'new' && !newRoleName)}
            className="bg-blue-600 text-white"
          >
            {saving ? 'Saving...' : 'Save Permission Changes'}
          </Button>
          {selectedRole === 'new' && (
            <Button
              variant="outline"
              onClick={() => {
                setNewRoleName('');
                setSelectedRole('admin');
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};