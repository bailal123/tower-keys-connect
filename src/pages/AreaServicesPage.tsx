import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { areaAPI, areaServicesAPI, cityAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useNotifications } from '../hooks/useNotificationContext';
import type { AreaServiceListItem, CreateAreaServiceRequest, AreaServiceQueryParams } from '../types/api';
import { MapPin, Plus, RefreshCw, Search, Filter, List, Save } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLocationPicker from '../components/ui/MapLocationPicker.tsx';
import PlacesAutocomplete from '../components/ui/PlacesAutocomplete';

const serviceCategories = [
  { value: 'health', labelAr: 'صحة', labelEn: 'Health' },
  { value: 'education', labelAr: 'تعليم', labelEn: 'Education' },
  { value: 'food', labelAr: 'طعام', labelEn: 'Food' },
  { value: 'shopping', labelAr: 'تسوق', labelEn: 'Shopping' },
  { value: 'transportation', labelAr: 'مواصلات', labelEn: 'Transportation' },
  { value: 'finance', labelAr: 'مالية', labelEn: 'Finance' },
  { value: 'automotive', labelAr: 'سيارات', labelEn: 'Automotive' },
  { value: 'sports', labelAr: 'رياضة', labelEn: 'Sports' },
  { value: 'entertainment', labelAr: 'ترفيه', labelEn: 'Entertainment' },
  { value: 'government', labelAr: 'حكومي', labelEn: 'Government' },
];

const priorities = [
  { value: 1, labelAr: 'عالية', labelEn: 'High' },
  { value: 2, labelAr: 'متوسطة', labelEn: 'Medium' },
  { value: 3, labelAr: 'منخفضة', labelEn: 'Low' },
];

