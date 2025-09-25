import React from 'react'
import type { BuildingData } from '../../pages/BuildingBuilderPage'

interface BuildingVisualizationProps {
  buildingData: BuildingData
  currentStep: number
}

const BuildingVisualization: React.FC<BuildingVisualizationProps> = ({
  buildingData,
  currentStep
}) => {
  const renderEmptyLand = () => (
    <svg width="100%" height="300" viewBox="0 0 400 300" className="border-2 border-dashed border-gray-300 rounded-lg">
      {/* Ground */}
      <rect x="0" y="250" width="400" height="50" fill="#90EE90" opacity="0.3" />
      
      {/* Sky */}
      <rect x="0" y="0" width="400" height="250" fill="#87CEEB" opacity="0.2" />
      
      {/* Sun */}
      <circle cx="350" cy="50" r="25" fill="#FFD700" opacity="0.6" />
      
      {/* Clouds */}
      <ellipse cx="100" cy="80" rx="30" ry="15" fill="white" opacity="0.8" />
      <ellipse cx="120" cy="75" rx="25" ry="12" fill="white" opacity="0.8" />
      
      {/* Trees */}
      <rect x="50" y="230" width="8" height="20" fill="#8B4513" />
      <circle cx="54" cy="225" r="15" fill="#228B22" />
      
      <rect x="320" y="235" width="6" height="15" fill="#8B4513" />
      <circle cx="323" cy="230" r="12" fill="#228B22" />
      
      {/* Text */}
      <text x="200" y="160" textAnchor="middle" className="fill-gray-600 text-lg font-medium">
        أرض فارغة
      </text>
      <text x="200" y="180" textAnchor="middle" className="fill-gray-500 text-sm">
        جاهزة لبناء البرج
      </text>
    </svg>
  )

  const renderFoundation = () => (
    <svg width="100%" height="300" viewBox="0 0 400 300" className="border-2 border-gray-300 rounded-lg">
      {/* Ground */}
      <rect x="0" y="250" width="400" height="50" fill="#90EE90" opacity="0.3" />
      
      {/* Sky */}
      <rect x="0" y="0" width="400" height="250" fill="#87CEEB" opacity="0.2" />
      
      {/* Foundation */}
      <rect x="100" y="230" width="200" height="20" fill="#696969" stroke="#555" strokeWidth="2" />
      <rect x="110" y="220" width="180" height="10" fill="#808080" />
      
      {/* Construction equipment */}
      <rect x="50" y="240" width="20" height="15" fill="#FFA500" />
      <circle cx="52" cy="258" r="3" fill="#333" />
      <circle cx="68" cy="258" r="3" fill="#333" />
      
      {/* Text */}
      <text x="200" y="140" textAnchor="middle" className="fill-gray-700 text-lg font-bold">
        {buildingData.name}
      </text>
      <text x="200" y="160" textAnchor="middle" className="fill-gray-600 text-sm">
        الأساسات جاهزة
      </text>
    </svg>
  )

  const renderBuildingWithBlocks = () => {
    const blockWidth = 160 / Math.max(buildingData.blocks.length, 1)
    const colors = ['#4F46E5', '#059669', '#DC2626', '#7C2D12', '#1F2937']
    
    return (
      <svg width="100%" height="400" viewBox="0 0 400 400" className="border-2 border-gray-300 rounded-lg">
        {/* Ground */}
        <rect x="0" y="350" width="400" height="50" fill="#90EE90" opacity="0.3" />
        
        {/* Sky */}
        <rect x="0" y="0" width="400" height="350" fill="#87CEEB" opacity="0.2" />
        
        {/* Building blocks */}
        {buildingData.blocks.map((block, index) => {
          const x = 120 + index * blockWidth
          const maxFloors = Math.max(...buildingData.blocks.map(b => b.floors.length), 1)
          const buildingHeight = Math.max(maxFloors * 15, 40)
          const y = 350 - buildingHeight - 20
          
          return (
            <g key={block.id}>
              {/* Block structure */}
              <rect
                x={x}
                y={y}
                width={blockWidth - 5}
                height={buildingHeight}
                fill={colors[index % colors.length]}
                stroke="#333"
                strokeWidth="1"
                opacity="0.8"
              />
              
              {/* Floors */}
              {block.floors.map((floor, floorIndex) => (
                <g key={floor.id}>
                  {/* Floor line */}
                  <line
                    x1={x}
                    y1={y + buildingHeight - (floorIndex + 1) * 15}
                    x2={x + blockWidth - 5}
                    y2={y + buildingHeight - (floorIndex + 1) * 15}
                    stroke="#fff"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                  
                  {/* Units as small rectangles */}
                  {floor.units.map((unit, unitIndex) => {
                    const unitWidth = (blockWidth - 15) / Math.max(floor.units.length, 1)
                    return (
                      <rect
                        key={unit.id}
                        x={x + 5 + unitIndex * unitWidth}
                        y={y + buildingHeight - (floorIndex + 1) * 15 + 2}
                        width={unitWidth - 2}
                        height={11}
                        fill="white"
                        stroke="#333"
                        strokeWidth="0.5"
                        opacity="0.9"
                      />
                    )
                  })}
                  
                  {/* Floor number */}
                  <text
                    x={x - 8}
                    y={y + buildingHeight - (floorIndex + 1) * 15 + 8}
                    className="fill-gray-700 text-xs"
                    textAnchor="middle"
                  >
                    {floor.number}
                  </text>
                </g>
              ))}
              
              {/* Block label */}
              <text
                x={x + blockWidth / 2 - 2.5}
                y={y - 5}
                className="fill-gray-800 text-sm font-bold"
                textAnchor="middle"
              >
                {block.name}
              </text>
              
              {/* Block info */}
              <text
                x={x + blockWidth / 2 - 2.5}
                y={y + buildingHeight + 15}
                className="fill-gray-600 text-xs"
                textAnchor="middle"
              >
                {block.floors.length} طابق
              </text>
              <text
                x={x + blockWidth / 2 - 2.5}
                y={y + buildingHeight + 28}
                className="fill-gray-600 text-xs"
                textAnchor="middle"
              >
                {block.floors.reduce((total, floor) => total + floor.units.length, 0)} شقة
              </text>
            </g>
          )
        })}
        
        {/* Building title */}
        <text x="200" y="30" textAnchor="middle" className="fill-gray-800 text-lg font-bold">
          {buildingData.name}
        </text>
        
        {/* Building stats */}
        <text x="200" y="50" textAnchor="middle" className="fill-gray-600 text-sm">
          {buildingData.blocks.length} بلوك • {buildingData.blocks.reduce((total, block) => total + block.floors.length, 0)} طابق • {buildingData.blocks.reduce((total, block) => 
            total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
          )} شقة
        </text>
      </svg>
    )
  }

  const renderContent = () => {
    if (currentStep === 1 && !buildingData.name) {
      return renderEmptyLand()
    } else if (currentStep === 2 || (buildingData.name && buildingData.blocks.length === 0)) {
      return renderFoundation()
    } else if (buildingData.blocks.length > 0) {
      return renderBuildingWithBlocks()
    } else {
      return renderFoundation()
    }
  }

  return (
    <div className="w-full">
      {renderContent()}
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">مفتاح الألوان:</h5>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>البلوك الأول</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>البلوك الثاني</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>البلوك الثالث</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-gray-400 rounded"></div>
            <span>الشقق</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildingVisualization