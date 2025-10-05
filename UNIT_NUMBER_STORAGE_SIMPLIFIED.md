# تحديث تخزين رقم الوحدة (unitNumber) - تخزين الرقم فقط بدون رمز الطابق أو البرج
**التاريخ**: 5 أكتوبر 2025

## 📋 الوصف
تم تحديث نظام تخزين `unitNumber` في قاعدة البيانات بحيث يتم تخزين **رقم الوحدة فقط** لجميع أنواع الوحدات (سكنية، تجارية، مكاتب، مواقف، إلخ)، بدون إضافة رمز الطابق أو اسم البرج. سيتم دمج هذه المعلومات في الفرونت إند عند العرض.

## 🎯 المشكلة السابقة

### التخزين القديم:
```typescript
// للوحدات السكنية
unitNumber: "01"  // رقم فقط ✅

// للوحدات غير السكنية
unitNumber: "Tower-F5-01"  // كود كامل مع اسم البرج ورمز الطابق ❌
```

### المشاكل:
1. **عدم الاتساق**: الوحدات السكنية تُخزن برقم فقط، وغير السكنية تُخزن بكود كامل
2. **صعوبة التعديل**: إذا تغير اسم البرج أو رمز الطابق، تحتاج لتحديث جميع الوحدات
3. **تكرار البيانات**: معلومات البرج والطابق موجودة بالفعل في `TowerId`, `BlockId`, `floorCode`
4. **مرونة أقل**: لا يمكن تغيير صيغة العرض بدون تعديل قاعدة البيانات

## ✅ الحل المطبق

### التخزين الجديد (موحد لجميع الأنواع):
```typescript
// جميع الوحدات - سكنية وغير سكنية
unitNumber: "01"  // رقم الوحدة فقط ✅
unitNumber: "02"  // رقم الوحدة فقط ✅
unitNumber: "STORE-01"  // للوحدات اليدوية (خدمي/مختلط/أرضي) ✅
```

### البيانات الكاملة المخزنة:
```typescript
{
  unitNumber: "01",           // رقم الوحدة فقط
  floorCode: "F5",           // رمز الطابق
  TowerId: 123,              // معرف البرج
  BlockId: 456,              // معرف البلوك
  blockFloorId: 789,         // معرف طابق البلوك
  type: UnitType.Office,     // نوع الوحدة
  // ... باقي البيانات
}
```

## 🔄 التغييرات في الكود

### قبل التعديل:
```typescript
else if(d.unitsDefinition && d.unitsDefinition.count>0){ 
  const t=unitTypeNumeric(d.unitsDefinition.type)
  const isRes=t===UnitType.Residential
  for(let i=0;i<d.unitsDefinition.count;i++){ 
    const uNum=d.unitsDefinition.startNumber+i
    const code=buildUnitCode(d.floorCode,uNum,d.unitsDefinition)
    units.push({ 
      unitNumber:isRes?String(uNum).padStart(2,'0'):code,  // ❌ كود مختلف حسب النوع
      // ... باقي البيانات
    }) 
  } 
}
```

### بعد التعديل:
```typescript
else if(d.unitsDefinition && d.unitsDefinition.count>0){ 
  const t=unitTypeNumeric(d.unitsDefinition.type)
  for(let i=0;i<d.unitsDefinition.count;i++){ 
    const uNum=d.unitsDefinition.startNumber+i
    // تخزين رقم الوحدة فقط لجميع الأنواع (بدون رمز الطابق أو البرج)
    units.push({ 
      unitNumber:String(uNum).padStart(2,'0'),  // ✅ رقم فقط لجميع الأنواع
      // ... باقي البيانات
    }) 
  } 
}
```

### إزالة الدالة غير المستخدمة:
تم حذف دالة `buildUnitCode` لأنها لم تعد ضرورية في عملية الحفظ. يمكن بناء الكود الكامل في الفرونت إند عند العرض.

## 📊 أمثلة التخزين

### مثال 1: وحدات سكنية (Regular)
```typescript
// الإعدادات:
floorType: Regular
codePrefix: "F"
startNumber: 1
unitsCount: 4
floorNumber: 5

// التخزين في DB:
{unitNumber: "01", floorCode: "F5", type: Residential}
{unitNumber: "02", floorCode: "F5", type: Residential}
{unitNumber: "03", floorCode: "F5", type: Residential}
{unitNumber: "04", floorCode: "F5", type: Residential}
```

