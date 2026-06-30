'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProTipAlert } from '@/components/onboarding/shared/pro-tip-alert';
import { TeamCard } from '@/components/onboarding/team/team-card';
import { AddMembersModal } from '@/components/onboarding/team/add-members-modal';
import { ManageTeamModal } from '@/components/onboarding/team/manage-team-modal';
import { PublicHeader } from '@/components/common/public-header';
import { OnboardingHeader } from '@/components/onboarding/shared/onboarding-header';
import { USE_MOCK_DATA, mockAllEmployees, mockTeams } from '@/data/mock-teams';

export default function TeamViewPage() {
    const { t } = useTranslation('teamView');
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<{
        title: string;
        department: string;
        members: any[];
    } | null>(null);

    const allEmployees = USE_MOCK_DATA ? mockAllEmployees : [];

    const [teams, setTeams] = useState(USE_MOCK_DATA ? mockTeams : []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <PublicHeader showSave={true} />

            <main className="grow">
                <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
                    <OnboardingHeader title={t('title')} subtitle={t('subtitle')} />

                    <ProTipAlert
                        title={t('proTip.title')}
                        description={t('proTip.description')}
                        buttonText={t('proTip.import')}
                    />

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {teams.map((team, index) => (
                            <TeamCard
                                key={index}
                                title={team.title}
                                members={team.members}
                                department={team.department}
                                dateCreated={team.dateCreated}
                                onAddMember={() => {
                                    setSelectedTeam(team);
                                    setIsAddModalOpen(true);
                                }}
                                onManageTeam={() => {
                                    setSelectedTeam(team);
                                    setIsManageModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <footer className="flex justify-end p-8 max-w-4xl mx-auto w-full rtl:justify-start">
                <Button
                    onClick={() => router.push('/onboarding-complete')}
                    className="h-[40px] w-full md:w-auto px-6 rounded-[8px] bg-primary text-[14px] font-medium hover:bg-primary/90 text-primary-foreground"
                >
                    {t('finishSetup')}
                </Button>
            </footer>

            {selectedTeam && (
                <>
                    <AddMembersModal
                        key={`add-${selectedTeam.title}`}
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        teamName={selectedTeam.title}
                        allEmployees={allEmployees}
                        initialAssigned={selectedTeam.members}
                        onSave={() => {
                            setIsAddModalOpen(false);
                        }}
                    />
                    <ManageTeamModal
                        key={`manage-${selectedTeam.title}`}
                        isOpen={isManageModalOpen}
                        onClose={() => setIsManageModalOpen(false)}
                        team={selectedTeam}
                        onSave={(updatedTeam) => {
                            const updatedTeams = teams.map((t) =>
                                t.title === updatedTeam.title ? updatedTeam : t,
                            );
                            setTeams(updatedTeams);
                        }}
                    />
                </>
            )}
        </div>
    );
}
