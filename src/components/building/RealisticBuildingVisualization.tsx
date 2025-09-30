// import React, { useState, useRef, useCallback, useEffect } from 'react'
// import { Stage, Layer, Rect, Text, Circle, Line, Group } from 'react-konva'
// import type { BuildingData, Block, Floor, Unit } from '../building-builder/types'
// import Konva from 'konva'

// interface BlockUpdateData {
//   position?: BlockPosition
//   [key: string]: unknown
// }

// interface RealisticBuildingVisualizationProps {
//   buildingData: BuildingData
//   currentStep: number
//   onBlockUpdate?: (blockId: string, updates: BlockUpdateData) => void
//   onUnitClick?: (unitId: string) => void
//   selectedUnits?: Set<string>
// }

// interface BlockPosition {
//   x: number
//   y: number
//   rotation: number
// }

// const RealisticBuildingVisualization: React.FC<RealisticBuildingVisualizationProps> = ({
//   buildingData,
//   currentStep,
//   onBlockUpdate,
//   onUnitClick,
//   selectedUnits = new Set()
// }) => {
//   const stageRef = useRef<Konva.Stage>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [blockPositions, setBlockPositions] = useState<Record<string, BlockPosition>>({})
//   const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
//   const [scale, setScale] = useState(1)
//   const [stagePos, setStagePos] = useState({ x: 0, y: 0 })

//   // ألوان واقعية للطوب والخرسانة
//   const realisticBuildingColors = [
//     {
//       main: '#8B7355',    // طوب بني طبيعي
//       accent: '#6B5B47',  // طوب بني داكن
//       mortar: '#C0B299',  // مونة فاتحة
//       window: '#87CEEB',  // نوافذ زجاجية
//       roof: '#654321'     // سقف بني داكن
//     },
//     {
//       main: '#A0937D',    // طوب تان فاتح
//       accent: '#8B7D6B',  // طوب تان داكن
//       mortar: '#D2C5B0',  // مونة بيج
//       window: '#B0E0E6',  // نوافذ زجاجية فاتحة
//       roof: '#704214'     // سقف بني
//     },
//     {
//       main: '#CD853F',    // طوب رملي
//       accent: '#B8860B',  // طوب ذهبي داكن
//       mortar: '#F5DEB3',  // مونة قمحية
//       window: '#ADD8E6',  // نوافذ زرقاء فاتحة
//       roof: '#8B4513'     // سقف بني محمر
//     },
//     {
//       main: '#708090',    // خرسانة رمادية
//       accent: '#2F4F4F',  // خرسانة داكنة
//       mortar: '#C0C0C0',  // مونة فضية
//       window: '#F0F8FF',  // نوافذ بيضاء
//       roof: '#36454F'     // سقف رمادي داكن
//     }
//   ]

//   // مقاسات الشاشة - متجاوبة مع حجم الحاوية
//   const [containerSize, setContainerSize] = useState({ width: 1000, height: 600 })
//   const stageWidth = containerSize.width
//   const stageHeight = containerSize.height

//   // قياس حجم الحاوية
//   useEffect(() => {
//     const updateSize = () => {
//       if (containerRef.current) {
//         const rect = containerRef.current.getBoundingClientRect()
//         setContainerSize({
//           width: Math.max(800, rect.width - 20), // حد أدنى 800 مع هامش
//           height: Math.max(500, rect.height - 20) // حد أدنى 500 مع هامش
//         })
//       }
//     }

//     updateSize()
//     window.addEventListener('resize', updateSize)
//     return () => window.removeEventListener('resize', updateSize)
//   }, [])

//   // دالة للحصول على موقع البلوك
//   const getBlockPosition = (blockId: string, index: number): BlockPosition => {
//     return blockPositions[blockId] || {
//       x: stageWidth/2 - (buildingData.blocks.length * 70) + index * 140,
//       y: stageHeight - 250,
//       rotation: 0
//     }
//   }

//   // دالة تحديث موقع البلوك
//   const handleBlockDragEnd = useCallback((blockId: string, e: Konva.KonvaEventObject<DragEvent>) => {
//     const newPosition = {
//       x: e.target.x(),
//       y: e.target.y(),
//       rotation: blockPositions[blockId]?.rotation || 0
//     }
    
//     setBlockPositions(prev => ({
//       ...prev,
//       [blockId]: newPosition
//     }))

//     if (onBlockUpdate) {
//       onBlockUpdate(blockId, { position: newPosition })
//     }
//   }, [blockPositions, onBlockUpdate])

//   // دالة التكبير والتصغير
//   const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
//     e.evt.preventDefault()
    
//     const scaleBy = 1.05
//     const stage = e.target.getStage()
//     if (!stage) return

//     const oldScale = stage.scaleX()
//     const mousePointTo = {
//       x: stage.getPointerPosition()!.x / oldScale - stage.x() / oldScale,
//       y: stage.getPointerPosition()!.y / oldScale - stage.y() / oldScale
//     }

//     const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
    
//     setScale(Math.max(0.5, Math.min(3, newScale)))
    
//     const newPos = {
//       x: -(mousePointTo.x - stage.getPointerPosition()!.x / newScale) * newScale,
//       y: -(mousePointTo.y - stage.getPointerPosition()!.y / newScale) * newScale
//     }
//     setStagePos(newPos)
//   }, [])

//   // رسم الخلفية الواقعية مع السماء والأرض
//   const renderRealisticBackground = () => (
//     <Group>
//       {/* السماء بتدرج واقعي */}
//       <Rect
//         x={0}
//         y={0}
//         width={800}
//         height={350}
//         fillLinearGradientStartPoint={{ x: 0, y: 0 }}
//         fillLinearGradientEndPoint={{ x: 0, y: 350 }}
//         fillLinearGradientColorStops={[
//           0, '#87CEEB',     // أزرق سماوي فاتح
//           0.3, '#B0E0E6',   // أزرق فاتح
//           0.7, '#E0F6FF',   // أبيض مزرق
//           1, '#F0F8FF'      // أبيض ثلجي
//         ]}
//       />
      
//       {/* الشمس */}
//       <Circle
//         x={720}
//         y={80}
//         radius={25}
//         fill="#FFD700"
//         shadowColor="#FFA500"
//         shadowBlur={15}
//         opacity={0.9}
//       />
      
//       {/* السحب الواقعية */}
//       {[
//         { x: 100, y: 60, size: 0.8 },
//         { x: 300, y: 80, size: 1.0 },
//         { x: 550, y: 70, size: 0.6 }
//       ].map((cloud, index) => (
//         <Group key={`cloud-${index}`}>
//           <Circle x={cloud.x} y={cloud.y} radius={20 * cloud.size} fill="rgba(255, 255, 255, 0.9)" />
//           <Circle x={cloud.x + 15 * cloud.size} y={cloud.y} radius={25 * cloud.size} fill="rgba(255, 255, 255, 0.8)" />
//           <Circle x={cloud.x + 30 * cloud.size} y={cloud.y} radius={18 * cloud.size} fill="rgba(255, 255, 255, 0.9)" />
//         </Group>
//       ))}
      
//       {/* الأرض الطبيعية */}
//       <Rect
//         x={0}
//         y={350}
//         width={800}
//         height={150}
//         fillLinearGradientStartPoint={{ x: 0, y: 0 }}
//         fillLinearGradientEndPoint={{ x: 0, y: 150 }}
//         fillLinearGradientColorStops={[
//           0, '#90EE90',     // أخضر عشب
//           0.2, '#8FBC8F',   // أخضر داكن
//           0.8, '#8B4513',   // بني تراب
//           1, '#654321'      // بني داكن
//         ]}
//       />
      
//       {/* الطريق الرئيسي */}
//       <Rect
//         x={0}
//         y={400}
//         width={800}
//         height={40}
//         fill="#2D3748"
//       />
      
//       {/* خطوط الطريق */}
//       <Line
//         points={[0, 420, 800, 420]}
//         stroke="#FFFF00"
//         strokeWidth={2}
//         dash={[10, 10]}
//       />
      
//       {/* الرصيف */}
//       <Rect
//         x={0}
//         y={440}
//         width={800}
//         height={15}
//         fill="#CBD5E0"
//       />
      
//       {/* الأشجار الطبيعية المحسنة */}
//       {[
//         { x: 50, y: 320, size: 1.2 },
//         { x: 120, y: 325, size: 1.0 },
//         { x: 680, y: 315, size: 1.3 },
//         { x: 720, y: 325, size: 0.9 },
//         { x: 200, y: 330, size: 1.1 },
//         { x: 600, y: 320, size: 1.0 }
//       ].map((tree, index) => (
//         <Group key={`tree-${index}`}>
//           {/* جذع الشجرة */}
//           <Rect
//             x={tree.x - 3 * tree.size}
//             y={tree.y}
//             width={6 * tree.size}
//             height={20 * tree.size}
//             fill="#8B4513"
//             cornerRadius={2}
//           />
//           {/* أوراق الشجرة متعددة الطبقات */}
//           <Circle x={tree.x} y={tree.y - 5 * tree.size} radius={15 * tree.size} fill="#228B22" opacity={0.9} />
//           <Circle x={tree.x - 6 * tree.size} y={tree.y - 2 * tree.size} radius={10 * tree.size} fill="#32CD32" opacity={0.8} />
//           <Circle x={tree.x + 6 * tree.size} y={tree.y - 2 * tree.size} radius={10 * tree.size} fill="#90EE90" opacity={0.8} />
//           <Circle x={tree.x} y={tree.y - 12 * tree.size} radius={12 * tree.size} fill="#9ACD32" opacity={0.7} />
//         </Group>
//       ))}
      
//       {/* أعمدة الإنارة */}
//       {[100, 250, 400, 550, 700].map((x, index) => (
//         <Group key={`streetlight-${index}`}>
//           {/* عمود الإنارة */}
//           <Rect
//             x={x - 2}
//             y={360}
//             width={4}
//             height={40}
//             fill="#4A5568"
//             cornerRadius={2}
//           />
//           {/* المصباح */}
//           <Circle
//             x={x}
//             y={365}
//             radius={8}
//             fill="#2D3748"
//             stroke="#718096"
//             strokeWidth={1}
//           />
//           {/* الضوء */}
//           <Circle
//             x={x}
//             y={365}
//             radius={4}
//             fill="#FFF9C4"
//             opacity={0.9}
//           />
//           {/* هالة الضوء */}
//           <Circle
//             x={x}
//             y={420}
//             radius={30}
//             fill="rgba(255, 249, 196, 0.3)"
//           />
//         </Group>
//       ))}
      
//       {/* السيارات المتوقفة */}
//       {[
//         { x: 80, y: 405, color: '#2C3E50', type: 'sedan' },
//         { x: 180, y: 405, color: '#E53E3E', type: 'suv' },
//         { x: 320, y: 405, color: '#3182CE', type: 'sedan' },
//         { x: 480, y: 405, color: '#38A169', type: 'hatchback' },
//         { x: 620, y: 405, color: '#805AD5', type: 'suv' }
//       ].map((car, index) => (
//         <Group key={`car-${index}`}>
//           {/* جسم السيارة */}
//           <Rect
//             x={car.x}
//             y={car.y}
//             width={car.type === 'suv' ? 45 : car.type === 'sedan' ? 40 : 35}
//             height={18}
//             fill={car.color}
//             cornerRadius={3}
//           />
//           {/* النوافذ */}
//           <Rect
//             x={car.x + 5}
//             y={car.y + 3}
//             width={car.type === 'suv' ? 35 : car.type === 'sedan' ? 30 : 25}
//             height={8}
//             fill="#87CEEB"
//             cornerRadius={2}
//             opacity={0.8}
//           />
//           {/* العجلات */}
//           <Circle
//             x={car.x + 8}
//             y={car.y + 20}
//             radius={4}
//             fill="#1A202C"
//           />
//           <Circle
//             x={car.x + (car.type === 'suv' ? 37 : car.type === 'sedan' ? 32 : 27)}
//             y={car.y + 20}
//             radius={4}
//             fill="#1A202C"
//           />
//           {/* الأضواء الأمامية */}
//           <Circle
//             x={car.x + (car.type === 'suv' ? 42 : car.type === 'sedan' ? 37 : 32)}
//             y={car.y + 6}
//             radius={2}
//             fill="#FFF9C4"
//           />
//           <Circle
//             x={car.x + (car.type === 'suv' ? 42 : car.type === 'sedan' ? 37 : 32)}
//             y={car.y + 12}
//             radius={2}
//             fill="#FFF9C4"
//           />
//         </Group>
//       ))}
      
//       {/* ممر المشاة */}
//       {Array.from({ length: 8 }).map((_, i) => (
//         <Rect
//           key={`crosswalk-${i}`}
//           x={350 + i * 12}
//           y={400}
//           width={8}
//           height={40}
//           fill="white"
//           opacity={0.9}
//         />
//       ))}
      
//       {/* حديقة صغيرة */}
//       <Group>
//         {/* العشب */}
//         <Circle x={150} y={380} radius={25} fill="#90EE90" opacity={0.8} />
//         <Circle x={650} y={380} radius={30} fill="#90EE90" opacity={0.8} />
        
//         {/* الزهور */}
//         {[
//           { x: 140, y: 370, color: '#FF69B4' },
//           { x: 155, y: 375, color: '#FF4500' },
//           { x: 160, y: 365, color: '#9370DB' },
//           { x: 640, y: 370, color: '#FF69B4' },
//           { x: 655, y: 375, color: '#FFD700' },
//           { x: 665, y: 365, color: '#FF6347' }
//         ].map((flower, index) => (
//           <Circle
//             key={`flower-${index}`}
//             x={flower.x}
//             y={flower.y}
//             radius={3}
//             fill={flower.color}
//           />
//         ))}
        
//         {/* مقاعد الحديقة */}
//         <Rect x={130} y={390} width={40} height={8} fill="#8B4513" cornerRadius={2} />
//         <Rect x={630} y={390} width={40} height={8} fill="#8B4513" cornerRadius={2} />
//       </Group>
      
//       {/* مواقف السيارات المخططة */}
//       {[60, 160, 300, 460, 600].map((x, index) => (
//         <Group key={`parking-${index}`}>
//           <Rect
//             x={x}
//             y={425}
//             width={50}
//             height={25}
//             stroke="#FFFFFF"
//             strokeWidth={1}
//             fill="transparent"
//             dash={[3, 3]}
//           />
//           <Text
//             x={x + 25}
//             y={435}
//             text={`P${index + 1}`}
//             fontSize={8}
//             fill="#FFFFFF"
//             align="center"
//             offsetX={8}
//           />
//         </Group>
//       ))}
//     </Group>
//   )

//   // رسم بلوك واقعي مع تفاصيل معمارية
//   const renderRealisticBlock = (block: Block, index: number) => {
//     const position = getBlockPosition(block.id, index)
//     const blockWidth = 120
//     const floorHeight = 25
//     const totalHeight = Math.max(block.floors.length * floorHeight + 20, 80)
//     const colorScheme = realisticBuildingColors[index % realisticBuildingColors.length]
//     const isSelected = selectedBlock === block.id

//     // حساب وجود الوحدات لتحديد مرحلة البناء
//     const hasUnits = block.floors.some((floor: Floor) => floor.units.length > 0)

//     return (
//       <Group
//         key={block.id}
//         x={position.x}
//         y={position.y}
//         rotation={position.rotation}
//         draggable={true}
//         onDragEnd={(e) => handleBlockDragEnd(block.id, e)}
//         onClick={() => setSelectedBlock(block.id)}
//         onTap={() => setSelectedBlock(block.id)}
//       >
//         {/* ظل البناء ثلاثي الأبعاد */}
//         <Rect
//           x={6}
//           y={6}
//           width={blockWidth}
//           height={totalHeight}
//           fill="rgba(0, 0, 0, 0.3)"
//           cornerRadius={3}
//         />
        
//         {/* الجانب الأيمن للبناء (تأثير 3D) */}
//         <Rect
//           x={blockWidth}
//           y={0}
//           width={15}
//           height={totalHeight}
//           fillLinearGradientStartPoint={{ x: 0, y: 0 }}
//           fillLinearGradientEndPoint={{ x: 15, y: 0 }}
//           fillLinearGradientColorStops={[
//             0, colorScheme.accent,
//             1, colorScheme.main + '80'
//           ]}
//         />
        
//         {/* السطح العلوي للبناء (تأثير 3D) */}
//         <Rect
//           x={0}
//           y={-8}
//           width={blockWidth + 15}
//           height={8}
//           fillLinearGradientStartPoint={{ x: 0, y: 0 }}
//           fillLinearGradientEndPoint={{ x: 0, y: 8 }}
//           fillLinearGradientColorStops={[
//             0, colorScheme.roof,
//             1, colorScheme.accent
//           ]}
//         />
        
//         {/* الواجهة الأمامية للبناء */}
//         <Rect
//           x={0}
//           y={0}
//           width={blockWidth}
//           height={totalHeight}
//           fill={hasUnits ? colorScheme.main : '#696969'}
//           stroke={isSelected ? '#FFD700' : colorScheme.accent}
//           strokeWidth={isSelected ? 3 : 2}
//           cornerRadius={2}
//         />

//         {/* خطوط الطوب الأفقية */}
//         {Array.from({ length: Math.floor(totalHeight / 8) }).map((_, i) => (
//           <Line
//             key={`brick-line-${i}`}
//             points={[2, i * 8, blockWidth - 2, i * 8]}
//             stroke={colorScheme.mortar}
//             strokeWidth={1}
//             opacity={0.7}
//           />
//         ))}

//         {/* خطوط الطوب العمودية (متداخلة) */}
//         {Array.from({ length: Math.floor(totalHeight / 8) }).map((_, row) => 
//           Array.from({ length: Math.floor(blockWidth / 20) }).map((_, col) => (
//             <Line
//               key={`brick-vertical-${row}-${col}`}
//               points={[
//                 col * 20 + (row % 2) * 10, row * 8,
//                 col * 20 + (row % 2) * 10, (row + 1) * 8
//               ]}
//               stroke={colorScheme.mortar}
//               strokeWidth={1}
//               opacity={0.5}
//             />
//           ))
//         )}

//         {/* رسم الطوابق مع النوافذ الواقعية - من الأسفل للأعلى */}
//         {block.floors.map((floor: Floor, floorIndex: number) => {
//           const floorY = totalHeight - floorHeight * (floorIndex + 1)
          
//           return (
//             <Group key={floor.id}>
//               {/* خط فاصل الطابق */}
//               <Line
//                 points={[5, floorY, blockWidth - 5, floorY]}
//                 stroke={colorScheme.accent}
//                 strokeWidth={2}
//                 opacity={0.8}
//               />
              
//               {/* رسم الشقق التفاعلية مع الأرقام */}
//               {floor.units.map((unit: Unit, unitIndex: number) => {
//                 const unitsPerFloor = Math.max(floor.units.length, 1)
//                 const windowWidth = Math.max(12, (blockWidth - 30) / unitsPerFloor)
//                 const windowX = 15 + unitIndex * (windowWidth + 5)
//                 const windowHeight = floorHeight - 8
//                 const isLit = hasUnits && Math.random() > 0.4
//                 const isSelected = selectedUnits.has(unit.id)
//                 const isClickable = hasUnits && onUnitClick
                