### مثال 2: وحدات مكتبية (Office)
```typescript
// الإعدادات:
floorType: Office
codePrefix: "O"
startNumber: 10
unitsCount: 3
floorNumber: 2

// التخزين في DB:
{unitNumber: "10", floorCode: "O2", type: Office}
{unitNumber: "11", floorCode: "O2", type: Office}
{unitNumber: "12", floorCode: "O2", type: Office}
```

### مثال 3: مواقف سيارات (Parking)
```typescript
// الإعدادات:
floorType: Parking
codePrefix: "P"
codePrefixStartNumber: 4
startNumber: 1
unitsCount: 20
floorNumber: -1

// التخزين في DB:
{unitNumber: "01", floorCode: "P4", type: Parking}
{unitNumber: "02", floorCode: "P4", type: Parking}
{unitNumber: "03", floorCode: "P4", type: Parking}
// ... حتى 20
```

### مثال 4: طابق خدمي (Service) - إدخال يدوي
```typescript
// الإعدادات:
floorType: Service
mixed units:
  - type: Storage, code: "STORE-01"
  - type: Clinic, code: "CLINIC-A"
  - type: Restaurant, code: "REST-001"

// التخزين في DB:
{unitNumber: "STORE-01", floorCode: "S5", type: Storage}
{unitNumber: "CLINIC-A", floorCode: "S5", type: Clinic}
{unitNumber: "REST-001", floorCode: "S5", type: Restaurant}
```

## 🎨 العرض في الفرونت إند

عند عرض الوحدات في الفرونت إند، يمكن دمج المعلومات حسب الحاجة:

### طريقة بناء الكود الكامل للعرض:
```typescript
// دالة مساعدة في الفرونت إند
function buildFullUnitCode(unit: Unit, floor: Floor, tower: Tower, includeOptions?: {
  includeTowerName?: boolean,
  includeBlockName?: boolean,
  includeFloorCode?: boolean
}): string {
  const parts: string[] = []
  
  if (includeOptions?.includeTowerName && tower.name) {
    parts.push(tower.name)
  }
  
  if (includeOptions?.includeBlockName && unit.blockName) {
    parts.push(unit.blockName)
  }
  
  if (includeOptions?.includeFloorCode && floor.floorCode) {
    parts.push(floor.floorCode)
  }
  
  parts.push(unit.unitNumber)
  
  return parts.join('-')
}

// أمثلة الاستخدام:
buildFullUnitCode(unit, floor, tower, {
  includeTowerName: true,
  includeFloorCode: true
})
// النتيجة: "Tower-A-F5-01"

buildFullUnitCode(unit, floor, tower, {
  includeFloorCode: true
})
// النتيجة: "F5-01"

buildFullUnitCode(unit, floor, tower, {})
// النتيجة: "01"
```

### أمثلة العرض:

#### عرض مبسط:
```
الوحدة: 01
الطابق: F5
البرج: Tower A
```

#### عرض بكود كامل:
```
الكود الكامل: Tower-A-F5-01
```

#### عرض في جدول:
| الوحدة | الطابق | البلوك | البرج | النوع | الحالة |
|--------|--------|--------|-------|-------|--------|
| 01 | F5 | A | Tower A | مكتب | متاح |
| 02 | F5 | A | Tower A | مكتب | محجوز |

## 💡 الفوائد

### 1. اتساق البيانات
- **موحد**: جميع الوحدات تُخزن بنفس الطريقة
- **منطقي**: الرقم في حقل الرقم، والمعلومات الإضافية في حقولها الخاصة

### 2. سهولة الصيانة
- **تحديث سهل**: تغيير اسم البرج أو رمز الطابق لا يؤثر على أرقام الوحدات
- **عدم التكرار**: كل معلومة مخزنة مرة واحدة فقط

### 3. مرونة في العرض
- **تخصيص**: يمكن عرض الكود بصيغ مختلفة حسب السياق
- **لغات متعددة**: سهولة دعم عرض متعدد اللغات

### 4. استعلامات أسرع
- **فهرسة**: `unitNumber` بسيط يمكن فهرسته بكفاءة
- **بحث**: البحث برقم الوحدة أسرع وأبسط

### 5. حجم أقل
- **توفير مساحة**: تخزين "01" بدلاً من "Tower-A-Block-B-F5-01"
- **نقل أسرع**: بيانات أقل للنقل بين الخادم والعميل

## 🔄 الترحيل (Migration)

إذا كانت هناك بيانات قديمة بصيغة الكود الكامل، يمكن إنشاء سكريبت ترحيل:

