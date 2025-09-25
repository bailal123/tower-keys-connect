import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

// Types for building data
export interface Block {
  id: string
  name: string
  floors: Floor[]
}

export interface Floor {
  id: string
  number: string
  units: Unit[]
}

export interface Unit {
  id: string
  number: string
}

export interface BuildingData {
  name: string
  blocks: Block[]
}

// Simple multi-select component
interface MultiSelectProps {
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
  allowCustom?: boolean
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder,
  allowCustom = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [newValue, setNewValue] = useState('')

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const addCustomValue = () => {
    if (newValue.trim() && !selectedValues.includes(newValue.trim()) && !options.includes(newValue.trim())) {
      onChange([...selectedValues, newValue.trim()])
      setNewValue('')
    }
  }

  return (
    <div className="relative">
      <div
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex flex-wrap items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.map((value) => (
          <span
            key={value}
            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            {value}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange(selectedValues.filter(v => v !== value))
              }}
              className="mr-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
        {selectedValues.length === 0 && (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {allowCustom && (
            <div className="p-2 border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="إضافة قيمة جديدة..."
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={addCustomValue}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  إضافة
                </button>
              </div>
            </div>
          )}
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                selectedValues.includes(option) ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {selectedValues.includes(option) && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Initial options
const initialFloorOptions = ['B2', 'B1', 'G', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
const initialUnitOptions = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))
const initialBlockOptions = ['A', 'B', 'C']

const BuildingBuilderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showFullScreenVisualization, setShowFullScreenVisualization] = useState(false)
  const [buildingData, setBuildingData] = useState<BuildingData>({
    name: '',
    blocks: []
  })

  // Step 1: Building Name
  const [buildingName, setBuildingName] = useState('')

  // Step 2: Blocks
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])

  // Step 3: Floors
  const [selectedFloors, setSelectedFloors] = useState<string[]>([])
  const [selectedBlocksForFloors, setSelectedBlocksForFloors] = useState<string[]>([])