//                 return (
//                   <Group key={unit.id}>

                    
//                     {/* إطار الشقة الخارجي - قابل للنقر */}
//                     <Rect
//                       x={windowX - 2}
//                       y={floorY + 3}
//                       width={windowWidth + 4}
//                       height={windowHeight}
//                       fill={isSelected ? '#FFD700' : colorScheme.accent}
//                       stroke={isSelected ? '#FF6B35' : colorScheme.accent}
//                       strokeWidth={isSelected ? 3 : 1}
//                       cornerRadius={1}
//                       opacity={isSelected ? 0.9 : 1}
//                       onClick={isClickable ? () => onUnitClick(unit.id) : undefined}
//                       onMouseEnter={(e) => {
//                         if (isClickable) {
//                           const stage = e.target.getStage()
//                           if (stage) stage.container().style.cursor = 'pointer'
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (isClickable) {
//                           const stage = e.target.getStage()
//                           if (stage) stage.container().style.cursor = 'default'
//                         }
//                       }}
//                     />
                    
//                     {/* زجاج الشقة/النافذة - قابل للنقر */}
//                     <Rect
//                       x={windowX}
//                       y={floorY + 5}
//                       width={windowWidth}
//                       height={windowHeight - 4}
//                       fill={isSelected ? '#FFF8DC' : (isLit ? '#FFE4B5' : colorScheme.window)}
//                       stroke={isSelected ? '#FF6B35' : '#2F4F4F'}
//                       strokeWidth={isSelected ? 2 : 1}
//                       cornerRadius={1}
//                       opacity={0.9}
//                       onClick={isClickable ? () => onUnitClick(unit.id) : undefined}
//                       onMouseEnter={(e) => {
//                         if (isClickable) {
//                           const stage = e.target.getStage()
//                           if (stage) stage.container().style.cursor = 'pointer'
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (isClickable) {
//                           const stage = e.target.getStage()
//                           if (stage) stage.container().style.cursor = 'default'
//                         }
//                       }}
//                     />
                    
//                     {/* قضبان النافذة */}
//                     <Line
//                       points={[
//                         windowX, floorY + 5 + windowHeight/2,
//                         windowX + windowWidth, floorY + 5 + windowHeight/2
//                       ]}
//                       stroke="#2F4F4F"
//                       strokeWidth={1}
//                     />
//                     <Line
//                       points={[
//                         windowX + windowWidth/2, floorY + 5,
//                         windowX + windowWidth/2, floorY + 5 + windowHeight - 4
//                       ]}
//                       stroke="#2F4F4F"
//                       strokeWidth={1}
//                     />
                    
//                     {/* انعكاس الضوء على الزجاج */}
//                     <Rect
//                       x={windowX + 2}
//                       y={floorY + 7}
//                       width={windowWidth/3}
//                       height={windowHeight/3}
//                       fill="rgba(255, 255, 255, 0.6)"
//                       opacity={0.7}
//                     />
                    
//                     {/* رقم الشقة داخل النافذة - قابل للنقر */}
//                     {hasUnits && windowWidth > 15 && (
//                       <Text
//                         x={windowX + windowWidth/2}
//                         y={floorY + 5 + (windowHeight - 4)/2 - 4}
//                         text={unit.number}
//                         fontSize={Math.max(8, Math.min(12, windowWidth/3))}
//                         fill={isSelected ? '#333' : (isLit ? '#333' : '#FFF')}
//                         fontStyle="bold"
//                         align="center"
//                         verticalAlign="middle"
//                         offsetX={0}
//                         onClick={isClickable ? () => onUnitClick(unit.id) : undefined}
//                         onMouseEnter={(e) => {
//                           if (isClickable) {
//                             const stage = e.target.getStage()
//                             if (stage) stage.container().style.cursor = 'pointer'
//                           }
//                         }}
//                         onMouseLeave={(e) => {
//                           if (isClickable) {
//                             const stage = e.target.getStage()
//                             if (stage) stage.container().style.cursor = 'default'
//                           }
//                         }}
//                       />
//                     )}
                    
//                     {/* شرفة صغيرة للطابق الأرضي */}
//                     {floor.number === 'G' && (
//                       <Group>
//                         <Rect
//                           x={windowX - 3}
//                           y={floorY + windowHeight - 2}
//                           width={windowWidth + 6}
//                           height={4}
//                           fill={isSelected ? '#FFD700' : colorScheme.accent}
//                           stroke={isSelected ? '#FF6B35' : colorScheme.accent}
//                           strokeWidth={isSelected ? 2 : 1}
//                         />
//                         <Line
//                           points={[
//                             windowX - 3, floorY + windowHeight + 2,
//                             windowX + windowWidth + 3, floorY + windowHeight + 2
//                           ]}
//                           stroke={isSelected ? '#FF6B35' : colorScheme.accent}
//                           strokeWidth={isSelected ? 3 : 2}
//                         />
//                       </Group>
//                     )}
                    
//                     {/* مؤشر الاختيار والتفاعل */}
//                     {isSelected && (
//                       <Group>
//                         {/* علامة صح */}
//                         <Circle
//                           x={windowX + windowWidth - 4}
//                           y={floorY + 7}
//                           radius={4}
//                           fill="#28A745"
//                           stroke="#FFF"
//                           strokeWidth={1}
//                         />
//                         <Text
//                           x={windowX + windowWidth - 4}
//                           y={floorY + 4}
//                           text="✓"
//                           fontSize={6}
//                           fill="white"
//                           fontStyle="bold"
//                           align="center"
//                           listening={false}
//                         />
                        
//                         {/* إطار متحرك للاختيار */}
//                         <Rect
//                           x={windowX - 5}
//                           y={floorY}
//                           width={windowWidth + 10}
//                           height={windowHeight + 8}
//                           stroke="#FF6B35"
//                           strokeWidth={2}
//                           dash={[4, 4]}
//                           cornerRadius={2}
//                           fill="transparent"
//                           opacity={0.8}
//                           listening={false}
//                         />
//                       </Group>
//                     )}
                    
//                     {/* تأثير التمرير للشقق غير المختارة */}
//                     {!isSelected && isClickable && (
//                       <Rect
//                         x={windowX - 1}
//                         y={floorY + 2}
//                         width={windowWidth + 2}
//                         height={windowHeight + 2}
//                         stroke="#4A90E2"
//                         strokeWidth={1}
//                         cornerRadius={1}
//                         fill="transparent"
//                         opacity={0}
//                         onMouseEnter={(e) => {
//                           e.target.opacity(0.3)
//                         }}
//                         onMouseLeave={(e) => {
//                           e.target.opacity(0)
//                         }}
//                         onClick={() => onUnitClick(unit.id)}
//                       />
//                     )}
//                   </Group>
//                 )
//               })}
              
//               {/* رقم الطابق مع خلفية */}
//               <Circle
//                 x={-20}
//                 y={floorY + floorHeight/2}
//                 radius={8}
//                 fill={colorScheme.main}
//                 stroke={colorScheme.accent}
//                 strokeWidth={1}
//               />
//               <Text
//                 x={-20}
//                 y={floorY + floorHeight/2 - 4}
//                 text={floor.number.toString()}
//                 fontSize={10}
//                 fill="white"
//                 fontStyle="bold"
//                 align="center"
//                 offsetX={0}
//               />
//             </Group>
//           )
//         })}
        
//         {/* مدخل المبنى */}
//         {hasUnits ? (
//           // مدخل حديث للمبنى المكتمل
//           <Group>
//             <Rect
//               x={blockWidth * 0.3}
//               y={totalHeight - 15}
//               width={blockWidth * 0.4}
//               height={15}
//               fill={colorScheme.window}
//               stroke={colorScheme.accent}
//               strokeWidth={2}
//               cornerRadius={3}
//             />
//             <Text
//               x={blockWidth * 0.5}
//               y={totalHeight - 8}
//               text="🚪"
//               fontSize={10}
//               align="center"
//               offsetX={5}
//             />
//           </Group>
//         ) : (
//           // مدخل مؤقت للمبنى تحت الإنشاء
//           <Rect
//             x={blockWidth * 0.35}
//             y={totalHeight - 12}
//             width={blockWidth * 0.3}
//             height={12}
//             fill="#8B4513"
//             stroke="#654321"
//             strokeWidth={2}
//           />
//         )}
        
//         {/* سطح المبنى مع تفاصيل */}
//         <Group>
//           <Rect
//             x={5}
//             y={-8}
//             width={blockWidth - 10}
//             height={8}
//             fill={colorScheme.roof}
//             stroke={colorScheme.accent}
//             strokeWidth={1}
//           />
          
//           {/* معدات السطح */}
//           <Rect x={blockWidth * 0.2} y={-6} width={8} height={4} fill={colorScheme.accent} />
//           <Rect x={blockWidth * 0.5} y={-6} width={6} height={4} fill={colorScheme.accent} />
//           <Rect x={blockWidth * 0.8} y={-6} width={10} height={4} fill={colorScheme.accent} />
//         </Group>
        
//         {/* اسم البلوك مع خلفية جميلة */}
//         <Rect
//           x={blockWidth/2 - 20}
//           y={-35}
//           width={40}
//           height={18}
//           fill={hasUnits ? colorScheme.main : '#FF6B35'}
//           stroke={colorScheme.accent}
//           strokeWidth={1}
//           cornerRadius={4}
//         />
//         <Text
//           x={blockWidth / 2}
//           y={-30}
//           text={hasUnits ? `بلوك ${block.name}` : `🚧 بلوك ${block.name}`}
//           fontSize={12}
//           fill="white"
//           fontStyle="bold"
//           align="center"
//           offsetX={hasUnits ? 15 : 20}
//         />
        
//         {/* معلومات البلوك */}
//         <Rect
//           x={blockWidth/2 - 30}
//           y={totalHeight + 10}
//           width={60}
//           height={15}
//           fill={colorScheme.main}
//           stroke={colorScheme.accent}
//           strokeWidth={1}
//           cornerRadius={3}
//           opacity={0.9}
//         />
//         <Text
//           x={blockWidth / 2}
//           y={totalHeight + 20}
//           text={`${block.floors.length} طابق • ${block.floors.reduce((total: number, floor: Floor) => total + floor.units.length, 0)} شقة`}
//           fontSize={9}
//           fill="white"
//           fontStyle="bold"
//           align="center"
//           offsetX={30}
//         />

//         {/* تأثير الاختيار */}
//         {isSelected && (
//           <Rect
//             x={-5}
//             y={-10}
//             width={blockWidth + 25}
//             height={totalHeight + 15}
//             stroke="#FFD700"
//             strokeWidth={3}
//             fill="transparent"
//             dash={[5, 5]}
//             cornerRadius={5}
//           />
//         )}
//       </Group>
//     )
//   }

//   // رسم المحتوى حسب الخطوة
//   const renderContent = () => {
//     // إذا كان هناك بيانات مباني، اعرضها دائماً
//     if (buildingData.blocks && buildingData.blocks.length > 0) {
//       return (
//         <Group>
//           {renderRealisticBackground()}
//           {buildingData.blocks.map((block: Block, index: number) => renderRealisticBlock(block, index))}
          
//           {/* عنوان المشروع */}
//           <Rect
//             x={stageWidth/2 - 100}
//             y={20}
//             width={200}
//             height={25}
//             fill="rgba(139, 115, 85, 0.9)"
//             stroke="#6B5B47"
//             strokeWidth={2}
//             cornerRadius={5}
//           />
//           <Text
//             x={stageWidth / 2}
//             y={35}
//             text={buildingData.name || 'المشروع السكني'}
//             fontSize={16}
//             fill="white"
//             fontStyle="bold"
//             align="center"
//             offsetX={50}
//           />
//         </Group>
//       )
//     }

//     // إذا لم تكن هناك بيانات مباني، اعرض حسب الخطوة
//     switch (currentStep) {
//       case 1:
//         return (
//           <Group>
//             {renderRealisticBackground()}
//             <Text
//               x={stageWidth / 2}
//               y={stageHeight / 2}
//               text="أرض فارغة جاهزة للبناء"
//               fontSize={20}
//               fill="#2D3748"
//               fontStyle="bold"
//               align="center"
//               offsetX={80}
//             />
//             <Text
//               x={stageWidth / 2}
//               y={stageHeight / 2 + 30}
//               text={buildingData.name || "ابدأ بإدخال اسم المشروع"}
//               fontSize={16}
//               fill="#4A5568"
//               align="center"
//               offsetX={60}
//             />
//           </Group>
//         )
      
//       default:
//         return (
//           <Group>
//             {renderRealisticBackground()}
//             <Text
//               x={stageWidth / 2}
//               y={stageHeight / 2}
//               text="جاهز لبناء المشروع"
//               fontSize={20}
//               fill="#2D3748"
//               fontStyle="bold"
//               align="center"
//               offsetX={80}
//             />
//           </Group>
//         )
//     }
//   }

//   // حساب عدد الشقق المختارة
//   const selectedCount = selectedUnits.size
//   const totalUnits = buildingData.blocks.reduce((total: number, block: Block) =>
//     total + block.floors.reduce((floorTotal: number, floor: Floor) => floorTotal + floor.units.length, 0), 0
//   )

//   return (
//     <div ref={containerRef} className="w-full h-full overflow-hidden relative">
//       <Stage
//         ref={stageRef}
//         width={stageWidth}
//         height={stageHeight}
//         onWheel={handleWheel}
//         scaleX={scale}
//         scaleY={scale}
//         x={stagePos.x}
//         y={stagePos.y}
//         draggable={true}
//         className="border border-gray-300 rounded-lg shadow-lg bg-gradient-to-b from-blue-50 to-green-50"
//         style={{width: '100%', height: '100%', display: 'block'}}
//       >
//         <Layer>
//           {renderContent()}
//         </Layer>
//       </Stage>
      
//       {/* معلومات التحكم */}
//       <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-lg">
//         <div className="font-bold">🎛️ التحكم:</div>
//         <div>• عجلة الماوس: تكبير/تصغير</div>
//         <div>• اسحب: تحريك الرسم</div>
//         {totalUnits > 0 && onUnitClick && (
//           <div className="text-yellow-300 font-medium">• انقر على الشقق لاختيارها 👆</div>
//         )}
//       </div>
      
//       {/* معلومات الشقق المختارة */}
//       {selectedCount > 0 && (
//         <div className="absolute bottom-2 left-2 bg-blue-600 bg-opacity-90 text-white text-xs px-3 py-2 rounded-lg">
//           <div className="font-bold">الشقق المختارة: {selectedCount} / {totalUnits}</div>
//           <div className="mt-1 opacity-90">انقر على شقة لإلغاء اختيارها</div>
//         </div>
//       )}
      
//       {/* تعليمات للمستخدمين الجدد */}
//       {totalUnits > 0 && selectedCount === 0 && onUnitClick && (
//         <div className="absolute bottom-2 right-2 bg-gradient-to-r from-green-600 to-blue-600 bg-opacity-90 text-white text-xs px-4 py-3 rounded-lg max-w-56 shadow-lg animate-pulse">
//           <div className="font-bold flex items-center gap-1">
//             💡 نصيحة:
//           </div>
//           <div className="mt-1">انقر على أي شقة (مربع صغير) في الرسم لاختيارها</div>
//           <div className="mt-1 text-yellow-200 text-xs">👆 كل مربع = شقة قابلة للنقر</div>
//         </div>
//       )}
      
//       {/* أدوات التحكم */}
//       <div className="mt-4 flex justify-center gap-4">
//         <button
//           onClick={() => setScale(Math.min(scale + 0.2, 3))}
//           className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//         >
//           تكبير +
//         </button>
//         <button
//           onClick={() => setScale(Math.max(scale - 0.2, 0.5))}
//           className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//         >
//           تصغير -
//         </button>
//         <button
//           onClick={() => {
//             setScale(1)
//             setStagePos({ x: 0, y: 0 })
//           }}
//           className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
//         >
//           إعادة تعيين
//         </button>
//       </div>

//       {/* دليل الألوان الواقعية */}
//       <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-lg border border-amber-200">
//         <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//           🧱 دليل الألوان الواقعية
//         </h5>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-yellow-700 rounded border"></div>
//             <span className="text-gray-700">طوب طبيعي</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-yellow-600 rounded border"></div>
//             <span className="text-gray-700">طوب تان</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-yellow-800 rounded border"></div>
//             <span className="text-gray-700">طوب رملي</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-gray-500 rounded border"></div>
//             <span className="text-gray-700">خرسانة</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-sky-200 rounded border"></div>
//             <span className="text-gray-700">نوافذ زجاجية</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-yellow-200 rounded border"></div>
//             <span className="text-gray-700">نوافذ مضيئة</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-yellow-900 rounded border"></div>
//             <span className="text-gray-700">أسطح</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-3 bg-green-400 rounded border"></div>
//             <span className="text-gray-700">مناظر طبيعية</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default RealisticBuildingVisualization

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Circle, Line, Group } from 'react-konva'
import type { BuildingData, Block, Floor, Unit, FloorDefinition } from '../building-builder/types'
import Konva from 'konva'

interface BlockUpdateData {
  position?: BlockPosition
  [key: string]: unknown
}

interface RealisticBuildingVisualizationProps {
  buildingData: BuildingData
  currentStep: number
  onBlockUpdate?: (blockId: string, updates: BlockUpdateData) => void
  onUnitClick?: (unitId: string) => void
  onFloorClick?: (floorId: string, blockId: string) => void
  selectedUnits?: Set<string>
  selectedFloor?: { floorId: string; blockId: string } | null
  floorDefinitions?: Record<string, FloorDefinition>
}

interface BlockPosition {
  x: number
  y: number
  rotation: number
}

const RealisticBuildingVisualization: React.FC<RealisticBuildingVisualizationProps> = ({
  buildingData,
  currentStep,
  onBlockUpdate,
  onUnitClick,
  onFloorClick,
  selectedUnits = new Set(),
  selectedFloor,
  floorDefinitions = {}
}) => {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [blockPositions, setBlockPositions] = useState<Record<string, BlockPosition>>({})
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })

  // طباعة بيانات التشخيص
  console.log('🏗️ RealisticBuildingVisualization - Building Data:', {
    name: buildingData.name,
    blocksCount: buildingData.blocks?.length || 0,
    blocks: buildingData.blocks,
    currentStep
  })

  // ألوان واقعية للطوب والخرسانة
  const realisticBuildingColors = [
    {
      main: '#8B7355',    // طوب بني طبيعي
      accent: '#6B5B47',  // طوب بني داكن
      mortar: '#C0B299',  // مونة فاتحة
      window: '#87CEEB',  // نوافذ زجاجية
      roof: '#654321'     // سقف بني داكن
    },
    {
      main: '#A0937D',    // طوب تان فاتح
      accent: '#8B7D6B',  // طوب تان داكن
      mortar: '#D2C5B0',  // مونة بيج
      window: '#B0E0E6',  // نوافذ زجاجية فاتحة
      roof: '#704214'     // سقف بني
    },
    {
      main: '#CD853F',    // طوب رملي
      accent: '#B8860B',  // طوب ذهبي داكن
      mortar: '#F5DEB3',  // مونة قمحية
      window: '#ADD8E6',  // نوافذ زرقاء فاتحة
      roof: '#8B4513'     // سقف بني محمر
    },
    {
      main: '#708090',    // خرسانة رمادية
      accent: '#2F4F4F',  // خرسانة داكنة
      mortar: '#C0C0C0',  // مونة فضية
      window: '#F0F8FF',  // نوافذ بيضاء
      roof: '#36454F'     // سقف رمادي داكن
    }
  ]

  // مقاسات الشاشة - متجاوبة مع حجم الحاوية
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 600 })
  const stageWidth = containerSize.width
  const stageHeight = containerSize.height

  // قياس حجم الحاوية
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({
          width: Math.max(800, rect.width - 20), // حد أدنى 800 مع هامش
          height: Math.max(500, rect.height - 20) // حد أدنى 500 مع هامش
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // دالة للحصول على موقع البلوك
  const getBlockPosition = (blockId: string, index: number): BlockPosition => {
    return blockPositions[blockId] || {
      x: stageWidth/2 - (buildingData.blocks.length * 70) + index * 140,
      y: stageHeight - 250,
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
    
    setBlockPositions(prev => {
      const updated = {
        ...prev,
        [blockId]: newPosition
      }
      // حفظ المواقع في localStorage للاحتفاظ بها
      localStorage.setItem('buildingBlockPositions', JSON.stringify(updated))
      return updated
    })

    if (onBlockUpdate) {
      onBlockUpdate(blockId, { position: newPosition })
    }
  }, [blockPositions, onBlockUpdate])

  // استرجاع مواقع البلوكات المحفوظة عند التحميل
  useEffect(() => {
    try {
      const savedPositions = localStorage.getItem('buildingBlockPositions')
      if (savedPositions) {
        const parsed = JSON.parse(savedPositions)
        setBlockPositions(parsed)
      }
    } catch (error) {
      console.error('Error loading saved block positions:', error)
    }
  }, [])

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

  // رسم الخلفية الواقعية مع السماء والأرض
  const renderRealisticBackground = () => (
    <Group>
      {/* السماء بتدرج واقعي */}
      <Rect
        x={0}
        y={0}
        width={800}
        height={350}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: 350 }}
        fillLinearGradientColorStops={[
          0, '#87CEEB',     // أزرق سماوي فاتح
          0.3, '#B0E0E6',   // أزرق فاتح
          0.7, '#E0F6FF',   // أبيض مزرق
          1, '#F0F8FF'      // أبيض ثلجي
        ]}
      />
      
      {/* الشمس */}
      <Circle
        x={720}
        y={80}
        radius={25}
        fill="#FFD700"
        shadowColor="#FFA500"
        shadowBlur={15}
        opacity={0.9}
      />
      
      {/* السحب الواقعية */}
      {[
        { x: 100, y: 60, size: 0.8 },
        { x: 300, y: 80, size: 1.0 },
        { x: 550, y: 70, size: 0.6 }
      ].map((cloud, index) => (
        <Group key={`cloud-${index}`}>
          <Circle x={cloud.x} y={cloud.y} radius={20 * cloud.size} fill="rgba(255, 255, 255, 0.9)" />
          <Circle x={cloud.x + 15 * cloud.size} y={cloud.y} radius={25 * cloud.size} fill="rgba(255, 255, 255, 0.8)" />
          <Circle x={cloud.x + 30 * cloud.size} y={cloud.y} radius={18 * cloud.size} fill="rgba(255, 255, 255, 0.9)" />
        </Group>
      ))}
      
      {/* الأرض الطبيعية */}
      <Rect
        x={0}
        y={350}
        width={800}
        height={150}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: 150 }}
        fillLinearGradientColorStops={[
          0, '#90EE90',     // أخضر عشب
          0.2, '#8FBC8F',   // أخضر داكن
          0.8, '#8B4513',   // بني تراب
          1, '#654321'      // بني داكن
        ]}
      />
      
      {/* الطريق الرئيسي */}
      <Rect
        x={0}
        y={400}
        width={800}
        height={40}
        fill="#2D3748"
      />
      
      {/* خطوط الطريق */}
      <Line
        points={[0, 420, 800, 420]}
        stroke="#FFFF00"
        strokeWidth={2}
        dash={[10, 10]}
      />
      
      {/* الرصيف */}
      <Rect
        x={0}
        y={440}
        width={800}
        height={15}
        fill="#CBD5E0"
      />
      
      {/* الأشجار الطبيعية المحسنة */}
      {[
        { x: 50, y: 320, size: 1.2 },
        { x: 120, y: 325, size: 1.0 },
        { x: 680, y: 315, size: 1.3 },
        { x: 720, y: 325, size: 0.9 },
        { x: 200, y: 330, size: 1.1 },
        { x: 600, y: 320, size: 1.0 }
      ].map((tree, index) => (
        <Group key={`tree-${index}`}>
          {/* جذع الشجرة */}
          <Rect
            x={tree.x - 3 * tree.size}
            y={tree.y}
            width={6 * tree.size}
            height={20 * tree.size}
            fill="#8B4513"
            cornerRadius={2}
          />
          {/* أوراق الشجرة متعددة الطبقات */}
          <Circle x={tree.x} y={tree.y - 5 * tree.size} radius={15 * tree.size} fill="#228B22" opacity={0.9} />
          <Circle x={tree.x - 6 * tree.size} y={tree.y - 2 * tree.size} radius={10 * tree.size} fill="#32CD32" opacity={0.8} />
          <Circle x={tree.x + 6 * tree.size} y={tree.y - 2 * tree.size} radius={10 * tree.size} fill="#90EE90" opacity={0.8} />
          <Circle x={tree.x} y={tree.y - 12 * tree.size} radius={12 * tree.size} fill="#9ACD32" opacity={0.7} />
        </Group>
      ))}
      
      {/* أعمدة الإنارة */}
      {[100, 250, 400, 550, 700].map((x, index) => (
        <Group key={`streetlight-${index}`}>
          {/* عمود الإنارة */}
          <Rect
            x={x - 2}
            y={360}
            width={4}
            height={40}
            fill="#4A5568"
            cornerRadius={2}
          />
          {/* المصباح */}
          <Circle
            x={x}
            y={365}
            radius={8}
            fill="#2D3748"
            stroke="#718096"
            strokeWidth={1}
          />
          {/* الضوء */}
          <Circle
            x={x}
            y={365}
            radius={4}
            fill="#FFF9C4"
            opacity={0.9}
          />
          {/* هالة الضوء */}
          <Circle
            x={x}
            y={420}
            radius={30}
            fill="rgba(255, 249, 196, 0.3)"
          />
        </Group>
      ))}
      
      {/* السيارات المتوقفة */}
      {[
        { x: 80, y: 405, color: '#2C3E50', type: 'sedan' },
        { x: 180, y: 405, color: '#E53E3E', type: 'suv' },
        { x: 320, y: 405, color: '#3182CE', type: 'sedan' },
        { x: 480, y: 405, color: '#38A169', type: 'hatchback' },
        { x: 620, y: 405, color: '#805AD5', type: 'suv' }
      ].map((car, index) => (
        <Group key={`car-${index}`}>
          {/* جسم السيارة */}
          <Rect
            x={car.x}
            y={car.y}
            width={car.type === 'suv' ? 45 : car.type === 'sedan' ? 40 : 35}
            height={18}
            fill={car.color}
            cornerRadius={3}
          />
          {/* النوافذ */}
          <Rect
            x={car.x + 5}
            y={car.y + 3}
            width={car.type === 'suv' ? 35 : car.type === 'sedan' ? 30 : 25}
            height={8}
            fill="#87CEEB"
            cornerRadius={2}
            opacity={0.8}
          />
          {/* العجلات */}
          <Circle
            x={car.x + 8}
            y={car.y + 20}
            radius={4}
            fill="#1A202C"
          />
          <Circle
            x={car.x + (car.type === 'suv' ? 37 : car.type === 'sedan' ? 32 : 27)}
            y={car.y + 20}
            radius={4}
            fill="#1A202C"
          />
          {/* الأضواء الأمامية */}
          <Circle
            x={car.x + (car.type === 'suv' ? 42 : car.type === 'sedan' ? 37 : 32)}
            y={car.y + 6}
            radius={2}
            fill="#FFF9C4"
          />
          <Circle
            x={car.x + (car.type === 'suv' ? 42 : car.type === 'sedan' ? 37 : 32)}
            y={car.y + 12}
            radius={2}
            fill="#FFF9C4"
          />
        </Group>
      ))}
      
      {/* ممر المشاة */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Rect
          key={`crosswalk-${i}`}
          x={350 + i * 12}
          y={400}
          width={8}
          height={40}
          fill="white"
          opacity={0.9}
        />
      ))}
      
      {/* حديقة صغيرة */}
      <Group>
        {/* العشب */}
        <Circle x={150} y={380} radius={25} fill="#90EE90" opacity={0.8} />
        <Circle x={650} y={380} radius={30} fill="#90EE90" opacity={0.8} />
        
        {/* الزهور */}
        {[
          { x: 140, y: 370, color: '#FF69B4' },
          { x: 155, y: 375, color: '#FF4500' },
          { x: 160, y: 365, color: '#9370DB' },
          { x: 640, y: 370, color: '#FF69B4' },
          { x: 655, y: 375, color: '#FFD700' },
          { x: 665, y: 365, color: '#FF6347' }
        ].map((flower, index) => (
          <Circle
            key={`flower-${index}`}
            x={flower.x}
            y={flower.y}
            radius={3}
            fill={flower.color}
          />
        ))}
        
        {/* مقاعد الحديقة */}
        <Rect x={130} y={390} width={40} height={8} fill="#8B4513" cornerRadius={2} />
        <Rect x={630} y={390} width={40} height={8} fill="#8B4513" cornerRadius={2} />
      </Group>
      
      {/* مواقف السيارات المخططة */}
      {[60, 160, 300, 460, 600].map((x, index) => (
        <Group key={`parking-${index}`}>
          <Rect
            x={x}
            y={425}
            width={50}
            height={25}
            stroke="#FFFFFF"
            strokeWidth={1}
            fill="transparent"
            dash={[3, 3]}
          />
          <Text
            x={x + 25}
            y={435}
            text={`P${index + 1}`}
            fontSize={8}
            fill="#FFFFFF"
            align="center"
            offsetX={8}
          />
        </Group>
      ))}
    </Group>
  )

  // رسم بلوك واقعي مع تفاصيل معمارية
  const renderRealisticBlock = (block: Block, index: number) => {
    const position = getBlockPosition(block.id, index)
    const blockWidth = 120
    const floorHeight = 25
    const totalHeight = Math.max(block.floors.length * floorHeight + 20, 80)
    const colorScheme = realisticBuildingColors[index % realisticBuildingColors.length]
    const isSelected = selectedBlock === block.id

    // حساب مرحلة البناء بناءً على الخطوة الحالية
    const actuallyHasUnits = block.floors.some(floor => floor.units.length > 0)
    const showUnits = currentStep >= 5 && actuallyHasUnits  // إظهار الوحدات فقط في المرحلة 5+
    const showFoundations = currentStep <= 2  // إظهار الأساسات في المراحل الأولى
    const hasUnits = showUnits  // للتوافق مع الكود الموجود

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
        {/* ظل البناء ثلاثي الأبعاد */}
        <Rect
          x={6}
          y={6}
          width={blockWidth}
          height={totalHeight}
          fill="rgba(0, 0, 0, 0.3)"
          cornerRadius={3}
        />
        
        {/* الجانب الأيمن للبناء (تأثير 3D) */}
        <Rect
          x={blockWidth}
          y={0}
          width={15}
          height={totalHeight}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 15, y: 0 }}
          fillLinearGradientColorStops={[
            0, colorScheme.accent,
            1, colorScheme.main + '80'
          ]}
        />
        
        {/* السطح العلوي للبناء (تأثير 3D) */}
        <Rect
          x={0}
          y={-8}
          width={blockWidth + 15}
          height={8}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: 8 }}
          fillLinearGradientColorStops={[
            0, colorScheme.roof,
            1, colorScheme.accent
          ]}
        />
        
        {/* الواجهة الأمامية للبناء */}
        <Rect
          x={0}
          y={0}
          width={blockWidth}
          height={totalHeight}
          fill={showFoundations ? '#8B4513' : hasUnits ? colorScheme.main : '#696969'}
          stroke={isSelected ? '#FFD700' : colorScheme.accent}
          strokeWidth={isSelected ? 3 : 2}
          cornerRadius={2}
        />

        {/* رسم الأساسات في المراحل الأولى */}
        {showFoundations ? (
          <Group>
            {/* أساسات خرسانية */}
            <Rect
              x={-10}
              y={totalHeight}
              width={blockWidth + 20}
              height={15}
              fill="#654321"
              stroke="#4A2C2A"
              strokeWidth={2}
            />
            {/* حفر الأساسات */}
            <Rect
              x={-5}
              y={totalHeight + 15}
              width={blockWidth + 10}
              height={8}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth={1}
            />
            {/* خطوط الحديد */}
            {Array.from({ length: 5 }).map((_, i) => (
              <Line
                key={`foundation-rebar-${i}`}
                points={[-5 + i * (blockWidth + 10) / 4, totalHeight + 5, -5 + i * (blockWidth + 10) / 4, totalHeight + 20]}
                stroke="#FF4500"
                strokeWidth={2}
              />
            ))}
            {/* معدات البناء */}
            <Rect
              x={blockWidth + 10}
              y={totalHeight - 5}
              width={8}
              height={12}
              fill="#FFD700"
              stroke="#B8860B"
              strokeWidth={1}
            />
            <Text
              x={blockWidth + 14}
              y={totalHeight + 2}
              text="🚛"
              fontSize={8}
              align="center"
            />
            {/* نص الأساسات */}
            <Text
              x={blockWidth / 2}
              y={totalHeight + 30}
              text="🏗️ مرحلة الأساسات"
              fontSize={10}
              fill="#654321"
              fontStyle="bold"
              align="center"
              offsetX={40}
            />
          </Group>
        ) : (
          <Group>
            {/* خطوط الطوب الأفقية */}
            {Array.from({ length: Math.floor(totalHeight / 8) }).map((_, i) => (
              <Line
                key={`brick-line-${i}`}
                points={[2, i * 8, blockWidth - 2, i * 8]}
                stroke={colorScheme.mortar}
                strokeWidth={1}
                opacity={0.7}
              />
            ))}

            {/* خطوط الطوب العمودية (متداخلة) */}
            {Array.from({ length: Math.floor(totalHeight / 8) }).map((_, row) => 
              Array.from({ length: Math.floor(blockWidth / 20) }).map((_, col) => (
                <Line
                  key={`brick-vertical-${row}-${col}`}
                  points={[
                    col * 20 + (row % 2) * 10, row * 8,
                    col * 20 + (row % 2) * 10, (row + 1) * 8
                  ]}
                  stroke={colorScheme.mortar}
                  strokeWidth={1}
                  opacity={0.5}
                />
              ))
            )}
          </Group>
        )}

        {/* رسم الطوابق مع النوافذ الواقعية - من الأسفل للأعلى */}
        {block.floors.map((floor: Floor, floorIndex: number) => {
          const floorY = totalHeight - floorHeight * (floorIndex + 1)
          
          // التحقق من اختيار الطابق بطرق مختلفة
          const isFloorSelectedDirectly = selectedFloor && selectedFloor.floorId === floor.id && selectedFloor.blockId === block.id
          
          // التحقق من اختيار الطابق من floorDefinitions في المرحلة 3
          const floorNumber = floorIndex + 1
          const floorKey = `${block.name}-floor-${floorNumber}`
          const isFloorInDefinitions = currentStep === 3 && floorDefinitions[floorKey]
          
          const isFloorSelected = isFloorSelectedDirectly || isFloorInDefinitions
          
          return (
            <Group key={floor.id}>
              {/* تأثير اختيار الطابق - يعمل في المراحل 3 و 4 */}
              {(currentStep === 3 || currentStep === 4) && isFloorSelected && (
                <Group>
                  <Rect
                    x={-5}
                    y={floorY - 2}
                    width={blockWidth + 10}
                    height={floorHeight + 4}
                    stroke="#FF6B35"
                    strokeWidth={3}
                    fill="rgba(255, 107, 53, 0.1)"
                    cornerRadius={3}
                    dash={[8, 4]}
                  />
                  {/* نص إضافي للطابق المختار */}
                  <Text
                    x={blockWidth + 15}
                    y={floorY + floorHeight/2}
                    text={currentStep === 3 && isFloorInDefinitions ? "✓ معرف" : "✓ مختار"}
                    fontSize={8}
                    fill="#FF6B35"
                    fontStyle="bold"
                    align="center"
                    offsetY={3}
                  />
                </Group>
              )}
              
              {/* منطقة النقر على الطابق */}
              <Rect
                x={0}
                y={floorY}
                width={blockWidth}
                height={floorHeight}
                fill="transparent"
                onClick={() => {
                  // إما اختيار الطابق الكامل أو اختيار جميع وحداته
                  if (onFloorClick) {
                    onFloorClick(floor.id, block.id)
                  } else if (onUnitClick) {
                    // اختيار جميع وحدات الطابق
                    floor.units.forEach(unit => {
                      const unitId = `${block.id}-${floor.id}-${unit.id}`
                      onUnitClick(unitId)
                    })
                  }
                }}
                onTap={() => {
                  // إما اختيار الطابق الكامل أو اختيار جميع وحداته
                  if (onFloorClick) {
                    onFloorClick(floor.id, block.id)
                  } else if (onUnitClick) {
                    // اختيار جميع وحدات الطابق
                    floor.units.forEach(unit => {
                      const unitId = `${block.id}-${floor.id}-${unit.id}`
                      onUnitClick(unitId)
                    })
                  }
                }}
              />
              
              {/* خط فاصل الطابق */}
              <Line
                points={[5, floorY, blockWidth - 5, floorY]}
                stroke={colorScheme.accent}
                strokeWidth={2}
                opacity={0.8}
              />
              
              {/* رقم الطابق */}
              <Text
                x={-15}
                y={floorY + floorHeight/2}
                text={floor.number}
                fontSize={10}
                fill={colorScheme.accent}
                fontStyle="bold"
                align="center"
                offsetX={5}
                offsetY={5}
              />
              
              {/* رسم النوافذ الواقعية - فقط في المرحلة 5 وما بعدها وعند وجود وحدات */}
              {currentStep >= 5 && hasUnits && floor.units.length > 0 && floor.units.map((unit: Unit, unitIndex: number) => {
                const unitsPerFloor = Math.max(floor.units.length, 1)
                const windowWidth = Math.max(12, (blockWidth - 30) / unitsPerFloor)
                const windowX = 15 + unitIndex * (windowWidth + 5)
                const windowHeight = floorHeight - 8
                const unitId = `${block.id}-${floor.id}-${unit.id}`
                const isSelected = selectedUnits.has(unitId)
                const isLit = hasUnits && (isSelected || Math.random() > 0.4)
                
                return (
                  <Group key={unit.id}>
                    {/* إطار النافذة الخارجي */}
                    <Rect
                      x={windowX - 2}
                      y={floorY + 3}
                      width={windowWidth + 4}
                      height={windowHeight}
                      fill={colorScheme.accent}
                      cornerRadius={1}
                    />
                    
                    {/* زجاج النافذة */}
                    <Rect
                      x={windowX}
                      y={floorY + 5}
                      width={windowWidth}
                      height={windowHeight - 4}
                      fill={isLit ? '#FFE4B5' : colorScheme.window}
                      stroke="#2F4F4F"
                      strokeWidth={1}
                      cornerRadius={1}
                      opacity={0.9}
                      onClick={() => {
                        const unitId = `${block.id}-${floor.id}-${unit.id}`
                        if (onUnitClick) {
                          onUnitClick(unitId)
                        }
                      }}
                      onTap={() => {
                        const unitId = `${block.id}-${floor.id}-${unit.id}`
                        if (onUnitClick) {
                          onUnitClick(unitId)
                        }
                      }}
                    />
                    
                    {/* إطار الاختيار للوحدة المختارة */}
                    {isSelected && (
                      <Rect
                        x={windowX - 3}
                        y={floorY + 2}
                        width={windowWidth + 6}
                        height={windowHeight + 2}
                        stroke="#FFD700"
                        strokeWidth={3}
                        fill="transparent"
                        cornerRadius={2}
                        dash={[5, 5]}
                      />
                    )}
                    
                    {/* قضبان النافذة */}
                    <Line
                      points={[
                        windowX, floorY + 5 + windowHeight/2,
                        windowX + windowWidth, floorY + 5 + windowHeight/2
                      ]}
                      stroke="#2F4F4F"
                      strokeWidth={1}
                    />
                    <Line
                      points={[
                        windowX + windowWidth/2, floorY + 5,
                        windowX + windowWidth/2, floorY + 5 + windowHeight - 4
                      ]}
                      stroke="#2F4F4F"
                      strokeWidth={1}
                    />
                    
                    {/* انعكاس الضوء على الزجاج */}
                    <Rect
                      x={windowX + 2}
                      y={floorY + 7}
                      width={windowWidth/3}
                      height={windowHeight/3}
                      fill="rgba(255, 255, 255, 0.6)"
                      opacity={0.7}
                    />
                    
                    {/* شرفة صغيرة للطابق الأرضي */}
                    {floor.number === 'G' && (
                      <Group>
                        <Rect
                          x={windowX - 3}
                          y={floorY + windowHeight - 2}
                          width={windowWidth + 6}
                          height={4}
                          fill={colorScheme.accent}
                        />
                        <Line
                          points={[
                            windowX - 3, floorY + windowHeight + 2,
                            windowX + windowWidth + 3, floorY + windowHeight + 2
                          ]}
                          stroke={colorScheme.accent}
                          strokeWidth={2}
                        />
                      </Group>
                    )}
                  </Group>
                )
              })}
              
              {/* رسالة عدم وجود وحدات - فقط في المرحلة 5 */}
              {currentStep >= 5 && hasUnits && floor.units.length === 0 && (
                <Group>
                  <Rect
                    x={10}
                    y={floorY + 8}
                    width={blockWidth - 20}
                    height={10}
                    fill="rgba(200, 200, 200, 0.3)"
                    stroke="#999"
                    strokeWidth={1}
                    dash={[3, 3]}
                    cornerRadius={2}
                  />
                  <Text
                    x={blockWidth / 2}
                    y={floorY + 13}
                    text="لا توجد وحدات"
                    fontSize={8}
                    fill="#666"
                    align="center"
                    offsetX={30}
                  />
                </Group>
              )}
              
              {/* رقم الطابق مع خلفية - قابل للنقر */}
              <Circle
                x={-20}
                y={floorY + floorHeight/2}
                radius={8}
                fill={isFloorSelected ? '#FF6B35' : colorScheme.main}
                stroke={isFloorSelected ? '#FF4500' : colorScheme.accent}
                strokeWidth={isFloorSelected ? 2 : 1}
                onClick={() => {
                  if (onFloorClick) {
                    onFloorClick(floor.id, block.id)
                  }
                }}
                onTap={() => {
                  if (onFloorClick) {
                    onFloorClick(floor.id, block.id)
                  }
                }}
              />
              <Text
                x={-20}
                y={floorY + floorHeight/2 - 4}
                text={floor.number.toString()}
                fontSize={10}
                fill="white"
                fontStyle="bold"
                align="center"
                offsetX={0}
                onClick={() => {
                  if (onFloorClick) {
                    onFloorClick(floor.id, block.id)
                  }
                }}
                onTap={() => {
                  if (onFloorClick) {
                    onFloorClick(floor.id, block.id)
                  }
                }}
              />
            </Group>
          )
        })}
        
        {/* مدخل المبنى */}
        {hasUnits ? (
          // مدخل حديث للمبنى المكتمل
          <Group>
            <Rect
              x={blockWidth * 0.3}
              y={totalHeight - 15}
              width={blockWidth * 0.4}
              height={15}
              fill={colorScheme.window}
              stroke={colorScheme.accent}
              strokeWidth={2}
              cornerRadius={3}
            />
            <Text
              x={blockWidth * 0.5}
              y={totalHeight - 8}
              text="🚪"
              fontSize={10}
              align="center"
              offsetX={5}
            />
          </Group>
        ) : (
          // مدخل مؤقت للمبنى تحت الإنشاء
          <Rect
            x={blockWidth * 0.35}
            y={totalHeight - 12}
            width={blockWidth * 0.3}
            height={12}
            fill="#8B4513"
            stroke="#654321"
            strokeWidth={2}
          />
        )}
        
        {/* سطح المبنى مع تفاصيل */}
        <Group>
          <Rect
            x={5}
            y={-8}
            width={blockWidth - 10}
            height={8}
            fill={colorScheme.roof}
            stroke={colorScheme.accent}
            strokeWidth={1}
          />
          
          {/* معدات السطح */}
          <Rect x={blockWidth * 0.2} y={-6} width={8} height={4} fill={colorScheme.accent} />
          <Rect x={blockWidth * 0.5} y={-6} width={6} height={4} fill={colorScheme.accent} />
          <Rect x={blockWidth * 0.8} y={-6} width={10} height={4} fill={colorScheme.accent} />
        </Group>
        
        {/* اسم البلوك مع خلفية جميلة */}
        <Rect
          x={blockWidth/2 - 25}
          y={-35}
          width={50}
          height={18}
          fill={showFoundations ? '#8B4513' : hasUnits ? colorScheme.main : '#FF6B35'}
          stroke={colorScheme.accent}
          strokeWidth={1}
          cornerRadius={4}
        />
        <Text
          x={blockWidth / 2}
          y={-30}
          text={showFoundations ? `🏗️ أساسات ${block.name}` : hasUnits ? `بلوك ${block.name}` : `🚧 بلوك ${block.name}`}
          fontSize={12}
          fill="white"
          fontStyle="bold"
          align="center"
          offsetX={showFoundations ? 30 : hasUnits ? 15 : 20}
        />
        
        {/* معلومات البلوك */}
        <Rect
          x={blockWidth/2 - 30}
          y={totalHeight + 10}
          width={60}
          height={15}
          fill={colorScheme.main}
          stroke={colorScheme.accent}
          strokeWidth={1}
          cornerRadius={3}
          opacity={0.9}
        />
        <Text
          x={blockWidth / 2}
          y={totalHeight + 20}
          text={`${block.floors.length} طابق • ${block.floors.reduce((total: number, floor: Floor) => total + floor.units.length, 0)} شقة`}
          fontSize={9}
          fill="white"
          fontStyle="bold"
          align="center"
          offsetX={30}
        />

        {/* تأثير الاختيار */}
        {isSelected && (
          <Rect
            x={-5}
            y={-10}
            width={blockWidth + 25}
            height={totalHeight + 15}
            stroke="#FFD700"
            strokeWidth={3}
            fill="transparent"
            dash={[5, 5]}
            cornerRadius={5}
          />
        )}
      </Group>
    )
  }

  // رسم المحتوى حسب الخطوة
  const renderContent = () => {
    // طباعة حالة البيانات
    console.log('🎨 renderContent - Data check:', {
      hasBlocks: buildingData.blocks && buildingData.blocks.length > 0,
      blocksLength: buildingData.blocks?.length,
      currentStep,
      buildingName: buildingData.name
    })
    
    // إذا كان هناك بيانات مباني، اعرضها دائماً
    if (buildingData.blocks && buildingData.blocks.length > 0) {
      console.log('✅ Rendering building blocks:', buildingData.blocks)
      return (
        <Group>
          {renderRealisticBackground()}
          {buildingData.blocks.map((block, index) => renderRealisticBlock(block, index))}
          
          {/* عنوان المشروع */}
          <Rect
            x={stageWidth/2 - 100}
            y={20}
            width={200}
            height={25}
            fill="rgba(139, 115, 85, 0.9)"
            stroke="#6B5B47"
            strokeWidth={2}
            cornerRadius={5}
          />
          <Text
            x={stageWidth / 2}
            y={35}
            text={buildingData.name || 'المشروع السكني'}
            fontSize={16}
            fill="white"
            fontStyle="bold"
            align="center"
            offsetX={50}
          />
        </Group>
      )
    }
    
    console.log('⚠️ No building data found, showing default content for step:', currentStep)

    // إذا لم تكن هناك بيانات مباني، اعرض حسب الخطوة
    switch (currentStep) {
      case 1:
        return (
          <Group>
            {renderRealisticBackground()}
            <Text
              x={stageWidth / 2}
              y={stageHeight / 2}
              text="أرض فارغة جاهزة للبناء"
              fontSize={20}
              fill="#2D3748"
              fontStyle="bold"
              align="center"
              offsetX={80}
            />
            <Text
              x={stageWidth / 2}
              y={stageHeight / 2 + 30}
              text={buildingData.name || "ابدأ بإدخال اسم المشروع"}
              fontSize={16}
              fill="#4A5568"
              align="center"
              offsetX={60}
            />
          </Group>
        )
      
      default:
        return (
          <Group>
            {renderRealisticBackground()}
            <Text
              x={stageWidth / 2}
              y={stageHeight / 2}
              text="جاهز لبناء المشروع"
              fontSize={20}
              fill="#2D3748"
              fontStyle="bold"
              align="center"
              offsetX={80}
            />
          </Group>
        )
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={true}
        className="border border-gray-300 rounded-lg shadow-lg bg-gradient-to-b from-blue-50 to-green-50"
        style={{width: '100%', height: '100%', display: 'block'}}
      >
        <Layer>
          {renderContent()}
        </Layer>
      </Stage>
      
      {/* أدوات التحكم */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => setScale(Math.min(scale + 0.2, 3))}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          تكبير +
        </button>
        <button
          onClick={() => setScale(Math.max(scale - 0.2, 0.5))}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          تصغير -
        </button>
        <button
          onClick={() => {
            setScale(1)
            setStagePos({ x: 0, y: 0 })
          }}
          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          إعادة تعيين العرض
        </button>
        <button
          onClick={() => {
            setBlockPositions({})
            localStorage.removeItem('buildingBlockPositions')
          }}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          إعادة تعيين مواقع الأبراج
        </button>
      </div>

      {/* دليل التفاعل والألوان */}
      <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-lg border border-amber-200">
        <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          🎯 دليل التفاعل والألوان
        </h5>
        <div className="mb-3 text-xs text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
          <p className="font-medium mb-1">طرق التفاعل:</p>
          <p>• انقر على النافذة لاختيار وحدة واحدة (المرحلة 5 فقط)</p>
          <p>• انقر على رقم الطابق لإضافته لتعريفات الطوابق (المرحلة 3)</p>
          <p>• اسحب البرج لتغيير موقعه (يتم حفظ الموقع تلقائياً)</p>
          <p>• المراحل 1-2: تظهر الأساسات والحفريات</p>
          <p>• المراحل 3-4: تظهر الطوابق بدون وحدات</p>
          <p>• المرحلة 5: تظهر النوافذ والوحدات حسب العدد المحدد في كل طابق</p>
          <p>• يمكن تعديل عدد الوحدات لكل طابق في المرحلة 3 (تعريف الطوابق)</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-700 rounded border"></div>
            <span className="text-gray-700">طوب طبيعي</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-600 rounded border"></div>
            <span className="text-gray-700">طوب تان</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-800 rounded border"></div>
            <span className="text-gray-700">طوب رملي</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-gray-500 rounded border"></div>
            <span className="text-gray-700">خرسانة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-sky-200 rounded border"></div>
            <span className="text-gray-700">نوافذ زجاجية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-200 rounded border"></div>
            <span className="text-gray-700">نوافذ مضيئة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-900 rounded border"></div>
            <span className="text-gray-700">أسطح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-400 rounded border"></div>
            <span className="text-gray-700">مناظر طبيعية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-800 rounded border"></div>
            <span className="text-gray-700">أساسات خرسانية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-orange-500 rounded border"></div>
            <span className="text-gray-700">حديد التسليح</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealisticBuildingVisualization