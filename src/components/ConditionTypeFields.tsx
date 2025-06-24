import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// Helper: Render fields for each condition type
export function ConditionTypeFields({ type, values, setValues }: {
  type: string;
  values: any;
  setValues: (v: any) => void;
}) {
  // GEOGRAPHICAL
  if (type === 'GEOGRAPHICAL') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">State/Region</label>
        <Input placeholder="e.g. California, Texas" value={values.region || ''} onChange={e => setValues({ ...values, region: e.target.value })} />
        <label className="block text-sm font-medium">ZIP Code Range</label>
        <Input placeholder="e.g. 90001-90010" value={values.zipRange || ''} onChange={e => setValues({ ...values, zipRange: e.target.value })} />
        <label className="block text-sm font-medium">Radius (miles)</label>
        <Input type="number" placeholder="e.g. 10" value={values.radius || ''} onChange={e => setValues({ ...values, radius: e.target.value })} />
        <label className="block text-sm font-medium">Store Locations</label>
        <Input placeholder="Store IDs, comma separated" value={values.stores || ''} onChange={e => setValues({ ...values, stores: e.target.value })} />
        <label className="block text-sm font-medium">IP Geolocation</label>
        <Input placeholder="IP or range" value={values.ip || ''} onChange={e => setValues({ ...values, ip: e.target.value })} />
      </div>
    );
  }
  // WEATHER
  if (type === 'WEATHER') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">Temperature Range (°F)</label>
        <Input placeholder="e.g. 60-80" value={values.tempRange || ''} onChange={e => setValues({ ...values, tempRange: e.target.value })} />
        <label className="block text-sm font-medium">Weather Condition</label>
        <Input placeholder="e.g. sunny, rainy" value={values.weather || ''} onChange={e => setValues({ ...values, weather: e.target.value })} />
        <label className="block text-sm font-medium">Humidity (%)</label>
        <Input type="number" placeholder="e.g. 50" value={values.humidity || ''} onChange={e => setValues({ ...values, humidity: e.target.value })} />
        <label className="block text-sm font-medium">Wind Speed (mph)</label>
        <Input type="number" placeholder="e.g. 10" value={values.wind || ''} onChange={e => setValues({ ...values, wind: e.target.value })} />
        <label className="block text-sm font-medium">Forecast (hours ahead)</label>
        <Input type="number" placeholder="e.g. 24" value={values.forecast || ''} onChange={e => setValues({ ...values, forecast: e.target.value })} />
        <label className="block text-sm font-medium">Location</label>
        <Input placeholder="City or coordinates" value={values.location || ''} onChange={e => setValues({ ...values, location: e.target.value })} />
      </div>
    );
  }
  // TEMPORAL
  if (type === 'TEMPORAL') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">Days of Week</label>
        <Input placeholder="e.g. Mon, Tue, Fri" value={values.days || ''} onChange={e => setValues({ ...values, days: e.target.value })} />
        <label className="block text-sm font-medium">Time Range</label>
        <Input placeholder="e.g. 09:00-17:00" value={values.timeRange || ''} onChange={e => setValues({ ...values, timeRange: e.target.value })} />
        <label className="block text-sm font-medium">Holiday</label>
        <Input placeholder="e.g. Christmas" value={values.holiday || ''} onChange={e => setValues({ ...values, holiday: e.target.value })} />
        <label className="block text-sm font-medium">Seasonal Dates</label>
        <Input placeholder="e.g. 2025-06-01 to 2025-08-31" value={values.season || ''} onChange={e => setValues({ ...values, season: e.target.value })} />
        <label className="block text-sm font-medium">Timezone</label>
        <Input placeholder="e.g. America/Los_Angeles" value={values.timezone || ''} onChange={e => setValues({ ...values, timezone: e.target.value })} />
        <label className="block text-sm font-medium">Recurring Pattern</label>
        <Input placeholder="e.g. every Monday" value={values.recurring || ''} onChange={e => setValues({ ...values, recurring: e.target.value })} />
      </div>
    );
  }
  // DEMOGRAPHIC
  if (type === 'DEMOGRAPHIC') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">Age Range</label>
        <Input placeholder="e.g. 18-35" value={values.ageRange || ''} onChange={e => setValues({ ...values, ageRange: e.target.value })} />
        <label className="block text-sm font-medium">Loyalty Tier</label>
        <Input placeholder="e.g. Gold, Silver" value={values.loyalty || ''} onChange={e => setValues({ ...values, loyalty: e.target.value })} />
      </div>
    );
  }
  // PURCHASE
  if (type === 'PURCHASE') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">Cart Value Threshold</label>
        <Input type="number" placeholder="e.g. 100" value={values.cartValue || ''} onChange={e => setValues({ ...values, cartValue: e.target.value })} />
        <label className="block text-sm font-medium">Product Categories</label>
        <Input placeholder="e.g. Electronics, Apparel" value={values.categories || ''} onChange={e => setValues({ ...values, categories: e.target.value })} />
        <label className="block text-sm font-medium">Purchase Frequency</label>
        <Input type="number" placeholder="e.g. 5" value={values.frequency || ''} onChange={e => setValues({ ...values, frequency: e.target.value })} />
        <label className="block text-sm font-medium">Abandoned Cart</label>
        <Input placeholder="e.g. true/false" value={values.abandoned || ''} onChange={e => setValues({ ...values, abandoned: e.target.value })} />
      </div>
    );
  }
  // INVENTORY
  if (type === 'INVENTORY') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">Stock Level Threshold</label>
        <Input type="number" placeholder="e.g. 10" value={values.stock || ''} onChange={e => setValues({ ...values, stock: e.target.value })} />
        <label className="block text-sm font-medium">Overstock Detection</label>
        <Input placeholder="e.g. true/false" value={values.overstock || ''} onChange={e => setValues({ ...values, overstock: e.target.value })} />
        <label className="block text-sm font-medium">Expiration Date</label>
        <Input type="date" value={values.expiry || ''} onChange={e => setValues({ ...values, expiry: e.target.value })} />
        <label className="block text-sm font-medium">Supplier Delivery</label>
        <Input placeholder="e.g. Supplier Name" value={values.supplier || ''} onChange={e => setValues({ ...values, supplier: e.target.value })} />
      </div>
    );
  }
  // Default fallback
  return null;
}
