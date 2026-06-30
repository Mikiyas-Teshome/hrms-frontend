import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchContractsForOrganizationUnit } from '../contracts.actions';

export const useContractsForOrganizationUnit = (
  ouId?: string,
  options?: { enabled?: boolean },
) => {
  const trimmedOuId = ouId?.trim();
  return useQuery({
    queryKey: ['contracts-for-ou', trimmedOuId],
    queryFn: () => fetchContractsForOrganizationUnit(trimmedOuId!),
    enabled: (options?.enabled ?? true) && Boolean(trimmedOuId),
    placeholderData: keepPreviousData,
  });
};

