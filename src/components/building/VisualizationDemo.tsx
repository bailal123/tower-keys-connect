import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import InteractiveBuildingVisualization from './InteractiveBuildingVisualization'
import type { BuildingData, Block, Floor } from '../building-builder/types'

// بيانات تجريبية للاختبار
const mockBuildingData: BuildingData = {
  name: "برج المستقبل التفاعلي",
  blocks: [
    {
      id: "block-1",
      name: "البلوك الشرقي",
      floors: [
        {
          id: "floor-1-1",
          number: "1",
          units: [
            { id: "unit-1-1-1", number: "101" },
            { id: "unit-1-1-2", number: "102" },
            { id: "unit-1-1-3", number: "103" }
          ]
        },
        {
          id: "floor-1-2",
          number: "2",
          units: [
            { id: "unit-1-2-1", number: "201" },
            { id: "unit-1-2-2", number: "202" }
          ]
        },
        {
          id: "floor-1-3",
          number: "3",
          units: [
            { id: "unit-1-3-1", number: "301" },
            { id: "unit-1-3-2", number: "302" },
            { id: "unit-1-3-3", number: "303" },
            { id: "unit-1-3-4", number: "304" }
          ]
        }
      ]
    },
    {
      id: "block-2",
      name: "البلوك الغربي",
      floors: [
        {
          id: "floor-2-1",
          number: "1",
          units: [
            { id: "unit-2-1-1", number: "105" },
            { id: "unit-2-1-2", number: "106" }
          ]
        },
        {
          id: "floor-2-2",
          number: "2",
          units: [
            { id: "unit-2-2-1", number: "205" },
            { id: "unit-2-2-2", number: "206" },
            { id: "unit-2-2-3", number: "207" }
          ]
        }
      ]
    },
    {
      id: "block-3",
      name: "البلوك المركزي",
      floors: [
        {
          id: "floor-3-1",
          number: "1",
          units: [
            { id: "unit-3-1-1", number: "108" }
          ]
        },
        {
          id: "floor-3-2",
          number: "2",
          units: [
            { id: "unit-3-2-1", number: "208" },
            { id: "unit-3-2-2", number: "209" }
          ]
        },
        {
          id: "floor-3-3",
          number: "3",
          units: [
            { id: "unit-3-3-1", number: "308" },
            { id: "unit-3-3-2", number: "309" },
            { id: "unit-3-3-3", number: "310" }
          ]
        },
        {
          id: "floor-3-4",
          number: "4",
          units: [
            { id: "unit-3-4-1", number: "408" },
            { id: "unit-3-4-2", number: "409" }
          ]
        }
      ]
    }
  ]
}

interface VisualizationDemoProps {
  className?: string
}

const VisualizationDemo: React.FC<VisualizationDemoProps> = ({ className }) => {
  const [demoStep, setDemoStep] = useState(3)
  const [demoData, setDemoData] = useState<BuildingData>(mockBuildingData)

  const handleBlockUpdate = (blockId: string, updates: Record<string, unknown>) => {
    console.log('تحديث البلوك:', blockId, updates)
    // يمكنك هنا إضافة منطق لحفظ التغييرات
  }

  const resetDemo = () => {
    setDemoData({ ...mockBuildingData })
    setDemoStep(3)
  }

  const addRandomBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}`,
      name: `بلوك جديد ${demoData.blocks.length + 1}`,
      floors: [
        {
          id: `floor-${Date.now()}-1`,
          number: "1",
          units: [
            { id: `unit-${Date.now()}-1-1`, number: "101" },
            { id: `unit-${Date.now()}-1-2`, number: "102" }
          ]
        },
        {
          id: `floor-${Date.now()}-2`,
          number: "2",
          units: [
            { id: `unit-${Date.now()}-2-1`, number: "201" }
          ]
        }
      ]
    }

    setDemoData((prev: BuildingData) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }))
  }

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="space-y-6">
          {/* عنوان التجربة */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🏗️ تجربة نظام الرسم التفاعلي
            </h2>
            <p className="text-gray-600">
              جرب المزايا الجديدة: السحب، التكبير، التحديد والتنقل
            </p>
          </div>

          {/* أدوات التحكم في التجربة */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => setDemoStep(1)}
              variant={demoStep === 1 ? "default" : "outline"}
              size="sm"
            >
              🌍 أرض فارغة
            </Button>
            
            <Button
              onClick={() => setDemoStep(2)}
              variant={demoStep === 2 ? "default" : "outline"}
              size="sm"
            >
              🏗️ الأساسات
            </Button>
            
            <Button
              onClick={() => setDemoStep(3)}
              variant={demoStep === 3 ? "default" : "outline"}
              size="sm"
            >
              🏢 المبنى الكامل
            </Button>
            
            <Button
              onClick={addRandomBlock}
              variant="outline"
              size="sm"
            >
              ➕ إضافة بلوك
            </Button>
            
            <Button
              onClick={resetDemo}
              variant="outline"
              size="sm"
            >
              🔄 إعادة تعيين
            </Button>
          </div>

          {/* المعلومات الحالية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {demoData.blocks.length}
              </div>
              <div className="text-sm text-blue-700">البلوكات</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {demoData.blocks.reduce((total: number, block: Block) => total + block.floors.length, 0)}
              </div>
              <div className="text-sm text-green-700">الطوابق</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {demoData.blocks.reduce((total: number, block: Block) =>
                  total + block.floors.reduce((floorTotal: number, floor: Floor) => floorTotal + floor.units.length, 0), 0
                )}
              </div>
              <div className="text-sm text-purple-700">الشقق</div>
            </div>
          </div>

          {/* المكون التفاعلي */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <InteractiveBuildingVisualization
              buildingData={demoData}
              currentStep={demoStep}
              onBlockUpdate={handleBlockUpdate}
            />
          </div>

          {/* إرشادات الاستخدام */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              💡 إرشادات الاستخدام
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">🖱️</span>
                <span>انقر واسحب البلوكات لتحريكها</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">🎯</span>
                <span>انقر على البلوك لتحديده</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">🔍</span>
                <span>استخدم عجلة الماوس للتكبير/التصغير</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">✋</span>
                <span>اسحب الخلفية للتنقل في المشهد</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default VisualizationDemo