import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Trash2, Plus } from 'lucide-react'
import type { StepProps, FloorDefinition, UnitDefinition, BuildingData } from './types'
import { FloorType, UnitType, UnitStatus } from '../../types/api'
import { FloorTypeLabels, UnitTypeLabels } from '../../types/enumLabels'
import { useLanguage } from '../../hooks/useLanguage'
import { useNotifications } from '../../hooks/useNotificationContext'
import { RealEstateAPI } from '../../services/api'
import type { BlockFloorDto, CreateMultipleBlockFloorsRequest, UnitDto } from '../../types/api'

interface MixedUnitRow { id:string; type:number; code:string }
interface FormState { 
  from:number; 
  to:number; 
  blocks:string[]; 
  floorType:FloorType; 
  codePrefix:string; 
  unitType:string; 
  unitsCount:number; 
  startNumber:number; 
  includeTowerName:boolean; 
  includeFloorCode:boolean; 
  includeUnitNumber:boolean; 
  mixed:MixedUnitRow[] 
}
interface ApiFloor { id?:number; blockFloorId?:number; towerBlockId?:number; floorNumber?:number; FloorNumber?:number }

interface Props extends StepProps { 
  createdBlocks:{id:number;name:string;originalName:string}[]; 
  blockFloorsCount:Record<string,number>; 
  floorDefinitions:Record<string,FloorDefinition>; 
  setFloorDefinitions:(d:Record<string,FloorDefinition>)=>void; 
  createdTowerId:number|null; 
  setCreatedBlockFloors:React.Dispatch<React.SetStateAction<{id:number;blockName:string;floorNumber:string;towerBlockId:number}[]>>; 
  towerName?:string; 
  onVisualizationFloorSelection?:(h:(floors:number[],block?:string)=>void)=>void; 
  onSaveDefinitions:()=>void; 
  onAllFloorsPersisted?:()=>void;
  setBuildingData: React.Dispatch<React.SetStateAction<BuildingData>>
}

// Small editor for mixed/ground units
const MixedUnitsEditor:React.FC<{value:MixedUnitRow[];onChange:(v:MixedUnitRow[])=>void;lang:'ar'|'en'}> = ({value,onChange,lang})=>{
  const add=()=>onChange([...value,{id:crypto.randomUUID(),type:UnitType.Residential,code:''}])
  const upd=(id:string,p:Partial<MixedUnitRow>)=>onChange(value.map(r=>r.id===id?{...r,...p}:r))
  const del=(id:string)=>onChange(value.filter(r=>r.id!==id))
  return <div className="space-y-2">
    {value.map(r=> <div key={r.id} className="flex gap-2 items-center">
      <select className="border px-2 py-1 rounded" value={r.type} onChange={e=>upd(r.id,{type:Number(e.target.value)})}>
        {Object.entries(UnitTypeLabels).map(([val,lbl])=> <option key={val} value={val}>{lbl[lang]}</option>)}
      </select>
      <input className="border px-2 py-1 rounded" value={r.code} placeholder={lang==='ar'?'رمز':'Code'} onChange={e=>upd(r.id,{code:e.target.value})}/>
      <button type="button" className="text-red-600 text-xs" onClick={()=>del(r.id)}>حذف</button>
    </div>)}
    <button type="button" onClick={add} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">إضافة</button>
    {value.length===0 && <div className="text-xs text-gray-500">لا وحدات</div>}
  </div>
}

