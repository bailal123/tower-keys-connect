# 🌳 Family Tree Design - نظام الشجرة العائلية للأبراج

## 📋 نظرة عامة

تم تصميم صفحة **TowersFamilyTreePage** بأسلوب شجرة العائلة التفاعلية حيث:
- كل **برج** يظهر ككارت رئيسي في أعلى الشجرة
- عند الضغط على برج، يصبح هو الجذر وتظهر تحته **البلوكات**
- عند الضغط على بلوك، يصبح هو الجذر وتظهر تحته **الطوابق**
- عند الضغط على طابق، يصبح هو الجذر وتظهر تحته **الشقق**
- خطوط متصلة مثل شجرة العائلة تربط بين الأب والأبناء
- تصميم متجاوب يعمل على الموبايل والكمبيوتر

---

## 🎨 المميزات التصميمية

### 1️⃣ **نظام الخطوط المتصلة**
```
            [برج]
               |
      ┌────────┼────────┐
      |        |        |
   [بلوك1]  [بلوك2]  [بلوك3]
      |
   ┌──┼──┐
   |  |  |
[طابق] [طابق] [طابق]
```

- خطوط **رأسية** من الأب إلى الأبناء
- خطوط **أفقية** تربط الأخوة
- ألوان متدرجة حسب المستوى:
  * **أزرق** (Blue): الأبراج
  * **أخضر** (Green): البلوكات
  * **أصفر** (Yellow): الطوابق
  * **بنفسجي** (Purple): الشقق

### 2️⃣ **نظام Zoom-In التفاعلي**

#### المرحلة الأولى: عرض الأبراج
```
🏢 [برج 1]    🏢 [برج 2]    🏢 [برج 3]    🏢 [برج 4]
```
- جميع الأبراج مرئية في شكل بطاقات
- فلاتر للبحث والتصفية

#### عند الضغط على برج:
```
        🏢 [البرج المختار]
             |
   ┌─────────┼─────────┐
   |         |         |
📦 [بلوك 1] 📦 [بلوك 2] 📦 [بلوك 3]
```
- البرج المختار يصبح الجذر
- باقي الأبراج تختفي
- البلوكات تظهر كأبناء

#### عند الضغط على بلوك:
```
       📦 [البلوك المختار]
             |
   ┌─────────┼─────────┐
   |         |         |
🏢 [طابق 1] 🏢 [طابق 2] 🏢 [طابق 3]
```
- البلوك يصبح الجذر
- البرج يختفي
- الطوابق تظهر كأبناء

#### عند الضغط على طابق:
```
       🏢 [الطابق المختار]
             |
   ┌─────────┼─────────┐
   |         |         |
🏠 [شقة 1]  🏠 [شقة 2]  🏠 [شقة 3]
```
- الطابق يصبح الجذر
- البلوك يختفي
- الشقق تظهر كأبناء

### 3️⃣ **تصميم البطاقات (Cards)**

#### بطاقة البرج:
```tsx
┌─────────────────────────────┐
│  🏢  [Building Icon]   ✅   │
│                             │
│  اسم البرج بالعربي          │
│  Tower Name in English      │
│                             │
│ ┌─────┬─────┬─────┐        │
│ │  5  │  20 │ 100 │        │
│ │بلوك │طابق │شقة  │        │
│ └─────┴─────┴─────┘        │
│                             │
│ مرحلة التعريف: ████░░ 3/5  │
│                             │
│ [تعديل]    [عرض التفاصيل]  │
└─────────────────────────────┘
```

#### بطاقة البلوك:
```tsx
┌────────────────────────┐
│  📦  [Box Icon]   20   │
│                        │
│  اسم البلوك            │
│  Block Name            │
│                        │
│      [تعديل]          │
└────────────────────────┘
```

#### بطاقة الطابق:
```tsx
┌────────────────────────┐
│  🏢  [Layers Icon]  8  │
│                        │
│  الطابق الأول          │
│  First Floor           │
│                        │
│   [عرض الشقق]         │
└────────────────────────┘
```

#### بطاقة الشقة:
```tsx
┌────────────────────────┐
│  🏠  [Home Icon]  متاح │
│                        │
│  الشقة رقم 101        │
│  Unit 101              │
│                        │
│      [تعديل]          │
└────────────────────────┘
```

---

## 🔧 التنفيذ التقني

### الملفات الرئيسية:

#### 1. **TowersFamilyTreePage.tsx**
الصفحة الرئيسية التي تحتوي على:
- نظام العرض متعدد المستويات (towers → blocks → floors → units)
- إدارة الحالة باستخدام `useState`
- التنقل بين المستويات
- الخطوط المتصلة

#### 2. **index.css**
إضافة animation:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
```

#### 3. **AppRouter.tsx**
إضافة Route:
```tsx
<Route path="/towers" element={<TowersFamilyTreePage />} />
```

---

## 📊 نظام الحالة (State Management)

### ViewState Interface:
```typescript
interface ViewState {
  level: 'towers' | 'blocks' | 'floors' | 'units';
  selectedTowerId?: number;
  selectedBlockId?: number;
  selectedFloorId?: number;
}
```

### مثال على التنقل:
```typescript
// عرض الأبراج
{ level: 'towers' }

// اختيار برج → عرض البلوكات
{ level: 'blocks', selectedTowerId: 1 }

// اختيار بلوك → عرض الطوابق
{ level: 'blocks', selectedTowerId: 1, selectedBlockId: 5 }
{ level: 'floors', selectedTowerId: 1, selectedBlockId: 5 }

// اختيار طابق → عرض الشقق
{ level: 'units', selectedTowerId: 1, selectedBlockId: 5, selectedFloorId: 20 }
```

---

## 🎯 الوظائف الرئيسية

### 1. **handleTowerClick**
```typescript
const handleTowerClick = async (towerId: number) => {
  setLoadingChildren(true);
  // جلب البلوكات من API
  const blocksData = await towerBlockAPI.getAll({ towerId, onlyActive: true });
  setBlocks(blocksData);
  setViewState({ level: 'blocks', selectedTowerId: towerId });
};
```

### 2. **handleBlockClick**
```typescript
const handleBlockClick = async (blockId: number) => {
  // جلب الطوابق من API
  const floorsData = await blockFloorAPI.getAll({ towerBlockId: blockId });
  setFloors(floorsData);
  setViewState({ ...viewState, level: 'floors', selectedBlockId: blockId });
};
```

### 3. **handleFloorClick**
```typescript
const handleFloorClick = async (floorId: number) => {
  // جلب الشقق من API
  const unitsData = await unitAPI.getAllAdvanced({ blockFloorId: floorId });
  setUnits(unitsData);
  setViewState({ ...viewState, level: 'units', selectedFloorId: floorId });
};
```

### 4. **handleBack**
```typescript
const handleBack = () => {
  if (viewState.level === 'units') {
    // العودة من الشقق إلى الطوابق
    setViewState({ level: 'floors', ... });
  } else if (viewState.level === 'floors') {
    // العودة من الطوابق إلى البلوكات
    setViewState({ level: 'blocks', ... });
  } else if (viewState.level === 'blocks') {
    // العودة من البلوكات إلى الأبراج
    setViewState({ level: 'towers' });
  }
};
```

---

## 🌈 نظام الألوان

### الألوان حسب المستوى:

| المستوى | اللون الأساسي | Gradient | الأيقونة |
|---------|---------------|----------|----------|
| **البرج** | `blue-500` | `from-blue-500 to-blue-600` | 🏢 Building2 |
| **البلوك** | `green-500` | `from-green-500 to-green-600` | 📦 Box |
| **الطابق** | `yellow-500` | `from-yellow-500 to-yellow-600` | 🏢 Layers |
| **الشقة** | `purple-500` | `from-purple-500 to-purple-600` | 🏠 Home |

### الخطوط المتصلة:
```tsx
// خط من البرج إلى البلوكات
<div className="bg-gradient-to-b from-blue-400 to-green-500" />

// خط من البلوك إلى الطوابق
<div className="bg-gradient-to-b from-green-400 to-yellow-500" />

// خط من الطابق إلى الشقق
<div className="bg-gradient-to-b from-yellow-400 to-purple-500" />
```

---

## 📱 التصميم المتجاوب (Responsive)

### Breakpoints:
```css
/* Mobile First */
.flex flex-wrap justify-center gap-6

/* Tablet */
@media (min-width: 768px) {
  gap-8
}

/* Desktop */
@media (min-width: 1024px) {
  gap-12
}
```

### تنسيق البطاقات:
- **Mobile**: 1 بطاقة في السطر
- **Tablet**: 2-3 بطاقات في السطر
- **Desktop**: 3-5 بطاقات في السطر

---

## ⚡ التأثيرات البصرية (Animations)

### 1. **Fade In عند الظهور**
```tsx
<div 
  className="animate-fadeIn" 
  style={{ animationDelay: `${index * 100}ms` }}
