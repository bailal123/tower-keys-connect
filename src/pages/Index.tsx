import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Building2,
  Home,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('dashboard.totalTowers'),
      value: '24',
      change: { value: 8, type: 'increase' as const },
      icon: Building2,
      gradient: 'bg-gradient-primary',
    },
    {
      title: t('dashboard.availableUnits'),
      value: '156',
      change: { value: 12, type: 'increase' as const },
      icon: Home,
      gradient: 'bg-gradient-success',
    },
    {
      title: t('dashboard.activeContracts'),
      value: '89',
      change: { value: 5, type: 'increase' as const },
      icon: FileText,
      gradient: 'bg-warning',
    },
    {
      title: t('dashboard.monthlyRevenue'),
      value: 'AED 2.4M',
      change: { value: 15, type: 'increase' as const },
      icon: DollarSign,
      gradient: 'bg-gradient-success',
    },
    {
      title: t('dashboard.occupancyRate'),
      value: '87%',
      change: { value: 3, type: 'increase' as const },
      icon: TrendingUp,
      gradient: 'bg-gradient-primary',
    },
    {
      title: t('dashboard.pendingPayments'),
      value: '12',
      change: { value: 2, type: 'decrease' as const },
      icon: Clock,
      gradient: 'bg-warning',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">
          {t('dashboard.overview')}
        </h1>
        <p className="text-muted-foreground">
          Monitor your real estate portfolio performance and key metrics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Index;
