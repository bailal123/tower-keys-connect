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
import { Plus, Search, Star, Edit, Trash2, Home, Shield, Car, Trees, Dumbbell, Waves, MapPin, Wifi, Zap, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface TowerFeature {
  id: number;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  description: string;
  descriptionAr: string;
  isStandard: boolean;
  isPremium: boolean;
  additionalCost: number;
  icon: string;
  status: string;
}

const TowerFeatures = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Sample tower features data
  const [features, setFeatures] = useState<TowerFeature[]>([
    {
      id: 1,
      name: 'Swimming Pool',
      nameAr: 'مسبح',
      category: 'Recreation',
      categoryAr: 'الترفيه',
      description: 'Large outdoor swimming pool with leisure area',
      descriptionAr: 'مسبح خارجي كبير مع منطقة استرخاء',
      isStandard: true,
      isPremium: false,
      additionalCost: 0,
      icon: 'pool',
      status: 'active',
    },
    {
      id: 2,
      name: 'Gym & Fitness Center',
      nameAr: 'صالة رياضية ومركز لياقة',
      category: 'Recreation',
      categoryAr: 'الترفيه',
      description: 'Fully equipped gym with modern fitness equipment',
      descriptionAr: 'صالة رياضية مجهزة بالكامل بأحدث معدات اللياقة',
      isStandard: true,
      isPremium: false,
      additionalCost: 0,
      icon: 'gym',
      status: 'active',
    },
    {
      id: 3,
      name: 'Underground Parking',
      nameAr: 'موقف سيارات تحت الأرض',
      category: 'Parking',
      categoryAr: 'المواقف',
      description: 'Secure underground parking garage with 24/7 access',
      descriptionAr: 'موقف سيارات آمن تحت الأرض مع دخول على مدار الساعة',
      isStandard: true,
      isPremium: false,
      additionalCost: 0,
      icon: 'parking',
      status: 'active',
    },
    {
      id: 4,
      name: '24/7 Security',
      nameAr: 'أمن على مدار الساعة',
      category: 'Security',
      categoryAr: 'الأمان',
      description: 'Round-the-clock security with CCTV surveillance',
      descriptionAr: 'أمن على مدار الساعة مع كاميرات مراقبة',
      isStandard: true,
      isPremium: false,
      additionalCost: 0,
      icon: 'security',
      status: 'active',
    },
    {
      id: 5,
      name: 'Landscaped Gardens',
      nameAr: 'حدائق منسقة',
      category: 'Landscape',
      categoryAr: 'المناظر الطبيعية',
      description: 'Beautiful landscaped gardens and green areas',
      descriptionAr: 'حدائق منسقة جميلة ومناطق خضراء',
      isStandard: true,
      isPremium: false,
      additionalCost: 0,
      icon: 'garden',
      status: 'active',
    },
    {
      id: 6,
      name: 'Sky Lounge',
      nameAr: 'صالة السماء',
      category: 'Recreation',
      categoryAr: 'الترفيه',
      description: 'Exclusive rooftop lounge with panoramic city views',
      descriptionAr: 'صالة حصرية على السطح مع إطلالة بانورامية على المدينة',
      isStandard: false,
      isPremium: true,
      additionalCost: 500,
      icon: 'lounge',
      status: 'active',
    },
    {
      id: 7,
      name: 'Concierge Service',
      nameAr: 'خدمة الكونسيرج',
      category: 'Service',
      categoryAr: 'الخدمات',
      description: 'Professional concierge service for residents',
      descriptionAr: 'خدمة كونسيرج مهنية للسكان',
      isStandard: false,
      isPremium: true,
      additionalCost: 300,
      icon: 'service',
      status: 'active',
    },
    {
      id: 8,
      name: 'High-Speed Internet',
      nameAr: 'إنترنت عالي السرعة',
      category: 'Technology',
      categoryAr: 'التكنولوجيا',
      description: 'Fiber optic internet with high-speed connectivity',
      descriptionAr: 'إنترنت ألياف بصرية مع اتصال عالي السرعة',
      isStandard: true,
      isPremium: false,
      additionalCost: 0,
      icon: 'wifi',
      status: 'active',
    },
    {
      id: 9,
      name: 'Smart Home Integration',
      nameAr: 'تكامل المنزل الذكي',
      category: 'Technology',
      categoryAr: 'التكنولوجيا',
      description: 'Smart home automation and control systems',
      descriptionAr: 'أنظمة أتمتة وتحكم المنزل الذكي',
      isStandard: false,
      isPremium: true,
      additionalCost: 1200,
      icon: 'smart',
      status: 'active',
    },
    {
      id: 10,
      name: 'Children\'s Play Area',
      nameAr: 'منطقة ألعاب الأطفال',
      category: 'Recreation',
      categoryAr: 'الترفيه',
      description: 'Safe and fun play area designed for children',
      descriptionAr: 'منطقة لعب آمنة وممتعة مصممة للأطفال',
      isStandard: true,
      isPremium: false,
      additionalCost: 0,
      icon: 'playground',
      status: 'active',
    },
  ]);

  const categories = [
    { value: 'Recreation', label: 'الترفيه', labelEn: 'Recreation' },
    { value: 'Security', label: 'الأمان', labelEn: 'Security' },
    { value: 'Parking', label: 'المواقف', labelEn: 'Parking' },
    { value: 'Landscape', label: 'المناظر الطبيعية', labelEn: 'Landscape' },
    { value: 'Technology', label: 'التكنولوجيا', labelEn: 'Technology' },
    { value: 'Service', label: 'الخدمات', labelEn: 'Service' },
    { value: 'Utilities', label: 'المرافق', labelEn: 'Utilities' },
  ];

  const form = useForm({
    defaultValues: {
      name: '',
      nameAr: '',
      category: '',
      description: '',
      descriptionAr: '',
      isStandard: false,
      isPremium: false,
      additionalCost: '',
      status: 'active',
    },
  });

  const onSubmit = (data: any) => {
    const newFeature: TowerFeature = {
      id: features.length + 1,
      ...data,
      categoryAr: categories.find(cat => cat.value === data.category)?.label || '',
      additionalCost: parseFloat(data.additionalCost) || 0,
      icon: 'star',
    };
    
    setFeatures([...features, newFeature]);
    form.reset();
    setIsAddDialogOpen(false);
  };

  const deleteFeature = (id: number) => {
    setFeatures(features.filter(feature => feature.id !== id));
  };

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.nameAr.includes(searchTerm) ||
    feature.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.categoryAr.includes(searchTerm)
  );

  const getFeatureIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      pool: Waves,
      gym: Dumbbell,
      parking: Car,
      security: Shield,
      garden: Trees,
      wifi: Wifi,
      smart: Zap,
      service: Home,
      star: Star,
      playground: Home,
      lounge: Home,
    };
    
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Recreation': return 'bg-blue-100 text-blue-800';
      case 'Security': return 'bg-red-100 text-red-800';
      case 'Parking': return 'bg-gray-100 text-gray-800';
      case 'Landscape': return 'bg-green-100 text-green-800';
      case 'Technology': return 'bg-purple-100 text-purple-800';
      case 'Service': return 'bg-orange-100 text-orange-800';
      case 'Utilities': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-foreground">إدارة ميزات الأبراج</h1>
          <p className="text-muted-foreground">إدارة المرافق والميزات المتاحة في الأبراج والمجمعات السكنية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              إضافة ميزة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة ميزة جديدة</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الميزة (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Swimming Pool" {...field} />
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
                        <FormLabel>اسم الميزة (العربية)</FormLabel>
                        <FormControl>
                          <Input placeholder="مسبح" {...field} />
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
                    name="additionalCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التكلفة الإضافية (درهم شهرياً)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
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
                          <FormLabel>ميزة أساسية</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            متضمنة في جميع الوحدات
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
                    name="isPremium"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>ميزة مميزة</FormLabel>
                          <div className="text-xs text-muted-foreground">
                            ميزة حصرية مدفوعة
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
                          <Textarea placeholder="Feature description..." {...field} />
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
                          <Textarea placeholder="وصف الميزة..." {...field} />
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
                    حفظ الميزة
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
            placeholder="البحث في الميزات..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getFeatureIcon(feature.icon)}
                    <div>
                      <CardTitle className="text-lg">{feature.nameAr}</CardTitle>
                      <p className="text-sm text-muted-foreground">{feature.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteFeature(feature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الفئة:</span>
                  <Badge className={getCategoryColor(feature.category)}>
                    {feature.categoryAr}
                  </Badge>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {feature.isStandard && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      أساسية
                    </Badge>
                  )}
                  {feature.isPremium && (
                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      مميزة
                    </Badge>
                  )}
                </div>

                {feature.additionalCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">التكلفة الإضافية:</span>
                    <span className="text-lg font-bold text-primary">
                      {feature.additionalCost.toLocaleString()} درهم/شهر
                    </span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {feature.descriptionAr}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredFeatures.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد ميزات</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'لا توجد ميزات تطابق البحث' : 'لم يتم إضافة أي ميزات بعد'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TowerFeatures;