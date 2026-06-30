import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/features/auth/hooks/useAuth';
import {
  useCompanyOptions,
  useOrganizationHierarchy,
} from '@/features/organization/hooks/useOrganization';
import { buildOrganizationUnitOptionsForCompany } from '@/features/organization/organization-unit-options.util';
import type { OrganizationUnitType } from '@/features/organization/organization.types';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { isVisibleRoleName } from '@/features/roles/roles.constants';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { fetchContracts } from '@/features/contracts/contracts.actions';
import { fetchSalaryStructures } from '@/features/payroll/salary-structure/salary-structure.actions';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/features/employee/employee.types';
import type { TemplateMetadata } from '@/lib/excel-template-generator';

export const BULK_INVITE_MAX_ROWS = 100;

function resolveCompanyLabel(company: OrganizationUnitType): string {
  return (
    company.name
    || company.displayLabel
    || company.companyProfile?.legalName
    || company.id
  );
}

function scopedLabel(baseLabel: string, companyLabel: string, multiCompany: boolean): string {
  if (!multiCompany) {
    return baseLabel;
  }
  return `${companyLabel} / ${baseLabel}`;
}

export function useEmployeeImportMetadata() {
  const { t } = useTranslation('employees');
  const { data: profile } = useProfile();
  const { companies, isLoading: companiesLoading } = useCompanyOptions();
  const { data: hierarchy, isLoading: hierarchyLoading } = useOrganizationHierarchy();
  const { data: roles, isLoading: rolesLoading } = useRoles(profile?.companyId);
  const { currencySymbol } = useDisplayCurrency();

  const companyIds = useMemo(() => companies.map((company) => company.id), [companies]);
  const multiCompany = companyIds.length > 1;

  const contractQueries = useQueries({
    queries: companyIds.map((companyId) => ({
      queryKey: ['contracts', { ouId: companyId, limit: 1000 }],
      queryFn: () => fetchContracts({ ouId: companyId, limit: 1000 }),
      enabled: Boolean(companyId),
    })),
  });

  const salaryStructureQueries = useQueries({
    queries: companyIds.map((companyId) => ({
      queryKey: ['salary-structures', { companyId }],
      queryFn: () => fetchSalaryStructures(companyId),
      enabled: Boolean(companyId),
    })),
  });

  const metadata = useMemo((): TemplateMetadata => {
    const companyOptions = companies.map((company) => ({
      label: resolveCompanyLabel(company),
      value: company.id,
    }));

    const companyLabelById = new Map(companyOptions.map((company) => [company.value, company.label]));

    const departments = companyIds.flatMap((companyId) => {
      if (!hierarchy) {
        return [];
      }
      const companyLabel = companyLabelById.get(companyId) ?? companyId;
      return buildOrganizationUnitOptionsForCompany(hierarchy, companyId).map((dept) => {
        const baseLabel = dept.label.trim() || dept.name;
        return {
          label: scopedLabel(baseLabel, companyLabel, multiCompany),
          value: dept.id,
          companyOuId: companyId,
        };
      });
    });

    const roleOptions =
      roles
        ?.filter((role) => !!role.id && isVisibleRoleName(role.name))
        .map((role) => ({ label: role.name, value: role.id! })) ?? [];

    const contractOptions = companyIds.flatMap((companyId, index) => {
      const companyLabel = companyLabelById.get(companyId) ?? companyId;
      const contracts = contractQueries[index]?.data?.data ?? [];
      return contracts.map((contract) => {
        const baseLabel = contract.contractName || `Contract ${contract.contractNumber}`;
        return {
          label: scopedLabel(baseLabel, companyLabel, multiCompany),
          value: contract.id,
          companyOuId: companyId,
        };
      });
    });

    const employmentTypes = EMPLOYMENT_TYPE_OPTIONS.map((option) => ({
      label: t(option.value, option.label),
      value: option.value,
    }));

    const salaryStructureOptions = companyIds.flatMap((companyId, index) => {
      const companyLabel = companyLabelById.get(companyId) ?? companyId;
      const structures = salaryStructureQueries[index]?.data ?? [];
      return structures.map((structure) => ({
        label: scopedLabel(structure.name, companyLabel, multiCompany),
        value: structure.id,
        companyOuId: companyId,
      }));
    });

    return {
      companies: companyOptions,
      departments,
      roles: roleOptions,
      contracts: contractOptions,
      employmentTypes,
      salaryStructures: salaryStructureOptions,
      currencySymbol,
    };
  }, [
    companies,
    companyIds,
    hierarchy,
    roles,
    contractQueries,
    salaryStructureQueries,
    currencySymbol,
    multiCompany,
    t,
  ]);

  const contractsLoading = contractQueries.some((query) => query.isLoading);
  const salaryStructuresLoading = salaryStructureQueries.some((query) => query.isLoading);

  const isLoading =
    companiesLoading
    || hierarchyLoading
    || rolesLoading
    || contractsLoading
    || salaryStructuresLoading;

  const hasCompanies = metadata.companies.length > 0;
  const hasRoles = metadata.roles.length > 0;
  const hasContracts = metadata.contracts.length > 0;
  const hasSalaryStructures = metadata.salaryStructures.length > 0;
  const isReady = hasCompanies && hasRoles && hasContracts && hasSalaryStructures && !isLoading;

  return {
    metadata,
    isLoading,
    isReady,
    hasCompanies,
    hasRoles,
    hasContracts,
    hasSalaryStructures,
  };
}