const AreaServicesPage: React.FC = () => {
  const { language } = useLanguage();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(false);
  // TODO: Replace with concrete Area & City interfaces if available in types/api
  interface BasicNamedEntity { id: number; arabicName?: string; englishName?: string; }
  const [areas, setAreas] = useState<BasicNamedEntity[]>([]);
  const [cities, setCities] = useState<BasicNamedEntity[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [services, setServices] = useState<AreaServiceListItem[]>([]);
  const [filters, setFilters] = useState<AreaServiceQueryParams>({ isActive: true });
  const [search, setSearch] = useState('');
  const [createForm, setCreateForm] = useState<Partial<CreateAreaServiceRequest>>({ isActive: true, priority: 2 });
  const [creating, setCreating] = useState(false);
  const GOOGLE_PLACES_KEY = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_PLACES_API_KEY;

  const mapGoogleTypesToCategory = (types?: string[]): string | undefined => {
    if (!types || !types.length) return undefined;
    const lower = types.map(t => t.toLowerCase());
    if (lower.some(t => t.includes('hospital') || t.includes('clinic') || t.includes('health'))) return 'health';
    if (lower.some(t => t.includes('school') || t.includes('university') || t.includes('education'))) return 'education';
    if (lower.some(t => t.includes('restaurant') || t.includes('food') || t.includes('cafe'))) return 'food';
    if (lower.some(t => t.includes('store') || t.includes('shopping') || t.includes('mall') || t.includes('supermarket'))) return 'shopping';
    if (lower.some(t => t.includes('bus') || t.includes('transit') || t.includes('station') || t.includes('transport'))) return 'transportation';
    if (lower.some(t => t.includes('bank') || t.includes('atm') || t.includes('finance'))) return 'finance';
    if (lower.some(t => t.includes('car') || t.includes('auto'))) return 'automotive';
    if (lower.some(t => t.includes('gym') || t.includes('sport'))) return 'sports';
    if (lower.some(t => t.includes('cinema') || t.includes('movie') || t.includes('entertain') || t.includes('theatre'))) return 'entertainment';
    if (lower.some(t => t.includes('government') || t.includes('courthouse') || t.includes('embassy'))) return 'government';
    return undefined;
  };

  // Load cities & areas
  useEffect(() => {
    const load = async () => {
      try {
        const cityRes = await cityAPI.getAll(true, null, language);
        const citiesData = cityRes?.data?.data || cityRes?.data || [];
        setCities(citiesData);
      } catch (err) {
        console.error('Failed loading cities', err);
      }
    };
    load();
  }, [language]);

  useEffect(() => {
    const loadAreas = async () => {
      if (!selectedCity) { setAreas([]); return; }
      try {
        const areaRes = await areaAPI.getAll(true, selectedCity, language);
        const areaData = areaRes?.data?.data || areaRes?.data || [];
        setAreas(areaData);
      } catch (err) { console.error('Failed loading areas', err); }
    };
    loadAreas();
  }, [selectedCity, language]);

  const loadServices = async () => {
    if (!selectedArea) return;
    setLoading(true);
    try {
      const res = await areaServicesAPI.getAll({ ...filters, areaId: selectedArea, searchTerm: search || undefined }, language);
      const list = res?.data?.data || res?.data || [];
      setServices(list);
    } catch (err) {
      console.error('Failed loading services', err);
      addNotification({ type: 'error', message: language === 'ar' ? 'فشل تحميل الخدمات' : 'Failed to load services' });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadServices(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, filters, language]);

  const resetCreateForm = () => setCreateForm({ isActive: true, priority: 2, areaId: selectedArea || undefined });

  const handleCreate = async () => {
    if (!selectedArea) {
      addNotification({ type: 'warning', message: language === 'ar' ? 'اختر منطقة أولاً' : 'Select area first' });
      return;
    }
    if (!createForm.arabicName || !createForm.englishName || !createForm.serviceType || !createForm.serviceCategory) {
      addNotification({ type: 'warning', message: language === 'ar' ? 'اكمل الحقول الأساسية' : 'Complete required fields' });
      return;
    }
    setCreating(true);
    try {
      const payload: CreateAreaServiceRequest = {
        arabicName: createForm.arabicName!,
        englishName: createForm.englishName!,
        serviceType: createForm.serviceType!,
        serviceCategory: createForm.serviceCategory!,
        areaId: selectedArea,
        isActive: createForm.isActive ?? true,
        priority: createForm.priority ?? 2,
        arabicDescription: createForm.arabicDescription,
        englishDescription: createForm.englishDescription,
        googleRating: createForm.googleRating,
        distanceInKilometers: createForm.distanceInKilometers,
        googlePlaceId: createForm.googlePlaceId,
        googlePlaceName: createForm.googlePlaceName,
        googleMapsUrl: createForm.googleMapsUrl,
        latitude: createForm.latitude,
        longitude: createForm.longitude,
        phoneNumber: createForm.phoneNumber,
        address: createForm.address,
        notes: createForm.notes,
      };
      await areaServicesAPI.create(payload, language);
      addNotification({ type: 'success', message: language === 'ar' ? 'تم إنشاء الخدمة' : 'Service created' });
      resetCreateForm();
      loadServices();
    } catch (e) {
      console.error(e);
      addNotification({ type: 'error', message: language === 'ar' ? 'فشل الإنشاء' : 'Creation failed' });
    } finally { setCreating(false); }
  };

  const categoryOptions = useMemo(() => serviceCategories.map(c => ({ value: c.value, label: language === 'ar' ? c.labelAr : c.labelEn })), [language]);
  const priorityOptions = useMemo(() => priorities.map(p => ({ value: p.value, label: language === 'ar' ? p.labelAr : p.labelEn })), [language]);

  return (
    <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            {language === 'ar' ? 'خدمات المناطق' : 'Area Services'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'ar' ? 'إدارة الخدمات المحيطة وربطها بالمناطق' : 'Manage nearby services linked to areas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadServices} variant="outline" disabled={loading} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" /> {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{language === 'ar' ? 'المدينة' : 'City'}</label>
            <Select value={selectedCity?.toString() || ''} onChange={(v) => { setSelectedCity(v ? parseInt(v as string, 10) : null); setSelectedArea(null); }}
              options={cities.map(c => ({ value: c.id, label: (language === 'ar' ? c.arabicName : c.englishName) || '' }))} placeholder={language === 'ar' ? 'اختر مدينة' : 'Select city'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{language === 'ar' ? 'المنطقة' : 'Area'}</label>
            <Select value={selectedArea?.toString() || ''} onChange={(v) => setSelectedArea(v ? parseInt(v as string, 10) : null)}
              options={areas.map(a => ({ value: a.id, label: (language === 'ar' ? a.arabicName : a.englishName) || '' }))} placeholder={language === 'ar' ? 'اختر منطقة' : 'Select area'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{language === 'ar' ? 'التصنيف' : 'Category'}</label>
            <Select value={filters.serviceCategory || ''} onChange={(v) => setFilters(f => ({ ...f, serviceCategory: (typeof v === 'string' ? v : '') || undefined }))}
              options={categoryOptions} placeholder={language === 'ar' ? 'كل التصنيفات' : 'All categories'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{language === 'ar' ? 'الأولوية' : 'Priority'}</label>
            <Select value={filters.priority?.toString() || ''} onChange={(v) => setFilters(f => ({ ...f, priority: v ? parseInt(v as string, 10) : undefined }))}
              options={priorityOptions} placeholder={language === 'ar' ? 'كل الأولويات' : 'All priorities'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{language === 'ar' ? 'بحث' : 'Search'}</label>
            <div className="relative">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={language === 'ar' ? 'اسم أو وصف' : 'Name or description'}
                className="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 pr-8" />
              <Search className="h-4 w-4 absolute top-1/2 -translate-y-1/2 right-2 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button onClick={loadServices} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
            <Filter className="h-4 w-4" /> {language === 'ar' ? 'تطبيق' : 'Apply'}
          </Button>
          <Button variant="outline" onClick={() => { setFilters({ isActive: true }); setSearch(''); }}>
            {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
          </Button>
        </div>
      </Card>

      {/* Create form */}
      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <Plus className="h-5 w-5 text-green-600" /> {language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'بحث (جوجل بلايسز)' : 'Search (Google Places)'}</label>
              <PlacesAutocomplete
                apiKey={GOOGLE_PLACES_KEY}
                language={language === 'ar' ? 'ar' : 'en'}
                onPlaceSelected={(p) => {
                  setCreateForm(f => ({
                    ...f,
                    googlePlaceId: p.placeId,
                    googlePlaceName: p.name,
                    arabicName: f.arabicName || (language === 'ar' ? p.name : f.arabicName),
                    englishName: f.englishName || (language === 'en' ? p.name : f.englishName),
                    latitude: p.lat ?? f.latitude,
                    longitude: p.lng ?? f.longitude,
                    address: p.formattedAddress || f.address,
                    phoneNumber: p.intlPhone || f.phoneNumber,
                    websiteUrl: p.website || f.websiteUrl,
                    googleRating: p.rating ?? f.googleRating,
                    serviceCategory: f.serviceCategory || mapGoogleTypesToCategory(p.types) || f.serviceCategory,
                  }));
                  // Scroll to coordinates area if we just added them
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'الاسم (ع)' : 'Name (Ar)'}</label>
              <Input value={createForm.arabicName || ''} onChange={e => setCreateForm(f => ({ ...f, arabicName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'الاسم (En)' : 'Name (En)'}</label>
              <Input value={createForm.englishName || ''} onChange={e => setCreateForm(f => ({ ...f, englishName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'النوع' : 'Type'}</label>
              <Input value={createForm.serviceType || ''} onChange={e => setCreateForm(f => ({ ...f, serviceType: e.target.value }))} placeholder={language === 'ar' ? 'مثل: hospital' : 'e.g. hospital'} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'التصنيف' : 'Category'}</label>
              <Select value={createForm.serviceCategory || ''} onChange={v => setCreateForm(f => ({ ...f, serviceCategory: typeof v === 'string' ? v : '' }))} options={categoryOptions} placeholder={language === 'ar' ? 'التصنيف' : 'Category'} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'الأولوية' : 'Priority'}</label>
              <Select value={createForm.priority?.toString() || '2'} onChange={v => setCreateForm(f => ({ ...f, priority: v ? parseInt(v as string, 10) : 2 }))} options={priorityOptions} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Google Rating</label>
              <Input type="number" step="0.1" value={createForm.googleRating?.toString() || ''} onChange={e => setCreateForm(f => ({ ...f, googleRating: e.target.value ? parseFloat(e.target.value) : undefined }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'المسافة (كم)' : 'Distance (Km)'}</label>
              <Input type="number" step="0.01" value={createForm.distanceInKilometers?.toString() || ''} onChange={e => setCreateForm(f => ({ ...f, distanceInKilometers: e.target.value ? parseFloat(e.target.value) : undefined }))} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <label className="text-xs font-medium">{language === 'ar' ? 'نشط' : 'Active'}</label>
              <input type="checkbox" checked={createForm.isActive !== false} onChange={e => setCreateForm(f => ({ ...f, isActive: e.target.checked }))} />
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Google Place Id</label>
                <Input value={createForm.googlePlaceId || ''} onChange={e => setCreateForm(f => ({ ...f, googlePlaceId: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Google Place Name</label>
                <Input value={createForm.googlePlaceName || ''} onChange={e => setCreateForm(f => ({ ...f, googlePlaceName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Latitude</label>
                <Input value={createForm.latitude?.toString() || ''} onChange={e => setCreateForm(f => ({ ...f, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Longitude</label>
                <Input value={createForm.longitude?.toString() || ''} onChange={e => setCreateForm(f => ({ ...f, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
              </div>
            </div>
            <MapLocationPicker
              latitude={createForm.latitude}
              longitude={createForm.longitude}
              language={language === 'ar' ? 'ar' : 'en'}
              onChange={(lat: number, lng: number) => setCreateForm(f => ({ ...f, latitude: lat, longitude: lng }))}
              height={240}
            />
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</label>
              <Input value={createForm.address || ''} onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Phone</label>
                <Input value={createForm.phoneNumber || ''} onChange={e => setCreateForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Website URL</label>
                <Input value={createForm.websiteUrl || ''} onChange={e => setCreateForm(f => ({ ...f, websiteUrl: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'وصف (ع)' : 'Description (Ar)'}</label>
                <Textarea rows={2} value={createForm.arabicDescription || ''} onChange={e => setCreateForm(f => ({ ...f, arabicDescription: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'وصف (En)' : 'Description (En)'}</label>
                <Textarea rows={2} value={createForm.englishDescription || ''} onChange={e => setCreateForm(f => ({ ...f, englishDescription: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{language === 'ar' ? 'ملاحظات' : 'Notes'}</label>
              <Textarea rows={2} value={createForm.notes || ''} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="pt-1 flex gap-2">
              <Button disabled={creating} onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                <Save className="h-4 w-4" /> {creating ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الخدمة' : 'Save Service')}
              </Button>
              <Button variant="outline" onClick={resetCreateForm}>{language === 'ar' ? 'تفريغ' : 'Clear'}</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Services list */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <List className="h-5 w-5 text-blue-600" /> {language === 'ar' ? 'قائمة الخدمات' : 'Services List'}
          </h2>
          <span className="text-xs text-gray-500">{services.length} {language === 'ar' ? 'خدمة' : 'items'}</span>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">{language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : services.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">{language === 'ar' ? 'لا توجد خدمات' : 'No services found'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="p-2 text-right">{language === 'ar' ? 'التصنيف' : 'Category'}</th>
                  <th className="p-2 text-right">{language === 'ar' ? 'التقييم' : 'Rating'}</th>
                  <th className="p-2 text-right">{language === 'ar' ? 'المسافة كم' : 'Distance Km'}</th>
                  <th className="p-2 text-right">{language === 'ar' ? 'الأولوية' : 'Priority'}</th>
                  <th className="p-2 text-right">{language === 'ar' ? 'نشط' : 'Active'}</th>
                  <th className="p-2 text-right">{language === 'ar' ? 'تحكم' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, idx) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-500">{idx + 1}</td>
                    <td className="p-2 font-medium">{language === 'ar' ? (s.arabicName || s.englishName) : (s.englishName || s.arabicName)}</td>
                    <td className="p-2 text-xs">{s.serviceCategory}</td>
                    <td className="p-2">{s.googleRating ?? '-'}</td>
                    <td className="p-2">{s.distanceInKilometers ?? '-'}</td>
                    <td className="p-2 text-xs">{s.priorityText || s.priority || '-'}</td>
                    <td className="p-2">{s.isActive ? '✔' : '✖'}</td>
                    <td className="p-2 text-xs text-blue-600 underline cursor-pointer whitespace-nowrap">{language === 'ar' ? 'تعديل' : 'Edit'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AreaServicesPage;
