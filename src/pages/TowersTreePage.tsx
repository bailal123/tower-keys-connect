import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useNotifications } from '../hooks/useNotificationContext';
import { towerAPI, countryAPI, cityAPI, areaAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Building2, MapPin, Users, ChevronRight, Edit, Loader2, Box, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TowerRow {
  id: number;
  arabicName: string;
  englishName: string;
  countryId?: number;
  cityId?: number;
  areaId?: number;
  totalFloors?: number;
  totalBlocks?: number;
  unitsPerFloor?: number;
  definitionStage?: number;
  isActive?: boolean;
  createdAt?: string;
}

interface NamedLookup {
  id: number;
  arabicName?: string;
  englishName?: string;
}

const TowersTreePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { showError } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [towers, setTowers] = useState<TowerRow[]>([]);
  const [countries, setCountries] = useState<NamedLookup[]>([]);
  const [cities, setCities] = useState<NamedLookup[]>([]);
  const [areas, setAreas] = useState<NamedLookup[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 20;
  
  const [filters, setFilters] = useState<{
    countryId: number | '';
    cityId: number | '';
    areaId: number | '';
    search: string;
    active: string;
    stage: string;
  }>({
    countryId: '',
    cityId: '',
    areaId: '',
    search: '',
    active: '',
    stage: '',
  });

  // No tree state needed - clicking navigates to detail page

  // Load lookups once
  useEffect(() => {
    (async () => {
      try {
        const c = await countryAPI.getAll(true, language);
        setCountries(c.data?.data || c.data || []);
      } catch {
        showError(t('error'), '');
      }
    })();
  }, [language, t, showError]);

  useEffect(() => {
    if (!filters.countryId) {
      setCities([]);
      setFilters(f => ({ ...f, cityId: '', areaId: '' }));
      return;
    }
    (async () => {
      try {
        const c = await cityAPI.getAll(true, Number(filters.countryId), language);
        setCities(c.data?.data || c.data || []);
      } catch {
        showError(t('error'), '');
      }
    })();
  }, [filters.countryId, language, t, showError]);

  useEffect(() => {
    if (!filters.cityId) {
      setAreas([]);
      setFilters(f => ({ ...f, areaId: '' }));
      return;
    }
    (async () => {
      try {
        const a = await areaAPI.getAll(true, Number(filters.cityId), language);
        setAreas(a.data?.data || a.data || []);
      } catch {
        showError(t('error'), '');
      }
    })();
  }, [filters.cityId, language, t, showError]);

  const fetchTowers = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await towerAPI.getAll(
        true,
        filters.countryId ? Number(filters.countryId) : null,
        filters.cityId ? Number(filters.cityId) : null,
        filters.areaId ? Number(filters.areaId) : null,
        null,
        language,
        currentPage,
        pageSize
      );
      const raw = resp.data?.data || resp.data || [];
      const rows: TowerRow[] = Array.isArray(raw)
        ? raw.map((r: TowerRow) => ({
            id: r.id,
            arabicName: r.arabicName || '',
            englishName: r.englishName || '',
            countryId: r.countryId,
            cityId: r.cityId,
            areaId: r.areaId,
            totalFloors: r.totalFloors,
            totalBlocks: r.totalBlocks,
            unitsPerFloor: r.unitsPerFloor,
            definitionStage: r.definitionStage,
            isActive: r.isActive,
            createdAt: r.createdAt,
          }))
        : [];
      setTowers(rows);
      
      // تحديث معلومات الـ pagination
      if (resp.data?.pagination) {
        const pag = resp.data.pagination;
        setTotalPages(pag.last_page || 1);
        setTotalRows(pag.total_row || 0);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error?.response?.data?.message || t('error'), '');
    } finally {
      setLoading(false);
    }
  }, [filters, language, currentPage, pageSize, showError, t]);

  useEffect(() => {
    fetchTowers();
  }, [fetchTowers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Navigation handled via onClick on cards

  // Filter towers
  const filtered = towers.filter(t => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (
        !t.arabicName?.toLowerCase().includes(s) &&
        !t.englishName?.toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    if (filters.active === 'active' && !t.isActive) return false;
    if (filters.active === 'inactive' && t.isActive) return false;
    if (filters.stage && t.definitionStage !== Number(filters.stage)) return false;
    return true;
  });

  // Render functions
  const renderTowerCard = (tower: TowerRow) => {
    const countryName = countries.find(c => c.id === tower.countryId)?.[language === 'ar' ? 'arabicName' : 'englishName'] || '';
    const cityName = cities.find(c => c.id === tower.cityId)?.[language === 'ar' ? 'arabicName' : 'englishName'] || '';
    const areaName = areas.find(a => a.id === tower.areaId)?.[language === 'ar' ? 'arabicName' : 'englishName'] || '';
    
    const definitionStage = tower.definitionStage || 0;
    const progress = (definitionStage / 5) * 100;

    return (
      <Card 
        key={tower.id}
        className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0"
        onClick={() => navigate(`/tower-tree/${tower.id}`)}
      >
        {/* Card Image/Icon Header */}
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 text-white">
          <div className="absolute top-4 right-4">
            <Badge variant={tower.isActive ? 'success' : 'neutral'} className="shadow-lg">
              {tower.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'متوقف' : 'Inactive')}
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm mb-3 group-hover:scale-110 transition-transform">
              <Building2 className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold mb-1 line-clamp-2 min-h-[56px]">
              {language === 'ar' ? tower.arabicName : tower.englishName}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 bg-white">
          {/* Location */}
          <div className="flex items-start gap-2 mb-4 text-gray-600 min-h-[48px]">
            <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-blue-500" />
            <span className="text-sm line-clamp-2">
              {[countryName, cityName, areaName].filter(Boolean).join(' • ') || (language === 'ar' ? 'غير محدد' : 'Not specified')}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <Box className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-700">{tower.totalBlocks || 0}</div>
              <div className="text-xs text-gray-600 font-medium">{language === 'ar' ? 'بلوك' : 'Block'}</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <Layers className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-700">{tower.totalFloors || 0}</div>
              <div className="text-xs text-gray-600 font-medium">{language === 'ar' ? 'طابق' : 'Floor'}</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-700">{tower.unitsPerFloor || 0}</div>
              <div className="text-xs text-gray-600 font-medium">{language === 'ar' ? 'شقة' : 'Unit'}</div>
            </div>
          </div>

          {/* Definition Stage Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2 font-medium">
              <span>{language === 'ar' ? 'مرحلة التعريف' : 'Definition Stage'}</span>
              <span className="text-blue-600 font-bold">
                {definitionStage}/5
              </span>
            </div>
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/building-builder/${tower.id}`);
              }}
              className="flex-1 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/tower-tree/${tower.id}`)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">{language === 'ar' ? 'الأبراج' : 'Towers'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'الدولة' : 'Country'}</label>
            <select
              value={filters.countryId}
              onChange={e => setFilters(f => ({ ...f, countryId: e.target.value ? Number(e.target.value) : '' }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>
                  {language === 'ar' ? c.arabicName : c.englishName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'المدينة' : 'City'}</label>
            <select
              value={filters.cityId}
              onChange={e => setFilters(f => ({ ...f, cityId: e.target.value ? Number(e.target.value) : '' }))}
              className="mt-1 w-full border rounded px-2 py-2"
              disabled={!filters.countryId}
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>
                  {language === 'ar' ? c.arabicName : c.englishName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'المنطقة' : 'Area'}</label>
            <select
              value={filters.areaId}
              onChange={e => setFilters(f => ({ ...f, areaId: e.target.value ? Number(e.target.value) : '' }))}
              className="mt-1 w-full border rounded px-2 py-2"
              disabled={!filters.cityId}
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>
                  {language === 'ar' ? a.arabicName : a.englishName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'الحالة' : 'Status'}</label>
            <select
              value={filters.active}
              onChange={e => setFilters(f => ({ ...f, active: e.target.value }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="inactive">{language === 'ar' ? 'متوقف' : 'Inactive'}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'مرحلة التعريف' : 'Definition Stage'}</label>
            <select
              value={filters.stage}
              onChange={e => setFilters(f => ({ ...f, stage: e.target.value }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              {[1, 2, 3, 4, 5].map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'بحث' : 'Search'}</label>
            <Input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({ countryId: '', cityId: '', areaId: '', search: '', active: '', stage: '' })
            }
          >
            {language === 'ar' ? 'تفريغ' : 'Reset'}
          </Button>
          <Button onClick={fetchTowers}>{language === 'ar' ? 'تحديث' : 'Refresh'}</Button>
        </div>
      </Card>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center text-gray-500">
              {language === 'ar' ? 'لا توجد أبراج' : 'No towers found'}
            </Card>
          </div>
        ) : (
          filtered.map(tower => renderTowerCard(tower))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="mt-6 p-4">
          <div className="flex flex-col items-center gap-4">
            {/* عرض عدد النتائج */}
            <div className="text-sm text-gray-600">
              {language === 'ar' 
                ? `إجمالي ${totalRows} برج (الصفحة ${currentPage} من ${totalPages})`
                : `Total ${totalRows} towers (Page ${currentPage} of ${totalPages})`}
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="shadow-md"
              >
                {language === 'ar' ? 'السابق' : 'Previous'}
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 10) {
                    pageNum = i + 1;
                  } else if (currentPage <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 5) {
                    pageNum = totalPages - 9 + i;
                  } else {
                    pageNum = currentPage - 5 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 ${pageNum === currentPage ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="shadow-md"
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TowersTreePage;
