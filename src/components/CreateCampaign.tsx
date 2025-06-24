import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MockAPIService } from '../services/mockApiService';
import { Image, Eye, Play, Pause, ChevronLeft, ChevronRight, X, BadgeCheck } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import citiesData from '../../public/mock/responses/cities-list.json';

const api = MockAPIService.getInstance();

// Types
interface Option { label: string; value: string; region?: string; id?: string | number; name?: string; state?: string; location?: string; zone?: string; city?: string; }
interface StoreOption { id: string | number; name: string; location: string; region?: string; state?: string; type?: string; zone?: string; city?: string; }
interface PlacementOption { id: string; name: string; isActive?: boolean; type?: string; storeTypes?: string[]; regions?: string[]; zones?: string[]; states?: string[]; cities?: string[]; stores?: (string | number)[]; }
interface TemplateOption { label: string; value: string; duration: number; recommended?: boolean; }
interface UploadedImage { file: File; url: string; name: string; }

const initialCampaignData = {
  name: '',
  description: '',
  budget: '',
  conditions: { weather: [] as string[], traffic: '', footfall: '' },
  schedule: { startDate: '', startTime: '', endDate: '', endTime: '' },
  targeting: { locations: [] as string[], stores: [] as string[], placements: [] as string[] },
  media: { images: [] as UploadedImage[], template: '' }
};

