import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useNotifications } from '../hooks/useNotificationContext';
import { towerAPI, towerBlockAPI, blockFloorAPI, unitAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Building2, Box, Layers, Home, ChevronDown, ChevronRight, Edit, Loader2, ArrowLeft, Users } from 'lucide-react';

interface TowerDetails {
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
}

interface TowerBlock {
  id: number;
  arabicName: string;
  englishName: string;
  towerId: number;
  blockId: number;
  totalFloors?: number;
  isActive?: boolean;
}

interface BlockFloor {
  id: number;
  arabicName?: string;
  englishName?: string;
  towerBlockId: number;
  floorNameId?: number;
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
  type?: string;
  isActive?: boolean;
}

const TowerTreeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { showError } = useNotifications();
  const navigate = useNavigate();

  const [tower, setTower] = useState<TowerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Tree state
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [expandedFloors, setExpandedFloors] = useState<Set<number>>(new Set());

  const [towerBlocks, setTowerBlocks] = useState<TowerBlock[]>([]);
  const [blockFloors, setBlockFloors] = useState<Record<number, BlockFloor[]>>({});
  const [floorUnits, setFloorUnits] = useState<Record<number, Unit[]>>({});

  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState<Set<number>>(new Set());
  const [loadingUnits, setLoadingUnits] = useState<Set<number>>(new Set());

  // Load tower details and blocks
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Load tower details
        const towerResp = await towerAPI.getById(Number(id), language);
        const towerData = towerResp.data?.data || towerResp.data;
        setTower(towerData);

        // Load blocks immediately
        setLoadingBlocks(true);
        const blocksResp = await towerBlockAPI.getAll({ towerId: Number(id), onlyActive: true }, language);
        const blocks = blocksResp.data?.data || blocksResp.data || [];
        setTowerBlocks(blocks);
        setLoadingBlocks(false);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        showError(error?.response?.data?.message || t('error'), '');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, language, showError, t]);

  // Toggle block expand/collapse
  const toggleBlock = async (blockId: number) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
      setExpandedBlocks(newExpanded);
    } else {
      newExpanded.add(blockId);
      setExpandedBlocks(newExpanded);

      // Load floors if not already loaded
      if (!blockFloors[blockId]) {
        setLoadingFloors(prev => new Set(prev).add(blockId));
        try {
          const resp = await blockFloorAPI.getAll({ towerBlockId: blockId, onlyActive: true }, language);
          const floors = resp.data?.data || resp.data || [];
          setBlockFloors(prev => ({ ...prev, [blockId]: floors }));
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          showError(error?.response?.data?.message || t('error'), '');
        } finally {
          setLoadingFloors(prev => {
            const newSet = new Set(prev);
            newSet.delete(blockId);
            return newSet;
          });
        }
      }
    }
  };

  // Toggle floor expand/collapse
  const toggleFloor = async (floorId: number) => {
    const newExpanded = new Set(expandedFloors);
    if (newExpanded.has(floorId)) {
      newExpanded.delete(floorId);
      setExpandedFloors(newExpanded);
    } else {
      newExpanded.add(floorId);
      setExpandedFloors(newExpanded);

      // Load units if not already loaded
      if (!floorUnits[floorId]) {
        setLoadingUnits(prev => new Set(prev).add(floorId));
        try {
          const resp = await unitAPI.getAllAdvanced({ blockFloorId: floorId, onlyActive: true }, language);
          const units = resp.data?.data || resp.data || [];
          setFloorUnits(prev => ({ ...prev, [floorId]: units }));
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          showError(error?.response?.data?.message || t('error'), '');
        } finally {
          setLoadingUnits(prev => {
            const newSet = new Set(prev);
            newSet.delete(floorId);
            return newSet;
          });
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!tower) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            {language === 'ar' ? 'البرج غير موجود' : 'Tower not found'}
          </p>
          <Button onClick={() => navigate('/towers')}>
            {language === 'ar' ? 'العودة للأبراج' : 'Back to Towers'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/towers')}
          className="mb-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'العودة للأبراج' : 'Back to Towers'}
        </Button>

        <Card className="p-6 bg-gradient-to-r from-white to-blue-50 border-l-4 border-blue-500 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    {language === 'ar' ? tower.arabicName : tower.englishName}
                  </h1>
                  <Badge variant={tower.isActive ? 'success' : 'neutral'} className="shadow-sm">
                    {tower.isActive
                      ? language === 'ar' ? 'نشط' : 'Active'
                      : language === 'ar' ? 'متوقف' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Box className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{tower.totalBlocks || 0}</div>
                    <div className="text-sm text-gray-600">{language === 'ar' ? 'بلوك' : 'Blocks'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Layers className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{tower.totalFloors || 0}</div>
                    <div className="text-sm text-gray-600">{language === 'ar' ? 'طابق' : 'Floors'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{tower.unitsPerFloor || 0}</div>
                    <div className="text-sm text-gray-600">{language === 'ar' ? 'شقة/طابق' : 'Units/Floor'}</div>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/building-builder/${tower.id}`)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
            >
              <Edit className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Tree View */}
      <div className="space-y-6">
        {loadingBlocks ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : towerBlocks.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 bg-white shadow-md">
            {language === 'ar' ? 'لا توجد بلوكات' : 'No blocks found'}
          </Card>
        ) : (
          towerBlocks.map((block) => {
            const isExpanded = expandedBlocks.has(block.id);
            const isLoadingFloors = loadingFloors.has(block.id);
            const floors = blockFloors[block.id] || [];

            return (
              <div key={block.id} className="relative">
                {/* Block Card */}
                <Card className="bg-gradient-to-r from-white to-blue-50 hover:shadow-xl transition-all border-l-4 border-blue-500 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleBlock(block.id)}
                          className="p-3 hover:bg-blue-100 rounded-full transition-all shadow-sm hover:shadow-md"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-6 h-6 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-6 h-6 text-blue-600" />
                          )}
                        </button>
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                          <Box className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {language === 'ar' ? block.arabicName : block.englishName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {language === 'ar' ? `${block.totalFloors || 0} طابق` : `${block.totalFloors || 0} Floors`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/building-builder/${tower.id}`)}
                        className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === 'ar' ? 'تعديل' : 'Edit'}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Floors */}
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="pl-16 space-y-3 border-l-2 border-blue-200 ml-6">
                        {isLoadingFloors ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                          </div>
                        ) : floors.length === 0 ? (
                          <Card className="p-6 text-center text-gray-500 bg-gray-50">
                            {language === 'ar' ? 'لا توجد طوابق' : 'No floors found'}
                          </Card>
                        ) : (
                          floors.map((floor) => {
                            const isFloorExpanded = expandedFloors.has(floor.id);
                            const isLoadingUnits = loadingUnits.has(floor.id);
                            const units = floorUnits[floor.id] || [];

                            return (
                              <Card 
                                key={floor.id} 
                                className="bg-gradient-to-r from-white to-green-50 border-l-4 border-green-500 hover:shadow-lg transition-all"
                              >
                                <div className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <button
                                        onClick={() => toggleFloor(floor.id)}
                                        className="p-2 hover:bg-green-100 rounded-full transition-all shadow-sm"
                                        aria-label={isFloorExpanded ? 'Collapse' : 'Expand'}
                                      >
                                        {isFloorExpanded ? (
                                          <ChevronDown className="w-5 h-5 text-green-600" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-green-600" />
                                        )}
                                      </button>
                                      <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
                                        <Layers className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-800">
                                          {language === 'ar'
                                            ? floor.arabicName || `الطابق ${floor.floorNumber || ''}`
                                            : floor.englishName || `Floor ${floor.floorNumber || ''}`}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {language === 'ar' ? `${floor.totalUnits || 0} شقة` : `${floor.totalUnits || 0} Units`}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/building-builder`)}
                                      className="hover:bg-green-50"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* Expanded Units */}
                                  {isFloorExpanded && (
                                    <div className="mt-4 pl-14 space-y-2 border-l-2 border-green-200 ml-3">
                                      {isLoadingUnits ? (
                                        <div className="flex items-center justify-center py-4">
                                          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                        </div>
                                      ) : units.length === 0 ? (
                                        <Card className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                                          {language === 'ar' ? 'لا توجد شقق' : 'No units found'}
                                        </Card>
                                      ) : (
                                        units.map((unit) => (
                                          <Card 
                                            key={unit.id} 
                                            className="p-3 bg-gradient-to-r from-white to-purple-50 border-l-4 border-purple-500 hover:shadow-md transition-all"
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
                                                  <Home className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                  <span className="font-semibold text-gray-800">
                                                    {language === 'ar'
                                                      ? unit.arabicName || `الشقة ${unit.unitNumber || unit.id}`
                                                      : unit.englishName || `Unit ${unit.unitNumber || unit.id}`}
                                                  </span>
                                                  {unit.status && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                      {unit.status}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/residential-units`)}
                                                className="hover:bg-purple-50"
                                              >
                                                <Edit className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </Card>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TowerTreeDetailPage;
