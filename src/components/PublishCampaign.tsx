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
  const [showEditInfo, setShowEditInfo] = useState<number|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Add filter for Campaign Publish Status
  const [statusFilter, setStatusFilter] = useState('');

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
        if (statusFilter) {
          filtered = filtered.filter((c: any) => getCampaignStatus(c) === statusFilter);
        }
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
  }, [statusFilter, filterType, filterValue, page, sortKey, sortDir, selectedState, selectedCity]);

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

  // Helper to get campaign status
  const getCampaignStatus = (c: any) => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const start = c.startDate ? new Date(c.startDate) : null;
    const end = c.endDate ? new Date(c.endDate) : null;
    if (c.status === 'published') {
      if (start && end && start <= now && now <= end) {
        return 'Published Running';
      }
      if (end && end < now) {
        return 'Expired';
      }
      if (start && start > now) {
        return 'Published';
      }
      return 'Published';
    }
    if (end && end < now) {
      return 'Expired';
    }
    return c.status.charAt(0).toUpperCase() + c.status.slice(1);
  };

  // Helper to check if campaign is editable (not Published Running)
  const isEditable = (c: any) => {
    return getCampaignStatus(c) !== 'Published Running';
  };

  const isNextDisabled = () => {
    // Add your logic to enable/disable the Next button
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <Card className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-blue-700">Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter by Publish Status */}
          <div className="flex flex-wrap gap-4 mb-4">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="p-2 border rounded min-w-[180px]">
              <option value="">All Statuses</option>
              <option value="Published Running">Published Running</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Expired">Expired</option>
            </select>
            {/* Filter by State and City */}
            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setPage(1); }} className="p-2 border rounded min-w-[180px]">
              <option value="">All States</option>
              {Array.from(new Set(cities.map((c: any) => c.state))).map(stateCode => {
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
                      {sortKey === key && (
                        <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-left font-semibold text-blue-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading campaigns...</td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No active campaign is running</td></tr>
                ) : campaigns.map(c => {
                  const status = getCampaignStatus(c);
                  const editable = isEditable(c);
                  return (
                    <tr key={c.id} className="border-t hover:bg-blue-50 transition">
                      <td className="px-2 py-2 font-medium text-gray-900 truncate max-w-[180px]">{c.name}</td>
                      <td className="px-2 py-2 text-gray-700 truncate max-w-[220px]">{c.description || '-'}</td>
                      <td className="px-2 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'Published Running' ? 'bg-green-100 text-green-700' : status === 'Expired' ? 'bg-gray-200 text-gray-500' : status === 'Published' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{status}</span>
                      </td>
                      <td className="px-2 py-2">{c.startDate}</td>
                      <td className="px-2 py-2">{c.endDate}</td>
                      <td className="px-2 py-2">
                        <div className="flex flex-col gap-2 items-stretch">
                          <div className="relative group">
                            <Button variant="secondary" size="sm" className="w-full" onClick={() => editable ? handleEdit(c) : setShowEditInfo(c.id)} disabled={!editable} onMouseEnter={() => !editable && setShowEditInfo(c.id)} onMouseLeave={() => setShowEditInfo(null)}>
                              Edit
                            </Button>
                            {!editable && showEditInfo === c.id && (
                              <div className="absolute left-full top-0 ml-2 z-20 bg-white border border-gray-300 rounded shadow-lg p-3 w-64 text-xs text-gray-700 animate-fadein">
                                You can only edit a campaign if it is not <b>Published Running</b>.<br/>To edit, unpublish or wait until the campaign is not running.
                              </div>
                            )}
                          </div>
                          <Button variant={c.status === 'published' ? 'outline' : 'default'} size="sm" className={`w-full ${c.status !== 'published' ? 'bg-green-600 text-white hover:bg-green-700' : ''}`} onClick={() => handlePublish(c.id)}>
                            {c.status === 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(c.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end items-center mt-4">
            <div className="flex gap-2">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow hover:scale-105 transition-transform font-semibold text-lg disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow hover:scale-105 transition-transform font-semibold text-lg disabled:opacity-50"
                disabled={page === Math.ceil(total / PAGE_SIZE)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
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
          {/* Edit Info Modal */}
          {showEditInfo && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative animate-fadein">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowEditInfo(null)}>&times;</button>
                <h3 className="text-lg font-bold mb-4 text-blue-700">Edit Not Allowed</h3>
                <p className="mb-6 text-gray-700">You can only edit a campaign if it is not running ("Published Running").<br />Please unpublish or wait until the campaign is not running to edit.</p>
                <div className="flex justify-end">
                  <Button variant="default" onClick={() => setShowEditInfo(null)}>OK</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
