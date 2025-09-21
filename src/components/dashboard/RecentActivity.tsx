import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Building2, Users, DollarSign, FileText } from 'lucide-react';

export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      user: 'Ahmed Hassan',
      action: 'Created new tower',
      target: 'Marina Tower A',
      time: '2 minutes ago',
      icon: Building2,
      color: 'text-primary',
    },
    {
      id: 2,
      user: 'Sarah Mohammed',
      action: 'Added new tenant',
      target: 'Unit 1205',
      time: '15 minutes ago',
      icon: Users,
      color: 'text-success',
    },
    {
      id: 3,
      user: 'Mohammed Ali',
      action: 'Payment received',
      target: 'AED 120,000',
      time: '1 hour ago',
      icon: DollarSign,
      color: 'text-warning',
    },
    {
      id: 4,
      user: 'Fatima Al-Zahra',
      action: 'Contract signed',
      target: 'Unit 804',
      time: '3 hours ago',
      icon: FileText,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-primary text-white">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {activity.user}
                </span>
                <span className="text-sm text-muted-foreground">
                  {activity.action}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {activity.target}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {activity.time}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};