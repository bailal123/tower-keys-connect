# مكونات التصميم الموحدة - Unified UI Components

تحتوي هذه المجلد على مجموعة شاملة من مكونات التصميم الموحدة التي تضمن الاتساق عبر التطبيق.

## 🎯 عناصر واجهة أساسية

### 1. Button - زر
```tsx
import { Button } from './components/ui/Button'

<Button variant="default" size="default">
  النص
</Button>
```

**المتغيرات (Variants):**
- `default` - أزرق أساسي
- `destructive` - أحمر للحذف
- `outline` - حدود فقط
- `secondary` - رمادي ثانوي
- `ghost` - شفاف
- `link` - رابط
- `success` - أخضر للنجاح
- `warning` - أصفر للتحذير
- `info` - أزرق فاتح للمعلومات

### 2. Input - حقل الإدخال
```tsx
import { Input } from './components/ui/Input'

<Input
  placeholder="أدخل النص هنا"
  variant="default"
  leftIcon={<Search />}
  error="رسالة خطأ"
  helperText="نص مساعد"
/>
```

### 3. Textarea - حقل نص متعدد الأسطر
```tsx
import { Textarea } from './components/ui/Textarea'

<Textarea
  placeholder="أدخل النص هنا"
  variant="default"
  label="الوصف"
  rows={4}
/>
```

### 4. Select - قائمة منسدلة
```tsx
import { Select } from './components/ui/Select'

<Select
  placeholder="اختر خيار"
  options={[
    { value: '1', label: 'الخيار الأول' },
    { value: '2', label: 'الخيار الثاني' }
  ]}
  variant="default"
/>
```

### 5. Checkbox - مربع اختيار
```tsx
import { Checkbox } from './components/ui/Checkbox'

<Checkbox
  label="تذكرني"
  description="احفظ بياناتي لتسجيل الدخول التالي"
  size="md"
  variant="default"
/>
```

### 6. RadioGroup - مجموعة خيارات
```tsx
import { RadioGroup } from './components/ui/RadioGroup'

<RadioGroup
  name="type"
  label="نوع العقار"
  options={[
    { value: 'apartment', label: 'شقة' },
    { value: 'villa', label: 'فيلا' },
    { value: 'office', label: 'مكتب' }
  ]}
  value={selectedType}
  onChange={setSelectedType}
/>
```

### 7. Toggle/Switch - مفتاح تشغيل
```tsx
import { Toggle } from './components/ui/Toggle'

<Toggle
  checked={isEnabled}
  onChange={setIsEnabled}
  label="تفعيل الإشعارات"
  description="استقبال إشعارات عند إضافة عقارات جديدة"
/>
```

### 8. DatePicker - منتقي التاريخ
```tsx
import { DatePicker } from './components/ui/DatePicker'

<DatePicker
  label="تاريخ البداية"
  value={startDate}
  onChange={setStartDate}
  showTimeSelect={false}
/>
```

### 9. SearchBar - شريط البحث
```tsx
import { SearchBar } from './components/ui/SearchBar'

<SearchBar
  placeholder="البحث في العقارات..."
  value={searchTerm}
  onChange={setSearchTerm}
  onSearch={handleSearch}
  showFilterButton={true}
  onFilterClick={openFilters}
/>
```

## 🟠 عناصر عرض محتوى

### 1. Card - بطاقة
```tsx
import { ActionCard, InfoCard } from './components/ui/Card'

// بطاقة صغيرة للمدن والمناطق
<ActionCard
  title="الرياض"
  description="عدد العقارات: 150"
  selected={false}
  onEdit={() => {}}
  onDelete={() => {}}
  onClick={() => {}}
/>

// بطاقة كبيرة للدول
<InfoCard
  title="المملكة العربية السعودية"
  description="دولة في شبه الجزيرة العربية"
  badges={[
    { text: "145 مدينة", variant: "success" },
    { text: "نشط", variant: "default" }
  ]}
  image="/api/placeholder/300/200"
  actions={[
    { label: "تعديل", onClick: () => {} },
    { label: "حذف", onClick: () => {}, variant: "destructive" }
  ]}
/>
```