export const CreateCampaign: React.FC = () => {
  // State
  const [campaignData, setCampaignData] = useState<typeof initialCampaignData>(initialCampaignData);
  const [weatherOptions, setWeatherOptions] = useState<Option[]>([]);
  const [trafficOptions, setTrafficOptions] = useState<Option[]>([]);
  const [footfallOptions, setFootfallOptions] = useState<Option[]>([]);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);
  const [regionOptions, setRegionOptions] = useState<Option[]>([]);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([]);
  const [cityOptions, setCityOptions] = useState<Option[]>([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredStates, setFilteredStates] = useState<Option[]>([]);
  const [filteredCities, setFilteredCities] = useState<Option[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreOption[]>([]);
  const [filteredPlacements, setFilteredPlacements] = useState<PlacementOption[]>([]);
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [placementOptions, setPlacementOptions] = useState<PlacementOption[]>([]);

  // --- State for multi-select ---
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);

  // Fetch dropdown/multi-select data from mock APIs
  useEffect(() => {
    api.loadMockFile('campaign-conditions.json').then((data) => {
      setWeatherOptions(data.weather);
      setTrafficOptions(data.traffic);
      setFootfallOptions(data.footfall);
    });
    api.loadMockFile('locations-list.json').then((data) => {
      setRegionOptions(data.regions);
      setLocationOptions(data.states);
    });
    api.loadMockFile('stores-list.json').then((data) => {
      setStoreOptions(data.stores);
    });
    api.loadMockFile('admin-placements.json').then((data) => {
      setPlacementOptions(data.success.placements);
    });
    api.loadMockFile('templates-list.json').then((data) => {
      setTemplateOptions(data.templates);
    });
    setCityOptions((citiesData as any).cities || []);
  }, []);

  // --- Filtering logic for multi-select ---
  useEffect(() => {
    // Filter states by selected zones
    if (selectedZones.length) {
      setFilteredStates(locationOptions.filter(s => selectedZones.includes((s as any).zone)));
    } else {
      setFilteredStates(locationOptions);
    }
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedStores([]);
    setSelectedPlacements([]);
  }, [selectedZones, locationOptions]);

  useEffect(() => {
    // Filter cities by selected states
    if (selectedStates.length) {
      setFilteredCities(cityOptions.filter(c => selectedStates.includes((c as any).state)));
    } else if (selectedZones.length) {
      setFilteredCities(cityOptions.filter(c => selectedZones.includes((c as any).zone)));
    } else {
      setFilteredCities(cityOptions);
    }
    setSelectedCities([]);
    setSelectedStores([]);
    setSelectedPlacements([]);
  }, [selectedStates, selectedZones, cityOptions]);

  useEffect(() => {
    // Filter stores by selected cities
    let stores = storeOptions;
    if (selectedZones.length) stores = stores.filter(s => selectedZones.includes((s as any).zone));
    if (selectedStates.length) stores = stores.filter(s => selectedStates.includes((s as any).state));
    if (selectedCities.length) stores = stores.filter(s => selectedCities.includes((s as any).city));
    setFilteredStores(stores);
    setSelectedStores([]);
    setSelectedPlacements([]);
  }, [selectedZones, selectedStates, selectedCities, storeOptions]);

  useEffect(() => {
    // Filter placements by selected stores/cities/states/zones
    let placements = placementOptions;
    if (selectedStores.length) {
      const storeIds = selectedStores.map(String);
      placements = placements.filter(p => p.stores && p.stores.some((id: string | number) => storeIds.includes(String(id))));
    } else if (selectedCities.length) {
      placements = placements.filter(p => p.cities && p.cities.some((id: string) => selectedCities.includes(id)));
    } else if (selectedStates.length) {
      placements = placements.filter(p => p.states && p.states.some((id: string) => selectedStates.includes(id)));
    } else if (selectedZones.length) {
      placements = placements.filter(p => p.zones && p.zones.some((id: string) => selectedZones.includes(id)));
    }
    setFilteredPlacements(placements);
    setSelectedPlacements([]);
  }, [selectedStores, selectedCities, selectedStates, selectedZones, placementOptions]);

  // Intelligent filtering for stores based on selected locations
  useEffect(() => {
    if (!campaignData.targeting.locations.length) {
      setFilteredStores(storeOptions);
      return;
    }
    const selectedRegions = regionOptions.filter(r => campaignData.targeting.locations.includes(r.value)).map(r => r.value);
    const selectedStates = locationOptions.filter(s => campaignData.targeting.locations.includes(s.value)).map(s => s.value);
    setFilteredStores(
      storeOptions.filter(store =>
        (store.region && selectedRegions.includes(store.region)) || (store.state && selectedStates.includes(store.state))
      )
    );
  }, [campaignData.targeting.locations, storeOptions, regionOptions, locationOptions]);

  // Intelligent filtering for placements based on selected stores/regions
  useEffect(() => {
    if (!campaignData.targeting.stores.length) {
      setFilteredPlacements(placementOptions);
      return;
    }
    setFilteredPlacements(placementOptions.filter(p => p.isActive !== false));
  }, [campaignData.targeting.stores, placementOptions]);

  // Template auto-selection and disabling logic
  useEffect(() => {
    if (campaignData.media.images.length === 1) {
      setCampaignData((prev) => ({
        ...prev,
        media: { ...prev.media, template: 'single' }
      }));
    } else if (campaignData.media.images.length > 1 && campaignData.media.template === 'single') {
      setCampaignData((prev) => ({
        ...prev,
        media: { ...prev.media, template: 'slideshow' }
      }));
    }
  }, [campaignData.media.images.length]);

  // Auto-play logic for preview
  useEffect(() => {
    if (previewMode && autoPlay && campaignData.media.images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % campaignData.media.images.length);
      }, templateOptions.find(t => t.value === campaignData.media.template)?.duration || 3000);
      return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [previewMode, autoPlay, campaignData.media.images, campaignData.media.template, templateOptions]);

  // Drag and drop for images
  const onDrop = (acceptedFiles: File[]) => {
    const images: UploadedImage[] = acceptedFiles.map((file: File) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setCampaignData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        images: [...prev.media.images, ...images]
      }
    }));
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: true
  });

  // --- Enhanced Cross-Filtering Logic ---
  useEffect(() => {
    // Filter stores by selected locations
    let filtered = storeOptions;
    if (campaignData.targeting.locations.length) {
      const selectedRegions = regionOptions.filter(r => campaignData.targeting.locations.includes(r.value)).map(r => r.value);
      const selectedStates = locationOptions.filter(s => campaignData.targeting.locations.includes(s.value)).map(s => s.value);
      filtered = storeOptions.filter(store =>
        (store.region && selectedRegions.includes(store.region)) || (store.state && selectedStates.includes(store.state))
      );
    }
    // If stores are selected, filter locations to only those relevant to selected stores
    if (campaignData.targeting.stores.length) {
      filtered = filtered.filter(store => campaignData.targeting.stores.includes(store.id.toString()));
    }
    setFilteredStores(filtered);
  }, [campaignData.targeting.locations, campaignData.targeting.stores, storeOptions, regionOptions, locationOptions]);

  useEffect(() => {
    // Filter placements by selected stores and locations
    let filtered = placementOptions;
    if (campaignData.targeting.stores.length) {
      // Example: placements available only for selected stores' regions
      const selectedStoreObjs = storeOptions.filter(store => campaignData.targeting.stores.includes(store.id.toString()));
      const selectedRegions = Array.from(new Set(selectedStoreObjs.map(s => s.region)));
      filtered = placementOptions.filter(p => !p.regions || p.regions.some(r => selectedRegions.includes(r)));
    }
    if (campaignData.targeting.locations.length) {
      const selectedRegions = regionOptions.filter(r => campaignData.targeting.locations.includes(r.value)).map(r => r.value);
      filtered = filtered.filter(p => !p.regions || p.regions.some(r => selectedRegions.includes(r)));
    }
    if (campaignData.targeting.placements.length) {
      filtered = filtered.filter(p => campaignData.targeting.placements.includes(p.id));
    }
    setFilteredPlacements(filtered);
  }, [campaignData.targeting.stores, campaignData.targeting.locations, campaignData.targeting.placements, placementOptions, storeOptions, regionOptions]);

  // Handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaignData((prev) => ({ ...prev, [name]: value }));
  };
  const handleConditionChange = (type: 'weather' | 'traffic' | 'footfall', value: string | string[]) => {
    setCampaignData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [type]: value
      }
    }));
  };
  const handleMultiSelect = (type: 'locations' | 'stores' | 'placements', value: string) => {
    setCampaignData((prev) => {
      const arr = prev.targeting[type];
      return {
        ...prev,
        targeting: {
          ...prev.targeting,
          [type]: arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value]
        }
      };
    });
  };
  const handleMultiSelectArray = (type: 'locations' | 'stores' | 'placements', values: string[]) => {
    setCampaignData((prev) => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        [type]: values
      }
    }));
  };
  const handleSelectAll = (type: 'locations' | 'stores' | 'placements', options: Option[] | StoreOption[] | PlacementOption[]) => {
    setCampaignData((prev) => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        [type]: prev.targeting[type].length === options.length ? [] : options.map((o: any) => o.value || o.id)
      }
    }));
  };
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const images: UploadedImage[] = files.map((file: File) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setCampaignData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        images: [...prev.media.images, ...images]
      }
    }));
  };
  const handleImageDelete = (idx: number) => {
    setCampaignData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        images: prev.media.images.filter((_, i) => i !== idx)
      }
    }));
  };
  const handleTemplateChange = (value: string) => {
    setCampaignData((prev) => ({
      ...prev,
      media: { ...prev.media, template: value }
    }));
  };
  const handlePreview = () => {
    setPreviewMode(true);
    setCurrentSlide(0);
    setAutoPlay(campaignData.media.images.length > 1);
  };
  const closePreview = () => {
    setPreviewMode(false);
    setAutoPlay(false);
    setCurrentSlide(0);
  };

  // --- UI Rendering ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-6xl space-y-6">
          {/* Main sections use full width */}
          <Card className="rounded-xl shadow-lg bg-white w-full">
            <CardHeader>
              <CardTitle className="text-blue-700">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="text" name="name" value={campaignData.name} onChange={handleInputChange} placeholder="Campaign Name" className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" />
              <textarea name="description" value={campaignData.description} onChange={handleInputChange} placeholder="Description" className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" />
              <input type="number" name="budget" value={campaignData.budget} onChange={handleInputChange} placeholder="Budget" className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" />
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-lg bg-white w-full">
            <CardHeader>
              <CardTitle className="text-blue-700">Campaign Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {weatherOptions.map(option => (
                  <button key={option.value} onClick={() => handleConditionChange('weather', campaignData.conditions.weather.includes(option.value) ? campaignData.conditions.weather.filter(w => w !== option.value) : [...campaignData.conditions.weather, option.value])} className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${campaignData.conditions.weather.includes(option.value) ? 'bg-blue-600 text-white border-blue-700 scale-105 shadow' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}>{option.label}</button>
                ))}
              </div>
              <div className="flex gap-4">
                <select className="flex-1 p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" value={campaignData.conditions.traffic} onChange={e => handleConditionChange('traffic', e.target.value)}>
                  <option value="">Traffic Level</option>
                  {trafficOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <select className="flex-1 p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" value={campaignData.conditions.footfall} onChange={e => handleConditionChange('footfall', e.target.value)}>
                  <option value="">Footfall Level</option>
                  {footfallOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-lg bg-white w-full">
            <CardHeader>
              <CardTitle className="text-blue-700">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <input type="date" name="startDate" value={campaignData.schedule.startDate} onChange={e => setCampaignData(prev => ({ ...prev, schedule: { ...prev.schedule, startDate: e.target.value } }))} className="p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" />
              <input type="time" name="startTime" value={campaignData.schedule.startTime} onChange={e => setCampaignData(prev => ({ ...prev, schedule: { ...prev.schedule, startTime: e.target.value } }))} className="p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" />
              <input type="date" name="endDate" value={campaignData.schedule.endDate} onChange={e => setCampaignData(prev => ({ ...prev, schedule: { ...prev.schedule, endDate: e.target.value } }))} className="p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" />
              <input type="time" name="endTime" value={campaignData.schedule.endTime} onChange={e => setCampaignData(prev => ({ ...prev, schedule: { ...prev.schedule, endTime: e.target.value } }))} className="p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400" />
            </CardContent>
          </Card>
          <div className="space-y-8">
            <Card className="rounded-xl shadow-lg bg-white w-full">
              <CardHeader>
                <CardTitle className="text-blue-700">Targeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Geo Zone</label>
                    <select multiple className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400 h-32" value={selectedZones} onChange={e => setSelectedZones(Array.from(e.target.selectedOptions).map(o => o.value))}>
                      {regionOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-blue-700 mb-1">State</label>
                    <select multiple className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400 h-32" value={selectedStates} onChange={e => setSelectedStates(Array.from(e.target.selectedOptions).map(o => o.value))}>
                      {filteredStates.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-blue-700 mb-1">City</label>
                    <select multiple className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400 h-32" value={selectedCities} onChange={e => setSelectedCities(Array.from(e.target.selectedOptions).map(o => o.value))}>
                      {filteredCities.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Store</label>
                    <select multiple className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400 h-32" value={selectedStores} onChange={e => setSelectedStores(Array.from(e.target.selectedOptions).map(o => o.value))}>
                      {filteredStores.map(option => <option key={option.id} value={option.id}>{option.name} ({option.location})</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Placement</label>
                    <select multiple className="w-full p-2 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400 h-32" value={selectedPlacements} onChange={e => setSelectedPlacements(Array.from(e.target.selectedOptions).map(o => o.value))}>
                      {filteredPlacements.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-lg bg-white w-full">
              <CardHeader>
                <CardTitle className="text-blue-700">Media Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-blue-300 bg-white hover:bg-blue-50'}`}>
                  <input {...getInputProps()} />
                  <Image className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
                  <p className="text-blue-700 font-medium">Drag & drop images here, or click to select</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB each. Multiple images supported.</p>
                </div>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {campaignData.media.images.map((image, idx) => (
                    <div key={idx} className="relative group animate-fadein">
                      <img src={image.url} alt={image.name} className="w-20 h-20 object-cover rounded-md shadow group-hover:scale-105 transition-transform" />
                      <button onClick={() => handleImageDelete(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-80 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">{campaignData.media.images.length} image(s) selected</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-lg bg-white w-full">
              <CardHeader>
                <CardTitle className="text-blue-700">Template Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {templateOptions.map(template => (
                    <button key={template.value} onClick={() => handleTemplateChange(template.value)} disabled={campaignData.media.images.length < 2 && template.value !== 'single'} className={`flex-1 min-w-[120px] flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${campaignData.media.template === template.value ? 'border-blue-500 bg-blue-50 scale-105 shadow' : 'border-gray-200 bg-white hover:bg-blue-50'} ${campaignData.media.images.length < 2 && template.value !== 'single' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {template.value === 'single' && <Image className="w-8 h-8 text-blue-400 mb-1" />}
                      {template.value === 'slideshow' && <Play className="w-8 h-8 text-blue-400 mb-1" />}
                      <span className="font-medium text-blue-700">{template.label}</span>
                      <span className="text-xs text-gray-400">{template.duration ? `${template.duration / 1000}s` : 'Static'}</span>
                      {template.recommended && campaignData.media.images.length === 1 && <span className="text-xs text-green-600 font-semibold mt-1 animate-pulse">Recommended</span>}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-lg bg-white w-full">
              <CardHeader>
                <CardTitle className="text-blue-700">Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div><span className="font-semibold text-blue-700">Name:</span> {campaignData.name}</div>
                  <div><span className="font-semibold text-blue-700">Budget:</span> ${campaignData.budget}</div>
                  <div><span className="font-semibold text-blue-700">Weather:</span> {campaignData.conditions.weather.map(w => weatherOptions.find(opt => opt.value === w)?.label).join(', ')}</div>
                  <div><span className="font-semibold text-blue-700">Traffic:</span> {trafficOptions.find(opt => opt.value === campaignData.conditions.traffic)?.label}</div>
                  <div><span className="font-semibold text-blue-700">Footfall:</span> {footfallOptions.find(opt => opt.value === campaignData.conditions.footfall)?.label}</div>
                  <div><span className="font-semibold text-blue-700">Locations:</span> {campaignData.targeting.locations.map(l => regionOptions.concat(locationOptions).find(opt => opt.value === l)?.label).join(', ')}</div>
                  <div><span className="font-semibold text-blue-700">Stores:</span> {campaignData.targeting.stores.map(s => storeOptions.find(opt => opt.id.toString() === s)?.name).join(', ')}</div>
                  <div><span className="font-semibold text-blue-700">Placements:</span> {campaignData.targeting.placements.map(p => placementOptions.find(opt => opt.id === p)?.name).join(', ')}</div>
                  <div><span className="font-semibold text-blue-700">Images:</span> {campaignData.media.images.length}</div>
                  <div><span className="font-semibold text-blue-700">Template:</span> {templateOptions.find(opt => opt.value === campaignData.media.template)?.label}</div>
                </div>
              </CardContent>
            </Card>
            {/* CTA buttons below summary */}
            <div className="flex justify-end gap-4 w-full mt-4">
              <button onClick={handlePreview} disabled={!campaignData.media.images.length} className="flex items-center gap-2 bg-black/80 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all disabled:opacity-50 text-lg font-semibold">
                <Eye className="w-6 h-6" /> Preview
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg shadow hover:scale-105 transition-transform font-semibold text-lg">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Preview modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 animate-fadein">
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-8 py-4 bg-black/80">
              <span className="text-white text-xl font-bold">{campaignData.name || 'Campaign Preview'}</span>
              <button onClick={closePreview} className="text-white hover:text-red-400 transition-colors"><X className="w-7 h-7" /></button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              {campaignData.media.images.length > 0 && (
                <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center animate-fadein">
                  <img src={campaignData.media.images[currentSlide]?.url} alt={campaignData.media.images[currentSlide]?.name} className="rounded-xl shadow-2xl w-full max-w-md h-[320px] object-contain bg-black transition-all duration-500" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-8">
                    <button onClick={() => setCurrentSlide((currentSlide - 1 + campaignData.media.images.length) % campaignData.media.images.length)} className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAutoPlay(!autoPlay)} disabled={campaignData.media.images.length < 2} className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all disabled:opacity-50">
                        {autoPlay ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      <span className="text-white text-sm">{currentSlide + 1} / {campaignData.media.images.length}</span>
                    </div>
                    <button onClick={() => setCurrentSlide((currentSlide + 1) % campaignData.media.images.length)} className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"><ChevronRight className="w-6 h-6" /></button>
                  </div>
                </div>
              )}
              <div className="mt-8 text-white text-center animate-fadein">
                <div className="text-lg font-semibold">{templateOptions.find(opt => opt.value === campaignData.media.template)?.label}</div>
                <div className="text-xs text-gray-300">Auto-play: {autoPlay ? 'On' : 'Off'} | Interval: {templateOptions.find(opt => opt.value === campaignData.media.template)?.duration ? `${templateOptions.find(opt => opt.value === campaignData.media.template)?.duration / 1000}s` : 'Static'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};