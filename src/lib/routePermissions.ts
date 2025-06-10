export const routePermissions: Record<string, string> = {
  '/': 'dashboard.view',
  '/addusers': 'admin.users.manage',
  '/addplacements': 'admin.placements.manage',
  '/createcampaign': 'campaigns.create',
  '/publishcampaign': 'campaigns.publish',
  '/previewcampaign': 'campaigns.preview',
  '/campaignconditions': 'admin.conditions.manage',
  '/posstoresdevice': 'stores.manage',
  '/devicehealth': 'stores.health',
  '/report1': 'reports.view_all',
  '/report2': 'reports.view_all',
  '/report3': 'reports.view_all',
  // Add more as needed
};