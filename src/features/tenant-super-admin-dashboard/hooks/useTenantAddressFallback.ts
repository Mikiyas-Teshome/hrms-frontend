'use client';

import { useMemo } from 'react';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompany } from '@/features/company/hooks/useCompany';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';

function formatTenantLocation(input: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): string | null {
  const address = input.address?.trim();
  if (address) {
    return address;
  }

  const location = [input.city, input.state, input.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

  return location || null;
}

export function useTenantAddressFallback() {
  const { data: profile } = useProfile();
  const { data: hierarchy } = useOrganizationHierarchy();
  const { data: company } = useCompany(profile?.companyId ?? '');

  return useMemo(() => {
    const rootAddress = hierarchy?.[0]?.companyProfile?.address?.trim();
    if (rootAddress) {
      return rootAddress;
    }

    return formatTenantLocation({
      address: company?.address,
      city: company?.city,
      state: company?.state,
      country: company?.country,
    });
  }, [company, hierarchy]);
}
