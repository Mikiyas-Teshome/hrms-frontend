'use client';

import React from 'react';
import SummaryStatCard from"@/components/dashboard/shared/SummaryStatCard";
import { LucideIcon } from 'lucide-react';

interface Stat {
    id?: string;
    title: string;
    value: string | number;
    icon: LucideIcon | React.ElementType;
    iconColor?: string;
    iconBgColor?: string;
    borderColor?: string;
}

interface SummaryStatListProps {
    stats: Stat[];
    className?: string;
}

const SummaryStatList: React.FC<SummaryStatListProps> = ({ stats, className }) => {
    return (
        <div className="flex gap-4.5 items-center flex-wrap w-full">
            {stats.map((stat, index) => (
                <SummaryStatCard
                    key={stat.id || index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    iconColor={stat.iconColor}
                    iconBgColor={stat.iconBgColor}
                    borderColor={stat.borderColor}
                    className={className}
                />
            ))}
        </div>
    );
};

export default SummaryStatList;
