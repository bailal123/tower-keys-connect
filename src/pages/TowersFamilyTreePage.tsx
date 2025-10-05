import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useNotifications } from '../hooks/useNotificationContext';
import { towerAPI, countryAPI, cityAPI, areaAPI, towerBlockAPI, blockFloorAPI, unitAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Building2, Box, Layers, Home, Edit, Loader2, ArrowLeft, ZoomIn } from 'lucide-react';

interface Tower {
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
  imageUrl?: string;
  towerImage?: string;
  blocksCount?: number; // عدد البلوكات من Backend
  totalUnits?: number; // عدد الشقق المحسوب من TowerBlocks
  calculatedBlocks?: number; // عدد البلوكات الفعلي
  calculatedFloors?: number; // عدد الطوابق الفعلي
}

interface TowerBlock {
  id: number;
  arabicName: string;
  englishName: string;
  towerId: number;
  blockId: number;
  blockNumber?: string;
  blockArabicName?: string;
  blockEnglishName?: string;
  floorsInBlock?: number;
  unitsPerFloorInBlock?: number;
  totalFloors?: number;
  isActive?: boolean;
}

interface BlockFloor {
  id: number;
  arabicName?: string;
  englishName?: string;
  towerBlockId: number;
  floorNumber?: number;
  totalUnits?: number;
  isActive?: boolean;
}

interface Unit {
  id: number;
  arabicName?: string;
  englishName?: string;
  unitNumber?: string;
  blockFloorId?: number;
  status?: string;
  isActive?: boolean;
}

interface NamedLookup {
  id: number;
  arabicName?: string;
  englishName?: string;
}

type ViewLevel = 'towers' | 'blocks' | 'floors' | 'units';

interface ViewState {
  level: ViewLevel;
  selectedTowerId?: number;
  selectedBlockId?: number;
  selectedFloorId?: number;
}

const TowersFamilyTreePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { showError } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<NamedLookup[]>([]);
  const [cities, setCities] = useState<NamedLookup[]>([]);
  const [areas, setAreas] = useState<NamedLookup[]>([]);
  
  // Smart Pagination State
  const [cachedTowers, setCachedTowers] = useState<Tower[]>([]); // التخزين المؤقت للأبراج
  const [currentFrontendPage, setCurrentFrontendPage] = useState(1); // الصفحة الحالية في Frontend
  const [currentBackendPage, setCurrentBackendPage] = useState(1); // الصفحة المجلوبة من Backend
  const [totalBackendPages, setTotalBackendPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const towersPerFrontendPage = 25; // 25 برج لكل صفحة في Frontend
  const towersPerBackendPage = 100; // جلب 100 برج من Backend
  
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

  // View state
  const [viewState, setViewState] = useState<ViewState>({ level: 'towers' });
  const [blocks, setBlocks] = useState<TowerBlock[]>([]);
  const [floors, setFloors] = useState<BlockFloor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // Load lookups
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

  // جلب الإحصائيات من TowerBlocks
  const calculateTowerStats = useCallback(async (towerId: number): Promise<{
    totalUnits: number;
    calculatedBlocks: number;
    calculatedFloors: number;
  }> => {
    try {
      const resp = await towerBlockAPI.getAll({ towerId }, language);
      const blocks = resp.data?.data || resp.data || [];
      
      if (!Array.isArray(blocks) || blocks.length === 0) {
        return { totalUnits: 0, calculatedBlocks: 0, calculatedFloors: 0 };
      }
      
      let totalUnits = 0;
      let maxFloors = 0;
      
      // حساب عدد الشقق وأكبر عدد طوابق
      blocks.forEach((block: { floorsInBlock?: number; unitsPerFloorInBlock?: number }) => {
        const floors = block.floorsInBlock || 0;
        const unitsPerFloor = block.unitsPerFloorInBlock || 0;
        totalUnits += floors * unitsPerFloor;
        maxFloors = Math.max(maxFloors, floors);
      });
      
      return {
        totalUnits,
        calculatedBlocks: blocks.length,
        calculatedFloors: maxFloors
      };
    } catch {
      return { totalUnits: 0, calculatedBlocks: 0, calculatedFloors: 0 };
    }
  }, [language]);

  // جلب الأبراج من Backend (100 برج)
  const fetchTowersFromBackend = useCallback(async (backendPage: number) => {
    setLoading(true);
    try {
      const resp = await towerAPI.getAll(
        true,
        filters.countryId ? Number(filters.countryId) : null,
        filters.cityId ? Number(filters.cityId) : null,
        filters.areaId ? Number(filters.areaId) : null,
        null,
        language,
        backendPage,
        towersPerBackendPage
      );
      
      // استخراج البيانات والـ pagination من الاستجابة
      const raw = resp.data?.data || resp.data || [];
      const rows: Tower[] = Array.isArray(raw)
        ? raw.map((r: {
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
            imageUrl?: string;
            mainImageUrl?: string;
            towerImage?: string;
            blocksCount?: number;
          }) => ({
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
            imageUrl: r.imageUrl || r.mainImageUrl,
            blocksCount: r.blocksCount,
          }))
        : [];
      
      // حساب الإحصائيات لكل برج من TowerBlocks
      const towersWithStats = await Promise.all(
        rows.map(async (tower) => {
          const stats = await calculateTowerStats(tower.id);
          return {
            ...tower,
            totalUnits: stats.totalUnits,
            calculatedBlocks: stats.calculatedBlocks,
            calculatedFloors: stats.calculatedFloors,
          };
        })
      );
      
      // إضافة الأبراج الجديدة للتخزين المؤقت
      setCachedTowers(prev => {
        // إذا كانت الصفحة 1، نستبدل كل البيانات
        if (backendPage === 1) {
          return towersWithStats;
        }
        // إذا كانت صفحة جديدة، نضيف البيانات للنهاية
        if (backendPage > currentBackendPage) {
          return [...prev, ...towersWithStats];
        }
        // في حالة إعادة الجلب، نستبدل
        return towersWithStats;
      });
      
      setCurrentBackendPage(backendPage);
      
      // تحديث معلومات الـ pagination
      if (resp.data?.pagination) {
        const pag = resp.data.pagination;
        setTotalBackendPages(pag.last_page || 1);
        setTotalRows(pag.total_row || 0);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error?.response?.data?.message || t('error'), '');
    } finally {
      setLoading(false);
    }
  }, [filters, language, currentBackendPage, showError, t, calculateTowerStats, towersPerBackendPage]);

  // التحقق من الحاجة لجلب المزيد من البيانات
  useEffect(() => {
    const neededIndex = currentFrontendPage * towersPerFrontendPage;
    const hasEnoughData = cachedTowers.length >= neededIndex;
    
    // إذا لم يكن لدينا بيانات كافية وهناك المزيد من الصفحات
    if (!hasEnoughData && currentBackendPage < totalBackendPages && !loading) {
      fetchTowersFromBackend(currentBackendPage + 1);
    }
  }, [currentFrontendPage, cachedTowers.length, currentBackendPage, totalBackendPages, loading, fetchTowersFromBackend]);

  // جلب البيانات الأولية أو عند تغيير الفلاتر
  useEffect(() => {
    // إعادة تعيين كل شيء عند تغيير الفلاتر
    setCachedTowers([]);
    setCurrentBackendPage(1);
    setCurrentFrontendPage(1);
    fetchTowersFromBackend(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.countryId, filters.cityId, filters.areaId]);

  // حساب الأبراج المعروضة في الصفحة الحالية
  const getCurrentPageTowers = useCallback(() => {
    const startIndex = (currentFrontendPage - 1) * towersPerFrontendPage;
    const endIndex = startIndex + towersPerFrontendPage;
    return cachedTowers.slice(startIndex, endIndex);
  }, [cachedTowers, currentFrontendPage]);

  // حساب عدد الصفحات الكلي في Frontend
  const totalFrontendPages = Math.ceil(totalRows / towersPerFrontendPage);

  // الأبراج المعروضة في الصفحة الحالية
  const displayedTowers = getCurrentPageTowers();

  // Filter displayed towers (client-side refinement for search, active, stage)
  const filtered = displayedTowers.filter(t => {
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

  // Use filtered towers
  const paginatedTowers = filtered;

  // Reset to page 1 when filters change (search, active, stage only)
  useEffect(() => {
    setCurrentFrontendPage(1);
  }, [filters.search, filters.active, filters.stage]);

  // Handle tower click - zoom into blocks
  const handleTowerClick = async (towerId: number) => {
    setLoadingChildren(true);
    try {
      const resp = await towerBlockAPI.getAll({ towerId, onlyActive: true }, language);
      const blocksData = resp.data?.data || resp.data || [];
      setBlocks(blocksData);
      setViewState({ level: 'blocks', selectedTowerId: towerId });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error?.response?.data?.message || t('error'), '');
    } finally {
      setLoadingChildren(false);
    }
  };

  // Handle block click - zoom into floors
  const handleBlockClick = async (blockId: number) => {
    setLoadingChildren(true);
    try {
      const resp = await blockFloorAPI.getAll({ towerBlockId: blockId, onlyActive: true }, language);
      const floorsData = resp.data?.data || resp.data || [];
      setFloors(floorsData);
      setViewState({ ...viewState, level: 'floors', selectedBlockId: blockId });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error?.response?.data?.message || t('error'), '');
    } finally {
      setLoadingChildren(false);
    }
  };

  // Handle floor click - zoom into units
  const handleFloorClick = async (floorId: number) => {
    setLoadingChildren(true);
    try {
      const resp = await unitAPI.getAllAdvanced({ blockFloorId: floorId, onlyActive: true }, language);
      const unitsData = resp.data?.data || resp.data || [];
      setUnits(unitsData);
      setViewState({ ...viewState, level: 'units', selectedFloorId: floorId });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError(error?.response?.data?.message || t('error'), '');
    } finally {
      setLoadingChildren(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (viewState.level === 'units') {
      setViewState({ level: 'floors', selectedTowerId: viewState.selectedTowerId, selectedBlockId: viewState.selectedBlockId });
      setUnits([]);
    } else if (viewState.level === 'floors') {
      setViewState({ level: 'blocks', selectedTowerId: viewState.selectedTowerId });
      setFloors([]);
    } else if (viewState.level === 'blocks') {
      setViewState({ level: 'towers' });
      setBlocks([]);
    }
  };

  // Get selected items for display
  const selectedTower = cachedTowers.find((t: Tower) => t.id === viewState.selectedTowerId);
  const selectedBlock = blocks.find(b => b.id === viewState.selectedBlockId);
  const selectedFloor = floors.find(f => f.id === viewState.selectedFloorId);

  // Render tower card
  const renderTowerCard = (tower: Tower, index: number) => {
    const progress = ((tower.definitionStage || 0) / 5) * 100;
    const towerImageUrl = tower.imageUrl || tower.towerImage;
    
    return (
      <div key={tower.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
        <Card 
          className="relative h-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group border-2 border-transparent hover:border-blue-500 overflow-hidden"
          onClick={() => handleTowerClick(tower.id)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* صورة البرج */}
          {towerImageUrl ? (
            <div className="relative h-40 overflow-hidden">
              <img 
                src={towerImageUrl} 
                alt={language === 'ar' ? tower.arabicName : tower.englishName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  // في حالة فشل تحميل الصورة، نعرض الأيقونة الافتراضية
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
                <Building2 className="w-16 h-16 text-white opacity-50" />
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant={tower.isActive ? 'success' : 'neutral'} className="shadow-lg backdrop-blur-sm bg-white/90">
                  {tower.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'متوقف' : 'Inactive')}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-white opacity-50" />
              <div className="absolute top-2 right-2">
                <Badge variant={tower.isActive ? 'success' : 'neutral'} className="shadow-lg backdrop-blur-sm bg-white/90">
                  {tower.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'متوقف' : 'Inactive')}
                </Badge>
              </div>
            </div>
          )}
          
          <div className="p-4 relative z-10">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[56px]">
              {language === 'ar' ? tower.arabicName : tower.englishName}
            </h3>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{tower.calculatedBlocks || tower.blocksCount || 0}</div>
                <div className="text-xs text-gray-600">{language === 'ar' ? 'بلوك' : 'Block'}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{tower.calculatedFloors || 0}</div>
                <div className="text-xs text-gray-600">{language === 'ar' ? 'طابق' : 'Floor'}</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="text-lg font-bold text-orange-600">{tower.totalUnits || 0}</div>
                <div className="text-xs text-gray-600">{language === 'ar' ? 'إجمالي الشقق' : 'Total Units'}</div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{language === 'ar' ? 'مرحلة التعريف' : 'Stage'}</span>
                <span className="font-bold">{tower.definitionStage || 0}/5</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/building-builder/${tower.id}`);
                }}
                className="flex-1 text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600"
              >
                <ZoomIn className="w-3 h-3 mr-1" />
                {language === 'ar' ? 'عرض' : 'View'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render block card
  const renderBlockCard = (block: TowerBlock, index: number) => {
    const floorsCount = block.floorsInBlock || block.totalFloors || 0;
    const unitsPerFloor = block.unitsPerFloorInBlock || 0;
    const totalUnits = floorsCount * unitsPerFloor;
    
    return (
      <div key={block.id} className="flex flex-col items-center relative animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
        <Card 
          className="relative w-56 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group border-2 border-transparent hover:border-green-500"
          onClick={() => handleBlockClick(block.id)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                <Box className="w-5 h-5 text-white" />
              </div>
              <Badge variant="outline" className="text-xs">
                {language === 'ar' ? `بلوك ${block.blockNumber || ''}` : `Block ${block.blockNumber || ''}`}
              </Badge>
            </div>
            
            <h4 className="font-bold mb-3">
              {language === 'ar' 
                ? block.blockArabicName || block.arabicName 
                : block.blockEnglishName || block.englishName}
            </h4>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {language === 'ar' ? 'عدد الطوابق:' : 'Floors:'}
                </span>
                <span className="font-semibold text-gray-900">
                  {floorsCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {language === 'ar' ? 'شقق في الطابق:' : 'Units/Floor:'}
                </span>
                <span className="font-semibold text-gray-900">
                  {unitsPerFloor}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t pt-2">
                <span className="text-gray-600">
                  {language === 'ar' ? 'إجمالي الشقق:' : 'Total Units:'}
                </span>
                <span className="font-bold text-green-600">
                  {totalUnits}
                </span>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/building-builder/${block.towerId}`);
              }}
              className="w-full text-xs mt-2"
            >
              <Edit className="w-3 h-3 mr-1" />
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // Render floor card
  const renderFloorCard = (floor: BlockFloor, index: number) => {
    return (
      <div key={floor.id} className="flex flex-col items-center relative animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
        <Card 
          className="relative w-52 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group border-2 border-transparent hover:border-yellow-500"
          onClick={() => handleFloorClick(floor.id)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="p-3 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <Badge variant="outline" className="text-xs">
                {language === 'ar' ? `${floor.totalUnits || 0} شقة` : `${floor.totalUnits || 0} Units`}
              </Badge>
            </div>
            
            <h5 className="font-semibold text-sm mb-2">
              {language === 'ar'
                ? floor.arabicName || `الطابق ${floor.floorNumber || ''}`
                : floor.englishName || `Floor ${floor.floorNumber || ''}`}
            </h5>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => e.stopPropagation()}
              className="w-full text-xs"
            >
              <ZoomIn className="w-3 h-3 mr-1" />
              {language === 'ar' ? 'عرض الشقق' : 'View Units'}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // Render unit card
  const renderUnitCard = (unit: Unit, index: number) => {
    return (
      <div key={unit.id} className="flex flex-col items-center relative animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
        <Card 
          className="relative w-48 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-purple-500"
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                <Home className="w-4 h-4 text-white" />
              </div>
              {unit.status && (
                <Badge variant="outline" className="text-xs">
                  {unit.status}
                </Badge>
              )}
            </div>
            
            <h6 className="font-semibold text-sm mb-2">
              {language === 'ar'
                ? unit.arabicName || `الشقة ${unit.unitNumber || unit.id}`
                : unit.englishName || `Unit ${unit.unitNumber || unit.id}`}
            </h6>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/residential-units')}
              className="w-full text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      {/* Filters - Only show when at towers level */}
      {viewState.level === 'towers' && (
        <Card className="p-4 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{language === 'ar' ? 'الأبراج' : 'Towers'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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
              <label className="text-xs text-gray-600">{language === 'ar' ? 'مرحلة التعريف' : 'Stage'}</label>
              <select
                value={filters.stage}
                onChange={e => setFilters(f => ({ ...f, stage: e.target.value }))}
                className="mt-1 w-full border rounded px-2 py-2"
              >
                <option value="">{language === 'ar' ? 'الكل' : 'All'}</option>
                {[1, 2, 3, 4, 5].map(s => (
                  <option key={s} value={s}>{s}</option>
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
              onClick={() => setFilters({ countryId: '', cityId: '', areaId: '', search: '', active: '', stage: '' })}
            >
              {language === 'ar' ? 'تفريغ' : 'Reset'}
            </Button>
            <Button onClick={() => {
              setCachedTowers([]);
              setCurrentBackendPage(1);
              setCurrentFrontendPage(1);
              fetchTowersFromBackend(1);
            }}>{language === 'ar' ? 'تحديث' : 'Refresh'}</Button>
          </div>
        </Card>
      )}

      {/* Breadcrumb / Back Navigation */}
      {viewState.level !== 'towers' && (
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="shadow-md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </Button>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{language === 'ar' ? 'المسار:' : 'Path:'}</span>
            {selectedTower && (
              <>
                <span className="font-semibold text-blue-600">
                  {language === 'ar' ? selectedTower.arabicName : selectedTower.englishName}
                </span>
                {selectedBlock && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-green-600">
                      {language === 'ar' ? selectedBlock.arabicName : selectedBlock.englishName}
                    </span>
                  </>
                )}
                {selectedFloor && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-yellow-600">
                      {language === 'ar'
                        ? selectedFloor.arabicName || `الطابق ${selectedFloor.floorNumber || ''}`
                        : selectedFloor.englishName || `Floor ${selectedFloor.floorNumber || ''}`}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Family Tree View */}
      <div className="flex flex-col items-center">
        {loading || loadingChildren ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Towers Level */}
            {viewState.level === 'towers' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
                  {paginatedTowers.length === 0 ? (
                    <div className="col-span-full">
                      <Card className="p-12 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد أبراج' : 'No towers found'}
                      </Card>
                    </div>
                  ) : (
                    paginatedTowers.map((tower, index) => renderTowerCard(tower, index))
                  )}
                </div>
                
                {/* Pagination Controls */}
                {totalFrontendPages > 1 && (
                  <div className="flex flex-col items-center gap-4 mt-8">
                    {/* عرض عدد النتائج */}
                    <div className="text-sm text-gray-600">
                      {language === 'ar' 
                        ? `إجمالي ${totalRows} برج - صفحة ${currentFrontendPage} من ${totalFrontendPages}` 
                        : `Total ${totalRows} towers - Page ${currentFrontendPage} of ${totalFrontendPages}`}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentFrontendPage((p: number) => Math.max(1, p - 1))}
                        disabled={currentFrontendPage === 1}
                        className="shadow-md"
                      >
                        {language === 'ar' ? 'السابق' : 'Previous'}
                      </Button>
                      
                      <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
                        {/* عرض أول صفحتين */}
                        {[1, 2].map(page => page <= totalFrontendPages && (
                          <Button
                            key={page}
                            variant={page === currentFrontendPage ? 'default' : 'outline'}
                            onClick={() => setCurrentFrontendPage(page)}
                            className={`w-10 h-10 ${page === currentFrontendPage ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}`}
                          >
                            {page}
                          </Button>
                        ))}
                        
                        {/* ... إذا كانت الصفحة الحالية بعيدة عن البداية */}
                        {currentFrontendPage > 4 && <span className="px-2 py-2">...</span>}
                        
                        {/* عرض الصفحات حول الصفحة الحالية */}
                        {Array.from({ length: 5 }, (_, i) => currentFrontendPage - 2 + i)
                          .filter(page => page > 2 && page < totalFrontendPages - 1 && page > 0)
                          .map(page => (
                            <Button
                              key={page}
                              variant={page === currentFrontendPage ? 'default' : 'outline'}
                              onClick={() => setCurrentFrontendPage(page)}
                              className={`w-10 h-10 ${page === currentFrontendPage ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}`}
                            >
                              {page}
                            </Button>
                          ))}
                        
                        {/* ... إذا كانت الصفحة الحالية بعيدة عن النهاية */}
                        {currentFrontendPage < totalFrontendPages - 3 && <span className="px-2 py-2">...</span>}
                        
                        {/* عرض آخر صفحتين */}
                        {[totalFrontendPages - 1, totalFrontendPages].map(page => page > 2 && (
                          <Button
                            key={page}
                            variant={page === currentFrontendPage ? 'default' : 'outline'}
                            onClick={() => setCurrentFrontendPage(page)}
                            className={`w-10 h-10 ${page === currentFrontendPage ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentFrontendPage((p: number) => Math.min(totalFrontendPages, p + 1))}
                        disabled={currentFrontendPage === totalFrontendPages}
                        className="shadow-md"
                      >
                        {language === 'ar' ? 'التالي' : 'Next'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Blocks Level */}
            {viewState.level === 'blocks' && selectedTower && (
              <div className="flex flex-col items-center w-full max-w-7xl px-4">
                {/* Show selected tower as root */}
                <div className="flex justify-center mb-8">
                  {renderTowerCard(selectedTower, 0)}
                </div>
                
                {blocks.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    {language === 'ar' ? 'لا توجد بلوكات' : 'No blocks found'}
                  </Card>
                ) : (
                  <>
                    {/* Vertical line from tower to blocks */}
                    <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500 to-green-500"></div>
                    
                    {/* Show blocks as children in grid */}
                    <div className="flex grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-8 relative pt-16">
                      {/* Horizontal line for first row - fixed calculation */}
                      <div 
                        className="absolute top-0 h-0.5 bg-green-500"
                        style={{
                          left: blocks.length === 1 ? '50%' : 
                                blocks.length === 2 ? '23.5%' :
                                blocks.length === 3 ? '15%' : 
                                '12.5%',
                          right: blocks.length === 1 ? '50%' : 
                                 blocks.length === 2 ? '22.5%' :
                                 blocks.length === 3 ? '15.17%' : 
                                 '12.5%',
                        }}
                      ></div>
                      
                      {blocks.map((block, index) => (
                        <div key={block.id} className="flex flex-col items-center relative">
                          {/* Vertical line down to each block */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-green-500"></div>
                          
                          {renderBlockCard(block, index)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Floors Level */}
            {viewState.level === 'floors' && selectedBlock && (
              <div className="flex flex-col items-center w-full max-w-7xl px-4">
                {/* Show selected block as root */}
                <div className="flex flex-col items-center mb-8">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg mb-4">
                    <Box className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {language === 'ar' ? selectedBlock.arabicName : selectedBlock.englishName}
                  </h2>
                  <Badge variant="outline">
                    {language === 'ar' ? `${selectedBlock.totalFloors || 0} طابق` : `${selectedBlock.totalFloors || 0} Floors`}
                  </Badge>
                </div>
                
                {floors.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    {language === 'ar' ? 'لا توجد طوابق' : 'No floors found'}
                  </Card>
                ) : (
                  <>
                    {/* Vertical line from block to floors */}
                    <div className="w-0.5 h-16 bg-gradient-to-b from-green-500 to-yellow-500"></div>
                    
                    {/* Show floors as children in grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 relative pt-16">
                      {/* Horizontal line for first row */}
                      <div 
                        className="absolute top-0 h-0.5 bg-yellow-500"
                        style={{
                          left: floors.length === 1 ? '50%' : '10%',
                          right: floors.length === 1 ? '50%' : floors.length < 5 ? `${100 - (floors.length * 20 - 10)}%` : '10%',
                        }}
                      ></div>
                      
                      {floors.map((floor, index) => (
                        <div key={floor.id} className="flex flex-col items-center relative">
                          {/* Vertical line down to each floor */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-yellow-500"></div>
                          
                          {renderFloorCard(floor, index)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Units Level */}
            {viewState.level === 'units' && selectedFloor && (
              <div className="flex flex-col items-center w-full max-w-7xl px-4">
                {/* Show selected floor as root */}
                <div className="flex flex-col items-center mb-8">
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg mb-4">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {language === 'ar'
                      ? selectedFloor.arabicName || `الطابق ${selectedFloor.floorNumber || ''}`
                      : selectedFloor.englishName || `Floor ${selectedFloor.floorNumber || ''}`}
                  </h2>
                  <Badge variant="outline">
                    {language === 'ar' ? `${selectedFloor.totalUnits || 0} شقة` : `${selectedFloor.totalUnits || 0} Units`}
                  </Badge>
                </div>
                
                {units.length === 0 ? (
                  <Card className="p-8 text-center text-gray-500">
                    {language === 'ar' ? 'لا توجد شقق' : 'No units found'}
                  </Card>
                ) : (
                  <>
                    {/* Vertical line from floor to units */}
                    <div className="w-0.5 h-16 bg-gradient-to-b from-yellow-500 to-purple-500"></div>
                    
                    {/* Show units as children in grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 relative pt-16">
                      {/* Horizontal line for first row */}
                      <div 
                        className="absolute top-0 h-0.5 bg-purple-500"
                        style={{
                          left: units.length === 1 ? '50%' : '8.33%',
                          right: units.length === 1 ? '50%' : units.length < 6 ? `${100 - (units.length * 16.67 - 8.33)}%` : '8.33%',
                        }}
                      ></div>
                      
                      {units.map((unit, index) => (
                        <div key={unit.id} className="flex flex-col items-center relative">
                          {/* Vertical line down to each unit */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-purple-500"></div>
                          
                          {renderUnitCard(unit, index)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TowersFamilyTreePage;