  // Step 4: Units
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedFloorsForUnits, setSelectedFloorsForUnits] = useState<string[]>([])
  const [selectedBlocksForUnits, setSelectedBlocksForUnits] = useState<string[]>([])

  // Handle Step 1: Save building name
  const handleSaveBuildingName = () => {
    if (buildingName.trim()) {
      setBuildingData(prev => ({ ...prev, name: buildingName.trim() }))
      setCurrentStep(2)
    }
  }

  // Handle Step 2: Save blocks
  const handleSaveBlocks = () => {
    if (selectedBlocks.length > 0) {
      const newBlocks: Block[] = selectedBlocks.map(blockName => ({
        id: `block-${blockName}`,
        name: blockName,
        floors: []
      }))
      setBuildingData(prev => ({ ...prev, blocks: newBlocks }))
      setCurrentStep(3)
    }
  }

  // Handle Step 3: Add floors to blocks
  const handleAddFloors = () => {
    if (selectedFloors.length > 0 && selectedBlocksForFloors.length > 0) {
      setBuildingData(prev => ({
        ...prev,
        blocks: prev.blocks.map(block => {
          if (selectedBlocksForFloors.includes(block.name)) {
            const newFloors: Floor[] = selectedFloors.map(floorNum => ({
              id: `floor-${block.name}-${floorNum}`,
              number: floorNum,
              units: []
            }))
            // Merge with existing floors, avoiding duplicates
            const existingFloorNumbers = block.floors.map(f => f.number)
            const uniqueNewFloors = newFloors.filter(f => !existingFloorNumbers.includes(f.number))
            return { ...block, floors: [...block.floors, ...uniqueNewFloors] }
          }
          return block
        })
      }))
      setSelectedFloors([])
      setSelectedBlocksForFloors([])
    }
  }

  // Handle Step 4: Add units to floors
  const handleAddUnits = () => {
    if (selectedUnits.length > 0 && selectedFloorsForUnits.length > 0 && selectedBlocksForUnits.length > 0) {
      setBuildingData(prev => ({
        ...prev,
        blocks: prev.blocks.map(block => {
          if (selectedBlocksForUnits.includes(block.name)) {
            return {
              ...block,
              floors: block.floors.map(floor => {
                if (selectedFloorsForUnits.includes(floor.number)) {
                  const newUnits: Unit[] = selectedUnits.map(unitNum => ({
                    id: `unit-${block.name}-${floor.number}-${unitNum}`,
                    number: unitNum
                  }))
                  // Merge with existing units, avoiding duplicates
                  const existingUnitNumbers = floor.units.map(u => u.number)
                  const uniqueNewUnits = newUnits.filter(u => !existingUnitNumbers.includes(u.number))
                  return { ...floor, units: [...floor.units, ...uniqueNewUnits] }
                }
                return floor
              })
            }
          }
          return block
        })
      }))
      setSelectedUnits([])
      setSelectedFloorsForUnits([])
      setSelectedBlocksForUnits([])
    }
  }

  // Advanced Building Visualization Component
  const SimpleBuildingVisualization = () => {
    const renderEmptyLand = () => (
      <svg width="100%" height="300" viewBox="0 0 500 300" className="border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-b from-blue-100 to-green-100">
        {/* Sky background */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:"#87CEEB", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#98FB98", stopOpacity:1}} />
          </linearGradient>
        </defs>
        <rect width="500" height="250" fill="url(#skyGradient)" />
        
        {/* Ground */}
        <rect x="0" y="250" width="500" height="50" fill="#8FBC8F" />
        
        {/* Sun */}
        <circle cx="420" cy="60" r="25" fill="#FFD700" opacity="0.8" />
        
        {/* Clouds */}
        <ellipse cx="120" cy="80" rx="30" ry="15" fill="white" opacity="0.8" />
        <ellipse cx="140" cy="75" rx="25" ry="12" fill="white" opacity="0.8" />
        <ellipse cx="350" cy="100" rx="35" ry="18" fill="white" opacity="0.7" />
        
        {/* Trees */}
        <rect x="50" y="235" width="8" height="15" fill="#8B4513" />
        <circle cx="54" cy="230" r="12" fill="#228B22" />
        
        <rect x="430" y="240" width="6" height="10" fill="#8B4513" />
        <circle cx="433" cy="235" r="10" fill="#228B22" />
        
        {/* Construction area outline */}
        <rect x="150" y="200" width="200" height="50" fill="none" stroke="#8B4513" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />
        
        {/* Text */}
        <text x="250" y="160" textAnchor="middle" className="fill-gray-700 text-lg font-bold" fontSize="18">
          أرض فارغة
        </text>
        <text x="250" y="180" textAnchor="middle" className="fill-gray-600 text-sm" fontSize="14">
          جاهزة لبناء {buildingData.name || "البرج"}
        </text>
      </svg>
    )

    const renderFoundation = () => (
      <svg width="100%" height="300" viewBox="0 0 500 300" className="border-2 border-gray-300 rounded-lg bg-gradient-to-b from-blue-100 to-green-100">
        {/* Sky */}
        <rect width="500" height="250" fill="url(#skyGradient)" />
        
        {/* Ground */}
        <rect x="0" y="250" width="500" height="50" fill="#8FBC8F" />
        
        {/* Foundation base */}
        <rect x="125" y="235" width="250" height="25" fill="#696969" stroke="#555" strokeWidth="2" />
        <rect x="130" y="225" width="240" height="10" fill="#808080" />
        
        {/* Foundation pillars */}
        <rect x="140" y="200" width="15" height="25" fill="#555" />
        <rect x="200" y="200" width="15" height="25" fill="#555" />
        <rect x="285" y="200" width="15" height="25" fill="#555" />
        <rect x="345" y="200" width="15" height="25" fill="#555" />
        
        {/* Construction crane */}
        <line x1="400" y1="150" x2="400" y2="240" stroke="#FF6B35" strokeWidth="4" />
        <line x1="380" y1="160" x2="420" y2="160" stroke="#FF6B35" strokeWidth="3" />
        <line x1="400" y1="160" x2="450" y2="180" stroke="#FF6B35" strokeWidth="2" />
        
        {/* Construction materials */}
        <rect x="80" y="235" width="20" height="15" fill="#D2691E" />
        <rect x="85" y="230" width="10" height="5" fill="#CD853F" />
        
        <text x="250" y="120" textAnchor="middle" className="fill-gray-800 text-xl font-bold" fontSize="20">
          {buildingData.name}
        </text>
        <text x="250" y="140" textAnchor="middle" className="fill-gray-600 text-sm" fontSize="14">
          الأساسات جاهزة للبناء
        </text>
      </svg>
    )

    const renderCompleteBuilding = () => {
      // Check if units are defined to determine building state
      const hasUnits = buildingData.blocks.some(block => 
        block.floors.some(floor => floor.units.length > 0)
      )
      
      // Building schemes - different for construction vs finished state
      const constructionSchemes = [
        { main: '#8B7355', accent: '#6B5B47', trim: '#A0937D', shadow: '#5D4E37' }, // Brown brick
        { main: '#87CEEB', accent: '#4682B4', trim: '#B0C4DE', shadow: '#36648B' }, // Steel blue  
        { main: '#696969', accent: '#2F4F4F', trim: '#A9A9A9', shadow: '#1C1C1C' }, // Gray concrete
        { main: '#8FBC8F', accent: '#556B2F', trim: '#9ACD32', shadow: '#228B22' }  // Green construction
      ]
      
      const finishedSchemes = [
        { main: '#F0F8FF', accent: '#1E90FF', trim: '#E6F3FF', shadow: '#0066CC', glass: '#B3D9FF' }, // Crystal blue
        { main: '#FFF0F5', accent: '#FF69B4', trim: '#FFE4E1', shadow: '#C71585', glass: '#FFB6C1' }, // Rose crystal  
        { main: '#F0FFF0', accent: '#32CD32', trim: '#E0FFE0', shadow: '#228B22', glass: '#98FB98' }, // Mint crystal
        { main: '#FFFAF0', accent: '#FF8C00', trim: '#FFEEDD', shadow: '#FF6347', glass: '#FFDAB9' }  // Golden crystal
      ]
      
      const buildingSchemes = hasUnits ? finishedSchemes : constructionSchemes
      
      // Calculate dimensions dynamically based on data
      const maxFloors = Math.max(...buildingData.blocks.map(block => block.floors.length), 1)
      
      // Dynamic sizing
      const minBlockWidth = 100
      const maxBlockWidth = 200
      const availableWidth = 800 // Increased base width
      const blockWidth = Math.min(maxBlockWidth, Math.max(minBlockWidth, availableWidth / buildingData.blocks.length))
      
      const floorHeight = Math.max(25, Math.min(40, 600 / maxFloors)) // Dynamic floor height
      const totalWidth = blockWidth * buildingData.blocks.length
      const totalHeight = maxFloors * floorHeight + 150 // Dynamic total height
      
      const svgWidth = Math.max(600, totalWidth + 100)
      const svgHeight = Math.max(500, totalHeight + 100)
      
      const startX = (svgWidth - totalWidth) / 2
      const groundY = svgHeight - 80
      
      return (
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="border-2 border-gray-300 rounded-lg bg-gradient-to-b from-blue-50 to-green-50"
          style={{minHeight: '400px', maxHeight: showFullScreenVisualization ? 'none' : '80vh'}}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Modern Gradient Definitions */}
          <defs>
            <linearGradient id="modernSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:"#E0F2FE", stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:"#BAE6FD", stopOpacity:0.8}} />
              <stop offset="100%" style={{stopColor:"#7DD3FC", stopOpacity:0.6}} />
            </linearGradient>
            
            <radialGradient id="buildingShadow" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.4"/>
              <stop offset="70%" stopColor="#000000" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0.05"/>
            </radialGradient>
            
            {/* Construction Phase - Brick Texture */}
            <pattern id="brickPattern" patternUnits="userSpaceOnUse" width="20" height="10">
              <rect width="20" height="10" fill="#8B7355"/>
              <rect x="0" y="0" width="10" height="5" fill="#A0937D" stroke="#6B5B47" strokeWidth="0.5"/>
              <rect x="10" y="0" width="10" height="5" fill="#967A65" stroke="#6B5B47" strokeWidth="0.5"/>
              <rect x="5" y="5" width="10" height="5" fill="#A0937D" stroke="#6B5B47" strokeWidth="0.5"/>
              <rect x="15" y="5" width="5" height="5" fill="#967A65" stroke="#6B5B47" strokeWidth="0.5"/>
              <rect x="0" y="5" width="5" height="5" fill="#8B7355" stroke="#6B5B47" strokeWidth="0.5"/>
            </pattern>
            
            <pattern id="concretePattern" patternUnits="userSpaceOnUse" width="15" height="15">
              <rect width="15" height="15" fill="#696969"/>
              <circle cx="3" cy="3" r="0.5" fill="#808080" opacity="0.7"/>
              <circle cx="8" cy="7" r="0.3" fill="#A9A9A9" opacity="0.6"/>
              <circle cx="12" cy="2" r="0.4" fill="#778899" opacity="0.5"/>
              <circle cx="6" cy="12" r="0.2" fill="#DCDCDC" opacity="0.8"/>
              <circle cx="13" cy="10" r="0.3" fill="#C0C0C0" opacity="0.6"/>
            </pattern>
            
            {/* Finished Phase - Glass Effects */}
            <linearGradient id="crystalGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0F8FF" stopOpacity="0.9"/>
              <stop offset="30%" stopColor="#E6F3FF" stopOpacity="0.7"/>
              <stop offset="70%" stopColor="#CCE7FF" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#B3D9FF" stopOpacity="0.8"/>
            </linearGradient>
            
            <linearGradient id="litWindow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9C4"/>
              <stop offset="50%" stopColor="#FFE082"/>
              <stop offset="100%" stopColor="#FFB300"/>
            </linearGradient>
            
            <linearGradient id="normalWindow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={hasUnits ? "#F0F9FF" : "#D3D3D3"}/>
              <stop offset="50%" stopColor={hasUnits ? "#E0F2FE" : "#C0C0C0"}/>
              <stop offset="100%" stopColor={hasUnits ? "#BAE6FD" : "#A9A9A9"}/>
            </linearGradient>
            
            <linearGradient id="windowGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD600"/>
              <stop offset="100%" stopColor="#FF8F00"/>
            </linearGradient>

            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="3" dy="6" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
            
            <filter id="glassEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="2" dy="2" result="offset"/>
              <feFlood floodColor="#87CEEB" floodOpacity="0.3"/>
              <feComposite in2="offset" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Modern Sky Background */}
          <rect width={svgWidth} height={groundY} fill="url(#modernSky)" />
          
          {/* Modern Ground with texture */}
          <rect x="0" y={groundY} width={svgWidth} height={svgHeight - groundY} fill="#10B981" opacity="0.8" />
          <rect x="0" y={groundY} width={svgWidth} height="10" fill="#059669" opacity="0.9" />
          
          {/* Modern Sun with glow effect */}
          <circle cx={svgWidth - 80} cy="60" r="30" fill="#FFD700" opacity="0.2" />
          <circle cx={svgWidth - 80} cy="60" r="22" fill="#FFF700" opacity="0.6" />
          <circle cx={svgWidth - 80} cy="60" r="18" fill="#FFEB3B" />
          
          {/* Clouds for realistic sky */}
          <ellipse cx={svgWidth * 0.2} cy="80" rx="25" ry="12" fill="#FFFFFF" opacity="0.7" />
          <ellipse cx={svgWidth * 0.22} cy="75" rx="20" ry="10" fill="#FFFFFF" opacity="0.7" />
          <ellipse cx={svgWidth * 0.65} cy="70" rx="30" ry="15" fill="#FFFFFF" opacity="0.6" />
          <ellipse cx={svgWidth * 0.67} cy="65" rx="25" ry="12" fill="#FFFFFF" opacity="0.6" />
          
          {/* Modern Buildings with realistic architecture */}
          {buildingData.blocks.map((block, blockIndex) => {
            const blockFloors = Math.max(block.floors.length, 1)
            const buildingHeight = blockFloors * floorHeight + 40 // Dynamic height
            const x = startX + blockIndex * blockWidth + 10
            const y = groundY - buildingHeight
            const scheme = buildingSchemes[blockIndex % buildingSchemes.length]
            
            return (
              <g key={block.id}>
                {/* Modern Building Shadow */}
                <rect
                  x={x + 8}
                  y={y + 8}
                  width={blockWidth - 20}
                  height={buildingHeight}
                  fill="url(#buildingShadow)"
                  rx="6"
                  filter="url(#dropShadow)"
                />
                
                {/* Modern Building Base/Podium */}
                <rect
                  x={x}
                  y={groundY - 25}
                  width={blockWidth - 20}
                  height="25"
                  fill={scheme.accent}
                  opacity="0.8"
                  rx="4"
                />
                
                {/* Main Building Structure - Changes based on construction phase */}
                <rect
                  x={x}
                  y={y}
                  width={blockWidth - 20}
                  height={buildingHeight - 25}
                  fill={hasUnits ? scheme.main : (blockIndex % 2 === 0 ? "url(#brickPattern)" : "url(#concretePattern)")}
                  stroke={scheme.trim}
                  strokeWidth={hasUnits ? "2" : "3"}
                  rx={hasUnits ? "8" : "2"}
                  filter={hasUnits ? "url(#glassEffect)" : "none"}
                  opacity={hasUnits ? "0.9" : "1"}
                />

                {/* Vertical Elements - Different for construction vs finished */}
                {hasUnits ? (
                  // Glass/Crystal columns for finished building
                  <>
                    <rect
                      x={x + 8}
                      y={y}
                      width={Math.max(6, blockWidth * 0.06)}
                      height={buildingHeight - 25}
                      fill="url(#crystalGlass)"
                      stroke={scheme.accent}
                      strokeWidth="1"
                      opacity="0.8"
                      rx="4"
                      filter="url(#glassEffect)"
                    />
                    <rect
                      x={x + blockWidth - 20 - Math.max(6, blockWidth * 0.06)}
                      y={y}
                      width={Math.max(6, blockWidth * 0.06)}
                      height={buildingHeight - 25}
                      fill="url(#crystalGlass)"
                      stroke={scheme.accent}
                      strokeWidth="1"
                      opacity="0.8"
                      rx="4"
                      filter="url(#glassEffect)"
                    />
                  </>
                ) : (
                  // Steel/concrete supports for construction phase
                  <>
                    <rect
                      x={x + 8}
                      y={y}
                      width={Math.max(6, blockWidth * 0.06)}
                      height={buildingHeight - 25}
                      fill="#4A4A4A"
                      stroke="#2F2F2F"
                      strokeWidth="1"
                      opacity="0.9"
                      rx="1"
                    />
                    <rect
                      x={x + blockWidth - 20 - Math.max(6, blockWidth * 0.06)}
                      y={y}
                      width={Math.max(6, blockWidth * 0.06)}
                      height={buildingHeight - 25}
                      fill="#4A4A4A"
                      stroke="#2F2F2F"
                      strokeWidth="1"
                      opacity="0.9"
                      rx="1"
                    />
                  </>
                )}

                {/* Entrance - Different styles for construction vs finished */}
                {hasUnits ? (
                  // Modern Glass Entrance for finished building
                  <>
                    <rect
                      x={x + blockWidth * 0.15}
                      y={groundY - 35}
                      width={blockWidth * 0.7}
                      height={35}
                      fill="url(#crystalGlass)"
                      stroke={scheme.accent}
                      strokeWidth="2"
                      opacity="0.95"
                      rx="6"
                      filter="url(#glassEffect)"
                    />
                    
                    {/* Crystal Glass Panels */}
                    {Array.from({length: Math.min(4, Math.floor(blockWidth / 25))}).map((_, i) => (
                      <rect
                        key={`entrance-${i}`}
                        x={x + blockWidth * 0.2 + i * (blockWidth * 0.6 / Math.min(4, Math.floor(blockWidth / 25)))}
                        y={groundY - 32}
                        width={(blockWidth * 0.6) / Math.min(4, Math.floor(blockWidth / 25)) - 2}
                        height={29}
                        fill="url(#crystalGlass)"
                        stroke={scheme.accent}
                        strokeWidth="1"
                        opacity="0.9"
                        filter="url(#glassEffect)"
                      />
                    ))}
                  </>
                ) : (
                  // Construction entrance with temporary materials
                  <>
                    <rect
                      x={x + blockWidth * 0.25}
                      y={groundY - 25}
                      width={blockWidth * 0.5}
                      height={25}
                      fill="#8B7355"
                      stroke="#6B5B47"
                      strokeWidth="2"
                      opacity="0.9"
                      rx="2"
                    />
                    
                    {/* Construction barriers */}
                    {Array.from({length: 3}).map((_, i) => (
                      <rect
                        key={`barrier-${i}`}
                        x={x + blockWidth * 0.3 + i * (blockWidth * 0.1)}
                        y={groundY - 22}
                        width={blockWidth * 0.08}
                        height={19}
                        fill="#FF6B35"
                        stroke="#E55A2B"
                        strokeWidth="1"
                        opacity="0.8"
                      />
                    ))}
                  </>
                )}

                {/* Roof - Different for construction vs finished */}
                {hasUnits ? (
                  // Modern finished roof
                  <>
                    <rect
                      x={x - 3}
                      y={y - 12}
                      width={blockWidth - 14}
                      height={12}
                      fill="url(#crystalGlass)"
                      stroke={scheme.accent}
                      strokeWidth="1"
                      opacity="0.95"
                      rx="4"
                      filter="url(#glassEffect)"
                    />
                    
                    {/* Modern rooftop equipment */}
                    <rect x={x + 15} y={y - 8} width={12} height={6} fill={scheme.accent} rx="2" opacity="0.8" />
                    <rect x={x + 35} y={y - 8} width={8} height={6} fill={scheme.accent} rx="2" opacity="0.8" />
                    <rect x={x + 50} y={y - 8} width={15} height={6} fill={scheme.accent} rx="2" opacity="0.8" />
                  </>
                ) : (
                  // Construction roof
                  <>
                    <rect
                      x={x - 3}
                      y={y - 8}
                      width={blockWidth - 14}
                      height={8}
                      fill="#8B7355"
                      stroke="#6B5B47"
                      strokeWidth="2"
                      opacity="0.9"
                      rx="1"
                    />
                    
                    {/* Construction equipment */}
                    <rect x={x + 15} y={y - 6} width={10} height={4} fill="#4A4A4A" rx="1" />
                    <rect x={x + 35} y={y - 6} width={6} height={4} fill="#4A4A4A" rx="1" />
                    
                    {/* Construction crane arm (small) */}
                    <line
                      x1={x + blockWidth/2}
                      y1={y - 6}
                      x2={x + blockWidth/2 + 20}
                      y2={y - 15}
                      stroke="#FFD700"
                      strokeWidth="2"
                    />
                  </>
                )}
                
                {/* Modern Floors with Realistic Windows */}
                {block.floors.map((floor, floorIndex) => {
                  const floorY = y + (blockFloors - floorIndex - 1) * floorHeight + 15
                  const unitsPerFloor = Math.max(floor.units.length, 1)
                  const availableWidth = blockWidth - 40
                  const unitWidth = Math.max(15, availableWidth / unitsPerFloor) // Minimum window width
                  const actualUnitsToShow = Math.min(unitsPerFloor, Math.floor(availableWidth / 15)) // Max units that fit
                  
                  return (
                    <g key={floor.id}>
                      {/* Modern Floor Separator */}
                      <rect
                        x={x + 2}
                        y={floorY + floorHeight - 3}
                        width={blockWidth - 24}
                        height={3}
                        fill={scheme.trim}
                        opacity="0.8"
                      />
                      
                      {/* Modern Floor Number Circle */}
                      <circle
                        cx={x - 15}
                        cy={floorY + floorHeight/2}
                        r="10"
                        fill={scheme.accent}
                        opacity="0.9"
                      />
                      <text
                        x={x - 15}
                        y={floorY + floorHeight/2 + 3}
                        className="fill-white text-xs font-bold"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        {floor.number}
                      </text>
                      
                      {/* Windows - Construction holes vs Modern Glass */}
                      {floor.units.slice(0, actualUnitsToShow).map((unit, unitIndex) => {
                        const windowX = x + 20 + unitIndex * unitWidth + 3
                        const windowY = floorY + 5
                        const windowWidth = Math.max(unitWidth - 6, 15)
                        const windowHeight = floorHeight - 10
                        const isLit = hasUnits && Math.random() > 0.4 // Only lit if units are defined
                        const hasBalcony = hasUnits && Math.random() > 0.6 // Only balconies for finished buildings
                        
                        return (
                          <g key={unit.id}>
                            {hasUnits ? (
                              // Finished building - Modern glass windows
                              <g>
                                {/* Crystal Balcony (for some units) */}
                                {hasBalcony && (
                                  <g>
                                    <rect
                                      x={windowX - 4}
                                      y={windowY + windowHeight - 8}
                                      width={windowWidth + 8}
                                      height={10}
                                      fill="url(#crystalGlass)"
                                      stroke={scheme.accent}
                                      strokeWidth="1"
                                      opacity="0.8"
                                      rx="3"
                                      filter="url(#glassEffect)"
                                    />
                                    {/* Crystal railing */}
                                    <line
                                      x1={windowX - 3}
                                      y1={windowY + windowHeight - 5}
                                      x2={windowX + windowWidth + 3}
                                      y2={windowY + windowHeight - 5}
                                      stroke={scheme.accent}
                                      strokeWidth="2"
                                      opacity="0.9"
                                    />
                                  </g>
                                )}

                                {/* Modern Crystal Frame */}
                                <rect
                                  x={windowX - 3}
                                  y={windowY - 3}
                                  width={windowWidth + 6}
                                  height={windowHeight + 6}
                                  fill={scheme.accent}
                                  opacity="0.7"
                                  rx="4"
                                />
                                
                                {/* Crystal Glass with Lighting */}
                                <rect
                                  x={windowX}
                                  y={windowY}
                                  width={windowWidth}
                                  height={windowHeight}
                                  fill={isLit ? "url(#litWindow)" : "url(#crystalGlass)"}
                                  stroke={scheme.accent}
                                  strokeWidth="1"
                                  rx="3"
                                  filter="url(#glassEffect)"
                                  opacity="0.9"
                                />
                                
                                {/* Modern Window Dividers */}
                                <line
                                  x1={windowX}
                                  y1={windowY + windowHeight/3}
                                  x2={windowX + windowWidth}
                                  y2={windowY + windowHeight/3}
                                  stroke={scheme.accent}
                                  strokeWidth="0.8"
                                  opacity="0.7"
                                />
                                <line
                                  x1={windowX + windowWidth/2}
                                  y1={windowY}
                                  x2={windowX + windowWidth/2}
                                  y2={windowY + windowHeight}
                                  stroke={scheme.accent}
                                  strokeWidth="0.8"
                                  opacity="0.7"
                                />
                                
                                {/* Crystal Glow Effect */}
                                {isLit && (
                                  <rect
                                    x={windowX - 4}
                                    y={windowY - 4}
                                    width={windowWidth + 8}
                                    height={windowHeight + 8}
                                    fill="none"
                                    stroke="url(#windowGlow)"
                                    strokeWidth="2"
                                    opacity="0.8"
                                    rx="4"
                                  />
                                )}
                                
                                {/* Unit Number Badge */}
                                {floor.number === 'G' && (
                                  <g>
                                    <rect
                                      x={windowX + windowWidth/2 - 10}
                                      y={floorY + floorHeight + 8}
                                      width={20}
                                      height={14}
                                      fill="url(#crystalGlass)"
                                      stroke={scheme.accent}
                                      strokeWidth="1"
                                      rx="4"
                                      opacity="0.9"
                                      filter="url(#glassEffect)"
                                    />
                                    <text
                                      x={windowX + windowWidth/2}
                                      y={floorY + floorHeight + 18}
                                      className="fill-gray-800 text-xs font-bold"
                                      fontSize="9"
                                      textAnchor="middle"
                                    >
                                      {unit.number}
                                    </text>
                                  </g>
                                )}
                                
                                {/* Crystal Reflection */}
                                <rect
                                  x={windowX + 2}
                                  y={windowY + 2}
                                  width={Math.max(windowWidth/3, 6)}
                                  height={Math.max(windowHeight/3, 6)}
                                  fill="#FFFFFF"
                                  opacity="0.6"
                                  rx="2"
                                />
                              </g>
                            ) : (
                              // Construction phase - Raw openings
                              <g>
                                {/* Construction opening */}
                                <rect
                                  x={windowX - 2}
                                  y={windowY - 2}
                                  width={windowWidth + 4}
                                  height={windowHeight + 4}
                                  fill="#2F2F2F"
                                  stroke="#1A1A1A"
                                  strokeWidth="2"
                                  rx="1"
                                />
                                
                                {/* Raw opening */}
                                <rect
                                  x={windowX}
                                  y={windowY}
                                  width={windowWidth}
                                  height={windowHeight}
                                  fill="#1A1A1A"
                                  stroke="#0F0F0F"
                                  strokeWidth="1"
                                  opacity="0.9"
                                />
                                
                                {/* Construction supports */}
                                <line
                                  x1={windowX}
                                  y1={windowY + windowHeight/2}
                                  x2={windowX + windowWidth}
                                  y2={windowY + windowHeight/2}
                                  stroke="#4A4A4A"
                                  strokeWidth="2"
                                />
                                <line
                                  x1={windowX + windowWidth/2}
                                  y1={windowY}
                                  x2={windowX + windowWidth/2}
                                  y2={windowY + windowHeight}
                                  stroke="#4A4A4A"
                                  strokeWidth="2"
                                />
                                
                                {/* Construction marker (for ground floor) */}
                                {floor.number === 'G' && (
                                  <g>
                                    <rect
                                      x={windowX + windowWidth/2 - 8}
                                      y={floorY + floorHeight + 8}
                                      width={16}
                                      height={12}
                                      fill="#FF6B35"
                                      stroke="#E55A2B"
                                      strokeWidth="1"
                                      rx="2"
                                      opacity="0.9"
                                    />
                                    <text
                                      x={windowX + windowWidth/2}
                                      y={floorY + floorHeight + 17}
                                      className="fill-white text-xs font-bold"
                                      fontSize="8"
                                      textAnchor="middle"
                                    >
                                      {unit.number}
                                    </text>
                                  </g>
                                )}
                              </g>
                            )}
                          </g>
                        )
                      })}
                      
                    </g>
                  )
                })}

                {/* Building Name Badge - Different styles */}
                {hasUnits ? (
                  // Finished building badge
                  <>
                    <rect
                      x={x + (blockWidth - 20)/2 - 30}
                      y={y - 35}
                      width={60}
                      height={20}
                      fill="url(#crystalGlass)"
                      stroke={scheme.accent}
                      strokeWidth="1"
                      rx="6"
                      opacity="0.95"
                      filter="url(#glassEffect)"
                    />
                    <text
                      x={x + (blockWidth - 20)/2}
                      y={y - 22}
                      className="fill-gray-800 text-sm font-bold"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      بلوك {block.name}
                    </text>
                  </>
                ) : (
                  // Construction phase badge
                  <>
                    <rect
                      x={x + (blockWidth - 20)/2 - 35}
                      y={y - 35}
                      width={70}
                      height={20}
                      fill="#FF6B35"
                      stroke="#E55A2B"
                      strokeWidth="2"
                      rx="3"
                      opacity="0.9"
                    />
                    <text
                      x={x + (blockWidth - 20)/2}
                      y={y - 22}
                      className="fill-white text-sm font-bold"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      🚧 بلوك {block.name}
                    </text>
                  </>
                )}
                
                {/* Building Stats - Different presentation */}
                {hasUnits ? (
                  // Finished building stats
                  <g>
                    <rect
                      x={x + (blockWidth - 20)/2 - 30}
                      y={groundY + 15}
                      width={60}
                      height={16}
                      fill="url(#crystalGlass)"
                      stroke={scheme.accent}
                      strokeWidth="1"
                      rx="4"
                      opacity="0.9"
                      filter="url(#glassEffect)"
                    />
                    <text
                      x={x + (blockWidth - 20)/2}
                      y={groundY + 25}
                      className="fill-gray-800 text-xs font-semibold"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      ✨ {block.floors.length} طابق | {block.floors.reduce((total, floor) => total + floor.units.length, 0)} شقة
                    </text>
                  </g>
                ) : (
                  // Construction stats
                  <g>
                    <rect
                      x={x + (blockWidth - 20)/2 - 25}
                      y={groundY + 15}
                      width={50}
                      height={16}
                      fill="#8B7355"
                      stroke="#6B5B47"
                      strokeWidth="1"
                      rx="2"
                      opacity="0.9"
                    />
                    <text
                      x={x + (blockWidth - 20)/2}
                      y={groundY + 25}
                      className="fill-white text-xs font-semibold"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      🏗️ {block.floors.length} طابق
                    </text>
                  </g>
                )}
                <text
                  x={x + (blockWidth-10)/2}
                  y={378}
                  className="fill-gray-700 text-xs"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {block.floors.reduce((total, floor) => total + floor.units.length, 0)} شقة
                </text>
              </g>
            )
          })}

          {/* Landscaping Elements - Trees and Vegetation */}
          <g opacity="0.8">
            {/* Left side trees */}
            <g transform={`translate(20, ${groundY - 30})`}>
              <ellipse cx="0" cy="15" rx="12" ry="8" fill="#228B22" />
              <ellipse cx="0" cy="8" rx="10" ry="12" fill="#32CD32" />
              <ellipse cx="0" cy="0" rx="8" ry="10" fill="#90EE90" />
              <rect x="-2" y="15" width="4" height="15" fill="#8B4513" />
            </g>
            
            <g transform={`translate(40, ${groundY - 20})`}>
              <ellipse cx="0" cy="10" rx="8" ry="6" fill="#228B22" />
              <ellipse cx="0" cy="4" rx="6" ry="8" fill="#32CD32" />
              <rect x="-1.5" y="10" width="3" height="10" fill="#8B4513" />
            </g>

            {/* Right side trees */}
            <g transform={`translate(${svgWidth - 40}, ${groundY - 25})`}>
              <ellipse cx="0" cy="12" rx="10" ry="7" fill="#228B22" />
              <ellipse cx="0" cy="6" rx="8" ry="10" fill="#32CD32" />
              <ellipse cx="0" cy="0" rx="6" ry="8" fill="#90EE90" />
              <rect x="-2" y="12" width="4" height="12" fill="#8B4513" />
            </g>
            
            <g transform={`translate(${svgWidth - 20}, ${groundY - 15})`}>
              <ellipse cx="0" cy="8" rx="6" ry="5" fill="#228B22" />
              <ellipse cx="0" cy="3" rx="5" ry="6" fill="#32CD32" />
              <rect x="-1" y="8" width="2" height="8" fill="#8B4513" />
            </g>
          </g>

          {/* Sidewalk/Pathway */}
          <rect x="0" y={groundY - 5} width={svgWidth} height="8" fill="#C0C0C0" opacity="0.7" />
          
          {/* Decorative Elements */}
          <g opacity="0.6">
            {/* Small bushes */}
            <ellipse cx={svgWidth * 0.16} cy={groundY + 5} rx="8" ry="4" fill="#228B22" />
            <ellipse cx={svgWidth * 0.24} cy={groundY + 5} rx="6" ry="3" fill="#32CD32" />
            <ellipse cx={svgWidth * 0.76} cy={groundY + 5} rx="7" ry="4" fill="#228B22" />
            <ellipse cx={svgWidth * 0.84} cy={groundY + 5} rx="5" ry="3" fill="#32CD32" />
          </g>
          
          {/* Project Title - Changes based on phase */}
          {hasUnits ? (
            // Finished project title
            <>
              <rect x={svgWidth/2 - 120} y="15" width="240" height="25" fill="url(#crystalGlass)" stroke="#3B82F6" strokeWidth="2" rx="6" opacity="0.95" filter="url(#glassEffect)" />
              <text x={svgWidth/2} y="32" textAnchor="middle" className="fill-gray-800 text-lg font-bold" fontSize="16">
                ✨ {buildingData.name || 'مجمع سكني حديث مكتمل'}
              </text>
            </>
          ) : (
            // Construction phase title
            <>
              <rect x={svgWidth/2 - 120} y="15" width="240" height="25" fill="#FF6B35" stroke="#E55A2B" strokeWidth="2" rx="4" opacity="0.95" />
              <text x={svgWidth/2} y="32" textAnchor="middle" className="fill-white text-lg font-bold" fontSize="16">
                🚧 {buildingData.name || 'مشروع تحت الإنشاء'}
              </text>
            </>
          )}
          
          {/* Statistics Panel */}
          {hasUnits ? (
            <g>
              <rect x={svgWidth/2 - 140} y="45" width="280" height="18" fill="url(#crystalGlass)" stroke="#3B82F6" strokeWidth="1" rx="4" opacity="0.9" filter="url(#glassEffect)" />
              <text x={svgWidth/2} y="56" textAnchor="middle" className="fill-gray-800 text-sm font-semibold" fontSize="11">
                🏢 {buildingData.blocks.length} بلوك مكتمل • {' '}
                🏠 {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)} طابق • {' '}
                🔑 {buildingData.blocks.reduce((total, block) => 
                  total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
                )} شقة جاهزة
              </text>
            </g>
          ) : (
            <g>
              <rect x={svgWidth/2 - 120} y="45" width="240" height="18" fill="#8B7355" stroke="#6B5B47" strokeWidth="1" rx="3" opacity="0.9" />
              <text x={svgWidth/2} y="56" textAnchor="middle" className="fill-white text-sm font-semibold" fontSize="11">
                🏗️ {buildingData.blocks.length} بلوك قيد الإنشاء • {' '}
                📏 {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)} طابق مخطط
              </text>
            </g>
          )}
        </svg>
      )
    }

    // Determine which visualization to show
    const getVisualization = () => {
      if (currentStep === 1 && !buildingData.name) {
        return renderEmptyLand()
      } else if ((currentStep === 2 && buildingData.blocks.length === 0) || 
                 (buildingData.name && buildingData.blocks.length === 0)) {
        return renderFoundation()
      } else if (buildingData.blocks.length > 0) {
        return renderCompleteBuilding()
      } else {
        return renderFoundation()
      }
    }

    return (
      <div className="w-full space-y-4">
        {getVisualization()}
        
        {/* Legend - only show for complete buildings */}
        {buildingData.blocks.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 via-white to-green-50 rounded-lg border-2 border-blue-200 shadow-sm">
            <h5 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              �️ دليل المبنى الحديث
              <span className="text-xs text-gray-500">(تصميم واقعي)</span>
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-b from-blue-200 to-blue-400 rounded shadow-sm border"></div>
                <span className="text-gray-700 font-medium">المباني الحديثة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">النوافذ المضيئة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-b from-blue-100 to-blue-200 rounded shadow-sm border"></div>
                <span className="text-gray-700 font-medium">النوافذ العادية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gray-600 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">إطارات النوافذ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-r from-blue-400 to-pink-400 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">شرفات حديثة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-green-400 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">المناظر الطبيعية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-t from-yellow-300 to-yellow-100 rounded-full shadow-sm"></div>
                <span className="text-gray-700 font-medium">الشمس مع الوهج</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-white border-2 border-blue-300 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">السحب الطبيعية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gray-400 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">الأرصفة والممرات</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t-2 border-blue-200 bg-gradient-to-r from-blue-25 to-green-25 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">🏢</span>
                  <span className="text-gray-700"><strong>التصميم المعماري:</strong> مباني حديثة مع تفاصيل واقعية</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">💡</span>
                  <span className="text-gray-700"><strong>الإضاءة الذكية:</strong> إضاءة عشوائية تحاكي الواقع</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">🌳</span>
                  <span className="text-gray-700"><strong>البيئة المحيطة:</strong> أشجار وحدائق طبيعية</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">📊</span>
                  <span className="text-gray-700"><strong>الإحصائيات:</strong> عرض شامل للطوابق والشقق</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Step navigation
  const goToNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Complete building creation
  const handleCompleteBuilding = () => {
    console.log('Building data ready for API:', buildingData)
    // Here you would send the data to your API
    alert('تم إنشاء البرج بنجاح!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            منشئ الأبراج التفاعلي
          </h1>
          <p className="text-gray-600 text-center">
            اتبع الخطوات لإنشاء برج جديد مع البلوكات والطوابق والشقق
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel: Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Step 1: Building Name */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الأولى: اسم البرج
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      أدخل اسم البرج <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      placeholder="مثال: برج المدينة الأول"
                      dir="rtl"
                    />
                  </div>
                  <Button
                    onClick={handleSaveBuildingName}
                    disabled={!buildingName.trim()}
                    className="w-full"
                  >
                    حفظ والانتقال للمرحلة التالية
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Blocks */}
            {currentStep === 2 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الثانية: البلوكات
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر عدد أو أسماء البلوكات <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={initialBlockOptions}
                      selectedValues={selectedBlocks}
                      onChange={setSelectedBlocks}
                      placeholder="اختر أو أضف بلوكات..."
                      allowCustom={true}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      السابق
                    </Button>
                    <Button
                      onClick={handleSaveBlocks}
                      disabled={selectedBlocks.length === 0}
                      className="flex-1"
                    >
                      حفظ والانتقال للمرحلة التالية
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Floors */}
            {currentStep === 3 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الثالثة: الطوابق
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر أرقام الطوابق <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={initialFloorOptions}
                      selectedValues={selectedFloors}
                      onChange={setSelectedFloors}
                      placeholder="اختر أو أضف طوابق..."
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر البلوكات لتطبيق الطوابق عليها <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={buildingData.blocks.map(block => block.name)}
                      selectedValues={selectedBlocksForFloors}
                      onChange={setSelectedBlocksForFloors}
                      placeholder="اختر البلوكات..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      السابق
                    </Button>
                    <Button
                      onClick={handleAddFloors}
                      disabled={selectedFloors.length === 0 || selectedBlocksForFloors.length === 0}
                      className="flex-1"
                    >
                      إضافة الطوابق
                    </Button>
                    <Button onClick={goToNextStep} variant="outline" className="flex-1">
                      التالي
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Units */}
            {currentStep === 4 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  المرحلة الرابعة: الشقق
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر أرقام الشقق <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={initialUnitOptions}
                      selectedValues={selectedUnits}
                      onChange={setSelectedUnits}
                      placeholder="اختر أو أضف شقق..."
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر البلوكات <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={buildingData.blocks.map(block => block.name)}
                      selectedValues={selectedBlocksForUnits}
                      onChange={(values) => {
                        setSelectedBlocksForUnits(values)
                        setSelectedFloorsForUnits([]) // Reset floors when blocks change
                      }}
                      placeholder="اختر البلوكات..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر الطوابق <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={(() => {
                        const floors = new Set<string>()
                        buildingData.blocks.forEach(block => {
                          if (selectedBlocksForUnits.includes(block.name)) {
                            block.floors.forEach(floor => floors.add(floor.number))
                          }
                        })
                        return Array.from(floors)
                      })()}
                      selectedValues={selectedFloorsForUnits}
                      onChange={setSelectedFloorsForUnits}
                      placeholder="اختر الطوابق..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
                      السابق
                    </Button>
                    <Button
                      onClick={handleAddUnits}
                      disabled={selectedUnits.length === 0 || selectedFloorsForUnits.length === 0 || selectedBlocksForUnits.length === 0}
                      className="flex-1"
                    >
                      إضافة الشقق
                    </Button>
                  </div>
                </div>

                {/* Complete Building Button */}
                {buildingData.blocks.some(block => 
                  block.floors.some(floor => floor.units.length > 0)
                ) && (
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      onClick={handleCompleteBuilding}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      🎉 إكمال إنشاء البرج
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Building Summary */}
            {currentStep > 1 && (
              <Card className="p-6 bg-blue-50">
                <h4 className="text-lg font-semibold mb-3 text-blue-900">ملخص البرج</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>اسم البرج:</strong> {buildingData.name || 'غير محدد'}</p>
                  <p><strong>عدد البلوكات:</strong> {buildingData.blocks.length}</p>
                  <p><strong>إجمالي الطوابق:</strong> {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)}</p>
                  <p><strong>إجمالي الشقق:</strong> {buildingData.blocks.reduce((total, block) => 
                    total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
                  )}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel: Visualization */}
          <div className="xl:sticky xl:top-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">المعاينة المرئية</h4>
                <button
                  onClick={() => setShowFullScreenVisualization(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                  title="عرض بحجم كامل"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  عرض كامل
                </button>
              </div>
              <div 
                style={{maxHeight: '500px', overflow: 'auto'}} 
                className="rounded-lg border border-gray-200 relative group"
              >
                <SimpleBuildingVisualization />
                {/* Scroll indicator */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  اسحب للتنقل
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Screen Visualization Modal */}
      {showFullScreenVisualization && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  المعاينة الكاملة - {buildingData.name || 'البرج'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  عرض تفصيلي بحجم كامل للمبنى
                </p>
              </div>
              <button
                onClick={() => setShowFullScreenVisualization(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="إغلاق"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="w-full h-full min-h-[600px]">
                <SimpleBuildingVisualization />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  💡 يمكنك التكبير والتصغير باستخدام عجلة الماوس أو إيماءات اللمس
                </div>
                <button
                  onClick={() => setShowFullScreenVisualization(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إغلاق العرض الكامل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuildingBuilderPage