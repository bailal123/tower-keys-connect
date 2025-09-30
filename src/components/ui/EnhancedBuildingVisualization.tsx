import React, { useState, useRef, useEffect } from 'react'
import { Building2, Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import type { BuildingData } from '../building-builder/types'

interface EnhancedBuildingVisualizationProps {
  buildingData: BuildingData
  currentStep: number
  onUnitClick?: (unitId: string) => void
  selectedUnits?: Set<string>
  onBlockUpdate?: (blockId: string, updates: Record<string, unknown>) => void
}

const EnhancedBuildingVisualization: React.FC<EnhancedBuildingVisualizationProps> = ({
  buildingData,
  currentStep,
  onUnitClick,
  selectedUnits = new Set()
}) => {
  const [view3D, setView3D] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // حساب الإحصائيات
  const totalBlocks = buildingData.blocks.length
  const totalFloors = buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)
  const totalUnits = buildingData.blocks.reduce((total, block) => 
    total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
  )

  // رسم البرج على Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || totalBlocks === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // مسح Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // إعدادات الرسم
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const blockWidth = 120
    const blockHeight = 200
    const blockSpacing = 140
    const floorHeight = 25
    const unitWidth = 20
    const unitHeight = 20

    // رسم الخلفية
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f0f8ff')
    gradient.addColorStop(1, '#e6f3ff')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // رسم البلوكات
    buildingData.blocks.forEach((block, blockIndex) => {
      const blockX = centerX + (blockIndex - (totalBlocks - 1) / 2) * blockSpacing
      const blockY = centerY + 50

      // رسم البلوك الأساسي
      ctx.fillStyle = view3D ? '#8B7355' : '#e2e8f0'
      ctx.strokeStyle = '#475569'
      ctx.lineWidth = 2
      
      if (view3D) {
        // رسم ثلاثي الأبعاد
        const offsetX = 10
        const offsetY = -10
        
        // الجانب الخلفي
        ctx.fillStyle = '#6B5B47'
        ctx.fillRect(blockX + offsetX, blockY + offsetY, blockWidth, blockHeight)
        
        // الجانب الأمامي
        ctx.fillStyle = '#8B7355'
        ctx.fillRect(blockX, blockY, blockWidth, blockHeight)
        
        // الخطوط الجانبية
        ctx.beginPath()
        ctx.moveTo(blockX + blockWidth, blockY)
        ctx.lineTo(blockX + blockWidth + offsetX, blockY + offsetY)
        ctx.moveTo(blockX + blockWidth, blockY + blockHeight)
        ctx.lineTo(blockX + blockWidth + offsetX, blockY + blockHeight + offsetY)
        ctx.moveTo(blockX, blockY)
        ctx.lineTo(blockX + offsetX, blockY + offsetY)
        ctx.stroke()
      } else {
        ctx.fillRect(blockX, blockY, blockWidth, blockHeight)
        ctx.strokeRect(blockX, blockY, blockWidth, blockHeight)
      }

      // عنوان البلوك
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`البلوك ${block.name}`, blockX + blockWidth / 2, blockY - 10)

      // رسم الطوابق
      block.floors.forEach((floor, floorIndex) => {
        const floorY = blockY + blockHeight - (floorIndex + 1) * floorHeight
        
        // خط الطابق
        ctx.strokeStyle = '#64748b'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(blockX, floorY)
        ctx.lineTo(blockX + blockWidth, floorY)
        ctx.stroke()

        // رقم الطابق
        ctx.fillStyle = '#475569'
        ctx.font = '12px Arial'
        ctx.textAlign = 'right'
        ctx.fillText(floor.number, blockX - 5, floorY - 5)

        // رسم الوحدات
        const unitsPerRow = Math.floor(blockWidth / unitWidth)
        floor.units.forEach((unit, unitIndex) => {
          const unitX = blockX + (unitIndex % unitsPerRow) * unitWidth + 5
          const unitY = floorY + 5
          const unitId = `${block.id}-${floor.id}-${unit.id}`
          const isSelected = selectedUnits.has(unitId)

          // لون الوحدة
          ctx.fillStyle = isSelected ? '#22c55e' : '#f1f5f9'
          ctx.strokeStyle = isSelected ? '#16a34a' : '#94a3b8'
          ctx.lineWidth = 1

          ctx.fillRect(unitX, unitY, unitWidth - 2, unitHeight - 2)
          ctx.strokeRect(unitX, unitY, unitWidth - 2, unitHeight - 2)

          // رقم الوحدة
          if (unitWidth > 15) {
            ctx.fillStyle = isSelected ? '#ffffff' : '#64748b'
            ctx.font = '8px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(unit.number, unitX + unitWidth / 2 - 1, unitY + unitHeight / 2 + 2)
          }
        })
      })

      // معلومات البلوك
      ctx.fillStyle = '#475569'
      ctx.font = '11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${block.floors.length} طوابق`, blockX + blockWidth / 2, blockY + blockHeight + 20)
      ctx.fillText(`${block.floors.reduce((total, floor) => total + floor.units.length, 0)} وحدة`, 
                   blockX + blockWidth / 2, blockY + blockHeight + 35)
    })

    // إضافة عنوان البرج
    if (buildingData.name) {
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(buildingData.name, centerX, 40)
    }

  }, [buildingData, view3D, selectedUnits, totalBlocks])

  // معالجة النقر على Canvas
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onUnitClick) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // حساب موقع النقر وتحديد الوحدة
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const blockWidth = 120
    const blockSpacing = 140
    const floorHeight = 25
    const unitWidth = 20

    buildingData.blocks.forEach((block, blockIndex) => {
      const blockX = centerX + (blockIndex - (totalBlocks - 1) / 2) * blockSpacing
      const blockY = centerY + 50

      if (x >= blockX && x <= blockX + blockWidth && y >= blockY && y <= blockY + 200) {
        block.floors.forEach((floor, floorIndex) => {
          const floorY = blockY + 200 - (floorIndex + 1) * floorHeight
          
          if (y >= floorY + 5 && y <= floorY + 25) {
            const unitsPerRow = Math.floor(blockWidth / unitWidth)
            floor.units.forEach((unit, unitIndex) => {
              const unitX = blockX + (unitIndex % unitsPerRow) * unitWidth + 5
              
              if (x >= unitX && x <= unitX + unitWidth - 2) {
                const unitId = `${block.id}-${floor.id}-${unit.id}`
                onUnitClick(unitId)
              }
            })
          }
        })
      }
    })
  }

  // إذا لم تكن هناك بيانات، اعرض رسالة
  if (!buildingData.name && totalBlocks === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
        <Building2 className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد بيانات لعرضها</h3>
        <p className="text-gray-500 text-center max-w-md">
          قم بإنشاء البرج أولاً، ثم أضف البلوكات والطوابق لرؤية التصور التفاعلي
        </p>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg border shadow-sm">
      {/* شريط التحكم */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              {buildingData.name || 'البرج الجديد'}
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {totalBlocks} بلوك
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-1 rounded hover:bg-gray-200"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-xs text-gray-600 px-2">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={() => setScale(Math.min(2, scale + 0.1))}
              className="p-1 rounded hover:bg-gray-200"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-1 rounded hover:bg-gray-200"
              title="تدوير"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setView3D(!view3D)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                view3D 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {view3D ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {view3D ? 'عرض 2D' : 'عرض 3D'}
            </button>
          </div>
        </div>
      </div>

      {/* منطقة العرض */}
      <div className="p-6">
        {totalBlocks === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Building2 className="w-12 h-12 mb-3 opacity-50" />
            <p>لا توجد بلوكات لعرضها</p>
            <p className="text-sm">أضف بلوكات في الخطوة الثانية</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onClick={handleCanvasClick}
              className="border rounded-lg shadow-sm cursor-crosshair"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            />
          </div>
        )}
      </div>

      {/* شريط المعلومات السفلي */}
      <div className="px-6 py-3 bg-gray-50 border-t rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>الخطوة الحالية: {currentStep}</span>
            {selectedUnits.size > 0 && (
              <span className="text-green-600 font-medium">
                تم اختيار {selectedUnits.size} وحدة
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span>إجمالي البلوكات: {totalBlocks}</span>
            <span>إجمالي الطوابق: {totalFloors}</span>
            <span>إجمالي الوحدات: {totalUnits}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedBuildingVisualization