import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users, FileText, DollarSign } from 'lucide-react';

export const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    {
      title: 'Add Tower',
      description: 'Create a new tower project',
      icon: Building2,
      color: 'bg-gradient-primary',
      href: '/towers/new',
    },
    {
      title: 'Add Owner',
      description: 'Register a new property owner',
      icon: Users,
      color: 'bg-gradient-success',
      href: '/owners/new',
    },
    {
      title: 'New Contract',
      description: 'Create a rental contract',
      icon: FileText,
      color: 'bg-warning',
      href: '/contracts/new',
    },
    {
      title: 'Record Payment',
      description: 'Log a new payment',
      icon: DollarSign,
      color: 'bg-gradient-success',
      href: '/payments/new',
    },
  ];

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Plus className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex items-center space-x-4 hover:shadow-md transition-all"
              asChild
            >
              <a href={action.href}>
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </a>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};