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
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Palette, DollarSign, Home, Star, Edit, Trash2, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface UnitDesign {
  id: number;
  name: string;
  nameAr: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  originalPrice: number;
  finalPrice: number;
  discount: number;
  features: string[];
  appliances: string[];
  maintenanceType: string;
  gasType: string;
  floorPlan: string;
  viewType: string;
  furnishingType: string;
  parkingSpaces: number;
  storageRoom: boolean;
  maidRoom: boolean;
  laundryRoom: boolean;
  kitchenType: string;
  flooring: string;
  paintType: string;
  lightingType: string;
  description: string;
  descriptionAr: string;
  status: string;
}

const UnitDesigns = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [designs, setDesigns] = useState<UnitDesign[]>([
    {
      id: 1,
      name: 'Studio Premium',
      nameAr: 'استوديو مميز',
      area: 450,
      bedrooms: 0,
      bathrooms: 1,
      balconies: 1,
      originalPrice: 85000,
      finalPrice: 80000,
      discount: 6,
      features: ['Balcony', 'Sea View', 'Master Bedroom'],
      appliances: ['AC', 'Washing Machine', 'Refrigerator'],
      maintenanceType: 'Annual',
      gasType: 'Central',
      floorPlan: 'Open Plan',
      viewType: 'Sea View',
      furnishingType: 'Unfurnished',
      parkingSpaces: 1,
      storageRoom: false,
      maidRoom: false,
      laundryRoom: true,
      kitchenType: 'Open Kitchen',
      flooring: 'Ceramic',
      paintType: 'Premium',
      lightingType: 'LED',
      description: 'Modern studio apartment with premium finishes',
      descriptionAr: 'شقة استوديو حديثة مع تشطيبات مميزة',
      status: 'active',
    },
    {
      id: 2,
      name: '1BR Deluxe',
      nameAr: 'غرفة نوم واحدة ديلوكس',
      area: 750,
      bedrooms: 1,
      bathrooms: 2,
      balconies: 2,
      originalPrice: 120000,
      finalPrice: 110000,
      discount: 8,
      features: ['Two Balconies', 'Open View', 'Two Bathrooms'],
      appliances: ['AC', 'Washing Machine', 'Refrigerator', 'Dishwasher'],
      maintenanceType: 'Free',
      gasType: 'Cylinder',
      floorPlan: 'Closed Plan',
      viewType: 'City View',
      furnishingType: 'Semi-Furnished',
      parkingSpaces: 1,
      storageRoom: true,
      maidRoom: false,
      laundryRoom: true,
      kitchenType: 'Closed Kitchen',
      flooring: 'Marble',
      paintType: 'Standard',
      lightingType: 'Mixed',
      description: 'Spacious 1-bedroom apartment with modern amenities',
      descriptionAr: 'شقة واسعة بغرفة نوم واحدة مع وسائل الراحة الحديثة',
      status: 'active',
    },
    {
      id: 3,
      name: '2BR Family',
      nameAr: 'غرفتين نوم عائلية',
      area: 1200,
      bedrooms: 2,
      bathrooms: 3,
      balconies: 3,
      originalPrice: 180000,
      finalPrice: 165000,
      discount: 8,
      features: ['Three Balconies', 'Sea View', 'Master Bedroom', 'Maid Room'],
      appliances: ['AC', 'Washing Machine', 'Refrigerator', 'Dishwasher', 'Oven'],
      maintenanceType: 'Optional',
      gasType: 'Central',
      floorPlan: 'Mixed Plan',
      viewType: 'Sea and City View',
      furnishingType: 'Fully Furnished',
      parkingSpaces: 2,
      storageRoom: true,
      maidRoom: true,
      laundryRoom: true,
      kitchenType: 'Island Kitchen',
      flooring: 'Parquet',
      paintType: 'Premium',
      lightingType: 'Smart LED',
      description: 'Luxurious family apartment with premium amenities',
      descriptionAr: 'شقة عائلية فاخرة مع وسائل الراحة المميزة',
      status: 'active',
    },
  ]);

  const availableFeatures = [
    'Sea View', 'City View', 'Garden View', 'Pool View',
    'Balcony', 'Large Balcony', 'Multiple Balconies',
    'Master Bedroom', 'Walk-in Closet', 'En-suite Bathroom',
    'Storage Room', 'Maid Room', 'Laundry Room',
    'Built-in Wardrobes', 'Study Room', 'Dining Room'
  ];

  const availableAppliances = [
    'Air Conditioner', 'Split AC', 'Central AC',
    'Refrigerator', 'Built-in Refrigerator',
    'Washing Machine', 'Dryer', 'Washer & Dryer',
    'Dishwasher', 'Built-in Dishwasher',
    'Oven', 'Built-in Oven', 'Microwave',
    'Cooktop', 'Hood', 'Water Heater'
  ];

  const maintenanceTypes = [
    { value: 'Free', label: 'مجاني' },
    { value: 'Annual', label: 'سنوي' },
    { value: 'Monthly', label: 'شهري' },
    { value: 'Optional', label: 'اختياري' },
  ];

  const gasTypes = [
    { value: 'Central', label: 'مركزي' },
    { value: 'Cylinder', label: 'أسطوانة' },
    { value: 'None', label: 'لا يوجد' },
  ];

  const floorPlanTypes = [
    { value: 'Open Plan', label: 'مخطط مفتوح' },
    { value: 'Closed Plan', label: 'مخطط مغلق' },
    { value: 'Mixed Plan', label: 'مخطط مختلط' },
  ];

  const viewTypes = [
    { value: 'Sea View', label: 'إطلالة بحرية' },
    { value: 'City View', label: 'إطلالة مدينة' },
    { value: 'Garden View', label: 'إطلالة حديقة' },
    { value: 'Pool View', label: 'إطلالة مسبح' },
    { value: 'Street View', label: 'إطلالة شارع' },
  ];

  const furnishingTypes = [
    { value: 'Unfurnished', label: 'غير مفروش' },
    { value: 'Semi-Furnished', label: 'نصف مفروش' },
    { value: 'Fully Furnished', label: 'مفروش بالكامل' },
  ];

  const kitchenTypes = [
    { value: 'Open Kitchen', label: 'مطبخ مفتوح' },
    { value: 'Closed Kitchen', label: 'مطبخ مغلق' },
    { value: 'Island Kitchen', label: 'مطبخ جزيرة' },
    { value: 'Galley Kitchen', label: 'مطبخ ممر' },
  ];

  const flooringTypes = [
    { value: 'Marble', label: 'رخام' },
    { value: 'Ceramic', label: 'سيراميك' },
    { value: 'Parquet', label: 'باركيه' },
    { value: 'Laminate', label: 'لامينيت' },
    { value: 'Vinyl', label: 'فينيل' },
  ];

  const paintTypes = [
    { value: 'Standard', label: 'عادي' },
    { value: 'Premium', label: 'مميز' },
    { value: 'Luxury', label: 'فاخر' },
  ];

  const lightingTypes = [
    { value: 'Standard', label: 'عادي' },
    { value: 'LED', label: 'LED' },
    { value: 'Smart LED', label: 'LED ذكي' },
    { value: 'Mixed', label: 'مختلط' },
  ];

  const form = useForm({
    defaultValues: {
      name: '',
      nameAr: '',
      area: '',
      bedrooms: '',
      bathrooms: '',
      balconies: '',
      originalPrice: '',
      finalPrice: '',
      discount: '',
      features: [] as string[],
      appliances: [] as string[],
      maintenanceType: '',
      gasType: '',
      floorPlan: '',
      viewType: '',
      furnishingType: '',
      parkingSpaces: '',
      storageRoom: false,
      maidRoom: false,
      laundryRoom: false,
      kitchenType: '',
      flooring: '',
      paintType: '',
      lightingType: '',
      description: '',
      descriptionAr: '',
      status: 'active',
    },
  });

  const onSubmit = (data: any) => {
    const newDesign: UnitDesign = {
      id: designs.length + 1,
      ...data,
      area: parseFloat(data.area),
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseInt(data.bathrooms),
      balconies: parseInt(data.balconies),
      originalPrice: parseFloat(data.originalPrice),
      finalPrice: parseFloat(data.finalPrice),
      discount: parseFloat(data.discount),
      parkingSpaces: parseInt(data.parkingSpaces),
    };
    
    setDesigns([...designs, newDesign]);
    form.reset();
    setIsAddDialogOpen(false);
  };

  const deleteDesign = (id: number) => {
    setDesigns(designs.filter(design => design.id !== id));
  };

  const duplicateDesign = (design: UnitDesign) => {
    const newDesign: UnitDesign = {
      ...design,
      id: designs.length + 1,
      name: `${design.name} - Copy`,
      nameAr: `${design.nameAr} - نسخة`,
    };
    setDesigns([...designs, newDesign]);
  };

  const filteredDesigns = designs.filter(design =>
    design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    design.nameAr.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة تصاميم الوحدات</h1>
          <p className="text-muted-foreground">إنشاء وإدارة قوالب تصميم الوحدات السكنية والتجارية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              إضافة تصميم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة تصميم جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم التصميم (English)</FormLabel>
                          <FormControl>
                            <Input placeholder="Studio Premium" {...field} />
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
                          <FormLabel>اسم التصميم (العربية)</FormLabel>
                          <FormControl>
                            <Input placeholder="استوديو مميز" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المساحة (متر مربع)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="450" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>غرف النوم</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>دورات المياه</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="balconies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الشرفات</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">التسعير</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر الأصلي (درهم)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="85000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="finalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر النهائي (درهم)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="80000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة الخصم (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Layout & Design */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">التخطيط والتصميم</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="floorPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع المخطط</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع المخطط" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {floorPlanTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="viewType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الإطلالة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الإطلالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {viewTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="furnishingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الأثاث</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الأثاث" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {furnishingTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">المرافق الإضافية</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parkingSpaces"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مواقف السيارات</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="storageRoom"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>غرفة تخزين</FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maidRoom"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>غرفة خادمة</FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="laundryRoom"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>غرفة غسيل</FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Finishing & Materials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">التشطيبات والمواد</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="kitchenType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع المطبخ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع المطبخ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {kitchenTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="flooring"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الأرضية</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الأرضية" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {flooringTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="paintType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الدهان</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الدهان" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paintTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="lightingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الإضاءة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الإضاءة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {lightingTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الخدمات</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maintenanceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الصيانة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الصيانة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {maintenanceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="gasType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الغاز</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الغاز" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gasTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Features Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الميزات المتاحة</h3>
                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-3 gap-2">
                          {availableFeatures.map((feature) => (
                            <FormField
                              key={feature}
                              control={form.control}
                              name="features"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={feature}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(feature)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, feature])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== feature
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {feature}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Appliances Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الأجهزة المتاحة</h3>
                  <FormField
                    control={form.control}
                    name="appliances"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-3 gap-2">
                          {availableAppliances.map((appliance) => (
                            <FormField
                              key={appliance}
                              control={form.control}
                              name="appliances"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={appliance}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(appliance)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, appliance])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== appliance
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {appliance}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الوصف</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف (English)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Unit design description..." {...field} />
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
                            <Textarea placeholder="وصف تصميم الوحدة..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    حفظ التصميم
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في التصاميم..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Designs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredDesigns.map((design, index) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="dashboard-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{design.nameAr}</CardTitle>
                      <p className="text-sm text-muted-foreground">{design.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Home className="h-4 w-4 mr-1" />
                        {design.area} متر مربع • {design.bedrooms} غرف نوم • {design.bathrooms} حمام
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => duplicateDesign(design)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDesign(design.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {design.discount > 0 && (
                  <Badge variant="secondary">{design.discount}% خصم</Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="bg-gradient-secondary p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">التسعير</span>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-foreground">
                      {design.finalPrice.toLocaleString()} درهم
                    </span>
                    {design.originalPrice !== design.finalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {design.originalPrice.toLocaleString()} درهم
                      </span>
                    )}
                  </div>
                </div>

                {/* Layout Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">نوع المخطط:</span>
                    <div className="font-medium">{floorPlanTypes.find(t => t.value === design.floorPlan)?.label}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">نوع الإطلالة:</span>
                    <div className="font-medium">{viewTypes.find(t => t.value === design.viewType)?.label}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الأثاث:</span>
                    <div className="font-medium">{furnishingTypes.find(t => t.value === design.furnishingType)?.label}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">مواقف السيارات:</span>
                    <div className="font-medium">{design.parkingSpaces}</div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">الميزات</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {design.features.slice(0, 4).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {design.features.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{design.features.length - 4} المزيد
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">الصيانة:</span>
                    <div className="font-medium">{maintenanceTypes.find(t => t.value === design.maintenanceType)?.label}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الغاز:</span>
                    <div className="font-medium">{gasTypes.find(t => t.value === design.gasType)?.label}</div>
                  </div>
                </div>

                {/* Room Features */}
                <div className="flex gap-2 flex-wrap">
                  {design.storageRoom && (
                    <Badge variant="outline" className="text-xs">غرفة تخزين</Badge>
                  )}
                  {design.maidRoom && (
                    <Badge variant="outline" className="text-xs">غرفة خادمة</Badge>
                  )}
                  {design.laundryRoom && (
                    <Badge variant="outline" className="text-xs">غرفة غسيل</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    تعديل
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => duplicateDesign(design)}>
                    نسخ
                  </Button>
                  <Button className="bg-gradient-primary">
                    تطبيق على الوحدات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredDesigns.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد تصاميم</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'لا توجد تصاميم تطابق البحث' : 'لم يتم إضافة أي تصاميم بعد'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default UnitDesigns;