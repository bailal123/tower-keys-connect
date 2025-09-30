import React, { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Sky, 
  Stars,
  Text,
  Box,
  Plane,
  Html,
  PerspectiveCamera,
  Stats,
  Grid
} from '@react-three/drei'
import * as THREE from 'three'
import type { BuildingData, Block, Floor, Unit } from '../building-builder/types'

// مكون النافذة المنفصل للتعامل مع الحالة
interface UnitWindowProps {
  unit: { id: string; number: string; area?: number }
  windowWidth: number
  windowX: number
  onUnitClick?: (unitId: string) => void
  selectedUnits: Set<string>
}

const UnitWindow: React.FC<UnitWindowProps> = ({ 
  unit, 
  windowWidth, 
  windowX, 
  onUnitClick, 
  selectedUnits 
}) => {
  const [hovered, setHovered] = useState(false)
  const isSelected = selectedUnits.has(unit.id)
  const isLit = Math.random() > 0.3 // إضاءة عشوائية
  
  return (
    <group>
      {/* النافذة الزجاجية - قابلة للنقر */}
      <mesh 
        position={[windowX, 0, 9 + 0.05]}
        onClick={(e) => {
          e.stopPropagation()
          if (onUnitClick) {
            onUnitClick(unit.id)
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <boxGeometry args={[windowWidth, 2.5, 0.15]} />
        <meshPhysicalMaterial 
          color={isSelected ? '#FFD700' : (isLit ? '#FFF9C4' : '#E6F3FF')}
          transparent
          opacity={isSelected ? 0.95 : (isLit ? 0.85 : 0.7)}
          transmission={isSelected ? 0.3 : 0.6}
          roughness={0.1}
          metalness={0.0}
          reflectivity={0.8}
          emissive={isSelected ? '#FFB000' : (isLit ? '#FFE082' : '#000000')}
          emissiveIntensity={isSelected ? 0.4 : (isLit ? 0.2 : 0)}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* إطار النافذة - محسن */}
      <mesh position={[windowX, 0, 9 + 0.12]}>
        <boxGeometry args={[windowWidth + 0.15, 2.6, 0.08]} />
        <meshStandardMaterial 
          color={isSelected ? '#FF6B35' : '#C0C0C0'} 
          metalness={0.7} 
          roughness={0.3}
          emissive={isSelected ? '#331100' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* رقم الشقة */}
      <Text
        position={[windowX, -0.5, 9 + 0.2]}
        fontSize={0.3}
        color={isSelected ? '#FF6B35' : '#333333'}
        anchorX="center"
        anchorY="middle"
        fontWeight={isSelected ? 'bold' : 'normal'}
        onClick={(e) => {
          e.stopPropagation()
          if (onUnitClick) {
            onUnitClick(unit.id)
          }
        }}
      >
        {unit.number}
      </Text>
      
      {/* مؤشر الاختيار */}
      {isSelected && (
        <mesh position={[windowX + windowWidth/2 - 0.2, 1, 9 + 0.25]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color="#28A745"
            emissive="#0F5132"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
      
      {/* تأثير التمرير */}
      {hovered && !isSelected && (
        <mesh position={[windowX, 0, 9 + 0.18]}>
          <boxGeometry args={[windowWidth + 0.3, 2.8, 0.02]} />
          <meshStandardMaterial 
            color="#4A90E2"
            transparent
            opacity={0.5}
            emissive="#1E5A96"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* قضبان النافذة - محسنة */}
      <mesh position={[windowX, 0, 9 + 0.08]}>
        <boxGeometry args={[0.04, 2.4, 0.03]} />
        <meshStandardMaterial 
          color={isSelected ? '#FF6B35' : '#808080'} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>
      <mesh position={[windowX, 0.7, 9 + 0.08]}>
        <boxGeometry args={[windowWidth * 0.9, 0.04, 0.03]} />
        <meshStandardMaterial 
          color={isSelected ? '#FF6B35' : '#808080'} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>
      <mesh position={[windowX, -0.7, 9 + 0.08]}>
        <boxGeometry args={[windowWidth * 0.9, 0.04, 0.03]} />
        <meshStandardMaterial 
          color={isSelected ? '#FF6B35' : '#808080'} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

interface ThreeDVisualizationProps {
  buildingData: BuildingData
  currentStep: number
  onBlockUpdate?: (blockId: string, updates: Record<string, unknown>) => void
  onUnitClick?: (unitId: string) => void
  selectedUnits?: Set<string>
  enableVR?: boolean
  enableAR?: boolean
  showStats?: boolean
  enableMap?: boolean
}

// مكون البلوك ثلاثي الأبعاد
interface BuildingBlockProps {
  block: Block
  position: [number, number, number]
  onSelect: (blockId: string) => void
  selected: boolean
  blockIndex: number
  onUnitClick?: (unitId: string) => void
  selectedUnits: Set<string>
}

const BuildingBlock: React.FC<BuildingBlockProps> = ({ 
  block, 
  position, 
  onSelect, 
  selected,
  blockIndex,
  onUnitClick,
  selectedUnits
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  // ألوان واقعية للطوب والخرسانة
  const realisticBlockColors = [
    '#8B7355', // طوب بني طبيعي
    '#A0937D', // طوب تان فاتح
    '#967A65', // طوب بني متوسط
    '#CD853F', // طوب رملي بني
    '#D2B48C', // طوب تان
    '#BC9A6A', // طوب خاكي
    '#8FBC8F', // خرسانة خضراء حكيمة
    '#708090'  // خرسانة رمادية أردوازية
  ]
  
  const floorHeight = 3.5
  const buildingHeight = Math.max(block.floors.length * floorHeight, 10)
  const buildingWidth = 8
  const buildingDepth = 6
  
  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })
  
  return (
    <group position={position}>
      {/* المبنى الرئيسي بتأثير الطوب */}
      <mesh
        ref={meshRef}
        onClick={() => onSelect(block.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial 
          color={selected ? '#FFD700' : realisticBlockColors[blockIndex % realisticBlockColors.length]}
          metalness={0.05}
          roughness={0.95}
          emissive={hovered ? '#2D1B14' : selected ? '#3D2A1F' : '#000000'}
          emissiveIntensity={hovered ? 0.1 : selected ? 0.05 : 0}
        />
      </mesh>
      
      {/* تفاصيل الطوب على الجدران */}
      {Array.from({ length: Math.floor(buildingHeight / 1.5) }).map((_, rowIndex) => 
        Array.from({ length: Math.floor(buildingWidth / 1.2) }).map((_, colIndex) => (
          <mesh 
            key={`brick-front-${rowIndex}-${colIndex}`}
            position={[
              -buildingWidth/2 + (colIndex + 0.5) * 1.2, 
              -buildingHeight/2 + (rowIndex + 0.5) * 1.5, 
              buildingDepth/2 + 0.02
            ]}
          >
            <boxGeometry args={[1.1, 0.4, 0.05]} />
            <meshStandardMaterial 
              color={realisticBlockColors[blockIndex % realisticBlockColors.length]} 
              roughness={0.9}
              metalness={0.02}
            />
          </mesh>
        ))
      )}
      
      {/* خطوط المونة بين الطوب */}
      {Array.from({ length: Math.floor(buildingHeight / 1.5) + 1 }).map((_, rowIndex) => (
        <mesh 
          key={`mortar-h-${rowIndex}`}
          position={[0, -buildingHeight/2 + rowIndex * 1.5, buildingDepth/2 + 0.01]}
        >
          <boxGeometry args={[buildingWidth + 0.1, 0.1, 0.02]} />
          <meshStandardMaterial color="#E5DDD5" roughness={0.8} metalness={0.0} />
        </mesh>
      ))}
      
      {/* السطح مع تفاصيل */}
      <mesh position={[0, buildingHeight/2 + 0.2, 0]}>
        <boxGeometry args={[buildingWidth + 0.5, 0.4, buildingDepth + 0.5]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.7} 
          metalness={0.1}
        />
      </mesh>
      
      {/* حافة السطح */}
      <mesh position={[0, buildingHeight/2 + 0.5, 0]}>
        <boxGeometry args={[buildingWidth + 0.7, 0.2, buildingDepth + 0.7]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.6} 
          metalness={0.2}
        />
      </mesh>
      
      {/* الطوابق - من الأسفل للأعلى */}
      {block.floors.map((floor: Floor, floorIndex: number) => (
        <group key={floor.id} position={[0, -buildingHeight/2 + floorIndex * floorHeight + floorHeight/2, 0]}>
          {/* خط الطابق */}
          <mesh position={[0, floorHeight/2 - 0.1, buildingDepth/2 + 0.1]}>
            <boxGeometry args={[buildingWidth + 0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
          </mesh>
          
          {/* النوافذ والشقق - مع التفاعل */}
          {floor.units.map((unit: Unit, unitIndex: number) => {
            const windowWidth = buildingWidth / Math.max(floor.units.length, 1) * 0.7
            const windowX = -buildingWidth/2 + (unitIndex + 0.5) * (buildingWidth / floor.units.length)
            
            return (
              <UnitWindow
                key={unit.id}
                unit={unit}
                windowWidth={windowWidth}
                windowX={windowX}
                onUnitClick={onUnitClick}
                selectedUnits={selectedUnits}
              />
            )
          })}          {/* رقم الطابق */}
          <Text
            position={[-buildingWidth/2 - 1, 0, 0]}
            fontSize={0.8}
            color="#333333"
            anchorX="center"
            anchorY="middle"
          >
            {floor.number}
          </Text>
        </group>
      ))}
      
      {/* اسم البلوك */}
      <Text
        position={[0, buildingHeight/2 + 2, 0]}
        fontSize={1.2}
        color="#1F2937"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {block.name}
      </Text>
      
      {/* معلومات البلوك */}
      <Html position={[0, -buildingHeight/2 - 2, 0]} center>
        <div className="bg-white px-2 py-1 rounded shadow text-xs text-center">
          <div>{block.floors.length} طابق</div>
          <div>{block.floors.reduce((total: number, floor: Floor) => total + floor.units.length, 0)} شقة</div>
        </div>
      </Html>
    </group>
  )
}

// مكون البيئة المحيطة
const EnvironmentScene: React.FC<{ timeOfDay: 'morning' | 'noon' | 'evening' | 'night' }> = ({ timeOfDay }) => {
  const sunPositions: Record<string, [number, number, number]> = {
    morning: [10, 5, 10],
    noon: [0, 20, 0],
    evening: [-10, 5, 10],
    night: [0, -5, 0]
  }
  
  const skyColors = {
    morning: '#FFE4B5',
    noon: '#87CEEB',
    evening: '#FF6347',
    night: '#191970'
  }
  
  return (
    <>
      {/* السماء */}
      <Sky 
        sunPosition={sunPositions[timeOfDay]}
        turbidity={timeOfDay === 'night' ? 20 : 10}
        rayleigh={timeOfDay === 'night' ? 0.5 : 2}
      />
      
      {/* النجوم (فقط في الليل) */}
      {timeOfDay === 'night' && <Stars radius={300} depth={60} count={1000} factor={7} />}
      
      {/* الإضاءة الرئيسية */}
      <directionalLight 
        position={sunPositions[timeOfDay]}
        intensity={timeOfDay === 'night' ? 0.2 : 1.2}
        color={timeOfDay === 'night' ? '#4169E1' : '#ffffff'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* إضاءة مساعدة محسنة */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0001}
      />
      <directionalLight 
        position={[-10, 8, -10]} 
        intensity={0.3}
        color="#E6F3FF"
      />
      
      {/* إضاءة المدينة (في الليل) */}
      {timeOfDay === 'night' && (
        <pointLight position={[0, 10, 0]} intensity={2} color="#FFE082" distance={50} />
      )}
      
      {/* الضباب */}
      <fog attach="fog" args={[skyColors[timeOfDay], 30, 100]} />
    </>
  )
}

// مكون السيارة ثلاثية الأبعاد
interface CarProps {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  type: 'sedan' | 'suv' | 'hatchback'
}

const Car3D: React.FC<CarProps> = ({ position, rotation, color, type }) => {
  const carRef = useRef<THREE.Group>(null)
  
  const dimensions = {
    sedan: { width: 4, height: 1.5, length: 2 },
    suv: { width: 4.5, height: 2, length: 2.2 },
    hatchback: { width: 3.5, height: 1.4, length: 1.8 }
  }
  
  const carSize = dimensions[type]
  
  return (
    <group ref={carRef} position={position} rotation={rotation}>
      {/* جسم السيارة */}
      <mesh position={[0, carSize.height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[carSize.width, carSize.height, carSize.length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.2}
        />
      </mesh>
      
      {/* النوافذ */}
      <mesh position={[0, carSize.height/2 + 0.3, 0]} castShadow>
        <boxGeometry args={[carSize.width - 0.2, carSize.height - 0.3, carSize.length - 0.2]} />
        <meshPhysicalMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.7}
          transmission={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* العجلات */}
      <mesh position={[-carSize.width/2 + 0.3, 0.3, carSize.length/2 - 0.3]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      <mesh position={[carSize.width/2 - 0.3, 0.3, carSize.length/2 - 0.3]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      <mesh position={[-carSize.width/2 + 0.3, 0.3, -carSize.length/2 + 0.3]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      <mesh position={[carSize.width/2 - 0.3, 0.3, -carSize.length/2 + 0.3]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      
      {/* الأضواء الأمامية */}
      <mesh position={[carSize.width/2, carSize.height/2, 0.3]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial 
          color="#FFF9C4" 
          emissive="#FFE082"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[carSize.width/2, carSize.height/2, -0.3]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial 
          color="#FFF9C4" 
          emissive="#FFE082"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

// مكون الشجرة ثلاثية الأبعاد
interface TreeProps {
  position: [number, number, number]
  size: number
}

const Tree3D: React.FC<TreeProps> = ({ position, size }) => {
  return (
    <group position={position}>
      {/* جذع الشجرة */}
      <mesh position={[0, 2 * size, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2 * size, 0.3 * size, 4 * size]} />
        <meshStandardMaterial 
          color="#8B4513"
          roughness={0.8}
          normalScale={[1, 1]}
        />
      </mesh>
      
      {/* أوراق الشجرة - طبقات متعددة */}
      <mesh position={[0, 3.5 * size, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.5 * size]} />
        <meshStandardMaterial 
          color="#228B22"
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 4.2 * size, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.2 * size]} />
        <meshStandardMaterial 
          color="#32CD32"
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 4.8 * size, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.8 * size]} />
        <meshStandardMaterial 
          color="#90EE90"
          roughness={0.6}
        />
      </mesh>
    </group>
  )
}

// مكون عمود الإنارة
interface StreetLightProps {
  position: [number, number, number]
}

const StreetLight3D: React.FC<StreetLightProps> = ({ position }) => {
  return (
    <group position={position}>
      {/* عمود الإنارة */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.15, 6]} />
        <meshStandardMaterial 
          color="#4A5568"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* المصباح */}
      <mesh position={[0, 5.8, 0]} castShadow>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial 
          color="#2D3748"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* الضوء */}
      <mesh position={[0, 5.8, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial 
          color="#FFF9C4"
          emissive="#FFE082"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* إضاءة النقطة */}
      <pointLight
        position={[0, 5.5, 0]}
        intensity={2}
        color="#FFE082"
        distance={15}
        castShadow
      />
    </group>
  )
}

// مكون الأرض والشوارع
const GroundAndStreets: React.FC = () => {
  return (
    <group>
      {/* الأرض الرئيسية */}
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Plane>
      
      {/* الشوارع */}
      <Plane args={[100, 8]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <meshStandardMaterial color="#2D3748" />
      </Plane>
      
      <Plane args={[8, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <meshStandardMaterial color="#2D3748" />
      </Plane>
      
      {/* الأرصفة */}
      {[-4, 4].map(z => (
        <Plane key={z} args={[100, 2]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, z]}>
          <meshStandardMaterial color="#E2E8F0" />
        </Plane>
      ))}
      
      {/* أعمدة الإنارة الواقعية */}
      {[-20, -10, 0, 10, 20].map(x => (
        <StreetLight3D key={x} position={[x, 0, 6]} />
      ))}
      
      {/* السيارات المتوقفة */}
      <Car3D position={[-15, 0, 8]} rotation={[0, 0, 0]} color="#2C3E50" type="sedan" />
      <Car3D position={[-5, 0, 8]} rotation={[0, Math.PI, 0]} color="#E53E3E" type="suv" />
      <Car3D position={[5, 0, 8]} rotation={[0, 0, 0]} color="#3182CE" type="hatchback" />
      <Car3D position={[15, 0, 8]} rotation={[0, Math.PI, 0]} color="#38A169" type="sedan" />
      
      {/* الأشجار والمناظر الطبيعية */}
      <Tree3D position={[-25, 0, 0]} size={1.2} />
      <Tree3D position={[-22, 0, -3]} size={1.0} />
      <Tree3D position={[25, 0, 0]} size={1.3} />
      <Tree3D position={[22, 0, -2]} size={0.9} />
      <Tree3D position={[-18, 0, 3]} size={1.1} />
      <Tree3D position={[18, 0, 3]} size={1.0} />
      
      {/* الظلال */}
      <ContactShadows 
        opacity={0.5} 
        scale={50} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />
    </group>
  )
}

// مكون VR/AR - سيتم تطبيقه لاحقاً
const VRScene: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

// المكون الرئيسي
const ThreeDVisualization: React.FC<ThreeDVisualizationProps> = ({
  buildingData,
  currentStep,
  onBlockUpdate,
  onUnitClick,
  selectedUnits = new Set(),
  enableVR = false,
  enableAR = false,
  showStats = false
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'noon' | 'evening' | 'night'>('noon')
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([20, 15, 20])
  
  const handleBlockSelect = (blockId: string) => {
    setSelectedBlock(selectedBlock === blockId ? null : blockId)
    if (onBlockUpdate) {
      onBlockUpdate(blockId, { selected: true, timestamp: Date.now() })
    }
  }
  
  const renderContent = () => {
    if (currentStep === 1 && !buildingData.name) {
      return (
        <group>
          <GroundAndStreets />
          <Text
            position={[0, 5, 0]}
            fontSize={3}
            color="#374151"
            anchorX="center"
            anchorY="middle"
          >
            أرض فارغة - جاهزة للبناء
          </Text>
        </group>
      )
    }
    
    if (currentStep === 2 || (buildingData.name && buildingData.blocks.length === 0)) {
      return (
        <group>
          <GroundAndStreets />
          {/* الأساسات */}
          <Box args={[30, 2, 15]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#696969" roughness={0.8} />
          </Box>
          <Text
            position={[0, 8, 0]}
            fontSize={2.5}
            color="#1F2937"
            anchorX="center"
            anchorY="middle"
          >
            {buildingData.name}
          </Text>
          <Text
            position={[0, 5, 0]}
            fontSize={1.5}
            color="#6B7280"
            anchorX="center"
            anchorY="middle"
          >
            الأساسات جاهزة
          </Text>
        </group>
      )
    }
    
    return (
      <group>
        <GroundAndStreets />
        
        {/* عنوان المشروع */}
        <Text
          position={[0, 25, 0]}
          fontSize={2}
          color="#1F2937"
          anchorX="center"
          anchorY="middle"
        >
          {buildingData.name}
        </Text>
        
        {/* البلوكات */}
        {buildingData.blocks.map((block: Block, index: number) => (
          <BuildingBlock
            key={block.id}
            block={block}
            position={[index * 12 - (buildingData.blocks.length - 1) * 6, 8, 0]}
            onSelect={handleBlockSelect}
            selected={selectedBlock === block.id}
            blockIndex={index}
            onUnitClick={onUnitClick}
            selectedUnits={selectedUnits}
          />
        ))}
      </group>
    )
  }
  
  const sceneContent = (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={75} />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={100}
      />
      
      <EnvironmentScene timeOfDay={timeOfDay} />
      
      <Suspense fallback={
        <Html center>
          <div className="text-white text-xl">جار التحميل...</div>
        </Html>
      }>
        {renderContent()}
      </Suspense>
      
      {/* البيئة المحيطة */}
      <Environment preset="city" />
      
      {/* الشبكة */}
      <Grid 
        args={[100, 100]} 
        position={[0, -1, 0]}
        cellSize={5}
        cellThickness={0.5}
        cellColor="#ffffff"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#cccccc"
        fadeDistance={50}
        fadeStrength={5}
      />
      
      {/* الإحصائيات */}
      {showStats && <Stats />}
    </>
  )
  
  return (
    <div className="w-full h-full relative">
      {/* أزرار VR/AR - قريباً */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {enableVR && (
          <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm">
            VR (قريباً)
          </button>
        )}
        {enableAR && (
          <button className="px-3 py-1 bg-orange-500 text-white rounded text-sm">
            AR (قريباً)
          </button>
        )}
      </div>
      
      {/* معلومات الشقق المختارة */}
      {selectedUnits.size > 0 && (
        <div className="absolute top-4 left-4 bg-blue-600 bg-opacity-90 text-white p-3 rounded-lg z-10">
          <div className="font-bold">الشقق المختارة (3D)</div>
          <div className="text-sm mt-1">{selectedUnits.size} شقة مختارة</div>
          <div className="text-xs mt-1 opacity-90">معروضة باللون الذهبي</div>
        </div>
      )}
      
      {/* أدوات التحكم */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <select 
          value={timeOfDay} 
          onChange={(e) => setTimeOfDay(e.target.value as 'morning' | 'noon' | 'evening' | 'night')}
          className="px-2 py-1 bg-white rounded text-sm"
        >
          <option value="morning">صباح</option>
          <option value="noon">ظهر</option>
          <option value="evening">مساء</option>
          <option value="night">ليل</option>
        </select>
        
        <button
          onClick={() => setCameraPosition([20, 15, 20])}
          className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
        >
          منظور عام
        </button>
        
        <button
          onClick={() => setCameraPosition([0, 30, 0])}
          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
        >
          منظور علوي
        </button>
      </div>
      
      {/* معلومات البلوك المحدد */}
      {selectedBlock && (
        <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded shadow">
          <h4 className="font-bold">
            {buildingData.blocks.find((b: Block) => b.id === selectedBlock)?.name}
          </h4>
          <p className="text-sm text-gray-600">
            البلوك محدد - انقر مرة أخرى لإلغاء التحديد
          </p>
        </div>
      )}
      
      {/* Canvas ثلاثي الأبعاد */}
      <Canvas 
        shadows 
        camera={{ 
          position: cameraPosition, 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ height: '600px' }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {enableVR ? (
          <VRScene>{sceneContent}</VRScene>
        ) : (
          sceneContent
        )}
      </Canvas>
    </div>
  )
}

export default ThreeDVisualization