```sql
-- مثال SQL للترحيل (تعتمد على بنية قاعدة البيانات)
UPDATE Units
SET unitNumber = 
  CASE 
    WHEN unitNumber LIKE '%-%-%-%' THEN 
      SUBSTRING(unitNumber FROM POSITION('-' IN REVERSE(unitNumber)) + 1)
    ELSE 
      unitNumber
  END
WHERE unitNumber LIKE '%-%';
```

أو في C# (Backend):
```csharp
// سكريبت ترحيل
var units = await _context.Units.ToListAsync();
foreach (var unit in units)
{
    // إذا كان unitNumber يحتوي على "-"
    if (unit.UnitNumber.Contains("-"))
    {
        // استخراج الجزء الأخير فقط
        var parts = unit.UnitNumber.Split('-');
        unit.UnitNumber = parts[^1]; // آخر جزء
    }
}
await _context.SaveChangesAsync();
```

## 📝 ملاحظات مهمة

### 1. للوحدات اليدوية (Service/Mixed/Ground):
- يتم تخزين `unitNumber` كما أدخله المستخدم بالضبط
- يمكن أن يكون رقم بسيط: "01"
- أو كود مخصص: "STORE-01", "CLINIC-A", "REST-001"
- المرونة الكاملة متاحة للمستخدم

### 2. للوحدات التلقائية:
- يتم تخزين الرقم المتسلسل فقط
- دائماً بصيغة رقمية بـ padding: "01", "02", "10", "99"
- بداية الترقيم من `startNumber` المحدد

### 3. في الفرونت إند:
- يمكن بناء الكود الكامل عند الحاجة
- استخدم دالة مساعدة لدمج المعلومات
- تخصيص صيغة العرض حسب السياق والواجهة

### 4. في Backend API:
- عند إرجاع الوحدات، قد تحتاج لإضافة خاصية محسوبة `fullCode`
- أو إرجاع معلومات الطابق والبرج منفصلة
- الفرونت إند يقوم بالدمج حسب الحاجة

## 🔍 الملفات المتأثرة

### src/components/building-builder/Step3FloorDefinitions.tsx
**التعديلات**:
1. **السطر ~405**: تحديث حفظ الوحدات التلقائية
   - إزالة المتغير `isRes`
   - إزالة استدعاء `buildUnitCode`
   - تخزين `unitNumber` كرقم فقط لجميع الأنواع

2. **السطر ~340**: حذف دالة `buildUnitCode`
   - لم تعد مستخدمة في عملية الحفظ
   - يمكن إنشاء نسخة منها في صفحات العرض إذا لزم الأمر

## ✅ الاختبار

### اختبارات ناجحة:
- [x] البناء: `npm run build` (21.47s) ✅
- [x] لا أخطاء TypeScript ✅
- [x] جميع أنواع الوحدات تُخزن برقم فقط ✅
- [x] الوحدات اليدوية تحتفظ بأكوادها المخصصة ✅

### السيناريوهات المدعومة:
- [x] وحدات سكنية: "01", "02", "03" ✅
- [x] وحدات مكتبية: "10", "11", "12" ✅
- [x] مواقف سيارات: "01", "02", "03" ✅
- [x] وحدات خدمية يدوية: "STORE-01", "CLINIC-A" ✅
- [x] وحدات مختلطة يدوية: "501", "OFF-502" ✅

## 🎯 الخطوات التالية (للفرونت إند)

### 1. إنشاء دالة مساعدة للعرض
```typescript
// في ملف utils أو hooks
export function formatUnitFullCode(
  unitNumber: string,
  floorCode: string,
  blockName?: string,
  towerName?: string,
  options?: DisplayOptions
): string {
  // ... منطق الدمج
}
```

### 2. استخدامها في صفحات العرض
```typescript
// في مكون عرض الوحدات
const fullCode = formatUnitFullCode(
  unit.unitNumber,
  floor.floorCode,
  block.name,
  tower.name,
  { includeAll: true }
)
```

### 3. في الجداول والقوائم
```typescript
// عرض بسيط
<td>{unit.unitNumber}</td>

// عرض كامل
<td>{formatUnitFullCode(unit, floor, block, tower)}</td>
```

## 🎉 النتيجة النهائية

نظام تخزين موحد ومنطقي:
- ✅ **unitNumber** يحتوي على رقم الوحدة فقط
- ✅ معلومات البرج والطابق في حقولها الخاصة
- ✅ مرونة كاملة في طريقة العرض
- ✅ سهولة الصيانة والتحديث
- ✅ استعلامات أسرع وأكثر كفاءة
- ✅ اتساق كامل عبر جميع أنواع الوحدات