const Step3FloorDefinitions:React.FC<Props>=({createdBlocks,blockFloorsCount,floorDefinitions,setFloorDefinitions,createdTowerId,setCreatedBlockFloors,towerName,onVisualizationFloorSelection,onSaveDefinitions,onAllFloorsPersisted,onPrevious,onNext,isCompleted,setBuildingData})=>{
  const {language, t}=useLanguage(); 
  const {showWarning,showSuccess,showError}=useNotifications()
  const [persisted,setPersisted]=React.useState<Set<string>>(new Set())
  const [showDefinitionForm, setShowDefinitionForm] = useState(false)
  const [form,setForm]=React.useState<FormState>({
    from:1,
    to:1,
    blocks:[],
    floorType:FloorType.Regular,
    codePrefix:'F',
    unitType:'',
    unitsCount:1,
    startNumber:1,
    includeTowerName:false,
    includeFloorCode:true,
    includeUnitNumber:true,
    mixed:[]
  })
  const [codePrefixStartNumber, setCodePrefixStartNumber] = React.useState(1)

  // دالة لمعالجة اختيار الطوابق من الرسمة
  const handleVisualizationFloorSelection = React.useCallback((selectedFloors: number[], selectedBlock?: string) => {
    console.log('🎨 تم اختيار طوابق من الرسمة:', { selectedFloors, selectedBlock })
    
    if (selectedFloors.length > 0) {
      const minFloor = Math.min(...selectedFloors)
      const maxFloor = Math.max(...selectedFloors)
      
      setForm(prev => {
        const updates: Partial<typeof prev> = {
          from: minFloor,
          to: maxFloor
        }
        
        // إضافة البلوك المحدد إلى القائمة
        if (selectedBlock) {
          const blockExists = createdBlocks.find(b => b.name === selectedBlock || b.originalName === selectedBlock)
          if (blockExists) {
            const currentBlocks = prev.blocks
            if (!currentBlocks.includes(blockExists.name)) {
              updates.blocks = [...currentBlocks, blockExists.name]
            } else {
              updates.blocks = currentBlocks
            }
          }
        }
        
        return { ...prev, ...updates }
      })
      
      const floorsText = selectedFloors.length === 1 
        ? `الطابق ${minFloor}` 
        : `الطوابق من ${minFloor} إلى ${maxFloor}`
      
      const blockText = selectedBlock ? ` في البلوك ${selectedBlock}` : ''
      
      showSuccess(
        `تم تحديد ${floorsText}${blockText} من الرسمة`, 
        'اختيار من الرسمة'
      )

      setShowDefinitionForm(true)
    }
  }, [showSuccess, createdBlocks])

  // إعداد callback للمكون الأب مرة واحدة فقط
  const visualizationInitRef = React.useRef(false)
  React.useEffect(() => {
    if (onVisualizationFloorSelection && !visualizationInitRef.current) {
      onVisualizationFloorSelection(handleVisualizationFloorSelection)
      visualizationInitRef.current = true
      console.log('✅ Visualization callback registered')
    }
  }, [onVisualizationFloorSelection, handleVisualizationFloorSelection])

  // دالة لتوليد رمز الوحدة
  const generateUnitCode = (floorCode: string, unitNumber: number, definition: UnitDefinition) => {
    const parts: string[] = []
    
    if (definition.includeTowerName && towerName) {
      parts.push(towerName)
    }
    
    if (definition.includeFloorCode) {
      parts.push(floorCode)
    }
    
    if (definition.includeUnitNumber) {
      parts.push(String(unitNumber).padStart(2, '0'))
    }
    
    return parts.join('-')
  }

  // دالة لمعالجة النموذج - إنشاء التعريفات عند الضغط على الزر
  const handleDefineFloors = () => {
    if (form.blocks.length === 0) {
      showWarning(t('builder_select_blocks_warning'), t('warning'))
      return
    }

    if (form.from > form.to) {
      showWarning(
        language === 'ar' ? 'رقم الطابق الأول يجب أن يكون أقل من أو يساوي رقم الطابق الأخير' : 'From floor must be less than or equal to To floor',
        t('warning')
      )
      return
    }

    // التحقق من اختيار نوع الوحدة للطوابق غير الخدمية والمختلطة والأرضية
    if (form.floorType !== FloorType.Mixed && 
        form.floorType !== FloorType.Ground && 
        form.floorType !== FloorType.Service && 
        !form.unitType) {
      showWarning(
        language === 'ar' ? 'يرجى اختيار نوع الوحدة' : 'Please select unit type',
        t('warning')
      )
      return
    }

    // التحقق من عدد الطوابق لكل بلوك
    const invalidBlocks: string[] = []
    form.blocks.forEach(b => {
      const maxFloors = blockFloorsCount[b] || 0
      if (form.to > maxFloors) {
        invalidBlocks.push(`${b} (${language === 'ar' ? 'الحد الأقصى' : 'max'}: ${maxFloors})`)
      }
    })
    
    if (invalidBlocks.length > 0) {
      showWarning(
        language === 'ar' 
          ? `تحذير: الطابق ${form.to} غير موجود في البلوكات التالية: ${invalidBlocks.join(', ')}`
          : `Warning: Floor ${form.to} does not exist in blocks: ${invalidBlocks.join(', ')}`,
        language === 'ar' ? 'تحذير' : 'Warning'
      )
      return
    }

    const newDefs:Record<string,FloorDefinition>={...floorDefinitions}
    
    for(let n=form.from;n<=form.to;n++){
      form.blocks.forEach(b=>{
        const maxFloors = blockFloorsCount[b] || 0
        if (n > maxFloors) return
        
        const key=`${b}-floor-${n}`
        if(persisted.has(key)) return
        
        const seq=(n-form.from)+1
        const numericPrefix=/^\d+$/.test(form.codePrefix)
        let floorCode=''
        
        // للطوابق الأرضية
        // if(form.floorType===FloorType.Ground) {
        //   floorCode='G'
        // }
        // للطوابق السكنية العادية فقط
        // else
           if(form.floorType===FloorType.Regular && numericPrefix) {
          floorCode=String(Number(form.codePrefix)+seq-1)
        }
        else if(form.floorType===FloorType.Regular && !numericPrefix) {
          floorCode=`${form.codePrefix}${n}`
        }
        else if(form.floorType===FloorType.Ground) {
          floorCode=`${form.codePrefix}`
        }
        // لجميع الأنواع الأخرى (باركنج، خدمي، مكتبي، إلخ)
        else {
          floorCode=`${form.codePrefix}${codePrefixStartNumber + seq - 1}`
        }
        
        const base:Partial<FloorDefinition>={
          floorCode,
          arabicName:`الطابق ${n}`,
          englishName:`Floor ${n}`,
          floorNumber:n,
          floorType:form.floorType
        }
        
        // الطوابق الخدمية والمختلطة والأرضية تستخدم إدخال يدوي للوحدات
        if(form.floorType===FloorType.Mixed || form.floorType===FloorType.Ground || form.floorType===FloorType.Service) {
          base.mixedUnits=form.mixed
        } else {
          base.unitsDefinition={
            type:form.unitType,
            count:form.unitType==='parking'?0:form.unitsCount,
            startNumber:form.startNumber,
            codePrefix:form.codePrefix,
            includeTowerName:form.includeTowerName,
            includeFloorCode:form.includeFloorCode,
            includeUnitNumber:form.includeUnitNumber
          }
        }
        newDefs[key]=base as FloorDefinition
      })
    }

    setFloorDefinitions(newDefs)
    setShowDefinitionForm(false)
    
    const totalFloors = Object.keys(newDefs).length - Object.keys(floorDefinitions).length
    showSuccess(`${t('builder_defs_created_success').replace('{count}', String(totalFloors))}`, t('success'))

    // تحديث الرسمة بالمعاينة
    setBuildingData(prev => {
      const existingBlocks = prev.blocks || []
      
      const updatedBlocks = existingBlocks.map(block => {
        const existingFloors = block.floors || []
        
        const newBlockFloors = Object.keys(newDefs)
          .filter(key => key.startsWith(`${block.name}-floor-`))
          .map(key => {
            const floorNumber = key.split('-floor-')[1]
            const definition = newDefs[key]
            
            const units = []
            if (definition.unitsDefinition && definition.unitsDefinition.type !== 'parking') {
              for (let i = 0; i < definition.unitsDefinition.count; i++) {
                const unitNumber = definition.unitsDefinition.startNumber + i
                const unitCode = generateUnitCode(definition.floorCode, unitNumber, definition.unitsDefinition)
                
                const displayNumber = definition.unitsDefinition.type === 'apartment' 
                  ? String(unitNumber).padStart(2, '0')
                  : unitCode
                
                units.push({
                  id: `unit-${block.name}-${floorNumber}-${unitNumber}`,
                  number: displayNumber,
                  type: definition.unitsDefinition.type,
                  code: unitCode,
                  color: '#10B981',
                  status: 'defined',
                  isDefined: true
                })
              }
            }
            
            return {
              id: `floor-${block.name}-${floorNumber}`,
              number: floorNumber,
              units,
              floorCode: definition.floorCode,
              floorType: definition.floorType,
              isDefined: true,
              isSelectable: true,
              isVisualizationMode: true
            }
          })
        
        const allFloors = [...existingFloors]
        newBlockFloors.forEach(newFloor => {
          const existingIndex = allFloors.findIndex(f => f.number === newFloor.number)
          if (existingIndex >= 0) {
            allFloors[existingIndex] = { ...newFloor, isSelectable: true, isVisualizationMode: true }
          } else {
            allFloors.push({ ...newFloor, isSelectable: true, isVisualizationMode: true })
          }
        })
        
        return {
          ...block,
          floors: allFloors.sort((a, b) => parseInt(a.number) - parseInt(b.number))
        }
      })
      
      return { ...prev, blocks: updatedBlocks }
    })
  }

  const unitTypeNumeric=(raw:string|number)=>{ 
    if(typeof raw==='number') return raw
    if(/^\d+$/.test(raw)) return Number(raw)
    const map:Record<string,number>={
      apartment:UnitType.Residential,
      office:UnitType.Office,
      commercial:UnitType.Commercial,
      parking:UnitType.Parking,
      shop:UnitType.Shop,
      storage:UnitType.Storage,
      clinic:UnitType.Clinic,
      restaurant:UnitType.Restaurant
    }
    return map[raw.toLowerCase()] ?? UnitType.Residential 
  }

  const handleSave=async()=>{
    if(!Object.keys(floorDefinitions).length){ 
      showWarning(t('no_data'), t('warning') || '')
      return 
    }
    
    // التحقق من أن الوحدات في الطوابق الخدمية والمختلطة والأرضية تحتوي على أكواد
    for(const d of Object.values(floorDefinitions)){ 
      if((d.floorType===FloorType.Mixed || d.floorType===FloorType.Ground || d.floorType===FloorType.Service) && d.mixedUnits?.some(u=>!u.code.trim())){ 
        showWarning(t('builder_select_units_and_design_warning'), t('warning'))
        return 
      } 
    }
    
    try {
      const floors:BlockFloorDto[]=[]
      const units:UnitDto[]=[]
      
      Object.entries(floorDefinitions).forEach(([k,d])=>{ 
        const [blockName,fStr]=k.split('-floor-')
        const floorNumber=parseInt(fStr)
        const block=createdBlocks.find(b=>b.name===blockName)
        if(!block) return
        
        floors.push({ 
          BlockId:block.id, 
          TowerId:createdTowerId||undefined, 
          FloorCode:d.floorCode, 
          FloorArabicName:d.arabicName, 
          FloorEnglishName:d.englishName, 
          FloorNumber:d.floorNumber, 
          SortOrder:floorNumber, 
          FloorType:d.floorType, 
          UnitsCount:d.unitsDefinition?.count||0, 
          UnitNumberPattern:'A##01', 
          HasSharedFacilities:false, 
          ElevatorsCount:0, 
          StaircasesCount:1, 
          HasEmergencyExit:false, 
          IsActive:true, 
          DisplayOrder:floorNumber 
        })
        
        // الطوابق الخدمية والمختلطة والأرضية تستخدم mixedUnits
        if((d.floorType===FloorType.Mixed || d.floorType===FloorType.Ground || d.floorType===FloorType.Service) && d.mixedUnits){ 
          d.mixedUnits.forEach(mu=> units.push({ 
            unitNumber:mu.code.trim(), // رمز الوحدة فقط كما أدخله المستخدم
            floorNumber:d.floorNumber, 
            TowerId:createdTowerId!, 
            BlockId:block.id, 
            blockFloorId:0, 
            type:mu.type as UnitType, 
            status:UnitStatus.Available, 
            isActive:true, 
            floorCode:d.floorCode 
          })) 
        } else if(d.unitsDefinition && d.unitsDefinition.count>0){ 
          const t=unitTypeNumeric(d.unitsDefinition.type)
          for(let i=0;i<d.unitsDefinition.count;i++){ 
            const uNum=d.unitsDefinition.startNumber+i
            // تخزين رقم الوحدة فقط لجميع الأنواع (بدون رمز الطابق أو البرج)
            units.push({ 
              unitNumber:String(uNum).padStart(2,'0'), 
              floorNumber:d.floorNumber, 
              TowerId:createdTowerId!, 
              BlockId:block.id, 
              blockFloorId:0, 
              type:t as UnitType, 
              status:UnitStatus.Available, 
              isActive:true, 
              floorCode:d.floorCode 
            }) 
          } 
        } 
      })
      
      const resp=await RealEstateAPI.blockFloor.createMultiple({blockFloors:floors} as CreateMultipleBlockFloorsRequest,language)
      const apiFloorsRaw = resp.data?.data?.blockFloors || resp.data?.data || []
      const apiFloorsArr: ApiFloor[] = Array.isArray(apiFloorsRaw) ? apiFloorsRaw : []
      const created: { id:number; blockName:string; floorNumber:string; towerBlockId:number }[] = []
      
      apiFloorsArr.forEach((f:ApiFloor, i:number)=>{ 
        const req=floors[i]
        const floorId=(f.id||f.blockFloorId||0) as number
        const towerBlockId=(f.towerBlockId??req.BlockId) as number
        const blockName=createdBlocks.find(b=>b.id===towerBlockId)?.name||'Unknown'
        const raw=(f.floorNumber??f.FloorNumber??req.FloorNumber) as number
        created.push({id:floorId,blockName,floorNumber:String(raw).padStart(2,'0'),towerBlockId})
        units.forEach(u=>{ if(u.BlockId===towerBlockId && u.floorNumber===raw) u.blockFloorId=floorId }) 
      })
      
      setCreatedBlockFloors(created)
      
      if(units.length) {
        await RealEstateAPI.unit.createMultiple({units},language)
      }
      
      console.log('✅ تم حفظ الطوابق والشقق - عدد الشقق:', units.length)
      
      showSuccess(
        language==='ar'
          ?`تم حفظ ${floors.length} ${t('builder_floors_suffix')} و ${units.length} ${t('builder_units_suffix')}`
          :`Saved ${floors.length} ${t('builder_floors_suffix')}(s) & ${units.length} ${t('builder_units_suffix')}(s)`, 
        t('success')
      )
      
      const saved=Object.keys(floorDefinitions)
      setPersisted(p=>{ const n=new Set(p); saved.forEach(k=>n.add(k)); return n })
      setFloorDefinitions({})
      setForm(f=>({...f,blocks:[],from:1,to:1,mixed:[]}))
      setCodePrefixStartNumber(1)
      
      const totalNeeded=createdBlocks.reduce((s,b)=>s+(blockFloorsCount[b.originalName]||0),0)
      const definedCount=(function(){ 
        const s=new Set<string>()
        saved.forEach(k=>s.add(k))
        persisted.forEach(k=>s.add(k))
        return s.size 
      })()
      
      if(definedCount>=totalNeeded && totalNeeded>0){ 
        onSaveDefinitions()
        onAllFloorsPersisted?.() 
      }
    } catch(err){ 
      console.error(err)
      showError(t('error'), t('error')) 
    }
  }

  const totalNeeded=createdBlocks.reduce((s,b)=>s+(blockFloorsCount[b.originalName]||0),0)
  const progress= totalNeeded? Math.round((persisted.size/totalNeeded)*100):0

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-xl font-semibold">{t('builder_step3_heading')}</h3>
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded border">{t('builder_step3_edit_hint')}</div>
        </div>

        {/* إرشادات للمستخدم */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <div className="text-blue-500 mt-1">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h5 className="text-lg font-semibold text-blue-900 mb-2">🎯 طرق تحديد الطوابق:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <h6 className="font-semibold text-blue-800 mb-2">📱 من الرسمة التفاعلية:</h6>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• انقر على الطوابق في رسمة البناء لتحديدها</li>
                    <li>• يمكن اختيار عدة طوابق معاً</li>
                    <li>• <strong>الطوابق تبقى قابلة للاختيار</strong></li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100">
                  <h6 className="font-semibold text-green-800 mb-2">⌨️ من القوائم:</h6>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• اختر نطاق الطوابق يدوياً</li>
                    <li>• حدد البلوكات المراد تعريفها</li>
                    <li>• مفيد للنطاقات الكبيرة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floor range selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-3 shadow-sm">
            <Label className="text-xs text-gray-500">{t('builder_range_from')}</Label>
            <select className="mt-1 w-full border rounded px-2 py-2 focus:ring-2 focus:ring-blue-500" value={form.from} onChange={e=>setForm(p=>({...p,from:parseInt(e.target.value)}))}>
              {Array.from({length:Math.max(...Object.values(blockFloorsCount),1)},(_,i)=>i+1).map(n=> <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="bg-white border rounded-lg p-3 shadow-sm">
            <Label className="text-xs text-gray-500">{t('builder_range_to')}</Label>
            <select className="mt-1 w-full border rounded px-2 py-2 focus:ring-2 focus:ring-blue-500" value={form.to} onChange={e=>setForm(p=>({...p,to:parseInt(e.target.value)}))}>
              {Array.from({length:Math.max(...Object.values(blockFloorsCount),1)},(_,i)=>i+1).map(n=> <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-lg p-3 shadow-sm flex flex-col justify-center">
            <Label className="text-xs text-gray-500">{t('builder_range_label')}</Label>
            <div className="mt-1 text-sm font-medium text-blue-800">
              {form.from===form.to?`${language==='ar'? 'الطابق':'Floor'} ${form.from}`:`${t('builder_range_from')} ${form.from} ${t('builder_range_to')} ${form.to}`}
              <span className="text-xs text-blue-500 ml-2">({language==='ar'? 'إجمالي':'Total'} {form.to-form.from+1})</span>
            </div>
          </div>
        </div>

        {/* Blocks selection */}
        <div>
          <Label className="block mb-2 font-medium">{t('builder_blocks_label')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {createdBlocks.map((b,i)=>{ 
              const sel=form.blocks.includes(b.name)
              return (
                <button 
                  type="button" 
                  key={b.id} 
                  onClick={()=>setForm(p=>({...p,blocks: sel? p.blocks.filter(x=>x!==b.name):[...p.blocks,b.name]}))} 
                  className={`relative group text-right p-4 rounded-lg border transition shadow-sm ${sel? 'bg-blue-600 border-blue-600 text-white':'bg-white hover:border-blue-400 border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">{language==='ar'? `${t('builder_block_label')} ${String.fromCharCode(65+i)}`:`${t('builder_block_label')} ${String.fromCharCode(65+i)}`}</div>
                      <div className={`text-xs mt-0.5 ${sel? 'text-blue-100':'text-gray-500'}`}>{b.originalName}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${sel? 'bg-blue-500 text-white':'bg-gray-100 text-gray-600'}`}>
                      {blockFloorsCount[b.originalName]||0} {language==='ar'? t('builder_floor_singular'): t('builder_floor_singular')}
                    </div>
                  </div>
                  {sel && <div className="absolute top-1.5 left-1.5 text-white">✓</div>}
                </button>
              )
            })}
          </div>
          {form.blocks.length>0 && (
            <div className="mt-2 text-xs text-green-600">
              {t('builder_defs_will_create_count').replace('{count}', String(form.blocks.length * (form.to-form.from+1)))}
            </div>
          )}
        </div>

        <Button
          onClick={() => setShowDefinitionForm(true)}
          disabled={form.blocks.length === 0}
          className="w-full mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          تعريف الطوابق المختارة
        </Button>

        {/* نموذج تفاصيل التعريف */}
        {showDefinitionForm && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h4 className="text-lg font-medium text-blue-900 mb-4">تفاصيل تعريف الطوابق</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Floor attributes */}
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <Label className="text-xs text-gray-500">{t('builder_floor_type_label')}</Label>
                <select 
                  className="mt-1 w-full border rounded px-2 py-2 focus:ring-2 focus:ring-blue-500" 
                  value={form.floorType} 
                  onChange={e=>setForm(p=>({...p,floorType:Number(e.target.value) as FloorType}))}
                >
                  {Object.entries(FloorTypeLabels).map(([val,lbl])=> <option key={val} value={val}>{lbl[language]}</option>)}
                </select>
              </div>
              
              {/* بادئة الكود - تظهر لجميع الأنواع ما عدا Mixed و Ground */}
              {/* {form.floorType!==FloorType.Mixed && form.floorType!==FloorType.Ground && ( */}
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <Label className="text-xs text-gray-500">{t('builder_code_prefix_label')}</Label>
                  <Input value={form.codePrefix} onChange={e=>setForm(p=>({...p,codePrefix:e.target.value}))} className="mt-1"/>
                </div>
              {/* )} */}
              
              {/* رقم بداية بادئة الكود - تظهر للأنواع غير السكنية */}
              { form.floorType!==FloorType.Regular && form.floorType!==FloorType.Ground && (
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <Label className="text-xs text-gray-500">
                    {language === 'ar' ? 'بداية ترقيم بادئة الكود' : 'Code Prefix Start Number'}
                  </Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={codePrefixStartNumber} 
                    onChange={e=>setCodePrefixStartNumber(parseInt(e.target.value)||1)} 
                    className="mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {language === 'ar' 
                      ? `مثال: ${form.codePrefix}${codePrefixStartNumber}, ${form.codePrefix}${codePrefixStartNumber+1}, ${form.codePrefix}${codePrefixStartNumber+2}...`
                      : `Example: ${form.codePrefix}${codePrefixStartNumber}, ${form.codePrefix}${codePrefixStartNumber+1}, ${form.codePrefix}${codePrefixStartNumber+2}...`
                    }
                  </div>
                </div>
              )}
              
              {form.floorType!==FloorType.Mixed && form.floorType!==FloorType.Ground && form.floorType!==FloorType.Service && (
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <Label className="text-xs text-gray-500">{t('builder_unit_type_label')}</Label>
                  <select 
                    className="mt-1 w-full border rounded px-2 py-2 focus:ring-2 focus:ring-blue-500" 
                    value={form.unitType} 
                    onChange={e=>setForm(p=>({...p,unitType:e.target.value}))}
                  >
                    <option value="" disabled>
                      {language === 'ar' ? 'اختر نوع الوحدة...' : 'Select unit type...'}
                    </option>
                    {Object.entries(UnitTypeLabels).map(([v,l])=> <option key={v} value={v}>{l[language]}</option>)}
                  </select>
                </div>
              )}
              
              {form.floorType!==FloorType.Mixed && form.floorType!==FloorType.Ground && form.floorType!==FloorType.Service &&(
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <Label className="text-xs text-gray-500">{t('builder_units_count_label')}</Label>
                  <Input type="number" min={1} value={form.unitsCount} onChange={e=>setForm(p=>({...p,unitsCount:parseInt(e.target.value)||1}))} className="mt-1"/>
                </div>
              )}
              
              {form.floorType!==FloorType.Mixed && form.floorType!==FloorType.Ground && form.floorType!==FloorType.Service && form.floorType!==FloorType.Parking && (
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  <Label className="text-xs text-gray-500">{t('builder_units_start_number_label')}</Label>
                  <Input type="number" min={1} value={form.startNumber} onChange={e=>setForm(p=>({...p,startNumber:parseInt(e.target.value)||1}))} className="mt-1"/>
                </div>
              )}
            </div>
            
            {(form.floorType===FloorType.Mixed||form.floorType===FloorType.Ground || form.floorType===FloorType.Service) && (
              <div className="mt-2 bg-white p-4 rounded-lg border shadow-sm">
                <h5 className="font-semibold mb-2 text-sm">{t('builder_mixed_units_label')}</h5>
                <MixedUnitsEditor value={form.mixed} onChange={mixed=>setForm(p=>({...p,mixed}))} lang={language}/>
                <div className="mt-2 text-xs text-gray-500">{t('builder_mixed_units_hint')}</div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowDefinitionForm(false)}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleDefineFloors}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                تطبيق التعريف
              </Button>
            </div>
          </Card>
        )}
      </Card>
      
      <Card className="p-4 mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span>{t('builder_progress_label')}</span>
          <span>{t('builder_progress_format').replace('{current}', String(persisted.size)).replace('{total}', String(totalNeeded)).replace('{percent}', String(progress))}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div className="h-2 bg-green-500 rounded" style={{width:`${progress}%`}}/>
        </div>
      </Card>
      
      {Object.keys(floorDefinitions).length>0 && (
        <Card className="p-6 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">{t('builder_preview_floors_label')}</h4>
            <Button size="sm" variant="outline" className="text-red-600" onClick={()=>setFloorDefinitions({})}>
              <Trash2 className="w-4 h-4 mr-1"/>{t('builder_clear_preview')}
            </Button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto text-sm">
            {Object.entries(floorDefinitions).map(([k,d])=>{ 
              const [blockName,f]=k.split('-floor-')
              return (
                <div key={k} className="p-3 bg-gray-50 border rounded">
                  <div className="flex justify-between">
                    <span>{blockName} - {language==='ar'? `${t('builder_floor_singular')} ${f}`:`${t('builder_floor_singular')} ${f}`}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600" 
                      onClick={()=>{ 
                        const nd={...floorDefinitions}
                        delete nd[k]
                        setFloorDefinitions(nd) 
                      }}
                    >
                      {t('builder_delete')}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    <div><strong>{t('builder_code_label')}</strong> {d.floorCode}</div>
                    <div><strong>{t('builder_type_label')}</strong> {FloorTypeLabels[d.floorType]?.[language]}</div>
                    {d.unitsDefinition && (
                      <>
                        <div><strong>{t('builder_units_label')}</strong> {d.unitsDefinition.count}</div>
                        <div><strong>{t('builder_start_label')}</strong> {d.unitsDefinition.startNumber}</div>
                      </>
                    )}
                    {d.mixedUnits && (
                      <div className="col-span-2"><strong>{t('builder_mixed_units_short')}</strong> {d.mixedUnits.length}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
      
      <Card className="p-6 mt-4">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onPrevious}>
            {language==='ar'? 'السابق': t('wizard_previous')}
          </Button>
          <Button 
            disabled={!Object.keys(floorDefinitions).length} 
            onClick={handleSave} 
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {t('save')}
          </Button>
        </div>
        {isCompleted && (
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={onNext}>
              {language==='ar'? 'التالي': t('wizard_next')}
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}

export default Step3FloorDefinitions