import { useCallback, useEffect, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Contract } from '../contracts.types';
import { resolveContractEmploymentType } from '../contract-employment-type.util';

export function buildContractsById(...sources: Array<Contract[] | undefined>): Map<string, Contract> {
    const map = new Map<string, Contract>();
    for (const source of sources) {
        for (const contract of source ?? []) {
            map.set(contract.id, contract);
        }
    }
    return map;
}

export function useContractEmploymentTypeSync(
    form: UseFormReturn<any>,
    contractsById: Map<string, Contract>,
) {
    const selectedContractId = form.watch('contractId') as string | undefined;
    const selectedEmploymentType = form.watch('employmentType') as string | undefined;
    const { setValue, getValues } = form;

    const contractsKey = useMemo(
        () =>
            Array.from(contractsById.entries())
                .map(([id, contract]) => `${id}:${contract.employmentType ?? ''}:${contract.contractType ?? ''}`)
                .join('|'),
        [contractsById],
    );

    const syncEmploymentTypeFromContract = useCallback(
        (contractId: string) => {
            const employmentType = resolveContractEmploymentType(contractsById.get(contractId));
            const next = employmentType ?? '';
            const current = getValues('employmentType') ?? '';
            if (next === current) {
                return;
            }
            setValue('employmentType', next, {
                shouldValidate: Boolean(employmentType),
            });
        },
        [contractsById, getValues, setValue],
    );

    useEffect(() => {
        if (!selectedContractId) {
            if (selectedEmploymentType) {
                setValue('employmentType', '', { shouldValidate: false });
            }
            return;
        }

        const employmentType = resolveContractEmploymentType(contractsById.get(selectedContractId));
        const next = employmentType ?? '';
        if (next === (selectedEmploymentType ?? '')) {
            return;
        }
        setValue('employmentType', next, {
            shouldValidate: Boolean(employmentType),
        });
    }, [selectedContractId, selectedEmploymentType, contractsKey, contractsById, setValue]);

    return { selectedContractId, selectedEmploymentType, syncEmploymentTypeFromContract };
}