### 2. Modal/Dialog - نوافذ منبثقة
```tsx
// متوفرة مسبقاً في النظام
import { Modal, FormModal, ConfirmationDialog } from './components/ui'
```

### 3. Tooltip - تلميح
```tsx
import { Tooltip } from './components/ui/Tooltip'

<Tooltip content="هذا نص التلميح" position="top">
  <Button>مرر للمشاهدة</Button>
</Tooltip>
```

### 4. Notification/Toast - إشعارات
```tsx
import { Notification, ToastContainer } from './components/ui/Notification'

<Notification
  variant="success"
  title="تم الحفظ بنجاح"
  description="تم حفظ البيانات بنجاح"
  autoClose={true}
  duration={5000}
/>
```

### 5. Badge - شارات
```tsx
import { Badge } from './components/ui/Badge'

<Badge variant="success" size="md" removable onRemove={() => {}}>
  جديد
</Badge>
```

### 6. Avatar - صورة المستخدم
```tsx
import { Avatar } from './components/ui/Avatar'

<Avatar
  src="/user-avatar.jpg"
  name="أحمد محمد"
  size="lg"
  showStatus={true}
  status="online"
/>
```

### 7. Accordion - قسم قابل للطي
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/ui/Accordion'

<Accordion type="single" defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>العنوان الأول</AccordionTrigger>
    <AccordionContent>
      محتوى القسم الأول
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### 8. Tabs - تبويبات
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">التبويب الأول</TabsTrigger>
    <TabsTrigger value="tab2">التبويب الثاني</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">محتوى التبويب الأول</TabsContent>
  <TabsContent value="tab2">محتوى التبويب الثاني</TabsContent>
</Tabs>
```

### 9. DataTable - جدول البيانات
```tsx
import { DataTable } from './components/ui/DataTable'

<DataTable
  data={countries}
  columns={[
    {
      key: 'name',
      title: 'الاسم',
      sortable: true,
      filterable: true
    },
    {
      key: 'code',
      title: 'الكود',
      sortable: true
    }
  ]}
  searchable={true}
  pagination={{
    page: 1,
    pageSize: 10,
    total: 100,
    onPageChange: (page) => {},
    onPageSizeChange: (size) => {}
  }}
/>
```

## 🟡 التنقّل (Navigation)

### 1. Breadcrumbs - مسار التصفّح
```tsx
import { Breadcrumbs } from './components/ui/Breadcrumbs'

<Breadcrumbs
  items={[
    { label: 'الرئيسية', href: '/' },
    { label: 'الدول', href: '/countries' },
    { label: 'السعودية', isActive: true }
  ]}
  showHome={true}
/>
```

### 2. Navbar/Sidebar - متوفر في AppRouter
```tsx
// متوفر في src/components/layout/AppRouter.tsx
```

### 3. PageHeader - رأس الصفحة
```tsx
import { PageHeader } from './components/ui/PageHeader'

<PageHeader
  title="إدارة الدول"
  breadcrumbs={[
    { label: "الرئيسية", href: "/" },
    { label: "الدول", href: "/countries" }
  ]}
  showBackButton={true}
  actions={
    <Button variant="default">
      إضافة دولة جديدة
    </Button>
  }
/>
```

## ⚪ عناصر مساعدة

### 1. Loader/Spinner - مؤشرات تحميل
```tsx
import { Spinner, Loader, Skeleton, Progress } from './components/ui/Loader'

// Spinner بسيط
<Spinner size="md" variant="default" />

// Loader مع نص
<Loader text="جارٍ التحميل..." fullscreen={false} />

// Skeleton للتحميل
<Skeleton lines={3} />

// Progress Bar
<Progress value={75} max={100} showValue={true} />
```

### 2. EmptyState - شاشة فارغة
```tsx
import { EmptyState, NoData, NoResults, ErrorState } from './components/ui/EmptyState'

// EmptyState مخصص
<EmptyState
  title="لا توجد عقارات"
  description="لم يتم العثور على أي عقارات"
  action={{
    label: "إضافة عقار جديد",
    onClick: () => {}
  }}
/>

