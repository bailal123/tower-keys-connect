import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building2, MapPin, Home, Eye } from 'lucide-react';

const Towers = () => {
  const { t } = useTranslation();

  const towers = [
    {
      id: 1,
      name: 'Marina Tower A',
      location: 'Dubai Marina, Dubai, UAE',
      totalUnits: 120,
      availableUnits: 45,
      occupancyRate: 62,
      status: 'Active',
      image: '/api/placeholder/300/200',
    },
    {
      id: 2,
      name: 'Business Bay Heights',
      location: 'Business Bay, Dubai, UAE',
      totalUnits: 85,
      availableUnits: 12,
      occupancyRate: 86,
      status: 'Active',
      image: '/api/placeholder/300/200',
    },
    {
      id: 3,
      name: 'Downtown Residence',
      location: 'Downtown Dubai, Dubai, UAE',
      totalUnits: 200,
      availableUnits: 8,
      occupancyRate: 96,
      status: 'Active',
      image: '/api/placeholder/300/200',
    },
  ];

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 70) return 'text-warning';
    return 'text-danger';
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
          <h1 className="text-3xl font-bold text-foreground">{t('navigation.towers')}</h1>
          <p className="text-muted-foreground">Manage your tower properties and units</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Tower
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search towers..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </motion.div>

      {/* Towers Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {towers.map((tower, index) => (
          <motion.div
            key={tower.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="dashboard-card overflow-hidden">
              <div className="h-48 bg-gradient-secondary relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">{tower.status}</Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Building2 className="h-12 w-12 text-white opacity-80" />
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{tower.name}</span>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {tower.location}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-foreground">{tower.totalUnits}</div>
                    <div className="text-xs text-muted-foreground">Total Units</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-success">{tower.availableUnits}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${getOccupancyColor(tower.occupancyRate)}`}>
                      {tower.occupancyRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Occupied</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Home className="h-4 w-4 mr-2" />
                    Units
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Towers;