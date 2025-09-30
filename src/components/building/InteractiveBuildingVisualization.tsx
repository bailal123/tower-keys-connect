import React, { useState, useRef, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Circle, Line, Group } from 'react-konva'
import type { BuildingData, Block, Floor, Unit } from '../building-builder/types'
import Konva from 'konva'

interface BlockUpdateData {
  position?: BlockPosition
  [key: string]: unknown
}

interface InteractiveBuildingVisualizationProps {
  buildingData: BuildingData
  currentStep: number
  onBlockUpdate?: (blockId: string, updates: BlockUpdateData) => void
}

interface BlockPosition {
  x: number
  y: number
  rotation: number
}

const InteractiveBuildingVisualization: React.FC<InteractiveBuildingVisualizationProps> = ({
  buildingData,
  currentStep,
  onBlockUpdate
}) => {
  const stageRef = useRef<Konva.Stage>(null)
  const [blockPositions, setBlockPositions] = useState<Record<string, BlockPosition>>({})
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })

  // ألوان واقعية للمباني - طوب وخرسانة
  const blockColors = [
    '#8B7355', // لون الطوب الطبيعي البني
    '#A0937D', // لون الطوب البيج الفاتح
    '#967A65', // لون الطوب البني المتوسط
    '#CD853F', // لون الطوب الرملي البني
    '#D2B48C', // لون الطوب التان
    '#BC9A6A', // لون الطوب الخاكي
    '#8FBC8F', // لون الخرسانة الأخضر الحكيم
    '#708090'  // لون الخرسانة الرمادي الأردوازي
  ]

  // مقاسات الشاشة
  const stageWidth = 800
  const stageHeight = 600

  // دالة للحصول على موقع البلوك
  const getBlockPosition = (blockId: string, index: number): BlockPosition => {
    return blockPositions[blockId] || {
      x: 150 + index * 120,
      y: stageHeight - 200,
      rotation: 0
    }
  }

  // دالة تحديث موقع البلوك
  const handleBlockDragEnd = useCallback((blockId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
      rotation: blockPositions[blockId]?.rotation || 0
    }
    
    setBlockPositions(prev => ({
      ...prev,
      [blockId]: newPosition
    }))

    if (onBlockUpdate) {
      onBlockUpdate(blockId, { position: newPosition })
    }
  }, [blockPositions, onBlockUpdate])

  // دالة التكبير والتصغير
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    const scaleBy = 1.05
    const stage = e.target.getStage()
    if (!stage) return

    const oldScale = stage.scaleX()
    const mousePointTo = {
      x: stage.getPointerPosition()!.x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition()!.y / oldScale - stage.y() / oldScale
    }

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
    
    setScale(Math.max(0.5, Math.min(3, newScale)))
    
    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition()!.x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition()!.y / newScale) * newScale
    }
    setStagePos(newPos)
  }, [])

  // رسم الخلفية والأرض
  const renderBackground = () => (
    <Group>
      {/* السماء بتدرج */}
      <Rect
        x={-stageWidth}
        y={-stageHeight}
        width={stageWidth * 3}
        height={stageHeight * 1.5}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: stageHeight }}
        fillLinearGradientColorStops={[0, '#87CEEB', 0.7, '#E0F6FF', 1, '#F8FAFC']}
      />
      
      {/* الأرض */}
      <Rect
        x={-stageWidth}
        y={stageHeight - 100}
        width={stageWidth * 3}
        height={200}
        fillLinearGradientStartPoint={{ x: 0, y: stageHeight - 100 }}
        fillLinearGradientEndPoint={{ x: 0, y: stageHeight }}
        fillLinearGradientColorStops={[0, '#22C55E', 0.5, '#16A34A', 1, '#15803D']}
      />
      
      {/* الشمس */}
      <Circle
        x={stageWidth - 100}
        y={80}
        radius={40}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={40}
        fillRadialGradientColorStops={[0, '#FEF08A', 0.7, '#FDE047', 1, '#FACC15']}
        shadowColor="rgba(253, 224, 71, 0.5)"
        shadowBlur={20}
        shadowOffset={{ x: 0, y: 0 }}
      />
      
      {/* السحب */}
      {[
        { x: 100, y: 120, size: 1 },
        { x: 300, y: 90, size: 0.8 },
        { x: 500, y: 140, size: 1.2 }
      ].map((cloud, index) => (
        <Group key={index}>
          <Circle x={cloud.x} y={cloud.y} radius={25 * cloud.size} fill="rgba(255, 255, 255, 0.8)" />
          <Circle x={cloud.x + 20 * cloud.size} y={cloud.y} radius={30 * cloud.size} fill="rgba(255, 255, 255, 0.7)" />
          <Circle x={cloud.x + 40 * cloud.size} y={cloud.y} radius={20 * cloud.size} fill="rgba(255, 255, 255, 0.8)" />
        </Group>
      ))}
    </Group>
  )

  // رسم بلوك واحد
  const renderBlock = (block: Block, index: number) => {
    const position = getBlockPosition(block.id, index)
    const blockWidth = 100
    const floorHeight = 20
    const totalHeight = Math.max(block.floors.length * floorHeight, 60)
    const color = blockColors[index % blockColors.length]
    const isSelected = selectedBlock === block.id

    return (
      <Group
        key={block.id}
        x={position.x}
        y={position.y}
        rotation={position.rotation}
        draggable={true}
        onDragEnd={(e) => handleBlockDragEnd(block.id, e)}
        onClick={() => setSelectedBlock(block.id)}
        onTap={() => setSelectedBlock(block.id)}
      >
        {/* ظل البلوك */}
        <Rect
          x={5}
          y={5}
          width={blockWidth}
          height={totalHeight}
          fill="rgba(0, 0, 0, 0.2)"
          cornerRadius={5}
        />
        
        {/* البلوك الرئيسي */}
        <Rect
          x={0}
          y={0}
          width={blockWidth}
          height={totalHeight}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: blockWidth, y: 0 }}
          fillLinearGradientColorStops={[0, color, 0.5, color + 'CC', 1, color + '99']}
          stroke={isSelected ? '#FFD700' : '#374151'}
          strokeWidth={isSelected ? 3 : 1}
          cornerRadius={5}
          shadowColor="rgba(0, 0, 0, 0.3)"
          shadowBlur={isSelected ? 10 : 5}
          shadowOffset={{ x: 2, y: 2 }}
        />

        {/* رسم الطوابق */}
        {block.floors.map((floor: Floor, floorIndex: number) => {
          const floorY = totalHeight - (floorIndex + 1) * floorHeight
          
          return (
            <Group key={floor.id}>
              {/* خط الطابق */}
              <Line
                points={[5, floorY, blockWidth - 5, floorY]}
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth={1}
              />
              
              {/* رسم الشقق */}
              {floor.units.map((unit: Unit, unitIndex: number) => {
                const unitWidth = (blockWidth - 20) / Math.max(floor.units.length, 1)
                const unitX = 10 + unitIndex * unitWidth
                
                return (
                  <Group key={unit.id}>
                    {/* نافذة الشقة */}
                    <Rect
                      x={unitX + 2}
                      y={floorY + 3}
                      width={unitWidth - 4}
                      height={floorHeight - 6}
                      fill="rgba(255, 255, 255, 0.9)"
                      stroke="rgba(0, 0, 0, 0.3)"
                      strokeWidth={0.5}
                      cornerRadius={2}
                    />
                    
                    {/* إضاءة النافذة */}
                    <Rect
                      x={unitX + 4}
                      y={floorY + 5}
                      width={unitWidth - 8}
                      height={floorHeight - 10}
                      fill="rgba(255, 248, 120, 0.7)"
                      cornerRadius={1}
                    />
                  </Group>
                )
              })}
              
              {/* رقم الطابق */}
              <Text
                x={-25}
                y={floorY + floorHeight / 2 - 6}
                text={floor.number.toString()}
                fontSize={12}
                fill="#374151"
                fontStyle="bold"
                align="center"
              />
            </Group>
          )
        })}
        
        {/* اسم البلوك */}
        <Text
          x={blockWidth / 2}
          y={-30}
          text={block.name}
          fontSize={14}
          fill="#1F2937"
          fontStyle="bold"
          align="center"
          offsetX={block.name.length * 3}
        />
        
        {/* معلومات البلوك */}
        <Text
          x={blockWidth / 2}
          y={totalHeight + 15}
          text={`${block.floors.length} طابق`}
          fontSize={10}
          fill="#6B7280"
          align="center"
          offsetX={25}
        />
        
        <Text
          x={blockWidth / 2}
          y={totalHeight + 30}
          text={`${block.floors.reduce((total: number, floor: Floor) => total + floor.units.length, 0)} شقة`}
          fontSize={10}
          fill="#6B7280"
          align="center"
          offsetX={20}
        />
      </Group>
    )
  }

  // رسم المحتوى حسب الخطوة
  const renderContent = () => {
    if (currentStep === 1 && !buildingData.name) {
      return (
        <>
          {renderBackground()}
          <Text
            x={stageWidth / 2}
            y={stageHeight / 2}
            text="أرض فارغة - جاهزة لبناء البرج"
            fontSize={24}
            fill="#374151"
            fontStyle="bold"
            align="center"
            offsetX={120}
          />
        </>
      )
    }

    if (currentStep === 2 || (buildingData.name && buildingData.blocks.length === 0)) {
      return (
        <>
          {renderBackground()}
          {/* الأساسات */}
          <Rect
            x={200}
            y={stageHeight - 150}
            width={400}
            height={30}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: 30 }}
            fillLinearGradientColorStops={[0, '#6B7280', 1, '#4B5563']}
            cornerRadius={5}
          />
          
          <Text
            x={stageWidth / 2}
            y={200}
            text={buildingData.name}
            fontSize={28}
            fill="#1F2937"
            fontStyle="bold"
            align="center"
            offsetX={buildingData.name.length * 7}
          />
          
          <Text
            x={stageWidth / 2}
            y={240}
            text="الأساسات جاهزة - ابدأ في إضافة البلوكات"
            fontSize={16}
            fill="#6B7280"
            align="center"
            offsetX={140}
          />
        </>
      )
    }

    return (
      <>
        {renderBackground()}
        
        {/* عنوان المشروع */}
        <Text
          x={stageWidth / 2}
          y={40}
          text={buildingData.name}
          fontSize={24}
          fill="#1F2937"
          fontStyle="bold"
          align="center"
          offsetX={buildingData.name.length * 6}
        />
        
        {/* إحصائيات المشروع */}
        <Text
          x={stageWidth / 2}
          y={70}
          text={`${buildingData.blocks.length} بلوك • ${buildingData.blocks.reduce((total: number, block: Block) => total + block.floors.length, 0)} طابق • ${buildingData.blocks.reduce((total: number, block: Block) =>
            total + block.floors.reduce((floorTotal: number, floor: Floor) => floorTotal + floor.units.length, 0), 0
          )} شقة`}
          fontSize={14}
          fill="#6B7280"
          align="center"
          offsetX={100}
        />
        
        {/* رسم البلوكات */}
        {buildingData.blocks.map((block: Block, index: number) => renderBlock(block, index))}
      </>
    )
  }

  return (
    <div className="w-full">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={handleWheel}
          draggable={true}
        >
          <Layer>
            {renderContent()}
          </Layer>
        </Stage>
      </div>
      
      {/* أدوات التحكم */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setScale(s => Math.min(3, s * 1.2))}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            تكبير +
          </button>
          <button
            onClick={() => setScale(s => Math.max(0.5, s / 1.2))}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            تصغير -
          </button>
          <button
            onClick={() => {
              setScale(1)
              setStagePos({ x: 0, y: 0 })
              setBlockPositions({})
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            إعادة تعيين
          </button>
        </div>
        
        {selectedBlock && (
          <div className="text-sm text-gray-600">
            البلوك المحدد: {buildingData.blocks.find((b: Block) => b.id === selectedBlock)?.name}
          </div>
        )}
      </div>
      
      {/* مفتاح الألوان المحسن */}
      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">المزايا التفاعلية:</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded shadow"></div>
            <span>اسحب البلوكات لتحريكها</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 border-2 border-yellow-600 rounded"></div>
            <span>انقر لتحديد البلوك</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🖱️</span>
            <span>عجلة الماوس للتكبير</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✋</span>
            <span>اسحب الخلفية للتنقل</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveBuildingVisualization