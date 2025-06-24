export const routePermissions: Record<string, string | Record<string, string>> = {
  '/': {
    admin: 'dashboard.view',
    campaign_manager: 'campaigns.create',
    reports_only: 'reports.view_all',
    pos_admin: 'stores.manage',
    // Add more roles as needed
  },
  '/addusers': 'admin.users.manage',
   '/rolePermissions': 'admin.users.manage',
  '/addplacements': 'addplacements',
  '/createcampaign': 'campaigns.create',
  '/publishcampaign': 'campaigns.publish',
  '/previewcampaign': 'campaigns.preview',
  '/campaignconditions': 'admin.conditions.manage',
  '/posstoresdevice': 'posstoresdevice',
  '/devicehealth': 'devicehealth',
  '/report1': 'reports.view_all',
  '/report2': 'reports.view_all',
  '/report3': 'reports.view_all',
  // Add more as needed
};