# دليل استخدام المكونات الموحدة

## 🎨 مكونات التصميم الموحد

تم إنشاء مجموعة من المكونات الموحدة لضمان تصميم متسق وسهولة التطوير في المشروع.

## 📋 قائمة المكونات

### 1. **Input - حقل الإدخال الموحد**
```tsx
import { Input } from '../components/ui/Input'

<Input
  label="اسم المستخدم"
  placeholder="أدخل اسم المستخدم"
  variant="default" // default | success | error | warning
  error="هذا الحقل مطلوب"
  helperText="نص مساعد"
  icon={<User className="h-4 w-4" />}
  required
/>
```

### 2. **Select - القائمة المنسدلة الموحدة**
```tsx
import { Select } from '../components/ui/Select'

<Select
  label="اختر البلد"
  placeholder="اختر..."
  options={[
    { value: 1, label: "الإمارات" },
    { value: 2, label: "السعودية", disabled: true }
  ]}
  variant="default"
  onChange={(value) => console.log(value)}
/>
```

### 3. **Grid - الشبكة الموحدة**
```tsx
import { Grid } from '../components/ui/Grid'

<Grid cols={4} gap="lg" responsive>
  <div>العنصر 1</div>
  <div>العنصر 2</div>
  <div>العنصر 3</div>
  <div>العنصر 4</div>
</Grid>
```

### 4. **ActionCard - البطاقة الصغيرة مع الإجراءات**
```tsx
import { ActionCard } from '../components/ui/ActionCard'

<ActionCard
  title="دبي"
  subtitle="Dubai"
  icon={<MapPin className="h-8 w-8 text-blue-500" />}
  badge={{ text: "نشط", variant: "success" }}
  isSelected={true}
  onClick={() => {}}
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

### 5. **InfoCard - البطاقة الكبيرة مع المعلومات**
```tsx
import { InfoCard } from '../components/ui/InfoCard'

<InfoCard
  title="دولة الإمارات"
  subtitle="United Arab Emirates"
  description="وصف إضافي للدولة"
  icon={<span className="text-4xl">🇦🇪</span>}
  badges={[
    { text: "AE", variant: "neutral" },
    { text: "نشط", variant: "success" }
  ]}
  onClick={() => {}}
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

### 6. **PageHeader - رأس الصفحة الموحد**
```tsx
import { PageHeader } from '../components/ui/PageHeader'

<PageHeader
  title="إدارة الدول"
  description="قائمة بجميع الدول المتاحة"
  breadcrumbs={[
    { label: "الرئيسية", onClick: () => {} },
    { label: "الدول", isActive: true }
  ]}
  onBack={() => {}}
  actions={
    <Button onClick={() => {}}>
      <Plus className="h-4 w-4 ml-2" />
      إضافة جديد
    </Button>
  }
/>
```

## 🎯 المزايا

### ✅ **تصميم موحد**
- جميع المكونات تتبع نفس نمط التصميم
- ألوان وخطوط وتباعدات متسقة
- تجربة مستخدم موحدة

### ✅ **سهولة التطوير**
- استيراد واحد لكل مكون
- خصائص واضحة ومفهومة
- أمثلة استخدام جاهزة

### ✅ **مرونة عالية**
- دعم للـ variants المختلفة
- خصائص اختيارية للتخصيص
- دعم للـ responsive design

### ✅ **أداء محسن**
- مكونات مُحسنة للأداء
- TypeScript للحماية من الأخطاء
- Tree shaking للحجم الأمثل

## 🚀 كيفية الاستخدام

### 1. **استيراد المكونات**
```tsx
// استيراد مكون واحد
import { Input } from '../components/ui/Input'

// استيراد عدة مكونات
import { Input, Select, Grid } from '../components/ui'
```

### 2. **استخدام المكونات**
```tsx
const MyPage = () => {
  return (
    <div className="p-6">
      <PageHeader
        title="صفحة جديدة"
        actions={<Button>إضافة</Button>}
      />
      
      <Grid cols={2} gap="lg">
        <Input label="الاسم" placeholder="أدخل الاسم" />
        <Select 
          label="النوع" 
          options={[{ value: 1, label: "نوع 1" }]} 
        />
      </Grid>
      
      <Grid cols={3} gap="md" className="mt-6">
        <ActionCard title="بطاقة 1" />
        <ActionCard title="بطاقة 2" />
        <ActionCard title="بطاقة 3" />
      </Grid>
    </div>
  )
}
```

## 🎨 ألوان المكونات

- **أزرق**: العمليات الأساسية والدول
- **أخضر**: النجاح والمدن
- **أصفر**: التحذيرات والمناطق
- **أحمر**: الأخطاء والحذف
- **رمادي**: العمليات الثانوية

## 📱 Responsive Design

جميع المكونات تدعم التصميم المتجاوب:
- `cols={4}` = 1 عمود على الموبايل، 2 على التابلت، 3 على اللابتوب، 4 على الشاشات الكبيرة
- `gap="lg"` = تباعد كبير بين العناصر
- `responsive={true}` = تفعيل التصميم المتجاوب

هذا النظام يضمن تصميماً موحداً وجميلاً عبر كامل التطبيق! 🎉