import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useNotifications } from '../hooks/useNotificationContext';
import { unitAPI, towerAPI, blockAPI, unitDesignAPI } from '../services/api';
import { DataTableWithViews, type Column } from '../components/ui/DataTableWithViews';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Home, Building2, Layers, DollarSign, MapPin, Tag } from 'lucide-react';

interface UnitRow {
  id: number;
  unitNumber?: string;
  unitCode?: string;
  floorCode?: string;
  blockName?: string;
  towerName?: string;
  type?: string;
  status?: string;
  designName?: string;
  area?: number;
  finalRentPrice?: number;
  finalSalePrice?: number;
  blockFloorId?: number;
  towerId?: number;
  unitDesignId?: number;
  [key: string]: unknown;
}

interface LookupItem {
  id: number;
  arabicName?: string;
  englishName?: string;
  name?: string;
}

const ResidentialUnitsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [towers, setTowers] = useState<LookupItem[]>([]);
  const [blocks, setBlocks] = useState<LookupItem[]>([]);
  const [designs, setDesigns] = useState<LookupItem[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 20;
  
  const [filters, setFilters] = useState<{
    towerId: number | '';
    blockId: number | '';
    designId: number | '';
    status: string;
    type: string;
    minPrice: string;
    maxPrice: string;
    search: string;
  }>({
    towerId: '',
    blockId: '',
    designId: '',
    status: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  // Load lookups
  useEffect(() => {
    (async () => {
      try {
        const t = await towerAPI.getAll(true, null, null, null, null, language);
        setTowers(t.data?.data || []);
      } catch {
        showError(t('error'), '');
      }
    })();
  }, [language, t, showError]);

  useEffect(() => {
    (async () => {
      try {
        const b = await blockAPI.getAll(true, language);
        setBlocks(b.data?.data || []);
      } catch {
        showError(t('error'), '');
      }
    })();
  }, [language, t, showError]);

  useEffect(() => {
    (async () => {
      try {
        const d = await unitDesignAPI.getAll(true, null, null, null, null, null, null, null, language);
        setDesigns(d.data?.data || []);
      } catch {
        showError(t('error'), '');
      }
    })();
  }, [language, t, showError]);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        onlyActive: true
      };
      if (filters.towerId) params.towerId = Number(filters.towerId);
      if (filters.blockId) params.blockId = Number(filters.blockId);
      if (filters.designId) params.unitDesignId = Number(filters.designId);
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.searchTerm = filters.search;

      const resp = await unitAPI.getAllAdvanced(params, language, currentPage, pageSize);
      const raw = resp.data?.data || resp.data || [];
      const rows: UnitRow[] = Array.isArray(raw) ? raw.map((r: UnitRow) => ({
        id: r.id,
        unitNumber: r.unitNumber || '',
        unitCode: r.unitCode || '',
        floorCode: r.floorCode || '',
        blockName: r.blockName || '',
        towerName: r.towerName || '',
        type: r.type || '',
        status: r.status || '',
        designName: r.designName || '',
        area: r.area,
        finalRentPrice: r.finalRentPrice,
        finalSalePrice: r.finalSalePrice,
        blockFloorId: r.blockFloorId,
        towerId: r.towerId,
        unitDesignId: r.unitDesignId
      })) : [];
      setUnits(rows);
      
      // تحديث معلومات الـ pagination
      if (resp.data?.pagination) {
        const pag = resp.data.pagination;
        setTotalPages(pag.last_page || 1);
        setTotalRows(pag.total_row || 0);
      }
    } catch {
      showError(t('error'), '');
    } finally {
      setLoading(false);
    }
  }, [filters, language, currentPage, pageSize, t, showError]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filtered = useMemo(() => {
    return units.filter(unit => {
      // Client-side price filtering
      if (filters.minPrice) {
        const minPrice = Number(filters.minPrice);
        const price = unit.finalSalePrice || unit.finalRentPrice || 0;
        if (price < minPrice) return false;
      }
      if (filters.maxPrice) {
        const maxPrice = Number(filters.maxPrice);
        const price = unit.finalSalePrice || unit.finalRentPrice || 0;
        if (price > maxPrice) return false;
      }
      return true;
    });
  }, [units, filters]);

  const columns: Column<UnitRow>[] = [
    { key: 'id', title: 'ID', sortable: true, width: '60px' },
    { key: 'unitNumber', title: language === 'ar' ? 'رقم الوحدة' : 'Unit Number', sortable: true },
    { key: 'unitCode', title: language === 'ar' ? 'كود الوحدة' : 'Unit Code', sortable: true },
    { key: 'floorCode', title: language === 'ar' ? 'كود الطابق' : 'Floor Code' },
    { key: 'blockName', title: language === 'ar' ? 'البلوك' : 'Block' },
    { key: 'towerName', title: language === 'ar' ? 'البرج' : 'Tower' },
    { key: 'type', title: language === 'ar' ? 'النوع' : 'Type' },
    { key: 'status', title: language === 'ar' ? 'الحالة' : 'Status' },
    { key: 'designName', title: language === 'ar' ? 'التصميم' : 'Design' },
    {
      key: 'area',
      title: language === 'ar' ? 'المساحة (م²)' : 'Area (m²)',
      sortable: true,
      render: (v) => v ? Number(v).toFixed(2) : '-'
    },
    {
      key: 'finalRentPrice',
      title: language === 'ar' ? 'سعر الإيجار' : 'Rent Price',
      sortable: true,
      render: (v) => v ? `${Number(v).toLocaleString()}` : '-'
    },
    {
      key: 'finalSalePrice',
      title: language === 'ar' ? 'سعر البيع' : 'Sale Price',
      sortable: true,
      render: (v) => v ? `${Number(v).toLocaleString()}` : '-'
    }
  ];

  const renderUnitCard = (unit: UnitRow) => {
    const price = unit.finalSalePrice || unit.finalRentPrice || 0;
    const priceType = unit.finalSalePrice ? (language === 'ar' ? 'بيع' : 'Sale') : (language === 'ar' ? 'إيجار' : 'Rent');
    const statusColor = unit.status === 'Available' ? 'bg-green-100 text-green-700' :
                       unit.status === 'Sold' ? 'bg-red-100 text-red-700' :
                       unit.status === 'Rented' ? 'bg-blue-100 text-blue-700' :
                       'bg-yellow-100 text-yellow-700';

    return (
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{unit.unitCode || unit.unitNumber}</h3>
                <p className="text-xs text-gray-500">ID: {unit.id}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
              {language === 'ar' ? 
                (unit.status === 'Available' ? 'متاح' : 
                 unit.status === 'Sold' ? 'مباع' : 
                 unit.status === 'Rented' ? 'مؤجر' : 'محجوز') 
                : unit.status}
            </span>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{unit.towerName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {unit.blockName} - {unit.floorCode}
              </span>
            </div>

            {unit.designName && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{unit.designName}</span>
              </div>
            )}

            {unit.area && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{Number(unit.area).toFixed(2)} {language === 'ar' ? 'م²' : 'm²'}</span>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">{priceType}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {price.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {unit.type}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">{language === 'ar' ? 'الوحدات السكنية' : 'Residential Units'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'البرج' : 'Tower'}</label>
            <select
              value={filters.towerId}
              onChange={e => setFilters(f => ({ ...f, towerId: e.target.value ? Number(e.target.value) : '' }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              {towers.map(tw => (
                <option key={tw.id} value={tw.id}>
                  {language === 'ar' ? tw.arabicName : tw.englishName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'البلوك' : 'Block'}</label>
            <select
              value={filters.blockId}
              onChange={e => setFilters(f => ({ ...f, blockId: e.target.value ? Number(e.target.value) : '' }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              {blocks.map(bl => (
                <option key={bl.id} value={bl.id}>
                  {language === 'ar' ? bl.arabicName : bl.englishName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'التصميم' : 'Design'}</label>
            <select
              value={filters.designId}
              onChange={e => setFilters(f => ({ ...f, designId: e.target.value ? Number(e.target.value) : '' }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              {designs.map(ds => (
                <option key={ds.id} value={ds.id}>
                  {language === 'ar' ? ds.arabicName : ds.englishName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'الحالة' : 'Status'}</label>
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="Available">{language === 'ar' ? 'متاح' : 'Available'}</option>
              <option value="Sold">{language === 'ar' ? 'مباع' : 'Sold'}</option>
              <option value="Rented">{language === 'ar' ? 'مؤجر' : 'Rented'}</option>
              <option value="Reserved">{language === 'ar' ? 'محجوز' : 'Reserved'}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'النوع' : 'Type'}</label>
            <select
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full border rounded px-2 py-2"
            >
              <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="Residential">{language === 'ar' ? 'سكني' : 'Residential'}</option>
              <option value="Commercial">{language === 'ar' ? 'تجاري' : 'Commercial'}</option>
              <option value="Office">{language === 'ar' ? 'مكتبي' : 'Office'}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'الحد الأدنى للسعر' : 'Min Price'}</label>
            <Input
              type="number"
              value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
              placeholder={language === 'ar' ? 'من...' : 'From...'}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">{language === 'ar' ? 'الحد الأقصى للسعر' : 'Max Price'}</label>
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
              placeholder={language === 'ar' ? 'إلى...' : 'To...'}
              className="mt-1"
            />
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
            onClick={() => setFilters({
              towerId: '',
              blockId: '',
              designId: '',
              status: '',
              type: '',
              minPrice: '',
              maxPrice: '',
              search: ''
            })}
          >
            {language === 'ar' ? 'تفريغ' : 'Reset'}
          </Button>
          <Button onClick={fetchUnits}>{language === 'ar' ? 'تحديث' : 'Refresh'}</Button>
        </div>
      </Card>

      <DataTableWithViews
        data={filtered}
        columns={columns}
        loading={loading}
        searchable={false}
        renderCard={renderUnitCard}
        defaultView="cards"
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="mt-6 p-4">
          <div className="flex flex-col items-center gap-4">
            {/* عرض عدد النتائج */}
            <div className="text-sm text-gray-600">
              {language === 'ar' 
                ? `إجمالي ${totalRows} وحدة (الصفحة ${currentPage} من ${totalPages})`
                : `Total ${totalRows} units (Page ${currentPage} of ${totalPages})`}
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
                  // Show first 5 and last 5 pages if there are more than 10
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

export default ResidentialUnitsPage;
