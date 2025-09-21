import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Package, Edit, Trash2, Zap, Home, Star, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Appliances = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Sample appliances data
  const [appliances, setAppliances] = useState([
    {
      id: 1,
      name: 'Split Air Conditioner',
      nameAr: 'مكيف هواء سبليت',
      category: 'Cooling',
      categoryAr: 'التبريد',
      brand: 'Samsung',
      model: 'AR12TXHQASINEU',
      power: '1.5 HP',
      energyRating: 'A++',
      price: 1250,
      isStandard: true,
      maintenanceRequired: true,
      warranty: '2 years',
      description: 'High efficiency split AC unit with inverter technology',
      descriptionAr: 'وحدة تكييف سبليت عالية الكفاءة مع تقنية الانفرتر',
      icon: 'ac',
      status: 'active',
    },
    {
      id: 2,
      name: 'Built-in Refrigerator',
      nameAr: 'ثلاجة مدمجة',
      category: 'Kitchen',
      categoryAr: 'المطبخ',
      brand: 'LG',
      model: 'GR-X31FGNHL',
      power: '150W',
      energyRating: 'A+',
      price: 2850,
      isStandard: true,
      maintenanceRequired: false,
      warranty: '3 years',
      description: 'Large capacity built-in refrigerator with smart features',
      descriptionAr: 'ثلاجة مدمجة كبيرة السعة مع ميزات ذكية',
      icon: 'refrigerator',
      status: 'active',
    },
    {
      id: 3,
      name: 'Front Load Washing Machine',
      nameAr: 'غسالة محمل أمامي',
      category: 'Laundry',
      categoryAr: 'الغسيل',
      brand: 'Bosch',
      model: 'WAT28400UC',
      power: '2100W',
      energyRating: 'A+++',
      price: 1650,
      isStandard: false,
      maintenanceRequired: true,
      warranty: '2 years',
      description: 'Energy efficient front load washer with multiple cycles',
      descriptionAr: 'غسالة محمل أمامي موفرة للطاقة مع دورات متعددة',
      icon: 'washing-machine',
      status: 'active',
    },
    {
      id: 4,
      name: 'Built-in Dishwasher',
      nameAr: 'غسالة أطباق مدمجة',
      category: 'Kitchen',
      categoryAr: 'المطبخ',
      brand: 'Siemens',
      model: 'SN236I00KE',
      power: '2400W',
      energyRating: 'A++',
      price: 2200,
      isStandard: false,
      maintenanceRequired: true,
      warranty: '2 years',
      description: 'Quiet operation built-in dishwasher with multiple programs',
      descriptionAr: 'غسالة أطباق مدمجة هادئة التشغيل مع برامج متعددة',
      icon: 'dishwasher',
      status: 'active',
    },
    {
      id: 5,
      name: 'Electric Oven',
      nameAr: 'فرن كهربائي',
      category: 'Kitchen',
      categoryAr: 'المطبخ',
      brand: 'Whirlpool',
      model: 'WOS51EC0AS',
      power: '3500W',
      energyRating: 'A',
      price: 1800,
      isStandard: false,
      maintenanceRequired: false,
      warranty: '1 year',
      description: 'Built-in electric oven with convection technology',
      descriptionAr: 'فرن كهربائي مدمج مع تقنية الحمل الحراري',
      icon: 'oven',
      status: 'active',
    },
  ]);

  const categories = [
    { value: 'Kitchen', label: 'المطبخ', labelEn: 'Kitchen' },
    { value: 'Cooling', label: 'التبريد', labelEn: 'Cooling' },
    { value: 'Laundry', label: 'الغسيل', labelEn: 'Laundry' },
    { value: 'Lighting', label: 'الإضاءة', labelEn: 'Lighting' },
    { value: 'Security', label: 'الأمان', labelEn: 'Security' },
    { value: 'Entertainment', label: 'الترفيه', labelEn: 'Entertainment' },
  ];

  const energyRatings = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D'];

  const form = useForm({
    defaultValues: {
      name: '',
      nameAr: '',
      category: '',
      brand: '',
      model: '',
      power: '',
      energyRating: '',
      price: '',
      isStandard: false,
      maintenanceRequired: false,
      warranty: '',
      description: '',
      descriptionAr: '',
      status: 'active',
    },
  });

  const onSubmit = (data: any) => {
    const newAppliance = {
      id: appliances.length + 1,
      ...data,
      price: parseFloat(data.price),
    };
    setAppliances([...appliances, newAppliance]);
    form.reset();
    setIsAddDialogOpen(false);
  };

  const deleteAppliance = (id: number) => {
    setAppliances(appliances.filter(app => app.id !== id));
  };

  const filteredAppliances = appliances.filter(appliance =>
    appliance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appliance.nameAr.includes(searchTerm) ||
    appliance.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appliance.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Kitchen': return <Home className="h-4 w-4" />;
      case 'Cooling': return <Zap className="h-4 w-4" />;
      case 'Laundry': return <Settings className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getEnergyRatingColor = (rating: string) => {
    switch (rating) {
      case 'A+++': return 'bg-green-500';
      case 'A++': return 'bg-green-400';
      case 'A+': return 'bg-lime-400';
      case 'A': return 'bg-yellow-400';
      case 'B': return 'bg-orange-400';
      case 'C': return 'bg-red-400';
      case 'D': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الأجهزة والمعدات</h1>
          <p className="text-muted-foreground">إدارة قاعدة بيانات الأجهزة والمعدات المتاحة للوحدات السكنية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              إضافة جهاز جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة جهاز جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الجهاز (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Air Conditioner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الجهاز (العربية)</FormLabel>
                        <FormControl>
                          <Input placeholder="مكيف هواء" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفئة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العلامة التجارية</FormLabel>
                        <FormControl>
                          <Input placeholder="Samsung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموديل</FormLabel>
                        <FormControl>
                          <Input placeholder="AR12TXHQ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="power"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القدرة</FormLabel>
                        <FormControl>
                          <Input placeholder="1.5 HP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="energyRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تصنيف الطاقة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التصنيف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {energyRatings.map((rating) => (
                              <SelectItem key={rating} value={rating}>
                                {rating}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر (درهم)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1250" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="warranty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة الضمان</FormLabel>
                        <FormControl>
                          <Input placeholder="2 years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isStandard"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>جهاز أساسي</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            متضمن في جميع الوحدات
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maintenanceRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>يحتاج صيانة</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            صيانة دورية مطلوبة
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Device description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (العربية)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="وصف الجهاز..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    حفظ الجهاز
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في الأجهزة..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Appliances Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredAppliances.map((appliance, index) => (
          <motion.div
            key={appliance.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(appliance.category)}
                    <div>
                      <CardTitle className="text-lg">{appliance.nameAr}</CardTitle>
                      <p className="text-sm text-muted-foreground">{appliance.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAppliance(appliance.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الفئة:</span>
                  <Badge variant="secondary">{appliance.categoryAr}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">العلامة التجارية:</span>
                  <span className="text-sm font-medium">{appliance.brand}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الموديل:</span>
                  <span className="text-sm font-mono">{appliance.model}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">تصنيف الطاقة:</span>
                  <Badge className={`text-white ${getEnergyRatingColor(appliance.energyRating)}`}>
                    {appliance.energyRating}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">السعر:</span>
                  <span className="text-lg font-bold text-primary">{appliance.price.toLocaleString()} درهم</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {appliance.isStandard && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      أساسي
                    </Badge>
                  )}
                  {appliance.maintenanceRequired && (
                    <Badge variant="outline" className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      يحتاج صيانة
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>القدرة: {appliance.power}</div>
                  <div>الضمان: {appliance.warranty}</div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {appliance.descriptionAr}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredAppliances.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد أجهزة</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'لا توجد أجهزة تطابق البحث' : 'لم يتم إضافة أي أجهزة بعد'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Appliances;