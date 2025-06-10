import { getNavigationItems } from '../utils/roleBasedNavigation';
import { routePermissions } from './routePermissions';

export function canAccessRoute(user: any, routePath: string): boolean {
  if (!user) return false;
  const cleanPath = routePath.split('?')[0].toLowerCase();
  const requiredPermission = routePermissions[cleanPath];
  if (!requiredPermission) return true; // If no permission required, allow access
  return user.permissions.includes(requiredPermission);
}