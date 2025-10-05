# تطبيق نظام Pagination للفرونت إند

## نظرة عامة
تم تحديث الفرونت إند لاستخدام نظام الـ pagination الجديد من الباك إند الذي يوفر روابط التنقل بين الصفحات.

## التغييرات في API Services

### 1. تحديث `towerAPI.getAll`
```typescript
getAll: (onlyActive = true, countryId: number | null = null, cityId: number | null = null, areaId: number | null = null, towerType: number | null = null, lang = 'en', pageNumber = 1, pageSize = 20)
```
- إضافة `pageNumber` (افتراضي: 1)
- إضافة `pageSize` (افتراضي: 20)

### 2. تحديث `unitAPI.getAllAdvanced`
```typescript
getAllAdvanced: (params: UnitAdvancedQueryParams = {}, lang = 'en', pageNumber = 1, pageSize = 20)
```
- إضافة `pageNumber` (افتراضي: 1)
- إضافة `pageSize` (افتراضي: 20)

### 3. تحديث `unitAPI.getForTowerManagement`
```typescript
getForTowerManagement: (towerId: number | null = null, floorNumber: number | null = null, includeUnassignedOnly = false, includeAssignedDesigns = true, lang = 'en', pageNumber = 1, pageSize = 50)
```
- تغيير المسار من `/Unit/tower-management` إلى `/Unit/management`
- إضافة `includeAssignedDesigns` (افتراضي: true)
- إضافة `pageNumber` (افتراضي: 1)
- إضافة `pageSize` (افتراضي: 50)

## التغييرات في Types

### إضافة TypeScript Interfaces جديدة في `src/types/api.ts`

```typescript
export interface PaginationInfo {
  current_page: number;
  last_page: number;
  total_row: number;
  per_page: number;
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}

export interface ApiResponseWithPagination<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  pagination?: PaginationInfo;
}
```

## الصفحات المحدثة

### 1. TowersFamilyTreePage
**التغييرات:**
- إضافة state للـ pagination:
  ```typescript
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  ```
- تحديث `fetchTowers` لاستخدام pagination من الباك إند
- إضافة pagination controls في نهاية الصفحة مع عرض عدد النتائج الإجمالي
- Reset للصفحة عند تغيير الفلاتر

**معدل العرض:** 16 برج لكل صفحة (4 أبراج لكل صف)

### 2. ResidentialUnitsPage
**التغييرات:**
- إضافة state للـ pagination:
  ```typescript
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 20;
  ```
- تحديث `fetchUnits` لاستخدام pagination
- إضافة pagination controls مع عرض ذكي للصفحات (يعرض 10 صفحات كحد أقصى)
- Reset للصفحة عند تغيير الفلاتر

**معدل العرض:** 20 وحدة لكل صفحة

### 3. TowersTreePage
**التغييرات:**
- إضافة state للـ pagination
- تحديث `fetchTowers` لاستخدام pagination
- إضافة pagination controls مع نفس التصميم
- Reset للصفحة عند تغيير الفلاتر

**معدل العرض:** 20 برج لكل صفحة

## التغييرات في Hooks

### تحديث `useUnitsForTowerManagement` في `src/hooks/useApi.ts`
```typescript
export function useUnitsForTowerManagement(params?: { 
  towerId?: number; 
  floorNumber?: number; 
  includeUnassignedOnly?: boolean; 
  includeAssignedDesigns?: boolean; 
  lang?: string; 
  pageNumber?: number; 
  pageSize?: number 
})
```

## شكل الاستجابة من الباك إند

```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم جلب البيانات بنجاح",
  "data": [ ... ],
  "pagination": {
    "current_page": 2,
    "last_page": 5,
    "total_row": 87,
    "per_page": 20,
    "first": "https://.../api/Tower?onlyActive=true&pageNumber=1&pageSize=20",
    "prev": "https://.../api/Tower?onlyActive=true&pageNumber=1&pageSize=20",
    "next": "https://.../api/Tower?onlyActive=true&pageNumber=3&pageSize=20",
    "last": "https://.../api/Tower?onlyActive=true&pageNumber=5&pageSize=20"
  }
}
```

## مزايا التطبيق الجديد

1. **تحسين الأداء**: تحميل عدد محدود من السجلات في كل مرة
2. **تجربة مستخدم أفضل**: عرض عدد النتائج الإجمالي ورقم الصفحة الحالية
3. **تصميم موحد**: Pagination controls متسقة عبر جميع الصفحات
4. **دعم كامل للـ RTL/LTR**: الأزرار والنصوص تدعم العربية والإنجليزية
5. **روابط التنقل**: توفر روابط first, prev, next, last (جاهزة للاستخدام المستقبلي)

## الاستخدام

### مثال: جلب الأبراج مع pagination
```typescript
const resp = await towerAPI.getAll(
  true,              // onlyActive
  null,              // countryId
  null,              // cityId
  areaId,            // areaId
  null,              // towerType
  'ar',              // lang
  2,                 // pageNumber
  20                 // pageSize
);

// الوصول للبيانات
const towers = resp.data?.data || [];

// الوصول لمعلومات الـ pagination
const paginationInfo = resp.data?.pagination;
console.log(paginationInfo?.current_page);  // 2
console.log(paginationInfo?.total_row);     // 87
console.log(paginationInfo?.last_page);     // 5
```

### مثال: Pagination Controls Component
```typescript
{totalPages > 1 && (
  <Card className="mt-6 p-4">
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-600">
        {language === 'ar' 
          ? `إجمالي ${totalRows} برج (الصفحة ${currentPage} من ${totalPages})`
          : `Total ${totalRows} towers (Page ${currentPage} of ${totalPages})`}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          {language === 'ar' ? 'السابق' : 'Previous'}
        </Button>
        
        {/* Page numbers */}
        
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          {language === 'ar' ? 'التالي' : 'Next'}
        </Button>
      </div>
    </div>
  </Card>
)}
```

## ملاحظات مهمة

1. **Client-side filtering**: بعض الفلاتر لا تزال تعمل على الـ client-side (مثل البحث في بعض الحالات)
2. **Reset pagination**: عند تغيير الفلاتر، يتم إعادة الصفحة إلى 1 تلقائياً
3. **Default values**: كل API لديه قيم افتراضية مناسبة للـ pageSize
4. **Future enhancements**: يمكن استخدام روابط first, prev, next, last للتنقل المباشر

## التوافق

- ✅ يعمل مع Vite 4.5.14
- ✅ يعمل مع React 18
- ✅ يدعم TypeScript بالكامل
- ✅ متوافق مع RTL/LTR
- ✅ responsive design

## Build Status
✅ Build successful - تم البناء بنجاح في دقيقة واحدة
