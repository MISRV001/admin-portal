import { routePermissions } from './routePermissions';

export function canAccessRoute(user: any, routePath: string): boolean {
  if (!user) return false;
  const cleanPath = routePath.split('?')[0].toLowerCase();
  const permissionConfig = routePermissions[cleanPath];

  if (!permissionConfig) return true; // Allow if not mapped

  // If role-specific config
  if (typeof permissionConfig === 'object') {
    const requiredPermission = permissionConfig[user.role];
    if (!requiredPermission) return false; // No permission defined for this role
    return user.permissions.includes(requiredPermission);
  }

  // If single permission string
  return user.permissions.includes(permissionConfig);
}