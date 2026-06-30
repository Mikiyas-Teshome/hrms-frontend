import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLoan,
  fetchLoans,
  createLoan,
  updateLoan,
} from '../loan.actions';
import { CreateLoanInput, UpdateLoanInput } from '../loan.types';

export const useLoan = (id: string) => {
  return useQuery({
    queryKey: ['loan', id],
    queryFn: () => fetchLoan(id),
    enabled: !!id,
  });
};

export const useLoans = (companyId: string, employeeId?: string) => {
  return useQuery({
    queryKey: ['loans', { companyId, employeeId }],
    queryFn: () => fetchLoans(companyId, employeeId),
    enabled: !!companyId,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLoanInput) => createLoan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};

export const useUpdateLoan = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLoanInput) => updateLoan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};
