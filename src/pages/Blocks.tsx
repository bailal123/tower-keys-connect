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
import { Plus, Search, Building, Edit, Trash2, MapPin, Users, Home, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Block {
  id: number;
  name: string;
  nameAr: string;
  towerId: number;
  towerName: string;
  floors: number;
  unitsPerFloor: number;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  blockType: string;
  blockTypeAr: string;
  constructionYear: number;
  maintenanceFee: number;
  hasElevator: boolean;
  hasParkingGarage: boolean;
  hasGarden: boolean;
  hasGym: boolean;
  hasPool: boolean;
  status: string;
  description: string;
  descriptionAr: string;
}

const Blocks = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Sample blocks data
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 1,
      name: 'Block A',
      nameAr: 'المبنى أ',
      towerId: 1,
      towerName: 'Marina Tower',
      floors: 25,
      unitsPerFloor: 4,
      totalUnits: 100,
      occupiedUnits: 85,
      availableUnits: 15,
      blockType: 'Residential',
      blockTypeAr: 'سكني',
      constructionYear: 2020,
      maintenanceFee: 250,
      hasElevator: true,
      hasParkingGarage: true,
      hasGarden: false,
      hasGym: true,
      hasPool: true,
      status: 'active',
      description: 'Main residential block with luxury amenities',
      descriptionAr: 'المبنى السكني الرئيسي مع المرافق الفاخرة',
    },
    {
      id: 2,
      name: 'Block B',
      nameAr: 'المبنى ب',
      towerId: 1,
      towerName: 'Marina Tower',
      floors: 20,
      unitsPerFloor: 6,
      totalUnits: 120,
      occupiedUnits: 95,
      availableUnits: 25,
      blockType: 'Residential',
      blockTypeAr: 'سكني',
      constructionYear: 2021,
      maintenanceFee: 300,
      hasElevator: true,
      hasParkingGarage: true,
      hasGarden: true,
      hasGym: false,
      hasPool: false,
      status: 'active',
      description: 'Family-oriented block with garden views',
      descriptionAr: 'مبنى موجه للعائلات مع إطلالة على الحديقة',
    },
    {
      id: 3,
      name: 'Commercial Block',
      nameAr: 'المبنى التجاري',
      towerId: 2,
      towerName: 'Business Bay Tower',
      floors: 5,
      unitsPerFloor: 8,
      totalUnits: 40,
      occupiedUnits: 35,
      availableUnits: 5,
      blockType: 'Commercial',
      blockTypeAr: 'تجاري',
      constructionYear: 2019,
      maintenanceFee: 150,
      hasElevator: true,
      hasParkingGarage: true,
      hasGarden: false,
      hasGym: false,
      hasPool: false,
      status: 'active',
      description: 'Modern commercial spaces for businesses',
      descriptionAr: 'مساحات تجارية حديثة للأعمال',
    },
    {
      id: 4,
      name: 'Block C',
      nameAr: 'المبنى ج',
      towerId: 3,
      towerName: 'Downtown Residence',
      floors: 30,
      unitsPerFloor: 3,
      totalUnits: 90,
      occupiedUnits: 88,
      availableUnits: 2,
      blockType: 'Luxury',
      blockTypeAr: 'فاخر',
      constructionYear: 2022,
      maintenanceFee: 500,
      hasElevator: true,
      hasParkingGarage: true,
      hasGarden: true,
      hasGym: true,
      hasPool: true,
      status: 'active',
      description: 'Premium luxury residences with full amenities',
      descriptionAr: 'وحدات سكنية فاخرة مع جميع المرافق',
    },
  ]);

  const blockTypes = [
    { value: 'Residential', label: 'سكني', labelEn: 'Residential' },
    { value: 'Commercial', label: 'تجاري', labelEn: 'Commercial' },
    { value: 'Mixed', label: 'مختلط', labelEn: 'Mixed' },
    { value: 'Luxury', label: 'فاخر', labelEn: 'Luxury' },
    { value: 'Affordable', label: 'اقتصادي', labelEn: 'Affordable' },
  ];

  const towers = [
    { id: 1, name: 'Marina Tower' },
    { id: 2, name: 'Business Bay Tower' },
    { id: 3, name: 'Downtown Residence' },
  ];

  const form = useForm({
    defaultValues: {
      name: '',
      nameAr: '',
      towerId: '',
      floors: '',
      unitsPerFloor: '',
      blockType: '',
      constructionYear: '',
      maintenanceFee: '',
      hasElevator: true,
      hasParkingGarage: false,
      hasGarden: false,
      hasGym: false,
      hasPool: false,
      description: '',
      descriptionAr: '',
      status: 'active',
    },
  });

  const onSubmit = (data: any) => {
    const floors = parseInt(data.floors);
    const unitsPerFloor = parseInt(data.unitsPerFloor);
    const totalUnits = floors * unitsPerFloor;
    
    const newBlock: Block = {
      id: blocks.length + 1,
      ...data,
      towerId: parseInt(data.towerId),
      towerName: towers.find(t => t.id === parseInt(data.towerId))?.name || '',
      floors,
      unitsPerFloor,
      totalUnits,
      occupiedUnits: 0,
      availableUnits: totalUnits,
      blockTypeAr: blockTypes.find(bt => bt.value === data.blockType)?.label || '',
      constructionYear: parseInt(data.constructionYear),
      maintenanceFee: parseFloat(data.maintenanceFee),
    };
    
    setBlocks([...blocks, newBlock]);
    form.reset();
    setIsAddDialogOpen(false);
  };

  const deleteBlock = (id: number) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const filteredBlocks = blocks.filter(block =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.nameAr.includes(searchTerm) ||
    block.towerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.blockType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOccupancyRate = (block: Block) => {
    return Math.round((block.occupiedUnits / block.totalUnits) * 100);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'Luxury': return 'bg-purple-100 text-purple-800';
      case 'Commercial': return 'bg-blue-100 text-blue-800';
      case 'Residential': return 'bg-green-100 text-green-800';
      case 'Mixed': return 'bg-orange-100 text-orange-800';
      case 'Affordable': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-foreground">إدارة المباني والكتل السكنية</h1>
          <p className="text-muted-foreground">إدارة المباني والكتل السكنية في المشاريع العقارية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              إضافة مبنى جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة مبنى جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المبنى (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Block A" {...field} />
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
                        <FormLabel>اسم المبنى (العربية)</FormLabel>
                        <FormControl>
                          <Input placeholder="المبنى أ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="towerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البرج التابع له</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر البرج" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {towers.map((tower) => (
                              <SelectItem key={tower.id} value={tower.id.toString()}>
                                {tower.name}
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
                    name="blockType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع المبنى</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع المبنى" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {blockTypes.map((type) => (
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="floors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الطوابق</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unitsPerFloor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوحدات لكل طابق</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="constructionYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سنة البناء</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maintenanceFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رسوم الصيانة الشهرية (درهم)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">المرافق المتاحة</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hasElevator"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>مصعد</FormLabel>
                            <div className="text-xs text-muted-foreground">
                              يحتوي على مصعد
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
                      name="hasParkingGarage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>موقف سيارات</FormLabel>
                            <div className="text-xs text-muted-foreground">
                              يحتوي على موقف سيارات
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
                      name="hasGarden"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>حديقة</FormLabel>
                            <div className="text-xs text-muted-foreground">
                              يحتوي على حديقة
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
                      name="hasGym"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>صالة رياضية</FormLabel>
                            <div className="text-xs text-muted-foreground">
                              يحتوي على صالة رياضية
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
                      name="hasPool"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>مسبح</FormLabel>
                            <div className="text-xs text-muted-foreground">
                              يحتوي على مسبح
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Block description..." {...field} />
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
                          <Textarea placeholder="وصف المبنى..." {...field} />
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
                    حفظ المبنى
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
        className="flex items-center gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في المباني..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Blocks Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredBlocks.map((block, index) => {
          const occupancyRate = getOccupancyRate(block);
          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{block.nameAr}</CardTitle>
                        <p className="text-sm text-muted-foreground">{block.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge className={getBlockTypeColor(block.blockType)}>
                    {block.blockTypeAr}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">البرج:</span>
                    <span className="text-sm font-medium">{block.towerName}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{block.floors} طابق</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      <span>{block.totalUnits} وحدة</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">معدل الإشغال:</span>
                      <span className={`text-sm font-bold ${getOccupancyColor(occupancyRate)}`}>
                        {occupancyRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">مشغولة: </span>
                      <span className="font-semibold">{block.occupiedUnits}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">متاحة: </span>
                      <span className="font-semibold">{block.availableUnits}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">رسوم الصيانة:</span>
                    <span className="text-sm font-bold text-primary">{block.maintenanceFee} درهم/شهر</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>بُني في {block.constructionYear}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1">
                    {block.hasElevator && (
                      <Badge variant="outline" className="text-xs">مصعد</Badge>
                    )}
                    {block.hasParkingGarage && (
                      <Badge variant="outline" className="text-xs">موقف</Badge>
                    )}
                    {block.hasGarden && (
                      <Badge variant="outline" className="text-xs">حديقة</Badge>
                    )}
                    {block.hasGym && (
                      <Badge variant="outline" className="text-xs">جيم</Badge>
                    )}
                    {block.hasPool && (
                      <Badge variant="outline" className="text-xs">مسبح</Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {block.descriptionAr}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredBlocks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">لا توجد مباني</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'لا توجد مباني تطابق البحث' : 'لم يتم إضافة أي مباني بعد'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Blocks;