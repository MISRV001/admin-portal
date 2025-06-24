import React, { useEffect, useState } from 'react';
import { Shield, Target, Store, BarChart3, Mail, Settings, UserPlus, MapPin, Filter, PlusCircle, Eye, Play, Monitor, Activity } from 'lucide-react';

// SidebarRoute type for sidebar-permissions.json
interface SidebarRoute {
  route: string;
  name: string;
  description: string;
  group: string;
}

type UserRole = 'admin' | 'campaign_manager' | 'reports_only' | 'pos_admin';

const routeIconMap: Record<string, React.ReactNode> = {
  '/': <Shield className="w-4 h-4" />,
  '/addusers': <UserPlus className="w-4 h-4" />,
  '/featurepermissions': <Settings className="w-4 h-4" />,
  '/addplacements': <MapPin className="w-4 h-4" />,
  '/createcampaign': <PlusCircle className="w-4 h-4" />,
  '/publishcampaign': <Play className="w-4 h-4" />,
  '/previewcampaign': <Eye className="w-4 h-4" />,
  '/campaignconditions': <Filter className="w-4 h-4" />,
  '/posstoresdevice': <Monitor className="w-4 h-4" />,
  '/devicehealth': <Activity className="w-4 h-4" />,
  '/campaignreport': <BarChart3 className="w-4 h-4" />,
  '/report2': <BarChart3 className="w-4 h-4" />,
  '/report3': <BarChart3 className="w-4 h-4" />,
  '/networksimulator': <Monitor className="w-4 h-4" />,
  '/apimodeselector': <Settings className="w-4 h-4" />,
  '/stores': <Store className="w-4 h-4" />,
  '/reports': <BarChart3 className="w-4 h-4" />,
  '/settings': <Settings className="w-4 h-4" />
};

export interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  children: { name: string; icon: React.ReactNode; route: string }[];
}

// Dynamic hook for navigation items
export function useNavigationItems(userRole: UserRole, permissions: Record<string, string>) {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadSidebar() {
      console.log('[NAV DEBUG] useNavigationItems called with:', { userRole, permissions });
      const res = await fetch('/mock/responses/sidebar-permissions.json');
      const data = await res.json();
      if (cancelled) return;
      const sidebar: SidebarRoute[] = data.sidebar;
      // Group by 'group' field
      const grouped: Record<string, SidebarRoute[]> = {};
      sidebar.forEach(item => {
        if (!grouped[item.group]) grouped[item.group] = [];
        grouped[item.group].push(item);
      });
      // Build navigation items
      const nav = Object.entries(grouped).map(([group, items]) => ({
        title: group,
        icon: routeIconMap[items[0].route] || <Shield className="w-4 h-4" />,
        children: items
          .filter(item => permissions[item.route] && permissions[item.route] !== 'none')
          .map(item => ({
            name: item.name,
            icon: routeIconMap[item.route] || <Shield className="w-4 h-4" />,
            route: item.route
          }))
      })).filter(item => item.children.length > 0);
      console.log('[NAV DEBUG] navigationItems generated:', nav);
      setNavigationItems(nav);
    }
    loadSidebar();
    return () => { cancelled = true; };
  }, [userRole, permissions]);

  return navigationItems;
}
