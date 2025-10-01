import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { RealEstateAPI } from '../../services/api';
import { useNotifications } from '../../hooks/useNotificationContext';
import type { BuildingData } from './types';

interface Step5Props {
  buildingData: BuildingData;
  towerId: number;
  isCompleted: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onAssignDesign: (assignmentData: { unitIds: number[]; unitDesignId: number; }) => Promise<void>;
}

interface TowerBlock {
  id: number;
  towerId: number;
  blockCode?: string;
  blockArabicName?: string;
  blockEnglishName?: string;
  blockNumber?: string;
  floorsInBlock?: number;
  unitsPerFloorInBlock?: number;
  notes?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt: string;
  lastModifiedAt: string;
  // Legacy fields for backward compatibility
  blockName?: string;
  floorCount?: number;
}

interface BlockFloor {
  id: number;
  towerBlockId: number;
  towerId: number;
  towerName: string;
  floorCode: string;
  floorName: string;
  floorArabicName: string;
  floorEnglishName: string;
  floorNumber: number;
  sortOrder: number;
  floorType: number;
  floorTypeName: string;
  floorDescription?: string | null;
  unitsCount: number;
  unitNumberPattern?: string;
  totalFloorArea?: number | null;
  isActive: boolean;
  displayOrder: number;
  towerBlock?: {
    id: number;
    blockNumber: string;
    floorsInBlock: number;
    unitsPerFloorInBlock: number;
    displayOrder: number;
    block: {
      id: number;
      code: string;
      arabicName: string;
      englishName: string;
      blockType: number;
    };
    tower: {
      id: number;
      arabicName: string;
      englishName: string;
    };
  };
}

interface Unit {
  id: number;
  unitNumber?: string;
  unitCode?: string;
  floorNumber?: number;
  status: number;
  type: number;
  actualArea?: number | null;
  customRentPrice?: number | null;
  notes?: string | null;
  isActive: boolean;
  blockCode?: string | null;
  floorCode?: string | null;
  tower?: {
    id: number;
    arabicName: string;
    englishName: string;
  };
  unitDesign?: {
    id: number | null;
    arabicName: string | null;
    englishName: string | null;
    areaSquareMeters: number | null;
    bedroomsCount: number | null;
    bathroomsCount: number | null;
    finalRentPrice: number | null;
  };
  blockFloor?: {
    id: number;
    floorCode: string;
    floorArabicName: string;
    floorEnglishName: string;
    floorNumber: number;
    floorType: number;
    sortOrder: number;
    floorDescription: string | null;
    unitsCount: number;
    totalFloorArea: number | null;
    towerBlock: {
      id: number;
      blockNumber: string;
      floorsInBlock: number;
      unitsPerFloorInBlock: number;
      block: {
        id: number;
        code: string;
        arabicName: string;
        englishName: string;
      };
      tower: {
        id: number;
        arabicName: string;
        englishName: string;
      };
    };
  };
  createdAt: string;
  lastModifiedAt: string;
}

interface UnitDesign {
  id: number;
  arabicName: string;
  englishName: string;
  areaSquareMeters?: number;
  bedroomsCount?: number;
  bathroomsCount?: number;
  finalRentPrice?: number;
  isActive: boolean;
}

