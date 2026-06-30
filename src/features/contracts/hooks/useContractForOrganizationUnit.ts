import { useQuery } from '@tanstack/react-query';
import { fetchContractForOrganizationUnit } from '../contracts.actions';

export const useContractForOrganizationUnit = (
  ouId?: string,
  options?: { enabled?: boolean },
) => {
  const trimmedOuId = ouId?.trim();
  return useQuery({
    queryKey: ['contract-for-ou', trimmedOuId],
    queryFn: () => fetchContractForOrganizationUnit(trimmedOuId!),
    enabled: (options?.enabled ?? true) && Boolean(trimmedOuId),
  });
};
