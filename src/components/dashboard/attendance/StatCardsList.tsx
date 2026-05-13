import React from 'react';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { LucideIcon } from 'lucide-react';

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

interface StatCardsListProps {
  stats: Stat[];
}

const StatCardsList: React.FC<StatCardsListProps> = ({ stats }) => {
  const transformedStats = stats.map(stat => ({
    id: stat.id,
    title: stat.label,
    value: stat.value,
    icon: stat.icon,
    iconColor: stat.iconColor,
    iconBgColor: stat.bgColor,
    borderColor: stat.iconColor === stat.bgColor ? undefined : stat.iconColor // Heuristic to match original design if needed, but let's just pass it
  }));

  return <SummaryStatList stats={transformedStats} />;
};

export default StatCardsList;
