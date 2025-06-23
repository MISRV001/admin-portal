import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select as ShadSelect } from './ui/select';
import { MockAPIService } from '../services/mockApiService';

const api = MockAPIService.getInstance();
const PAGE_SIZE = 10;

export const PublishCampaign: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'zone' | 'city' | 'store' | 'all'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [zones, setZones] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [editId, setEditId] = useState<number|null>(null);
  const [editData, setEditData] = useState<any>({});
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'publish' | 'delete'; id: number } | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    api.loadMockFile('locations-list.json').then((data) => setZones(data.regions));
    api.loadMockFile('cities-list.json').then((data) => setCities(data.cities));
    api.loadMockFile('stores-list.json').then((data) => setStores(data.stores));
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      api.loadMockFile('campaigns-list.json').then((data) => {
        let filtered = data.campaigns;
        if (selectedState) {
          filtered = filtered.filter((c: any) => c.state === selectedState);
        }
        if (selectedCity) {
          filtered = filtered.filter((c: any) => c.city === selectedCity);
        }
        if (filterType === 'zone' && filterValue) {
          filtered = filtered.filter((c: any) => c.zone === filterValue);
        } else if (filterType === 'city' && filterValue) {
          filtered = filtered.filter((c: any) => c.city === filterValue);
        } else if (filterType === 'store' && filterValue) {
          filtered = filtered.filter((c: any) => c.store === filterValue);
        }
        // Sort
        filtered = filtered.sort((a: any, b: any) => {
          if (a[sortKey] < b[sortKey]) return sortDir === 'asc' ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
        setTotal(filtered.length);
        setCampaigns(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
        setLoading(false);
      });
    }, 800);
  }, [filterType, filterValue, page, sortKey, sortDir, selectedState, selectedCity]);

  const handlePublish = (id: number) => setConfirmAction({ type: 'publish', id });
  const handleDelete = (id: number) => setConfirmAction({ type: 'delete', id });
  const confirmProceed = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'publish') {
      setCampaigns((prev) => prev.map((c) => c.id === confirmAction.id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c));
    } else if (confirmAction.type === 'delete') {
      setCampaigns((prev) => prev.filter((c) => c.id !== confirmAction.id));
      setTotal((prev) => prev - 1);
      if (editId === confirmAction.id) setEditId(null);
    }
    setConfirmAction(null);
  };

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setEditData({ ...c });
  };
  const handleUpdate = () => {
    setCampaigns((prev) => prev.map((c) => c.id === editId ? { ...editData } : c));
    setEditId(null);
  };

  // Helper to check if campaign is editable (not running now and start date > 2 days from now)
  const isEditable = (startDate: string, endDate: string) => {
    if (!startDate) return false;
    const now = new Date();
    now.setHours(0,0,0,0);
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const minEditDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    // Not editable if campaign is running now
    if (start <= now && (!end || end >= now)) return false;
    // Not editable if start date is within 2 days
    if (start <= minEditDate) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter by State and City */}
          <div className="flex flex-wrap gap-4 mb-4">
            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setPage(1); }} className="p-2 border rounded min-w-[180px]">
              <option value="">All States</option>
              {Array.from(new Set(cities.map((c: any) => c.state))).map(stateCode => {
                // Try to get state label from locations-list.json if available
                const stateObj = (zones.flatMap((z: any) => (z.states || [])) as any[]).find((s: any) => s.value === stateCode);
                return <option key={stateCode} value={stateCode}>{stateObj?.label || stateCode}</option>;
              })}
            </select>
            <select value={selectedCity} onChange={e => { setSelectedCity(e.target.value); setPage(1); }} className="p-2 border rounded min-w-[180px]">
              <option value="">All Cities</option>
              {cities.filter((c: any) => !selectedState || c.state === selectedState).map((c: any) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full whitespace-nowrap bg-white text-sm">
              <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
                <tr>
                  {['name','description','status','startDate','endDate'].map((key) => (
                    <th key={key} className="px-2 py-2 text-left font-semibold text-blue-700 cursor-pointer select-none" onClick={() => {
                      if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortKey(key); setSortDir('asc'); }
                    }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {sortKey === key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-left font-semibold text-blue-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({length: PAGE_SIZE}).map((_,i) => (
                  <tr key={i} className="border-t animate-pulse">
                    {Array.from({length:6}).map((_,j) => (
                      <td key={j} className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" /></td>
                    ))}
                  </tr>
                )) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-blue-700 font-semibold">No active campaign is running</td>
                  </tr>
                ) : campaigns.map(c => (
                  <tr key={c.id} className="border-t hover:bg-blue-50 transition">
                    <td className="px-2 py-2 font-medium text-gray-900 truncate max-w-[180px]">{c.name}</td>
                    <td className="px-2 py-2 text-gray-700 truncate max-w-[220px]">{c.description || '-'}</td>
                    <td className="px-2 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${c.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                    </td>
                    <td className="px-2 py-2">{c.startDate}</td>
                    <td className="px-2 py-2">{c.endDate}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-col gap-2 items-stretch">
                        <Button variant="secondary" size="sm" className="w-full" onClick={() => handleEdit(c)} disabled={!isEditable(c.startDate, c.endDate)} title={isEditable(c.startDate, c.endDate) ? '' : 'Can only edit if campaign is not running and start date is at least 2 days from today'}>Edit</Button>
                        <Button variant={c.status === 'published' ? 'outline' : 'default'} size="sm" className={`w-full ${c.status !== 'published' ? 'bg-green-600 text-white hover:bg-green-700' : ''}`} onClick={() => handlePublish(c.id)}>
                          {c.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(c.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span>Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
            <div className="flex gap-2">
              <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button disabled={page === Math.ceil(total / PAGE_SIZE)} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
          {/* Confirm Modal for Publish/Delete */}
          {confirmAction && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative animate-fadein">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setConfirmAction(null)}>&times;</button>
                <h3 className="text-lg font-bold mb-4 text-blue-700">{confirmAction.type === 'publish' ? 'Confirm Publish/Unpublish' : 'Confirm Delete'}</h3>
                <p className="mb-6 text-gray-700">Are you sure you want to {confirmAction.type === 'publish' ? 'publish/unpublish' : 'delete'} this campaign?</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                  <Button variant={confirmAction.type === 'delete' ? 'destructive' : 'default'} className={confirmAction.type === 'delete' ? '' : 'bg-green-600 text-white hover:bg-green-700'} onClick={confirmProceed}>{confirmAction.type === 'delete' ? 'Delete' : 'Proceed'}</Button>
                </div>
              </div>
            </div>
          )}
          {/* Edit Form Modal/Inline */}
          {editId && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl relative animate-fadein overflow-y-auto max-h-[90vh]">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setEditId(null)}>&times;</button>
                <h3 className="text-lg font-bold mb-4 text-blue-700">Edit Campaign</h3>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input className="w-full p-2 border rounded" value={editData.name || ''} onChange={e => setEditData((d: any) => ({ ...d, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea className="w-full p-2 border rounded" value={editData.description || ''} onChange={e => setEditData((d: any) => ({ ...d, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select className="w-full p-2 border rounded" value={editData.status} onChange={e => setEditData((d: any) => ({ ...d, status: e.target.value }))}>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input type="date" className="w-full p-2 border rounded" value={editData.startDate || ''} onChange={e => setEditData((d: any) => ({ ...d, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input type="date" className="w-full p-2 border rounded" value={editData.endDate || ''} onChange={e => setEditData((d: any) => ({ ...d, endDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                      <select className="w-full p-2 border rounded" value={editData.zone || ''} onChange={e => setEditData((d: any) => ({ ...d, zone: e.target.value }))}>
                        <option value="">Select Zone</option>
                        {zones.map((z: any) => <option key={z.value} value={z.value}>{z.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <select className="w-full p-2 border rounded" value={editData.city || ''} onChange={e => setEditData((d: any) => ({ ...d, city: e.target.value }))}>
                        <option value="">Select City</option>
                        {cities.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
                      <select className="w-full p-2 border rounded" value={editData.store || ''} onChange={e => setEditData((d: any) => ({ ...d, store: e.target.value }))}>
                        <option value="">Select Store</option>
                        {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                      <input type="number" className="w-full p-2 border rounded" value={editData.budget || ''} onChange={e => setEditData((d: any) => ({ ...d, budget: e.target.value }))} />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    <Button type="submit" variant="default">Update</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
