'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OrganizationProfileValues } from '../schemas/organization-profile';
import { OrgStructureValues } from '../schemas/org-structure';

interface OnboardingContextType {
    profileData: Partial<OrganizationProfileValues>;
    structureData: Partial<OrgStructureValues>;
    policiesData: any;
    payrollData: any;
    contractsInsurancesData: any;
    teamData: any;
    setProfileData: (data: Partial<OrganizationProfileValues>) => void;
    setStructureData: (data: Partial<OrgStructureValues>) => void;
    setPoliciesData: (data: any) => void;
    setPayrollData: (data: any) => void;
    setContractsInsurancesData: (data: any) => void;
    setTeamData: (data: any) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [profileData, setProfileDataState] = useState<Partial<OrganizationProfileValues>>({});
    const [structureData, setStructureDataState] = useState<Partial<OrgStructureValues>>({});
    const [policiesData, setPoliciesDataState] = useState<any>({});
    const [payrollData, setPayrollDataState] = useState<any>({});
    const [contractsInsurancesData, setContractsInsurancesDataState] = useState<any>({});
    const [teamData, setTeamDataState] = useState<any>({});

    const setProfileData = (data: Partial<OrganizationProfileValues>) => {
        setProfileDataState((prev: Partial<OrganizationProfileValues>) => ({ ...prev, ...data }));
    };

    const setStructureData = (data: Partial<OrgStructureValues>) => {
        setStructureDataState((prev: Partial<OrgStructureValues>) => ({ ...prev, ...data }));
    };

    const setPoliciesData = (data: any) => {
        setPoliciesDataState((prev: any) => ({ ...prev, ...data }));
    };

    const setPayrollData = (data: any) => {
        setPayrollDataState((prev: any) => ({ ...prev, ...data }));
    };

    const setContractsInsurancesData = (data: any) => {
        setContractsInsurancesDataState((prev: any) => ({ ...prev, ...data }));
    };

    const setTeamData = (data: any) => {
        setTeamDataState((prev: any) => ({ ...prev, ...data }));
    };

    return (
        <OnboardingContext.Provider
            value={{
                profileData,
                structureData,
                policiesData,
                payrollData,
                contractsInsurancesData,
                teamData,
                setProfileData,
                setStructureData,
                setPoliciesData,
                setPayrollData,
                setContractsInsurancesData,
                setTeamData,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
