import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import VisualizationDemo from '../components/building/VisualizationDemo'
import ThreeDDemo from '../components/building/ThreeDDemo'

const AdvancedVisualizationPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'2d' | '3d' | 'comparison'>('3d')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4">
            🏗️ نظام الرسم المتقدم للمباني
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            تجربة شاملة لتقنيات الرسم 2D و 3D مع مزايا تفاعلية متطورة
          </p>
          
          {/* تقنيات مطبقة */}
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
              React Konva 2D
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              Three.js 3D
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
              React Three Fiber
            </span>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
              WebGL Canvas
            </span>
            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">
              PBR Materials
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
              Real-time Lighting
            </span>
          </div>
        </div>

        {/* مفتاح التبديل */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-200">
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveView('2d')}
                variant={activeView === '2d' ? "default" : "outline"}
                size="sm"
                className="px-6"
              >
                🎨 رسوم 2D تفاعلية
              </Button>
              <Button
                onClick={() => setActiveView('3d')}
                variant={activeView === '3d' ? "default" : "outline"}
                size="sm"
                className="px-6"
              >
                🌟 رسوم 3D واقعية
              </Button>
              <Button
                onClick={() => setActiveView('comparison')}
                variant={activeView === 'comparison' ? "default" : "outline"}
                size="sm"
                className="px-6"
              >
                ⚖️ مقارنة
              </Button>
            </div>
          </div>
        </div>

        {/* المحتوى حسب الاختيار */}
        {activeView === '2d' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🎨 تقنية React Konva - رسوم ثنائية الأبعاد
              </h2>
              <p className="text-gray-600">
                سريعة وتفاعلية مع إمكانيات السحب والإفلات والتحكم المباشر
              </p>
            </div>
            <VisualizationDemo />
          </div>
        )}

        {activeView === '3d' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🌟 تقنية Three.js - رسوم ثلاثية الأبعاد
              </h2>
              <p className="text-gray-600">
                واقعية بصرية مذهلة مع إضاءة متقدمة ومؤثرات بيئية
              </p>
            </div>
            <ThreeDDemo />
          </div>
        )}

        {activeView === 'comparison' && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                ⚖️ مقارنة شاملة بين التقنيات
              </h2>
              <p className="text-gray-600">
                اختر التقنية المناسبة لاحتياجاتك
              </p>
            </div>

            {/* جدول المقارنة */}
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-bold text-gray-800">الميزة</th>
                      <th className="text-center py-3 px-4 font-bold text-blue-600">React Konva (2D)</th>
                      <th className="text-center py-3 px-4 font-bold text-green-600">Three.js (3D)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 px-4 font-medium">سرعة الأداء</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐⭐</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">الواقعية البصرية</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐⭐</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">سهولة التطوير</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐⭐</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">التفاعل المباشر</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐⭐</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">استهلاك الموارد</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐⭐</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">المؤثرات البصرية</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                      <td className="py-3 px-4 text-center">⭐⭐⭐⭐⭐</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">دعم VR/AR</td>
                      <td className="py-3 px-4 text-center">❌</td>
                      <td className="py-3 px-4 text-center">✅</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">حجم المكتبة</td>
                      <td className="py-3 px-4 text-center">صغير (~100KB)</td>
                      <td className="py-3 px-4 text-center">متوسط (~600KB)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* التوصيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-l-4 border-l-blue-500">
                <h3 className="text-xl font-bold text-blue-600 mb-4">
                  🎨 استخدم React Konva عندما:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    تحتاج لسرعة عالية في الأداء
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    التفاعل المباشر مع العناصر مهم
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    المشروع يتطلب تطوير سريع
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    الرسوم البيانية والمخططات
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    التطبيقات التعليمية التفاعلية
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-l-4 border-l-green-500">
                <h3 className="text-xl font-bold text-green-600 mb-4">
                  🌟 استخدم Three.js عندما:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    الواقعية البصرية مطلوبة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    المشاريع التسويقية والعروض
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    التكامل مع VR/AR مطلوب
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    محاكاة البيئات الواقعية
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    الألعاب والتطبيقات الغامرة
                  </li>
                </ul>
              </Card>
            </div>

            {/* نموذج مصغر للمقارنة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-bold text-blue-600 mb-3 text-center">
                  🎨 معاينة 2D
                </h4>
                <div className="h-64 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <p className="text-gray-500">انقر "رسوم 2D تفاعلية" للمعاينة</p>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-bold text-green-600 mb-3 text-center">
                  🌟 معاينة 3D
                </h4>
                <div className="h-64 bg-gray-900 rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <p className="text-gray-300">انقر "رسوم 3D واقعية" للمعاينة</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* معلومات تقنية إضافية */}
        <Card className="p-6 mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🚀 التطوير المستقبلي المخطط
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <h4 className="font-bold mb-2">تكامل الخرائط</h4>
              <p className="text-sm text-gray-600">
                ربط المباني بالمواقع الجغرافية باستخدام Mapbox GL JS
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <h4 className="font-bold mb-2">الواقع المعزز</h4>
              <p className="text-sm text-gray-600">
                عرض المباني في البيئة الحقيقية عبر كاميرا الهاتف
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🥽</div>
              <h4 className="font-bold mb-2">الواقع الافتراضي</h4>
              <p className="text-sm text-gray-600">
                تجربة غامرة للتجول داخل المباني قبل البناء
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdvancedVisualizationPage