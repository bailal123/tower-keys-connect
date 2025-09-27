import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import ThreeDVisualization from './ThreeDVisualization'
import type { BuildingData } from '../../pages/BuildingBuilderPage'

// بيانات تجريبية متقدمة
const advanced3DBuildingData: BuildingData = {
  name: "مجمع الأبراج الذكية ثلاثية الأبعاد",
  blocks: [
    {
      id: "block-3d-1",
      name: "برج المستقبل",
      floors: [
        {
          id: "floor-3d-1-1",
          number: "1",
          units: [
            { id: "unit-3d-1-1-1", number: "101" },
            { id: "unit-3d-1-1-2", number: "102" },
            { id: "unit-3d-1-1-3", number: "103" },
            { id: "unit-3d-1-1-4", number: "104" }
          ]
        },
        {
          id: "floor-3d-1-2",
          number: "2",
          units: [
            { id: "unit-3d-1-2-1", number: "201" },
            { id: "unit-3d-1-2-2", number: "202" },
            { id: "unit-3d-1-2-3", number: "203" }
          ]
        },
        {
          id: "floor-3d-1-3",
          number: "3",
          units: [
            { id: "unit-3d-1-3-1", number: "301" },
            { id: "unit-3d-1-3-2", number: "302" },
            { id: "unit-3d-1-3-3", number: "303" },
            { id: "unit-3d-1-3-4", number: "304" },
            { id: "unit-3d-1-3-5", number: "305" }
          ]
        },
        {
          id: "floor-3d-1-4",
          number: "4",
          units: [
            { id: "unit-3d-1-4-1", number: "401" },
            { id: "unit-3d-1-4-2", number: "402" }
          ]
        },
        {
          id: "floor-3d-1-5",
          number: "5",
          units: [
            { id: "unit-3d-1-5-1", number: "501" },
            { id: "unit-3d-1-5-2", number: "502" },
            { id: "unit-3d-1-5-3", number: "503" }
          ]
        }
      ]
    },
    {
      id: "block-3d-2",
      name: "برج التقنية",
      floors: [
        {
          id: "floor-3d-2-1",
          number: "1",
          units: [
            { id: "unit-3d-2-1-1", number: "A101" },
            { id: "unit-3d-2-1-2", number: "A102" }
          ]
        },
        {
          id: "floor-3d-2-2",
          number: "2",
          units: [
            { id: "unit-3d-2-2-1", number: "A201" },
            { id: "unit-3d-2-2-2", number: "A202" },
            { id: "unit-3d-2-2-3", number: "A203" }
          ]
        },
        {
          id: "floor-3d-2-3",
          number: "3",
          units: [
            { id: "unit-3d-2-3-1", number: "A301" }
          ]
        }
      ]
    },
    {
      id: "block-3d-3",
      name: "برج الإبداع",
      floors: [
        {
          id: "floor-3d-3-1",
          number: "1",
          units: [
            { id: "unit-3d-3-1-1", number: "B101" },
            { id: "unit-3d-3-1-2", number: "B102" },
            { id: "unit-3d-3-1-3", number: "B103" },
            { id: "unit-3d-3-1-4", number: "B104" },
            { id: "unit-3d-3-1-5", number: "B105" },
            { id: "unit-3d-3-1-6", number: "B106" }
          ]
        },
        {
          id: "floor-3d-3-2",
          number: "2",
          units: [
            { id: "unit-3d-3-2-1", number: "B201" },
            { id: "unit-3d-3-2-2", number: "B202" },
            { id: "unit-3d-3-2-3", number: "B203" },
            { id: "unit-3d-3-2-4", number: "B204" }
          ]
        }
      ]
    }
  ]
}

interface ThreeD3DemoProps {
  className?: string
}

const ThreeDDemo: React.FC<ThreeD3DemoProps> = ({ className }) => {
  const [demoStep, setDemoStep] = useState(3)
  const [demoData, setDemoData] = useState<BuildingData>(advanced3DBuildingData)
  const [enableVR, setEnableVR] = useState(false)
  const [enableAR, setEnableAR] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const handleBlockUpdate = (blockId: string, updates: Record<string, unknown>) => {
    console.log('تحديث البلوك ثلاثي الأبعاد:', blockId, updates)
  }

  const addRandomBlock = () => {
    const newBlock = {
      id: `block-3d-${Date.now()}`,
      name: `برج جديد ${demoData.blocks.length + 1}`,
      floors: [
        {
          id: `floor-3d-${Date.now()}-1`,
          number: "1",
          units: [
            { id: `unit-3d-${Date.now()}-1-1`, number: "101" },
            { id: `unit-3d-${Date.now()}-1-2`, number: "102" },
            { id: `unit-3d-${Date.now()}-1-3`, number: "103" }
          ]
        },
        {
          id: `floor-3d-${Date.now()}-2`,
          number: "2",
          units: [
            { id: `unit-3d-${Date.now()}-2-1`, number: "201" },
            { id: `unit-3d-${Date.now()}-2-2`, number: "202" }
          ]
        },
        {
          id: `floor-3d-${Date.now()}-3`,
          number: "3",
          units: [
            { id: `unit-3d-${Date.now()}-3-1`, number: "301" }
          ]
        }
      ]
    }

    setDemoData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }))
  }

  const resetDemo = () => {
    setDemoData({ ...advanced3DBuildingData })
    setDemoStep(3)
  }

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="space-y-6">
          {/* عنوان التجربة */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🌟 تجربة الرسوم ثلاثية الأبعاد
            </h2>
            <p className="text-gray-600 text-lg">
              مناظر واقعية مع إضاءة متقدمة ومؤثرات بصرية مذهلة
            </p>
          </div>

          {/* مؤشرات الأداء */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {demoData.blocks.length}
              </div>
              <div className="text-sm text-blue-700">أبراج ثلاثية الأبعاد</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {demoData.blocks.reduce((total, block) => total + block.floors.length, 0)}
              </div>
              <div className="text-sm text-green-700">طوابق مضيئة</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {demoData.blocks.reduce((total, block) => 
                  total + block.floors.reduce((floorTotal, floor) => floorTotal + floor.units.length, 0), 0
                )}
              </div>
              <div className="text-sm text-purple-700">نوافذ متحركة</div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
              <div className="text-xl font-bold text-orange-600">
                3D
              </div>
              <div className="text-sm text-orange-700">تجربة غامرة</div>
            </div>
          </div>

          {/* أدوات التحكم المتقدمة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              🏗️ أساسات ثلاثية الأبعاد
            </Button>
            
            <Button
              onClick={() => setDemoStep(3)}
              variant={demoStep === 3 ? "default" : "outline"}
              size="sm"
            >
              🏢 مدينة كاملة
            </Button>
            
            <Button
              onClick={addRandomBlock}
              variant="outline"
              size="sm"
            >
              ➕ إضافة برج
            </Button>
          </div>

          {/* المؤثرات والخيارات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => setShowStats(!showStats)}
              variant={showStats ? "default" : "outline"}
              size="sm"
            >
              📊 {showStats ? 'إخفاء' : 'إظهار'} الإحصائيات
            </Button>
            
            <Button
              onClick={() => setEnableVR(!enableVR)}
              variant={enableVR ? "default" : "outline"}
              size="sm"
            >
              🥽 {enableVR ? 'إيقاف' : 'تشغيل'} VR
            </Button>
            
            <Button
              onClick={() => setEnableAR(!enableAR)}
              variant={enableAR ? "default" : "outline"}
              size="sm"
            >
              📱 {enableAR ? 'إيقاف' : 'تشغيل'} AR
            </Button>
          </div>

          <Button onClick={resetDemo} variant="outline" size="sm" className="w-full">
            🔄 إعادة تعيين المشهد
          </Button>

          {/* المكون ثلاثي الأبعاد */}
          <div className="border-2 border-gray-300 rounded-xl bg-black">
            <ThreeDVisualization
              buildingData={demoData}
              currentStep={demoStep}
              onBlockUpdate={handleBlockUpdate}
              enableVR={enableVR}
              enableAR={enableAR}
              showStats={showStats}
            />
          </div>

          {/* مزايا Three.js */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              🚀 مزايا Three.js المطبقة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✅</span>
                <div>
                  <div className="font-medium">رسوم ثلاثية الأبعاد</div>
                  <div className="text-gray-600">مناظر واقعية بالكامل</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✅</span>
                <div>
                  <div className="font-medium">إضاءة متقدمة</div>
                  <div className="text-gray-600">ظلال وانعكاسات واقعية</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✅</span>
                <div>
                  <div className="font-medium">مؤثرات بيئية</div>
                  <div className="text-gray-600">سماء وضباب وإضاءة ديناميكية</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✅</span>
                <div>
                  <div className="font-medium">تحكم بالكاميرا</div>
                  <div className="text-gray-600">دوران وتكبير سلس</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✅</span>
                <div>
                  <div className="font-medium">مواد متقدمة</div>
                  <div className="text-gray-600">معادن وزجاج ومواد واقعية</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">🚧</span>
                <div>
                  <div className="font-medium">VR/AR</div>
                  <div className="text-gray-600">قيد التطوير</div>
                </div>
              </div>
            </div>
          </div>

          {/* إرشادات التحكم */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🎮 تحكم في المشهد ثلاثي الأبعاد
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">🖱️</span>
                <span>انقر واسحب للدوران حول المشهد</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">🔍</span>
                <span>عجلة الماوس للتكبير والتصغير</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">🎯</span>
                <span>انقر على الأبراج لتحديدها</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🌅</span>
                <span>غيّر الوقت لرؤية الإضاءة المختلفة</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ThreeDDemo