>
```

### 2. **Hover Effects**
```tsx
className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
```

### 3. **Gradient Backgrounds**
```tsx
<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100" />
```

### 4. **Border Highlight**
```tsx
className="border-2 border-transparent hover:border-blue-500"
```

---

## 🔄 مسار المستخدم (User Flow)

```
1. المستخدم يفتح صفحة /towers
   ↓
2. يرى جميع الأبراج مع فلاتر البحث
   ↓
3. يضغط على برج معين
   ↓
4. البرج يصبح الجذر وتظهر البلوكات تحته
   ↓
5. يضغط على بلوك
   ↓
6. البلوك يصبح الجذر وتظهر الطوابق تحته
   ↓
7. يضغط على طابق
   ↓
8. الطابق يصبح الجذر وتظهر الشقق تحته
   ↓
9. يمكنه الضغط على "رجوع" للعودة للمستوى السابق
```

---

## 🧩 مكونات الواجهة

### الفلاتر (Filters):
- **الدولة** (Country)
- **المدينة** (City)
- **المنطقة** (Area)
- **الحالة** (Active/Inactive)
- **مرحلة التعريف** (Stage 1-5)
- **البحث** (Search)

### Breadcrumb Navigation:
```
المسار: البرج الشمالي → البلوك A → الطابق الأول → الشقة 101
```

### زر الرجوع:
```tsx
<Button variant="outline" onClick={handleBack}>
  ← رجوع
</Button>
```

---

## 📦 الـ APIs المستخدمة

```typescript
// جلب الأبراج
towerAPI.getAll(true, countryId, cityId, areaId, null, language)

// جلب البلوكات
towerBlockAPI.getAll({ towerId, onlyActive: true }, language)

// جلب الطوابق
blockFloorAPI.getAll({ towerBlockId, onlyActive: true }, language)

// جلب الشقق
unitAPI.getAllAdvanced({ blockFloorId, onlyActive: true }, language)
```

---

## ✅ الميزات المنفذة

- ✅ عرض الأبراج كبطاقات مع خطوط متصلة
- ✅ نظام Zoom-In: الضغط على عنصر يجعله الجذر
- ✅ إخفاء العناصر الأخرى عند التركيز على عنصر
- ✅ خطوط مرسومة مثل شجرة العائلة
- ✅ بطاقات صغيرة مع Hover Effects
- ✅ تصميم متجاوب (Mobile + Desktop)
- ✅ نظام ألوان متدرج حسب المستوى
- ✅ Animations سلسة
- ✅ Breadcrumb للمسار
- ✅ زر رجوع للمستوى السابق
- ✅ دعم اللغة العربية والإنجليزية
- ✅ Loading states
- ✅ Error handling

---

## 🚀 كيفية الاستخدام

### 1. التشغيل:
```bash
npm run dev
```

### 2. الوصول للصفحة:
```
http://localhost:5173/towers
```

### 3. التنقل:
- اضغط على أي برج لرؤية البلوكات
- اضغط على أي بلوك لرؤية الطوابق
- اضغط على أي طابق لرؤية الشقق
- استخدم زر "رجوع" للعودة

---

## 📊 إحصائيات البناء

```
Build Time: 50.36s
Bundle Size: 3,864.50 KB
CSS Size: 106.44 KB (gzip: 15.49 KB)
Modules: 2518
Status: ✅ Success
```

---

## 🎨 مثال على الكود

### رسم خط من الأب إلى الأبناء:
```tsx
{/* Vertical line from parent */}
<div className="w-0.5 h-12 bg-gradient-to-b from-blue-400 to-green-500"></div>

{/* Horizontal line connecting siblings */}
<div 
  className="absolute top-12 left-1/2 w-full h-0.5 bg-green-400" 
  style={{ 
    transform: index === 0 ? 'translateX(0)' : 
               index === total - 1 ? 'translateX(-100%)' : 
               'translateX(-50%)',
    width: index === 0 || index === total - 1 ? '50%' : '100%'
  }}
/>
```

---

## 🌟 خلاصة

تم تصميم صفحة **شجرة العائلية للأبراج** بنجاح مع:
- ✨ واجهة تفاعلية جميلة
- 🎯 نظام zoom-in ذكي
- 🌳 خطوط متصلة مثل شجرة العائلة
- 📱 تصميم متجاوب تماماً
- 🎨 ألوان متناسقة ومنظمة
- ⚡ أداء سريع وسلس

**الصفحة جاهزة للاستخدام!** 🚀
