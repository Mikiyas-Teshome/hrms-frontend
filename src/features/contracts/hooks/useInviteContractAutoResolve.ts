import { useEffect, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useContractsForOrganizationUnit } from './useContractsForOrganizationUnit';
import { resolveContractEmploymentType } from '../contract-employment-type.util';

function toContractOptions(contracts: { id: string; contractName?: string; contractNumber: string }[]) {
  return contracts.map((contract) => ({
    label: contract.contractName || `Contract ${contract.contractNumber}`,
    value: contract.id,
  }));
}

export function useInviteContractAutoResolve(
  form: UseFormReturn<any>,
  departmentOuId?: string,
) {
  const { data, isFetching, isFetched } = useContractsForOrganizationUnit(departmentOuId);
  const { setValue, getValues } = form;

  const departmentContracts = useMemo(() => data ?? [], [data]);
  const contractIdsKey = useMemo(
    () => departmentContracts.map((contract) => contract.id).join('|'),
    [departmentContracts],
  );

  useEffect(() => {
    if (!departmentOuId) {
      const current = getValues('contractId');
      if (current) {
        setValue('contractId', '', { shouldValidate: false, shouldDirty: false });
      }
      return;
    }

    if (!isFetched || isFetching) {
      return;
    }

    if (departmentContracts.length === 0) {
      const current = getValues('contractId');
      if (current) {
        setValue('contractId', '', { shouldValidate: false, shouldDirty: false });
      }
      return;
    }

    const currentContractId = getValues('contractId');
    const stillValid = departmentContracts.some((contract) => contract.id === currentContractId);
    if (!stillValid) {
      const nextContract = departmentContracts[0];
      const nextId = nextContract.id;
      if (currentContractId !== nextId) {
        setValue('contractId', nextId, { shouldValidate: false, shouldDirty: false });
        const employmentType = resolveContractEmploymentType(nextContract);
        setValue('employmentType', employmentType ?? '', {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [departmentOuId, contractIdsKey, isFetched, isFetching, departmentContracts, getValues, setValue]);

  const contractOptions = useMemo(() => toContractOptions(departmentContracts), [departmentContracts]);

  return {
    departmentContracts,
    contractOptions,
    isResolvingContract: Boolean(departmentOuId) && isFetching,
  };
}
