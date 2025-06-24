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

const PERMISSION_LEVELS = [
  { label: 'Edit-Access', value: 'edit' },
  { label: 'View-Only', value: 'view' },
  { label: 'No-Access', value: 'none' }
];

interface SidebarRoute {
  route: string;
  name: string;
  description: string;
  group: string;
}

// Ensure all sidebar routes are present in the permissions table for the selected role
const getRolePermissions = (rolePermissions: Record<string, string>, sidebarRoutes: string[]) => {
  // Ensure all sidebar routes are present, default to 'view' if missing
  return sidebarRoutes.map(route => ({
    route,
    permission: rolePermissions[route] || 'view',
  }));
};

export const FeaturePermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [newRoleName, setNewRoleName] = useState('');
  const [permissions, setPermissions] = useState<{ [route: string]: string }>({});
  const [sidebarRoutes, setSidebarRoutes] = useState<SidebarRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch sidebar routes and permissions for selected role
  useEffect(() => {
    setSuccess('');
    setError('');
    setLoading(true);
    fetch('/mock/responses/sidebar-permissions.json')
      .then(res => res.json())
      .then(data => {
        setSidebarRoutes(data.sidebar);
        const role = data.roles.find((r: any) => r.name === selectedRole);
        if (role) {
          const perms: { [route: string]: string } = {};
          data.sidebar.forEach((item: SidebarRoute) => {
            perms[item.route] = role.permissions[item.route] || 'none';
          });
          setPermissions(perms);
        } else {
          const perms: { [route: string]: string } = {};
          data.sidebar.forEach((item: SidebarRoute) => {
            perms[item.route] = 'none';
          });
          setPermissions(perms);
        }
      })
      .catch(() => setError('Failed to load permissions'))
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const handlePermissionChange = (route: string, value: string) => {
    setPermissions(prev => ({ ...prev, [route]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 800));
      setSuccess('Permissions saved successfully!');
    } catch (e) {
      setError('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Group sidebar routes by group
  const groupedSidebar = sidebarRoutes.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, SidebarRoute[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <Card className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-blue-700">Feature Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Label htmlFor="role">Role:</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-56">
                {selectedRole}
              </SelectTrigger>
              <SelectContent>
                {/* You may want to fetch roles from the API for dynamic roles */}
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="campaign_manager">Campaign Manager</SelectItem>
                <SelectItem value="reports_only">Report Analyst</SelectItem>
                <SelectItem value="pos_admin">POS-Admin</SelectItem>
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
              {Object.entries(groupedSidebar).map(([group, items]) => (
                <div key={group} className="mb-8">
                  <div className="text-lg font-semibold text-purple-700 mb-2 mt-4">{group}</div>
                  <div className="w-full">
                    <table className="w-full border mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left align-middle">Name</th>
                          <th className="p-2 text-left align-middle">Description</th>
                          <th className="p-2 text-left align-middle">Route</th>
                          <th className="p-2 text-left align-middle">Permission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.route} className="border-t">
                            <td className="p-2 text-left align-middle">{item.name}</td>
                            <td className="p-2 text-left align-middle text-gray-500">{item.description}</td>
                            <td className="p-2 text-left align-middle font-mono text-xs text-gray-500">{item.route}</td>
                            <td className="p-2 text-left align-middle">
                              <Select
                                value={permissions[item.route] || 'none'}
                                onValueChange={value => handlePermissionChange(item.route, value)}
                              >
                                <SelectTrigger className="w-36">
                                  {PERMISSION_LEVELS.find(l => l.value === (permissions[item.route] || 'none'))?.label ?? 'No-Access'}
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
                </div>
              ))}
            </div>
          )}
          {(success || error) && (
            <Alert className={`mt-4 ${success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertDescription className={success ? 'text-green-700' : 'text-red-700'}>
                {success || error}
              </AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end w-full mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg shadow hover:scale-105 transition-transform font-semibold text-lg"
              onClick={handleSave}
              disabled={saving || loading || (selectedRole === 'new' && !newRoleName)}
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};