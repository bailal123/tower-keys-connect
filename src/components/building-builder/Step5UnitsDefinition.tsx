import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { RealEstateAPI } from '../../services/api';
import { useNotifications } from '../../hooks/useNotificationContext';
import { useLanguage } from '../../hooks/useLanguage';
import type { BuildingData } from './types';

interface Step5Props {
  buildingData: BuildingData;
  towerId: number;
  isCompleted: boolean;
  onPrevious: () => void;
  onComplete?: () => void;
  onAssignDesign: (assignmentData: { unitIds: number[]; unitDesignId: number; }) => Promise<void>;
  visualSelection?: Set<string>;
  onClearVisualSelection?: () => void;
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
  onPrevious,
  onComplete,
  onAssignDesign,
  visualSelection,
  onClearVisualSelection,
  // buildingData (لم يعد مستخدماً بعد إزالة العرض البصري)
}) => {
  const { addNotification } = useNotifications();
  const { t, language } = useLanguage();
  
  // Data states
  const [towerBlocks, setTowerBlocks] = useState<TowerBlock[]>([]);
  const [blockFloors, setBlockFloors] = useState<Record<number, BlockFloor[]>>({});
  const [units, setUnits] = useState<Record<number, Unit[]>>({});
  const [designs, setDesigns] = useState<UnitDesign[]>([]);
  // خريطة مسبقة: visualKey (مثل unit-أ-4-8) => unit.id الحقيقي من قاعدة البيانات
  const [visualKeyToId, setVisualKeyToId] = useState<Record<string, number>>({});
  
  // Selection states
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  // خريطة تحويل unitId المرئي (blockId-floorId-unitId) إلى ID الحقيقي
  // يمكن لاحقاً إنشاء خريطة تحويل إذا احتجنا ترميز مخصص مختلف عن id

  // أزلنا منطق الاختيار البصري هنا بناءً على طلب المستخدم
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
  addNotification({ type: 'error', message: t('errorLoadingData') || t('error') });
      } finally {
        setLoading(false);
      }
    };

    if (towerId) {
      loadData();
    }
  }, [towerId, addNotification, t]);

  // مراجع لتتبع البلوكات المحمّلة لتجنب التحميل المتكرر الذي سبب الحلقة
  const fetchedBlocksRef = useRef<Set<number>>(new Set());

  // تحميل الطوابق عند تغيير قائمة البلوكات المختارة فقط (منع إعادة التشغيل على كل تحديث داخلي)
  useEffect(() => {
    let cancelled = false;

    const loadFloors = async (blockId: number) => {
      try {
        console.log(`🔄 Loading floors for TowerBlock ID: ${blockId}`);
        const floorsResponse = await RealEstateAPI.blockFloor.getAll({ towerBlockId: blockId });
  let floorsData: BlockFloor[] = [];
        if (floorsResponse?.data) {
          floorsData = Array.isArray(floorsResponse.data) ? floorsResponse.data :
                      Array.isArray(floorsResponse.data.data) ? floorsResponse.data.data : [];
        }
        if (cancelled) return;
        setBlockFloors(prev => ({ ...prev, [blockId]: floorsData }));
        console.log(`✅ Loaded ${floorsData.length} floors for TowerBlock ${blockId}`);

        // تحميل الوحدات لكل طابق
        for (const floor of floorsData) {
          try {
            const unitsResponse = await RealEstateAPI.unit.getAllAdvanced({ blockFloorId: floor.id });
            let unitsData: Unit[] = [];
            if (unitsResponse?.data) {
              unitsData = Array.isArray(unitsResponse.data) ? unitsResponse.data :
                         Array.isArray(unitsResponse.data.data) ? unitsResponse.data.data : [];
            }
            if (cancelled) return;
            setUnits(prev => ({ ...prev, [floor.id]: unitsData }));
          } catch (err) {
            console.error(`❌ Error loading units for floor ${floor.id}:`, err);
          }
        }
      } catch (err) {
        console.error(`❌ Error loading floors for TowerBlock ${blockId}:`, err);
      } finally {
        if (!cancelled) {
          setLoadingFloors(prev => ({ ...prev, [blockId]: false }));
        }
      }
    };

    if (selectedBlocks.length === 0) {
      // إعادة ضبط عند إلغاء الجميع
      setBlockFloors({});
      setUnits({});
      fetchedBlocksRef.current.clear();
      return;
    }

    // محاولة تحميل كل بلوك غير محمّل سابقاً
    selectedBlocks.forEach(blockId => {
      if (fetchedBlocksRef.current.has(blockId)) {
        return; // تم تحميله سابقاً
      }
      fetchedBlocksRef.current.add(blockId);
      setLoadingFloors(prev => ({ ...prev, [blockId]: true }));
      loadFloors(blockId);
    });

    return () => { cancelled = true; };
  }, [selectedBlocks]);

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
      // السماح بإعادة التحميل من جديد
      fetchedBlocksRef.current.delete(blockId);
    }
    else {
      // عند إلغاء التحديد حذف من الذاكرة أيضاً إذا أردنا إعادة تحميل لاحق
      fetchedBlocksRef.current.delete(blockId);
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
      setFloorCompatibilityMessage(t('builder_floor_mismatch_warning'));
    } else {
      setFloorCompatibilityMessage('');
    }
  }, [selectedBlocks, blockFloors, t]);

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

  // استخراج آخر خانتين (Suffix) من رقم/كود الوحدة
  const extractUnitSuffix = (raw?: string | null): string | null => {
    if (!raw) return null;
    // أولوية للأرقام في النهاية
    const numeric = raw.match(/(\d+)$/);
    if (numeric) {
      const digits = numeric[1];
      return digits.slice(-2).padStart(2, '0');
    }
    // دعم الوحدات المختلطة أو الأرضية ذات الرموز الحرفية (مثل G1 أو A أو S01)
    const alphaNum = raw.match(/[A-Za-z0-9]+$/);
    if (alphaNum) {
      return alphaNum[0].slice(-4); // خذ آخر حتى 4 حروف لتفادي الطول الكبير
    }
    // fallback: آخر 4 محارف
    return raw.slice(-4);
  };

  // Get available unit suffixes (last two digits) across selected floors in range
  const getAvailableUnitNumbers = () => {
    if (selectedBlocks.length === 0) return [];

    const suffixes = new Set<string>();

    selectedBlocks.forEach(blockId => {
      const floors = blockFloors[blockId] || [];
      floors.forEach(floor => {
        // فلترة الطوابق حسب النطاق إذا محدد
        if (floorRangeFrom && floorRangeTo && floor.floorCode) {
          const floorCodeNum = !isNaN(parseInt(floor.floorCode)) ? parseInt(floor.floorCode) : null;
          const rangeFromNum = !isNaN(parseInt(floorRangeFrom)) ? parseInt(floorRangeFrom) : null;
          const rangeToNum = !isNaN(parseInt(floorRangeTo)) ? parseInt(floorRangeTo) : null;
          if (floorCodeNum !== null && rangeFromNum !== null && rangeToNum !== null) {
            if (floorCodeNum < rangeFromNum || floorCodeNum > rangeToNum) return;
          } else {
            if (floor.floorCode < floorRangeFrom || floor.floorCode > floorRangeTo) return;
          }
        }
        const floorUnits = units[floor.id] || [];
        floorUnits.forEach(u => {
          const raw = u.unitNumber || u.unitCode || u.id.toString();
          const suffix = extractUnitSuffix(raw);
            if (suffix) suffixes.add(suffix);
        });
      });
    });

    const sorted = Array.from(suffixes).sort((a, b) => {
      const na = parseInt(a, 10); const nb = parseInt(b, 10);
      const aNum = !isNaN(na); const bNum = !isNaN(nb);
      if (aNum && bNum) return na - nb;
      if (aNum && !bNum) return -1; // الأرقام أولاً
      if (!aNum && bNum) return 1;
      return a.localeCompare(b, 'ar');
    });
    return sorted;
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
              const raw = unit.unitNumber || unit.unitCode || '';
              const suffix = extractUnitSuffix(raw);
              if (!suffix) return;
              const suffixNum = parseInt(suffix, 10);
              const fromNum = parseInt(unitRangeFrom, 10);
              const toNum = parseInt(unitRangeTo, 10);
              let inRange = false;
              if (!isNaN(suffixNum) && !isNaN(fromNum) && !isNaN(toNum)) {
                inRange = suffixNum >= fromNum && suffixNum <= toNum;
              } else {
                inRange = suffix >= unitRangeFrom && suffix <= unitRangeTo;
              }
              if (inRange) unitIds.push(unit.id);
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
      message: (language==='ar'? t('builder_range_select_success').replace('{count}', String(rangeUnits.length)) : t('builder_range_select_success').replace('{count}', String(rangeUnits.length)))
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

  // مزامنة مباشرة: selectedUnits = visualSelection (استبدال كامل) لضمان تفعيل الزر فوراً وتحديث الإزالة
  useEffect(() => {
    if (!visualSelection) { setSelectedUnits([]); return; }

  // 1) اجمع كل الوحدات المحملة (مفلطحة) لتسهيل البحث + استخدم خريطة visualKeyToId إن وُجدت
  const allUnits: Unit[] = [];
  Object.values(units).forEach(arr => { if (Array.isArray(arr)) allUnits.push(...arr); });

    // 2) دالة تحويل المفتاح المرئي (قد يكون id، رقم شقة، أو مفتاح مركب) إلى unit.id الحقيقي
    const resolveVisualKeyToUnitId = (key: string): number | null => {
      // (0) تحقق أولاً من الخريطة المباشرة
      if (visualKeyToId[key] !== undefined) return visualKeyToId[key];

      // (0.1) نمط خاص: unit-<blockName>-<floorNumber>-<unitNumber>
      // مثال: unit-أ-4-8
      if (key.startsWith('unit-')) {
        const parts = key.split('-');
        // parts: ['unit', blockName, floorNumber, unitNumber] أو أكثر إذا blockName يحتوي شرطات
        if (parts.length >= 4) {
          const unitNumberRaw = parts[parts.length - 1];
          const floorNumberRaw = parts[parts.length - 2];
          const floorNum = parseInt(floorNumberRaw, 10);
          const unitNumCandidate = parseInt(unitNumberRaw, 10);
          if (!isNaN(floorNum) && !isNaN(unitNumCandidate)) {
            // ابحث عن وحدة يطابق floorNumber & unitNumber
            const match = allUnits.find(u => {
              const uFloor = u.blockFloor?.floorNumber ?? u.floorNumber;
              if (uFloor !== floorNum) return false;
              // طابق مطابق، تحقق من unitNumber
              const uNumParsed = u.unitNumber ? parseInt(u.unitNumber, 10) : NaN;
              if (!isNaN(uNumParsed) && uNumParsed === unitNumCandidate) return true;
              // أو من خلال unitCode آخر تسلسل
              if (u.unitCode) {
                const codeMatches = u.unitCode.match(/(\d+)/g);
                if (codeMatches) {
                  const last = parseInt(codeMatches[codeMatches.length - 1], 10);
                  if (!isNaN(last) && last === unitNumCandidate) return true;
                }
              }
              return false;
            });
            if (match) return match.id;
          }
        }
      }
      // (أ) إذا كله أرقام فربما هو id مباشرة
      if (/^\d+$/.test(key)) {
        const asNum = parseInt(key, 10);
        if (allUnits.some(u => u.id === asNum)) return asNum; // تأكد أنه id فعلاً
      }

      // (ب) التقط آخر تسلسل أرقام (يدعم مفتاح مركب مثل block-2-floor-5-unit-37)
      const matches = key.match(/(\d+)/g) || [];
      if (matches.length) {
        const lastNumStr = matches[matches.length - 1];
        const lastNum = parseInt(lastNumStr, 10);
        if (!isNaN(lastNum)) {
          // إذا يطابق id حقيقي
            if (allUnits.some(u => u.id === lastNum)) return lastNum;
          // أو يطابق unitNumber / unitCode
          const byNumRef = allUnits.find(u => (u.unitNumber && u.unitNumber.toString() === lastNumStr) || (u.unitCode && u.unitCode.toString() === lastNumStr));
          if (byNumRef) return byNumRef.id;
        }
      }

      // (ج) جرّب كل الأجزاء الرقمية بعد التقسيم على الفواصل الشائعة
      const parts = key.split(/[-_:]/).filter(Boolean);
      for (const p of parts) {
        if (!/^\d+$/.test(p)) continue;
        const num = parseInt(p, 10);
        if (allUnits.some(u => u.id === num)) return num;
        const byNumber = allUnits.find(u => (u.unitNumber && u.unitNumber.toString() === p) || (u.unitCode && u.unitCode.toString() === p));
        if (byNumber) return byNumber.id;
      }

      return null; // فشل التحويل
    };

    // 3) طبّق التحويل على كل مفتاح مرئي
    const resolved: number[] = [];
    visualSelection.forEach(key => {
      const mapped = resolveVisualKeyToUnitId(key);
      if (mapped !== null) {
        resolved.push(mapped);
      } else {
        console.warn('[Step5] تعذر تحويل المفتاح المرئي إلى ID حقيقي:', key);
      }
    });

    // 4) إزالة التكرارات (قد تشير مفاتيح مختلفة لنفس الوحدة)
    const unique = Array.from(new Set(resolved));
    if (unique.length !== resolved.length) {
      console.debug('[Step5] إزالة تكرارات أثناء التحويل. قبل:', resolved.length, 'بعد:', unique.length);
    }
    setSelectedUnits(unique);
  }, [visualSelection, units, visualKeyToId]);

  // في حال كان هناك اختيار بصري لكن المستخدم لم يحدد البلوكات بعد، حدد كل البلوكات تلقائياً لتحميل الوحدات وتمكين التحويل
  useEffect(() => {
    if (visualSelection && visualSelection.size > 0 && selectedBlocks.length === 0 && towerBlocks.length > 0) {
      console.info('[Step5] Auto-selecting all blocks to resolve visual selections');
      setSelectedBlocks(towerBlocks.map(b => b.id));
    }
  }, [visualSelection, selectedBlocks.length, towerBlocks]);

  // بناء خريطة visualKey => unit.id لتسهيل التحويل (مرة عند تغير الوحدات)
  useEffect(() => {
    const flatUnits: Unit[] = [];
    Object.values(units).forEach(arr => { if (Array.isArray(arr)) flatUnits.push(...arr); });
    if (flatUnits.length === 0) { setVisualKeyToId({}); return; }

    const map: Record<string, number> = {};

    const addKey = (k: string, id: number) => {
      if (!k) return;
      if (map[k] && map[k] !== id) {
        // تعارض محتمل، سنحتفظ بالأول ونحذر
        console.warn('[Step5] تعارض مفاتيح مرئية لنفس النص:', k, 'القيمة الحالية:', map[k], 'والجديدة:', id);
        return;
      }
      map[k] = id;
    };

    const extractNumericVariants = (val?: string | null) => {
      const variants: string[] = [];
      if (!val) return variants;
      variants.push(val);
      const num = parseInt(val, 10);
      if (!isNaN(num) && num.toString() !== val) variants.push(num.toString());
      // استخراج آخر تسلسل أرقام من أي كود (مثلاً UNIT-A-04-008)
      const matches = val.match(/(\d+)/g);
      if (matches && matches.length) {
        const last = matches[matches.length - 1];
        if (!variants.includes(last)) variants.push(last);
      }
      return variants;
    };

    flatUnits.forEach(u => {
      const blockObj = u.blockFloor?.towerBlock?.block;
      const blockCandidates = [
        blockObj?.arabicName,
        blockObj?.englishName,
        blockObj?.code,
        u.blockCode
      ].filter(Boolean) as string[];

      const floorNumber = u.blockFloor?.floorNumber ?? u.floorNumber;
      if (floorNumber === undefined || floorNumber === null) return;

      const unitNumberVariants = [
        ...extractNumericVariants(u.unitNumber || undefined),
        ...extractNumericVariants(u.unitCode || undefined)
      ];

      // إزالة التكرار في variants
      const uniqueUnitVariants = Array.from(new Set(unitNumberVariants));

      blockCandidates.forEach(blockNameRaw => {
        const blockName = (blockNameRaw || '').trim().replace(/\s+/g, ''); // إزالة الفراغات فقط
        uniqueUnitVariants.forEach(numVar => {
          if (!numVar) return;
          const numeric = parseInt(numVar, 10);
          const normalizedNum = !isNaN(numeric) ? numeric.toString() : numVar;
          // شكل المفتاح المتوقع: unit-<blockName>-<floorNumber>-<unitNumber>
          const key = `unit-${blockName}-${floorNumber}-${normalizedNum}`;
          addKey(key, u.id);
        });
      });
    });

    console.debug('[Step5] visualKeyToId map built. Entries:', Object.keys(map).length);
    setVisualKeyToId(map);
  }, [units]);

  // Handle design assignment
  const handleAssignDesign = async () => {
    if (selectedUnits.length === 0 || !selectedDesign) {
  addNotification({ type: 'warning', message: t('builder_select_units_and_design_warning') });
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
      // إلغاء التحديد البصري في الرسمة (إن وُجد)
      if (onClearVisualSelection) {
        onClearVisualSelection();
      }
      
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
      
  addNotification({ type: 'success', message: t('builder_assign_design_success').replace('{count}', String(selectedUnits.length)) });
    } catch (error) {
      console.error('Error assigning design:', error);
  addNotification({ type: 'error', message: t('builder_assign_design_error') });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <p>{t('loading')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
  <h2 className="text-xl font-bold mb-4">{t('builder_step5_heading')}</h2>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            📝 <strong>{t('builder_guidelines_title')}</strong> {t('builder_step5_guidelines_desc')}
          </p>
        </div>
        
        {/* Debug Info */}
        {/* <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          <p>Tower ID: {towerId}</p>
          <p>Blocks Count: {Array.isArray(towerBlocks) ? towerBlocks.length : 'Not Array'}</p>
          <p>Designs Count: {Array.isArray(designs) ? designs.length : 'Not Array'}</p>
          <p>Selected Blocks: {selectedBlocks.length}</p>
        </div> */}
         <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t('builder_blocks_selection_label')}</label>
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
                  floorCountDisplay = t('builder_loading_floors');
                } else if (isBlockSelected && hasLoadedFloors) {
                  floorCountDisplay = `${blockFloors[block.id].length} ${t('builder_floors_suffix')}`;
                } else {
                  floorCountDisplay = `${block.floorsInBlock || 0} ${t('builder_floors_suffix')}`;
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
              <p className="text-gray-500 text-sm">{t('builder_no_blocks_available')}</p>
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
              {t('builder_range_select_checkbox')}
            </label>
          </div>

          {useRangeSelection && (
            <div className="space-y-4">
              {/* Floor Compatibility Warning */}
              {floorCompatibilityMessage && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">⚠️ {floorCompatibilityMessage}</p>
                </div>
              )}
              
              {/* Info Message */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700">💡 <strong>{t('note') || 'ملاحظة'}:</strong> {t('builder_note_select_blocks_first')}</p>
                {selectedBlocks.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">✅ {t('builder_blocks_selected_ready').replace('{count}', String(selectedBlocks.length))}</p>
                )}
              </div>
              
              {/* Floor Range Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('builder_floor_range_label')} {selectedBlocks.length > 0 && (<span className="text-xs text-gray-500 font-normal">({t('builder_floors_available_count').replace('{count}', String(getAvailableFloorCodes().length))})</span>)}</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('builder_floor_from_label')}</label>
                    <Select
                      value={floorRangeFrom || ''}
                      onChange={(value) => setFloorRangeFrom(value ? value.toString() : null)}
                      options={selectedBlocks.length > 0 ? getAvailableFloorCodes().map(code => ({ value: code, label: code })) : []}
                      placeholder={t('builder_select_floor_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('builder_floor_to_label')}</label>
                    <Select
                      value={floorRangeTo || ''}
                      onChange={(value) => setFloorRangeTo(value ? value.toString() : null)}
                      options={selectedBlocks.length > 0 ? getAvailableFloorCodes().map(code => ({ value: code, label: code })) : []}
                      placeholder={t('builder_select_floor_placeholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Unit Range Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('builder_unit_range_label')}{selectedBlocks.length > 0 && (<span className="text-xs text-gray-500 font-normal">({t('builder_units_available_count').replace('{count}', String(getAvailableUnitNumbers().length))})</span>)}</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('builder_unit_from_label')}</label>
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
                      placeholder={t('builder_select_unit_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('builder_unit_to_label')}</label>
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
                      placeholder={t('builder_select_unit_placeholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Range Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleRangeSelect}
                  className="bg-blue-600 text-white hover:bg-blue-700 w-full"
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
                  {t('builder_select_units_in_range')}
                  {floorRangeFrom && floorRangeTo && unitRangeFrom && unitRangeTo && (
                    <span className="text-xs ml-1">({getUnitsInRange().length} {t('builder_units_suffix')})</span>
                  )}
                </Button>
                <Button 
                  onClick={handleClearSelections}
                  variant="outline"
                  className="w-full"
                >
                  {t('builder_clear_selections')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Block Selection */}
       

        {/* Units Display */}
        {(selectedBlocks.length > 0 && !useRangeSelection) &&(
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">{t('builder_available_units_heading')} ({selectedUnits.length} {t('builder_units_selected_count')})</h3>
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
                      {blockName}{} ({floors.length} {t('builder_floors_suffix')})
                    </h4>
                    
                    {isLoadingFloors ? (
                      <p className="text-sm text-gray-500">{t('builder_loading_floors')}</p>
                    ) : floors.length > 0 ? (
                      <div className="space-y-3">
                        {floors
                          .sort((a, b) => (a.floorNumber || 0) - (b.floorNumber || 0))
                          .map(floor => {
                            const floorName = (floor.floorArabicName || floor.floorEnglishName || `الطابق ${floor.floorNumber}`)&& floor.floorCode ? ` (${floor.floorCode})` : '';
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
                      <p className="text-sm text-gray-500">{t('builder_no_floors_for_block')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Design Selection */}
        {((visualSelection && visualSelection.size) || (selectedUnits.length > 0)) && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">{t('builder_design_selection_label')}</label>
            <p className="mb-2 text-xs text-gray-600">{t('builder_visual_selected_summary').replace('{visual}', String(visualSelection!.size)).replace('{units}', String(selectedUnits.length))}</p>
            <Select
              value={selectedDesign?.toString() || ''}
              onChange={(value) => setSelectedDesign(value ? parseInt(value.toString()) : null)}
              options={designs.map(design => ({
                value: design.id,
                label: design.arabicName || design.englishName || `تصميم ${design.id}`
              }))}
              placeholder={t('builder_design_selection_label')}
            />
            {selectedUnits.length > 0 && (
              <p className="mt-1 text-xs text-green-700">{t('builder_ready_assign_design_count').replace('{count}', String(selectedUnits.length))}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            onClick={onPrevious}
            variant="outline"
          >
            {language==='ar'? 'السابق': t('wizard_previous')}
          </Button>

          <div className="flex flex-col gap-2 w-full">
            {selectedUnits.length > 0 && selectedDesign && (
              <Button
                onClick={handleAssignDesign}
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                {t('builder_assign_design_with_count').replace('{count}', String(selectedUnits.length))}
              </Button>
            )}
            
            {/* زر إتمام الخطوة */}
            {!isCompleted && onComplete && (
              <Button
                onClick={onComplete}
                variant="default"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {language === 'ar' ? 'إتمام تعريف البرج' : 'Complete Tower Definition'}
              </Button>
            )}
            
            {isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-medium">
                  {language === 'ar' ? 'تم إكمال تعريف البرج بنجاح!' : 'Tower definition completed successfully!'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step5UnitsDefinition;