import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, MapPin, Edit, Trash2, Building, Map } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Countries = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('countries');

  // Sample data
  const [countries, setCountries] = useState([
    { id: 1, name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', code: 'AE', cities: 7 },
    { id: 2, name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', code: 'SA', cities: 13 },
    { id: 3, name: 'Qatar', nameAr: 'قطر', code: 'QA', cities: 8 },
  ]);

  const [cities, setCities] = useState([
    { id: 1, name: 'Dubai', nameAr: 'دبي', countryId: 1, countryName: 'UAE', areas: 12 },
    { id: 2, name: 'Abu Dhabi', nameAr: 'أبو ظبي', countryId: 1, countryName: 'UAE', areas: 8 },
    { id: 3, name: 'Riyadh', nameAr: 'الرياض', countryId: 2, countryName: 'Saudi Arabia', areas: 15 },
  ]);

  const [areas, setAreas] = useState([
    { id: 1, name: 'Downtown Dubai', nameAr: 'وسط دبي', cityId: 1, cityName: 'Dubai', towers: 25 },
    { id: 2, name: 'Dubai Marina', nameAr: 'مارينا دبي', cityId: 1, cityName: 'Dubai', towers: 18 },
    { id: 3, name: 'Business Bay', nameAr: 'خليج الأعمال', cityId: 1, cityName: 'Dubai', towers: 22 },
  ]);

  // Form handlers
  const countryForm = useForm();
  const cityForm = useForm();
  const areaForm = useForm();

  const onSubmitCountry = (data: any) => {
    console.log('Country data:', data);
    // Handle country submission
  };

  const onSubmitCity = (data: any) => {
    console.log('City data:', data);
    // Handle city submission
  };

  const onSubmitArea = (data: any) => {
    console.log('Area data:', data);
    // Handle area submission
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
          <h1 className="text-3xl font-bold text-foreground">إدارة البيانات الأساسية</h1>
          <p className="text-muted-foreground">إدارة الدول والمدن والمناطق في محفظتك العقارية</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="countries">الدول</TabsTrigger>
            <TabsTrigger value="cities">المدن</TabsTrigger>
            <TabsTrigger value="areas">المناطق</TabsTrigger>
          </TabsList>

          {/* Countries Tab */}
          <TabsContent value="countries" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="البحث في الدول..." className="pl-10" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة دولة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة دولة جديدة</DialogTitle>
                  </DialogHeader>
                  <Form {...countryForm}>
                    <form onSubmit={countryForm.handleSubmit(onSubmitCountry)} className="space-y-4">
                      <FormField
                        control={countryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم الدولة (بالإنجليزية)</FormLabel>
                            <FormControl>
                              <Input placeholder="United Arab Emirates" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={countryForm.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم الدولة (بالعربية)</FormLabel>
                            <FormControl>
                              <Input placeholder="الإمارات العربية المتحدة" className="font-arabic" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={countryForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كود الدولة</FormLabel>
                            <FormControl>
                              <Input placeholder="AE" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="submit" className="bg-gradient-primary">حفظ</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countries.map((country, index) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-primary rounded-lg">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{country.name}</CardTitle>
                            <p className="text-sm text-muted-foreground font-arabic">{country.nameAr}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">{country.code}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {country.cities} مدينة
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="البحث في المدن..." className="pl-10" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة مدينة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مدينة جديدة</DialogTitle>
                  </DialogHeader>
                  <Form {...cityForm}>
                    <form onSubmit={cityForm.handleSubmit(onSubmitCity)} className="space-y-4">
                      <FormField
                        control={cityForm.control}
                        name="countryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الدولة</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الدولة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country.id} value={country.id.toString()}>
                                    {country.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={cityForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المدينة (بالإنجليزية)</FormLabel>
                            <FormControl>
                              <Input placeholder="Dubai" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={cityForm.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المدينة (بالعربية)</FormLabel>
                            <FormControl>
                              <Input placeholder="دبي" className="font-arabic" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="submit" className="bg-gradient-primary">حفظ</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-primary rounded-lg">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{city.name}</CardTitle>
                            <p className="text-sm text-muted-foreground font-arabic">{city.nameAr}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">{city.countryName}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {city.areas} منطقة
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Areas Tab */}
          <TabsContent value="areas" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="البحث في المناطق..." className="pl-10" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة منطقة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة منطقة جديدة</DialogTitle>
                  </DialogHeader>
                  <Form {...areaForm}>
                    <form onSubmit={areaForm.handleSubmit(onSubmitArea)} className="space-y-4">
                      <FormField
                        control={areaForm.control}
                        name="cityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المدينة</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المدينة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cities.map((city) => (
                                  <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={areaForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المنطقة (بالإنجليزية)</FormLabel>
                            <FormControl>
                              <Input placeholder="Downtown Dubai" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={areaForm.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المنطقة (بالعربية)</FormLabel>
                            <FormControl>
                              <Input placeholder="وسط دبي" className="font-arabic" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="submit" className="bg-gradient-primary">حفظ</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area, index) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="dashboard-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-primary rounded-lg">
                            <Map className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{area.name}</CardTitle>
                            <p className="text-sm text-muted-foreground font-arabic">{area.nameAr}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">{area.cityName}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {area.towers} برج
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Countries;