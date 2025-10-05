import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useNotifications } from '../hooks/useNotificationContext';
import { towerAPI, countryAPI, cityAPI, areaAPI } from '../services/api';
import { DataTableWithViews, type Column } from '../components/ui/DataTableWithViews';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, MapPin, Calendar, Users } from 'lucide-react';
// (Select component not needed currently)

interface TowerRow {
  id: number;
  arabicName: string;
  englishName: string;
  countryId?: number;
  cityId?: number;
  areaId?: number;
  totalFloors?: number;
  unitsPerFloor?: number;
  definitionStage?: number;
  isActive?: boolean;
  [key: string]: unknown; // accommodate DataTable generic (Record<string, unknown>)
}

interface NamedLookup {
  id: number;
  arabicName?: string;
  englishName?: string;
}

const TowersPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [towers, setTowers] = useState<TowerRow[]>([]);
  const [countries, setCountries] = useState<NamedLookup[]>([]);
  const [cities, setCities] = useState<NamedLookup[]>([]);
  const [areas, setAreas] = useState<NamedLookup[]>([]);
  const [filters, setFilters] = useState<{countryId:number|'';cityId:number|'';areaId:number|'';search:string;active:string;stage:string}>({countryId:'',cityId:'',areaId:'',search:'',active:'',stage:''});

  // Load lookups
  useEffect(()=>{ (async()=>{ try { const c = await countryAPI.getAll(true, language); setCountries(c.data?.data||[]);} catch { showError(t('error'),''); }})(); },[language,t,showError]);
  useEffect(()=>{ if(!filters.countryId) { setCities([]); setFilters(f=>({...f, cityId:'', areaId:''})); return;} (async()=>{ try { const c = await cityAPI.getAll(true, Number(filters.countryId), language); setCities(c.data?.data||[]);} catch { showError(t('error'),''); }})(); },[filters.countryId, language, t, showError]);
  useEffect(()=>{ if(!filters.cityId) { setAreas([]); setFilters(f=>({...f, areaId:''})); return;} (async()=>{ try { const a = await areaAPI.getAll(true, Number(filters.cityId), language); setAreas(a.data?.data||[]);} catch { showError(t('error'),''); }})(); },[filters.cityId, language, t, showError]);

  const fetchTowers = useCallback(async ()=>{
    setLoading(true);
    try {
      const resp = await towerAPI.getAll(true,
        filters.countryId?Number(filters.countryId):null,
        filters.cityId?Number(filters.cityId):null,
        filters.areaId?Number(filters.areaId):null,
        null,
        language);
      const raw = resp.data?.data || resp.data || [];
      const rows: TowerRow[] = Array.isArray(raw)? raw.map((r: TowerRow) => ({
        id:r.id,
        arabicName:r.arabicName||'',
        englishName:r.englishName||'',
        countryId:r.countryId,
        cityId:r.cityId,
        areaId:r.areaId,
        totalFloors:r.totalFloors,
        unitsPerFloor:r.unitsPerFloor,
        definitionStage:r.definitionStage,
        isActive:r.isActive
      } )): [];
      setTowers(rows);
  } catch { showError(t('error'),''); }
  finally{ setLoading(false);} }, [filters.countryId, filters.cityId, filters.areaId, language, t, showError]);

  useEffect(()=>{ fetchTowers(); },[fetchTowers]);

  const filtered = useMemo(()=>{
    return towers.filter(tw=>{
      if(filters.stage && String(tw.definitionStage)!==filters.stage) return false;
      if(filters.active==='active' && !tw.isActive) return false;
      if(filters.active==='inactive' && tw.isActive) return false;
      if(filters.search){
        const s=filters.search.toLowerCase();
        if(!(tw.arabicName?.toLowerCase().includes(s) || tw.englishName?.toLowerCase().includes(s) || String(tw.id).includes(s))) return false;
      }
      return true;
    })
  },[towers, filters]);

  const columns: Column<TowerRow>[] = [
    { key:'id', title:'ID', sortable:true },
    { key:'arabicName', title: language==='ar'? 'الاسم (عربي)':'Arabic Name' },
    { key:'englishName', title: language==='ar'? 'الاسم (إنجليزي)':'English Name' },
    { key:'totalFloors', title: language==='ar'? 'إجمالي الطوابق':'Floors' },
    { key:'unitsPerFloor', title: language==='ar'? 'وحدات/طابق':'Units/Floor' },
    { key:'definitionStage', title: language==='ar'? 'مرحلة التعريف':'Def. Stage' },
    { key:'isActive', title: language==='ar'? 'نشط':'Active', render:(v)=> v? '✓':'✗' }
  ];

  const renderTowerCard = (tower: TowerRow) => (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {language === 'ar' ? tower.arabicName : tower.englishName}
              </h3>
              <p className="text-xs text-gray-500">ID: {tower.id}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${tower.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {tower.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'متوقف' : 'Inactive')}
          </span>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{language === 'ar' ? 'الموقع' : 'Location'}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{tower.totalFloors || 0} {language === 'ar' ? 'طابق' : 'Floors'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{tower.unitsPerFloor || 0} {language === 'ar' ? 'وحدة/طابق' : 'Units/Floor'}</span>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{language === 'ar' ? 'مرحلة التعريف' : 'Stage'}</span>
              <span className="font-semibold text-blue-600">{tower.definitionStage || 1}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all" 
                style={{ width: `${((tower.definitionStage || 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-4">
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">{language==='ar'? 'الأبراج':'Towers'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-600">{language==='ar'? 'الدولة':'Country'}</label>
            <select value={filters.countryId} onChange={e=> setFilters(f=>({...f,countryId:e.target.value?Number(e.target.value):''}))} className="mt-1 w-full border rounded px-2 py-2">
              <option value="">{language==='ar'? 'الكل':'All'}</option>
              {countries.map(c=> <option key={c.id} value={c.id}>{language==='ar'? c.arabicName: c.englishName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language==='ar'? 'المدينة':'City'}</label>
            <select value={filters.cityId} onChange={e=> setFilters(f=>({...f,cityId:e.target.value?Number(e.target.value):''}))} className="mt-1 w-full border rounded px-2 py-2" disabled={!filters.countryId}>
              <option value="">{language==='ar'? 'الكل':'All'}</option>
              {cities.map(c=> <option key={c.id} value={c.id}>{language==='ar'? c.arabicName: c.englishName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language==='ar'? 'المنطقة':'Area'}</label>
            <select value={filters.areaId} onChange={e=> setFilters(f=>({...f,areaId:e.target.value?Number(e.target.value):''}))} className="mt-1 w-full border rounded px-2 py-2" disabled={!filters.cityId}>
              <option value="">{language==='ar'? 'الكل':'All'}</option>
              {areas.map(a=> <option key={a.id} value={a.id}>{language==='ar'? a.arabicName: a.englishName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language==='ar'? 'الحالة':'Status'}</label>
            <select value={filters.active} onChange={e=> setFilters(f=>({...f,active:e.target.value}))} className="mt-1 w-full border rounded px-2 py-2">
              <option value="">{language==='ar'? 'الكل':'All'}</option>
              <option value="active">{language==='ar'? 'نشط':'Active'}</option>
              <option value="inactive">{language==='ar'? 'متوقف':'Inactive'}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language==='ar'? 'مرحلة التعريف':'Definition Stage'}</label>
            <select value={filters.stage} onChange={e=> setFilters(f=>({...f,stage:e.target.value}))} className="mt-1 w-full border rounded px-2 py-2">
              <option value="">{language==='ar'? 'الكل':'All'}</option>
              {[1,2,3,4,5].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">{language==='ar'? 'بحث':'Search'}</label>
            <Input value={filters.search} onChange={e=> setFilters(f=>({...f,search:e.target.value}))} placeholder={language==='ar'? 'بحث...':'Search...'} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={()=> setFilters({countryId:'',cityId:'',areaId:'',search:'',active:'',stage:''})}>{language==='ar'? 'تفريغ':'Reset'}</Button>
          <Button onClick={fetchTowers}>{language==='ar'? 'تحديث':'Refresh'}</Button>
        </div>
      </Card>

      <DataTableWithViews 
        data={filtered} 
        columns={columns} 
        loading={loading} 
        searchable={false}
        renderCard={renderTowerCard}
        defaultView="cards"
      />
    </div>
  );
};

export default TowersPage;
