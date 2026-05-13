'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function QuickActionsCard() {
    const { t } = useTranslation('dashboard');

    return (
        <Card className="h-full border border-border shadow-sm rounded-2xl bg-card overflow-hidden flex flex-col">
            <CardHeader className="px-6 py-5 border-none">
                <CardTitle className="text-xl font-bold text-foreground tracking-tight">
                    {t('quickActions.title', 'Quick actions')}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-0 flex flex-col h-full">
                <div className="flex flex-col gap-3">
                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-3 bg-muted/50 dark:bg-muted/20 text-foreground hover:bg-muted/80 dark:hover:bg-muted/30 border-none h-11 px-4 rounded-xl text-sm font-semibold transition-all"
                    >
                        <Plus className="h-5 w-5 text-foreground/60" />
                        {t('quickActions.addEmployee', 'Add employee')}
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-3 bg-muted/50 dark:bg-muted/20 text-foreground hover:bg-muted/80 dark:hover:bg-muted/30 border-none h-11 px-4 rounded-xl text-sm font-semibold transition-all"
                    >
                        <Plus className="h-5 w-5 text-foreground/60" />
                        {t('quickActions.addDepartment', 'Add department')}
                    </Button>
                </div>

                <div className="flex flex-col gap-5 mt-8">
                    <button className="text-sm font-bold text-primary underline underline-offset-4 decoration-2 hover:text-[#1e4eb8] text-start transition-colors">
                        {t('quickActions.approveRequests', 'Approve requests')}
                    </button>
                    <button className="text-sm font-bold text-primary underline underline-offset-4 decoration-2 hover:text-[#1e4eb8] text-start transition-colors">
                        {t('quickActions.createAnnouncements', 'Create announcements')}
                    </button>
                    <button className="text-sm font-bold text-primary underline underline-offset-4 decoration-2 hover:text-[#1e4eb8] text-start transition-colors">
                        {t('quickActions.generateReport', 'Generate report')}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
