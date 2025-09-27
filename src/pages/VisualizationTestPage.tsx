import React from 'react'
import { Button } from '../components/ui/Button'
import VisualizationDemo from '../components/building/VisualizationDemo'

const VisualizationTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏗️ نظام رسم المباني التفاعلي
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            تجربة مطور باستخدام React Konva للحصول على رسوم تفاعلية وواقعية
          </p>
          
          {/* شارات التقنيات */}
          <div className="flex justify-center gap-3 mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              React Konva
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              TypeScript
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Canvas 2D
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              Interactive
            </span>
          </div>
        </div>

        {/* المكون التجريبي */}
        <VisualizationDemo />

        {/* معلومات إضافية */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* المزايا الحالية */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              ✅ المزايا المتوفرة
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                سحب وإفلات البلوكات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                تكبير وتصغير تفاعلي
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                تحديد البلوكات
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                رسوم واقعية مع ظلال
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                إضاءة ديناميكية للنوافذ
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                بيئة محيطة جميلة
              </li>
            </ul>
          </div>

          {/* التطوير المستقبلي */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              🚀 التطوير المستقبلي
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Three.js للرسوم ثلاثية الأبعاد
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                نماذج GLTF/GLB للمباني
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                إضاءة واقعية متقدمة
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                تكامل مع الخرائط
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                واقع افتراضي (VR)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                تصدير مقاطع فيديو
              </li>
            </ul>
          </div>

          {/* التقنيات المتاحة */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              🛠️ التقنيات البديلة
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-blue-600">React Konva</div>
                <div className="text-gray-600">للرسوم 2D التفاعلية السريعة</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">Three.js</div>
                <div className="text-gray-600">للمناظر ثلاثية الأبعاد الواقعية</div>
              </div>
              <div>
                <div className="font-semibold text-purple-600">D3.js + SVG</div>
                <div className="text-gray-600">للرسوم البيانية والإحصائيات</div>
              </div>
              <div>
                <div className="font-semibold text-orange-600">Mapbox GL</div>
                <div className="text-gray-600">للتكامل مع الخرائط الجغرافية</div>
              </div>
            </div>
          </div>
        </div>

        {/* روابط التوثيق */}
        <div className="mt-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              📚 مصادر التعلم والتوثيق
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm">
                📖 Konva.js Documentation
              </Button>
              <Button variant="outline" size="sm">
                🎯 React Konva Examples
              </Button>
              <Button variant="outline" size="sm">
                🌐 Three.js Journey
              </Button>
              <Button variant="outline" size="sm">
                🗺️ Mapbox GL JS Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisualizationTestPage