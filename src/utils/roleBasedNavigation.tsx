import React from 'react';
import { Shield, Target, Store, BarChart3, Mail, Settings, UserPlus, MapPin, Filter, PlusCircle, Eye, Play, Monitor, Activity } from 'lucide-react';

type UserRole = 'admin' | 'campaign_manager' | 'reports_only' | 'pos_admin';

interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  children: { name: string; icon: React.ReactNode; permission: string }[];
  requiredRole?: UserRole[];
}

export const getNavigationItems = (userRole: UserRole, permissions: string[]): NavigationItem[] => {
  const allNavigationItems: NavigationItem[] = [
    {
      title: 'Admin',
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      requiredRole: ['admin'],
      children: [
        { name: 'Add Users', icon: <UserPlus className="w-4 h-4" />, permission: 'admin.users.manage' },
        { name: 'Manage Users', icon: <Mail className="w-4 h-4" />, permission: 'admin.users.manage' },
        { name: 'Feature Permissions', icon: <Settings className="w-4 h-4" />, permission: 'admin.roles.manage' },
        { name: 'Campaign Conditions', icon: <Filter className="w-4 h-4" />, permission: 'admin.conditions.manage' }
      ]
    },
    {
      title: 'Campaign Management',
      icon: <Target className="w-5 h-5 text-green-600" />,
      requiredRole: ['admin', 'campaign_manager'],
      children: [
        { name: 'Create Campaign', icon: <PlusCircle className="w-4 h-4" />, permission: 'campaigns.create' },
        { name: 'Publish Campaign', icon: <Play className="w-4 h-4" />, permission: 'campaigns.publish' },
        { name: 'Preview Campaign', icon: <Eye className="w-4 h-4" />, permission: 'campaigns.preview' }
      ]
    },
    {
      title: 'Store Management',
      icon: <Store className="w-5 h-5 text-purple-600" />,
      requiredRole: ['admin', 'pos_admin'],
      children: [
        { name: 'POS Stores/Device', icon: <Monitor className="w-4 h-4" />, permission: 'posstoresdevice' },
        { name: 'Add Placements', icon: <MapPin className="w-4 h-4" />, permission: 'addplacements' }
      ]
    },
    {
      title: 'Reports',
      icon: <BarChart3 className="w-5 h-5 text-orange-600" />,
      requiredRole: ['admin', 'campaign_manager', 'reports_only', 'pos_admin'],
      children: [
        { name: 'Campaign Report', icon: <BarChart3 className="w-4 h-4" />, permission: 'reports.view_all' },
        { name: 'Store Performance Report', icon: <BarChart3 className="w-4 h-4" />, permission: 'reports.view_all' },
        { name: 'Device Health', icon: <Activity className="w-4 h-4" />, permission: 'devicehealth' },
        { name: 'Inventory Report', icon: <BarChart3 className="w-4 h-4" />, permission: 'reports.view_all' }
      ]
    }
  ];

  return allNavigationItems
    .filter(item => !item.requiredRole || item.requiredRole.includes(userRole))
    .map(item => ({
      ...item,
      children: item.children.filter(child => permissions.includes(child.permission))
    }))
    .filter(item => item.children.length > 0);
};
