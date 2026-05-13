'use client';

import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    translateDepartment,
    translateRole,
    translateTeamTitle,
} from '@/components/onboarding/utils/team-i18n';

interface TeamMember {
    name: string;
    role: string;
    isManager: boolean;
    isYou?: boolean;
}

interface TeamCardProps {
    title: string;
    members: TeamMember[];
    department: string;
    dateCreated: string;
    onAddMember?: () => void;
    onManageTeam?: () => void;
}

export function TeamCard({
    title,
    members,
    department,
    dateCreated,
    onAddMember,
    onManageTeam,
}: TeamCardProps) {
    const { t } = useTranslation('teamView');
    const displayTitle = translateTeamTitle(t, title);
    const displayDepartment = translateDepartment(t, department);

    return (
        <div className="flex flex-col rounded-[16px] bg-muted/50 border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/50">
                <h3 className="text-[16px] font-bold text-foreground">{displayTitle}</h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 grow">
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-muted-foreground">
                        {t('teamMembers', { count: members.length })}
                    </p>
                    <div className="space-y-3">
                        {members.map((member, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm ring-1 ring-border"
                            >
                                <div className="space-y-1 text-start rtl:text-end">
                                    <p className="text-sm font-bold text-foreground">
                                        {member.name} {member.isYou && t('roles.you')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {translateRole(t, member.role)}
                                    </p>
                                </div>
                                <div className="text-[14px] text-muted-foreground">
                                    {member.isManager ? t('roles.manager') : t('roles.member')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between pt-4 text-xs">
                    <div className="space-y-1 text-start rtl:text-end">
                        <p className="text-muted-foreground opacity-70">{t('department')}</p>
                        <p className="font-bold text-foreground">{displayDepartment}</p>
                    </div>
                    <div className="space-y-1 text-end rtl:text-start">
                        <p className="text-muted-foreground opacity-70">{t('dateCreated')}</p>
                        <p className="font-bold text-foreground">{dateCreated}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 p-6 pt-0">
                <Button
                    onClick={onAddMember}
                    className="h-11 rounded-[8px] bg-primary text-[14px] font-medium text-primary-foreground hover:bg-primary/90"
                >
                    <UserPlus className="me-2 w-4 h-4" />
                    {t('addMember')}
                </Button>
                <Button
                    variant="secondary"
                    onClick={onManageTeam}
                    className="h-11 rounded-[8px] bg-secondary text-[14px] font-medium text-secondary-foreground hover:bg-secondary/80 border-0"
                >
                    {t('manageTeam')}
                </Button>
            </div>
        </div>
    );
}