// أو استخدام المكونات المعرّفة مسبقاً
<NoData />
<NoResults />
<ErrorState />
```

### 3. Grid - شبكة
```tsx
import { Grid } from './components/ui/Grid'

<Grid columns={3} gap="md" responsive={true}>
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
</Grid>
```

### 4. Label - تسمية
```tsx
import { Label } from './components/ui/Label'

<Label
  text="اسم المستخدم"
  required={true}
  icon={<User />}
  variant="default"
  htmlFor="username"
/>
```

## 📋 ملخص المكونات المتاحة

### ✅ **العناصر الأساسية:**
- ✅ Button (زر رئيسي، ثانوي، بخيارات حجم/ألوان/أيقونة)
- ✅ Input (نصي، مع لابل وأخطاء التحقق)  
- ✅ Textarea (نص متعدد الأسطر)
- ✅ Select/Dropdown (مع خيارات ديناميكية)
- ✅ Checkbox (منفرد أو مجموعة)
- ✅ RadioGroup (اختيار واحد من عدة خيارات)
- ✅ Toggle/Switch (تشغيل/إيقاف)
- ✅ DatePicker (تاريخ ووقت)

### ✅ **عناصر عرض المحتوى:**
- ✅ Card (حاوية بمظهر موحّد)
- ✅ Modal/Dialog (نوافذ منبثقة)
- ✅ Tooltip (تلميح عند المرور)
- ✅ Alert/Notification (رسائل نجاح، خطأ، تحذير)
- ✅ Badge/Chip (شارات للحالة أو التصنيف)
- ✅ Avatar (صورة مستخدم مع الأحرف الأولى)
- ✅ Accordion (قسم قابل للفتح والإغلاق)
- ✅ Tabs (تنقل بين أقسام)
- ✅ Table/DataTable (مع ترتيب، تصفية، ترقيم)

### ✅ **التنقّل:**
- ✅ Breadcrumbs (مسار التصفّح)
- ✅ Navbar/Sidebar (متوفر في AppRouter)
- ✅ PageHeader (رأس الصفحة)

### ✅ **النماذج:**
- ✅ FormWrapper (متوفر في FormModal)
- ✅ SearchBar (بحث نصي مع أيقونة)

### ✅ **عناصر مساعدة:**
- ✅ Loader/Spinner/Skeleton (مؤشرات تحميل)
- ✅ Progress Bar (شريط التقدم)
- ✅ EmptyState (شاشة فارغة مع رسالة)
- ✅ Grid (نظام شبكة)
- ✅ Label (تسميات متقدمة)

## نظام الألوان الموحد

```css
/* الألوان الأساسية */
- الأزرق: bg-blue-600 (الأساسي)
- الأخضر: bg-green-600 (النجاح)
- الأحمر: bg-red-600 (الخطأ/الحذف)
- الأصفر: bg-yellow-600 (التحذير)
- الرمادي: bg-gray-600 (الثانوي)
- الأزرق الفاتح: bg-cyan-600 (المعلومات)

/* حالات التفاعل */
- التمرير: hover:bg-color-700
- التركيز: focus-visible:ring-color-500
- المعطل: disabled:opacity-50
```

## أفضل الممارسات

### 1. الاتساق
- استخدم نفس المتغيرات عبر التطبيق
- التزم بنظام الألوان الموحد
- استخدم نفس الأحجام والمسافات

### 2. إمكانية الوصول
- استخدم `Label` مع جميع حقول الإدخال
- أضف `aria-label` للأزرار التي تحتوي أيقونات فقط
- تأكد من التباين المناسب للألوان

### 3. الاستجابة
- استخدم `Grid` مع `responsive={true}` للتخطيطات
- اختبر على أحجام شاشات مختلفة
- استخدم الأحجام المناسبة للأجهزة المحمولة

### 4. الأداء
- استخدم `DataTable` للبيانات الكبيرة مع التصفح
- فعل البحث والتصفية حسب الحاجة
- استخدم `useMemo` للحسابات المعقدة

---

تم إنشاء هذه المكونات لضمان الاتساق والقابلية للإعادة الاستخدام عبر التطبيق. 
يرجى الرجوع إلى هذا الدليل عند إضافة ميزات جديدة.