const Step5UnitsDefinition: React.FC<Step5Props> = ({
  towerId,
  isCompleted,
  onNext,
  onPrevious,
  onAssignDesign
}) => {
  const { addNotification } = useNotifications();
  
  // Data states
  const [towerBlocks, setTowerBlocks] = useState<TowerBlock[]>([]);
  const [blockFloors, setBlockFloors] = useState<Record<number, BlockFloor[]>>({});
  const [units, setUnits] = useState<Record<number, Unit[]>>({});
  const [designs, setDesigns] = useState<UnitDesign[]>([]);
  
  // Selection states
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFloors, setLoadingFloors] = useState<Record<number, boolean>>({});
  
  // Range selection states
  const [useRangeSelection, setUseRangeSelection] = useState(false);
  const [floorRangeFrom, setFloorRangeFrom] = useState<string | null>(null);
  const [floorRangeTo, setFloorRangeTo] = useState<string | null>(null);
  const [unitRangeFrom, setUnitRangeFrom] = useState('');
  const [unitRangeTo, setUnitRangeTo] = useState('');
  
  // Floor compatibility check
  const [floorCompatibilityMessage, setFloorCompatibilityMessage] = useState('');

  // Reset unit range when floor range changes
  useEffect(() => {
    // Reset unit selection when floor range changes
    if (floorRangeFrom && floorRangeTo) {
      setUnitRangeFrom('');
      setUnitRangeTo('');
    }
  }, [floorRangeFrom, floorRangeTo]);

  // Reset ranges when blocks change
  useEffect(() => {
    if (selectedBlocks.length === 0) {
      setFloorRangeFrom(null);
      setFloorRangeTo(null);
      setUnitRangeFrom('');
      setUnitRangeTo('');
    }
  }, [selectedBlocks]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load tower blocks
        const blocksResponse = await RealEstateAPI.towerBlock.getAll({ towerId });
        let blocksData = [];
        if (blocksResponse?.data) {
          blocksData = Array.isArray(blocksResponse.data) ? blocksResponse.data : 
                     Array.isArray(blocksResponse.data.data) ? blocksResponse.data.data : [];
        }
        setTowerBlocks(blocksData);

        // Load designs
        const designsResponse = await RealEstateAPI.unitDesign.getAll();
        let designsData = [];
        if (designsResponse?.data) {
          designsData = Array.isArray(designsResponse.data) ? designsResponse.data : 
                       Array.isArray(designsResponse.data.data) ? designsResponse.data.data : [];
        }
        setDesigns(designsData);
        
        console.log('Loaded tower blocks:', blocksData.length);
        console.log('Loaded designs:', designsData.length);
      } catch (error) {
        console.error('Error loading data:', error);
        addNotification({ type: 'error', message: 'خطأ في تحميل البيانات' });
      } finally {
        setLoading(false);
      }
    };

    if (towerId) {
      loadData();
    }
  }, [towerId, addNotification]);

  // Load floors when blocks are selected
  useEffect(() => {
    const loadFloorsForSelectedBlocks = async () => {
      // If no blocks selected, clear everything
      if (selectedBlocks.length === 0) {
        setBlockFloors({});
        setUnits({});
        setLoadingFloors({});
        return;
      }

      // Load floors for selected blocks
      for (const blockId of selectedBlocks) {
        // تحقق من حالة التحميل من state بدلاً من dependency
        const isAlreadyLoading = loadingFloors[blockId];
        const hasFloors = blockFloors[blockId] && blockFloors[blockId].length > 0;
        
        if (!isAlreadyLoading && !hasFloors) {
          setLoadingFloors(prev => ({ ...prev, [blockId]: true }));
          
          try {
            console.log(`🔄 Loading floors for TowerBlock ID: ${blockId}`);
            const floorsResponse = await RealEstateAPI.blockFloor.getAll({ 
              towerBlockId: blockId  // استخدام towerBlockId (هذا هو TowerBlock.id وليس Block.id)
            });
            
            let floorsData = [];
            if (floorsResponse?.data) {
              floorsData = Array.isArray(floorsResponse.data) ? floorsResponse.data : 
                          Array.isArray(floorsResponse.data.data) ? floorsResponse.data.data : [];
            }
            
            console.log(`✅ Loaded ${floorsData.length} floors for TowerBlock ${blockId}:`, floorsData);
            setBlockFloors(prev => ({ ...prev, [blockId]: floorsData }));
            
            // Load units for each floor
            for (const floor of floorsData) {
              try {
                console.log(`🔄 Loading units for floor ${floor.id} (BlockFloorId)`);
                const unitsResponse = await RealEstateAPI.unit.getAllAdvanced({
                  blockFloorId: floor.id  // استخدام BlockFloorId من جدول BlockFloor
                });
                
                let unitsData: Unit[] = [];
                if (unitsResponse?.data) {
                  unitsData = Array.isArray(unitsResponse.data) ? unitsResponse.data : 
                             Array.isArray(unitsResponse.data.data) ? unitsResponse.data.data : [];
                }
                
                console.log(`✅ Loaded ${unitsData.length} units for floor ${floor.id}:`, unitsData);
                setUnits(prev => ({ ...prev, [floor.id]: unitsData }));
              } catch (error) {
                console.error(`❌ Error loading units for floor ${floor.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`❌ Error loading floors for TowerBlock ${blockId}:`, error);
          } finally {
            setLoadingFloors(prev => ({ ...prev, [blockId]: false }));
          }
        }
      }
    };

    loadFloorsForSelectedBlocks();
  }, [selectedBlocks, blockFloors, loadingFloors]); // إضافة جميع التبعيات المطلوبة

  // Handle block selection
  // Handle block selection
  const handleBlockSelect = (blockId: number, selected: boolean) => {
    if (selected) {
      // When selecting a block, first clear its previous data
      setBlockFloors(prev => {
        const newBlockFloors = { ...prev };
        delete newBlockFloors[blockId]; // Remove previous data for this block
        return newBlockFloors;
      });
      
      setUnits(prev => {
        const newUnits = { ...prev };
        // Remove units for floors that belonged to this block
        const oldFloors = blockFloors[blockId] || [];
        oldFloors.forEach(floor => {
          delete newUnits[floor.id];
        });
        return newUnits;
      });
      
      setLoadingFloors(prev => ({ ...prev, [blockId]: false }));
    }
    
    setSelectedBlocks(prev => {
      const newSelected = selected 
        ? [...prev, blockId]
        : prev.filter(id => id !== blockId);
      
      // Clear range selections when blocks change
      setFloorRangeFrom(null);
      setFloorRangeTo(null);
      setUnitRangeFrom('');
      setUnitRangeTo('');
      setSelectedUnits([]);
      
      return newSelected;
    });
  };

  // Check floor compatibility when blocks or floors change
  useEffect(() => {
    if (selectedBlocks.length < 2) {
      setFloorCompatibilityMessage('');
      return;
    }

    // Get floor codes for each selected block
    const blockFloorCodes: Record<number, string[]> = {};
    
    selectedBlocks.forEach(blockId => {
      const floors = blockFloors[blockId] || [];
      blockFloorCodes[blockId] = floors.map(floor => floor.floorCode || '').sort();
    });

    // Compare floor codes between blocks
    const firstBlockFloors = blockFloorCodes[selectedBlocks[0]] || [];
    let compatible = true;
    
    for (let i = 1; i < selectedBlocks.length; i++) {
      const currentBlockFloors = blockFloorCodes[selectedBlocks[i]] || [];
      
      if (firstBlockFloors.length !== currentBlockFloors.length) {
        compatible = false;
        break;
      }
      
      for (let j = 0; j < firstBlockFloors.length; j++) {
        if (firstBlockFloors[j] !== currentBlockFloors[j]) {
          compatible = false;
          break;
        }
      }
      
      if (!compatible) break;
    }
    
    if (!compatible) {
      setFloorCompatibilityMessage(
        'تحذير: طوابق البلوكات المختارة غير متطابقة. يُنصح بتعريف كل بلوك لوحده أو استخدام طريقة التعريف الأخرى.'
      );
    } else {
      setFloorCompatibilityMessage('');
    }
  }, [selectedBlocks, blockFloors]);

  // Get available floor codes for selected blocks
  const getAvailableFloorCodes = () => {
    if (selectedBlocks.length === 0) return [];
    
    const floorCodes = new Set<string>();
    selectedBlocks.forEach(blockId => {
      const floors = blockFloors[blockId] || [];
      console.log(`Block ${blockId} floors:`, floors.map(f => ({ id: f.id, floorCode: f.floorCode, floorNumber: f.floorNumber })));
      
      // Use the same logic as the display section
      floors
        .sort((a, b) => (a.floorNumber || 0) - (b.floorNumber || 0))
        .forEach(floor => {
          if (floor.floorCode) {
            floorCodes.add(floor.floorCode);
            console.log(`Added floor code: ${floor.floorCode}`);
          }
        });
    });
    
    const sortedFloorCodes = Array.from(floorCodes).sort();
    console.log('Available floor codes:', sortedFloorCodes);
    return sortedFloorCodes;
  };

  // Helper function to normalize unit numbers for comparison
  const normalizeUnitNumber = (unitNum: string): string => {
    const num = parseInt(unitNum);
    return isNaN(num) ? unitNum : num.toString();
  };

  // Helper function to find matching unit number
  const findMatchingUnit = (selectedValue: string | number): string => {
    const availableUnits = getAvailableUnitNumbers();
    const normalizedSelected = normalizeUnitNumber(selectedValue?.toString() || '');
    
    return availableUnits.find(unit => 
      normalizeUnitNumber(unit) === normalizedSelected
    ) || selectedValue?.toString() || '';
  };

  // Get available unit numbers for selected blocks and floor range
  const getAvailableUnitNumbers = () => {
    if (selectedBlocks.length === 0) return [];
    
    const unitNumbers = new Set<string>();
    
    console.log('Getting available unit numbers for blocks:', selectedBlocks);
    console.log('Floor range:', floorRangeFrom, 'to', floorRangeTo);
    
    // Get units from blockFloors and units state (already loaded data)
    selectedBlocks.forEach(blockId => {
      const floors = blockFloors[blockId] || [];
      floors.forEach(floor => {
        // Check floor range if specified
        if (floorRangeFrom && floorRangeTo && floor.floorCode) {
          // Convert floor codes to numbers for comparison if they are numeric
          const floorCodeNum = !isNaN(parseInt(floor.floorCode)) ? parseInt(floor.floorCode) : null;
          const rangeFromNum = !isNaN(parseInt(floorRangeFrom)) ? parseInt(floorRangeFrom) : null;
          const rangeToNum = !isNaN(parseInt(floorRangeTo)) ? parseInt(floorRangeTo) : null;
          
          // If all are numeric, do numeric comparison
          if (floorCodeNum !== null && rangeFromNum !== null && rangeToNum !== null) {
            if (floorCodeNum < rangeFromNum || floorCodeNum > rangeToNum) {
              return;
            }
          } else {
            // Otherwise do string comparison
            if (floor.floorCode < floorRangeFrom || floor.floorCode > floorRangeTo) {
              return;
            }
          }
        }
        
        const floorUnits = units[floor.id] || [];
        console.log(`Floor ${floor.floorCode} has ${floorUnits.length} units`);
        floorUnits.forEach(unit => {
          const unitNum = unit.unitNumber || unit.unitCode || unit.id.toString();
          if (unitNum) {
            unitNumbers.add(unitNum);
            console.log('Added unit number:', unitNum);
          }
        });
      });
    });
    
    const sortedUnits = Array.from(unitNumbers).sort((a, b) => {
      // Try to sort numerically if possible
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
    
    console.log('Available unit numbers:', sortedUnits);
    return sortedUnits;
  };

  // Apply range selection to get unit IDs
  const getUnitsInRange = () => {
    // Return empty array if range is not fully specified
    if (!floorRangeFrom || !floorRangeTo || !unitRangeFrom || !unitRangeTo) {
      return [];
    }
    
    const unitIds: number[] = [];
    selectedBlocks.forEach(blockId => {
      const floors = blockFloors[blockId] || [];
      floors.forEach(floor => {
        // Check floor range
        if (floor.floorCode && floorRangeFrom && floorRangeTo) {
          // Convert floor codes to numbers for comparison if they are numeric
          const floorCodeNum = !isNaN(parseInt(floor.floorCode)) ? parseInt(floor.floorCode) : null;
          const rangeFromNum = !isNaN(parseInt(floorRangeFrom)) ? parseInt(floorRangeFrom) : null;
          const rangeToNum = !isNaN(parseInt(floorRangeTo)) ? parseInt(floorRangeTo) : null;
          
          // If all are numeric, do numeric comparison
          let isInRange = false;
          if (floorCodeNum !== null && rangeFromNum !== null && rangeToNum !== null) {
            isInRange = floorCodeNum >= rangeFromNum && floorCodeNum <= rangeToNum;
          } else {
            // Otherwise do string comparison
            isInRange = floor.floorCode >= floorRangeFrom && floor.floorCode <= floorRangeTo;
          }
          
          if (isInRange) {
            const floorUnits = units[floor.id] || [];
            floorUnits.forEach(unit => {
              const unitNum = unit.unitNumber || unit.unitCode || '';
              
              if (unitNum) {
                // Try numeric comparison first
                const unitNumeric = parseInt(unitNum);
                const rangeFromNumeric = parseInt(unitRangeFrom);
                const rangeToNumeric = parseInt(unitRangeTo);
                
                let unitInRange = false;
                
                if (!isNaN(unitNumeric) && !isNaN(rangeFromNumeric) && !isNaN(rangeToNumeric)) {
                  // Numeric comparison
                  unitInRange = unitNumeric >= rangeFromNumeric && unitNumeric <= rangeToNumeric;
                } else {
                  // Fallback to string comparison for non-numeric unit numbers
                  unitInRange = unitNum >= unitRangeFrom && unitNum <= unitRangeTo;
                }
                
                if (unitInRange) {
                  unitIds.push(unit.id);
                }
              }
            });
          }
        }
      });
    });
    return unitIds;
  };

  // Select units by range
  const handleRangeSelect = () => {
    const rangeUnits = getUnitsInRange();
    setSelectedUnits(rangeUnits);
    addNotification({ 
      type: 'success', 
      message: `تم اختيار ${rangeUnits.length} شقة من النطاق المحدد` 
    });
  };

  // Clear all selections
  const handleClearSelections = () => {
    setSelectedUnits([]);
    setFloorRangeFrom(null);
    setFloorRangeTo(null);
    setUnitRangeFrom('');
    setUnitRangeTo('');
  };

  // Handle unit selection
  const handleUnitSelect = (unitId: number, selected: boolean) => {
    setSelectedUnits(prev => 
      selected 
        ? [...prev, unitId]
        : prev.filter(id => id !== unitId)
    );
  };

  // Handle design assignment
  const handleAssignDesign = async () => {
    if (selectedUnits.length === 0 || !selectedDesign) {
      addNotification({ type: 'warning', message: 'الرجاء اختيار الشقق والتصميم' });
      return;
    }

    try {
      await onAssignDesign({
        unitIds: selectedUnits,
        unitDesignId: selectedDesign
      });
      
      // Clear selections after successful assignment
      setSelectedUnits([]);
      setSelectedDesign(null);
      
      // Reload units to show updated design assignments
      for (const blockId of selectedBlocks) {
        const floors = blockFloors[blockId] || [];
        for (const floor of floors) {
          try {
            const unitsResponse = await RealEstateAPI.unit.getAllAdvanced({
              blockFloorId: floor.id,
              towerId
            });
            
            let unitsData = [];
            if (unitsResponse?.data) {
              unitsData = Array.isArray(unitsResponse.data) ? unitsResponse.data : 
                         Array.isArray(unitsResponse.data.data) ? unitsResponse.data.data : [];
            }
            
            setUnits(prev => ({ ...prev, [floor.id]: unitsData }));
          } catch (error) {
            console.error(`Error reloading units for floor ${floor.id}:`, error);
          }
        }
      }
      
      addNotification({ type: 'success', message: `تم تعيين التصميم لـ ${selectedUnits.length} شقة بنجاح` });
    } catch (error) {
      console.error('Error assigning design:', error);
      addNotification({ type: 'error', message: 'خطأ في تعيين التصميم' });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <p>جاري التحميل...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">الخطوة 5: تعريف الشقق</h2>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            📝 <strong>الإرشادات:</strong> اختر البلوكات التي تريد تعريف الشقق بها، ثم اختر التصميم المناسب للشقق
          </p>
        </div>
        
        {/* Debug Info */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          <p>Tower ID: {towerId}</p>
          <p>Blocks Count: {Array.isArray(towerBlocks) ? towerBlocks.length : 'Not Array'}</p>
          <p>Designs Count: {Array.isArray(designs) ? designs.length : 'Not Array'}</p>
          <p>Selected Blocks: {selectedBlocks.length}</p>
        </div>
         <div className="mb-6">
          <label className="block text-sm font-medium mb-2">اختيار البلوكات</label>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
            {Array.isArray(towerBlocks) && towerBlocks.length > 0 ? (
              towerBlocks.map((block) => {
                // Get block name based on language preference (Arabic first)
                const blockName = block.blockArabicName || block.blockEnglishName || 
                                 block.blockCode || block.blockNumber || `Block ${block.id}`;
                
                // Calculate floor count - show loading or actual count
                const isBlockSelected = selectedBlocks.includes(block.id);
                const isLoadingFloors = loadingFloors[block.id] || false;
                const hasLoadedFloors = blockFloors[block.id] && blockFloors[block.id].length > 0;
                
                let floorCountDisplay;
                if (isLoadingFloors) {
                  floorCountDisplay = "جاري تحميل الطوابق...";
                } else if (isBlockSelected && hasLoadedFloors) {
                  floorCountDisplay = `${blockFloors[block.id].length} طابق`;
                } else {
                  floorCountDisplay = `${block.floorsInBlock || 0} طابق`;
                }
                
                return (
                  <label key={block.id} className="flex items-center justify-between space-x-2 rtl:space-x-reverse p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        checked={selectedBlocks.includes(block.id)}
                        onChange={(e) => handleBlockSelect(block.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium">{blockName}</span>
                        <div className="text-xs text-gray-500">
                          <span>{floorCountDisplay}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">لا توجد بلوكات متاحة</p>
            )}
          </div>
        </div>
        {/* Range Selection Section */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useRangeSelection"
              checked={useRangeSelection}
              onChange={(e) => setUseRangeSelection(e.target.checked)}
              className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="useRangeSelection" className="text-lg font-medium">
              اختيار شقق بالنطاق (لسهولة التعامل مع المباني الكبيرة)
            </label>
          </div>

          {useRangeSelection && (
            <div className="space-y-4">
              {/* Floor Compatibility Warning */}
              {floorCompatibilityMessage && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ {floorCompatibilityMessage}
                  </p>
                </div>
              )}
              
              {/* Info Message */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700">
                  💡 <strong>ملاحظة:</strong> يجب اختيار البلوكات أولاً لعرض الطوابق والشقق المتاحة
                </p>
                {selectedBlocks.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ تم اختيار {selectedBlocks.length} بلوك - الطوابق والشقق متاحة الآن
                  </p>
                )}
              </div>
              
              {/* Floor Range Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  نطاق الطوابق 
                  {selectedBlocks.length > 0 && (
                    <span className="text-xs text-gray-500 font-normal">
                      ({getAvailableFloorCodes().length} طابق متاح)
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">من الطابق</label>
                    <Select
                      value={floorRangeFrom || ''}
                      onChange={(value) => setFloorRangeFrom(value ? value.toString() : null)}
                      options={selectedBlocks.length > 0 ? getAvailableFloorCodes().map(code => ({ value: code, label: code })) : []}
                      placeholder="اختر الطابق"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">إلى الطابق</label>
                    <Select
                      value={floorRangeTo || ''}
                      onChange={(value) => setFloorRangeTo(value ? value.toString() : null)}
                      options={selectedBlocks.length > 0 ? getAvailableFloorCodes().map(code => ({ value: code, label: code })) : []}
                      placeholder="اختر الطابق"
                    />
                  </div>
                </div>
              </div>

              {/* Unit Range Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  نطاق أرقام الشقق
                  {selectedBlocks.length > 0 && (
                    <span className="text-xs text-gray-500 font-normal">
                      ({getAvailableUnitNumbers().length} رقم شقة متاح)
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">من رقم الشقة</label>
                    {/* <div className="text-xs text-gray-400 mb-1">قيمة مختارة: "{unitRangeFrom}"</div> */}
                    <Select
                      key={`unit-from-${floorRangeFrom}-${floorRangeTo}-${selectedBlocks.join(',')}`}
                      value={unitRangeFrom}
                      onChange={(value) => {
                        const matchedUnit = findMatchingUnit(value || '');
                        console.log('Unit From changed:', value, 'matched with:', matchedUnit);
                        setUnitRangeFrom(matchedUnit);
                      }}
                      options={selectedBlocks.length > 0 ? getAvailableUnitNumbers().map(num => ({ 
                        value: num.toString(), 
                        label: ` ${num}` 
                      })) : []}
                      placeholder="اختر رقم الشقة"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">إلى رقم الشقة</label>
                    {/* <div className="text-xs text-gray-400 mb-1">قيمة مختارة: "{unitRangeTo}"</div> */}
                    <Select
                      key={`unit-to-${floorRangeFrom}-${floorRangeTo}-${selectedBlocks.join(',')}`}
                      value={unitRangeTo}
                      onChange={(value) => {
                        const matchedUnit = findMatchingUnit(value || '');
                        console.log('Unit To changed:', value, 'matched with:', matchedUnit);
                        setUnitRangeTo(matchedUnit);
                      }}
                      options={selectedBlocks.length > 0 ? getAvailableUnitNumbers().map(num => ({ 
                        value: num.toString(), 
                        label: ` ${num}` 
                      })) : []}
                      placeholder="اختر رقم الشقة"
                    />
                  </div>
                </div>
              </div>

              {/* Range Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleRangeSelect}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={
                    selectedBlocks.length === 0 || 
                    !floorRangeFrom || 
                    !floorRangeTo || 
                    !unitRangeFrom || 
                    !unitRangeTo ||
                    getAvailableFloorCodes().length === 0 ||
                    getAvailableUnitNumbers().length === 0
                  }
                >
                  اختيار الشقق في النطاق
                  {floorRangeFrom && floorRangeTo && unitRangeFrom && unitRangeTo && (
                    <span className="text-xs ml-1">
                      ({getUnitsInRange().length} شقة)
                    </span>
                  )}
                </Button>
                <Button 
                  onClick={handleClearSelections}
                  variant="outline"
                >
                  مسح الاختيارات
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Block Selection */}
       

        {/* Units Display */}
        {(selectedBlocks.length > 0 && !useRangeSelection) &&(
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">الشقق المتاحة ({selectedUnits.length} مختارة)</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-300 rounded-md p-3">
              {selectedBlocks.map(blockId => {
                const block = towerBlocks.find(b => b.id === blockId);
                const blockName = block?.blockArabicName || block?.blockEnglishName || 
                                 block?.blockCode || block?.blockNumber || `Block ${blockId}`;
                const floors = blockFloors[blockId] || [];
                const isLoadingFloors = loadingFloors[blockId] || false;

                return (
                  <div key={blockId} className="border-b border-gray-200 pb-3">
                    <h4 className="font-medium text-md mb-2 text-blue-700">
                      {blockName} ({floors.length} طابق)
                    </h4>
                    
                    {isLoadingFloors ? (
                      <p className="text-sm text-gray-500">جاري تحميل الطوابق...</p>
                    ) : floors.length > 0 ? (
                      <div className="space-y-3">
                        {floors
                          .sort((a, b) => (a.floorNumber || 0) - (b.floorNumber || 0))
                          .map(floor => {
                            const floorName = floor.floorArabicName || floor.floorEnglishName || `الطابق ${floor.floorNumber}`;
                            const floorUnits = units[floor.id] || [];
                            
                            return (
                              <div key={floor.id} className="bg-gray-50 p-2 rounded">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">{floorName}</span>
                                  <span className="text-xs text-gray-500">{floorUnits.length} شقة</span>
                                </div>
                                
                                {floorUnits.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {floorUnits.map(unit => {
                                      const unitName = unit.unitNumber || unit.unitCode || `شقة ${unit.id}`;
                                      const hasDesign = unit.unitDesign?.id;
                                      
                                      return (
                                        <label key={unit.id} className="flex items-center space-x-1 rtl:space-x-reverse text-xs">
                                          <input
                                            type="checkbox"
                                            checked={selectedUnits.includes(unit.id)}
                                            onChange={(e) => handleUnitSelect(unit.id, e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          />
                                          <span className={hasDesign ? 'text-green-600 font-medium' : 'text-gray-700'}>
                                            {unitName}
                                            {hasDesign && ' ✓'}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">لا توجد طوابق لهذا البلوك</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Design Selection */}
        {selectedUnits.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">اختيار التصميم</label>
            <Select
              value={selectedDesign?.toString() || ''}
              onChange={(value) => setSelectedDesign(value ? parseInt(value.toString()) : null)}
              options={designs.map(design => ({
                value: design.id,
                label: design.arabicName || design.englishName || `تصميم ${design.id}`
              }))}
              placeholder="اختر التصميم"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            onClick={onPrevious}
            variant="outline"
          >
            السابق
          </Button>

          <div className="flex space-x-2 space-x-reverse">
            {selectedUnits.length > 0 && selectedDesign && (
              <Button
                onClick={handleAssignDesign}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                تعيين التصميم ({selectedUnits.length} شقة)
              </Button>
            )}
            
            <Button
              onClick={onNext}
              disabled={!isCompleted}
              className={isCompleted 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            >
              التالي
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step5UnitsDefinition;