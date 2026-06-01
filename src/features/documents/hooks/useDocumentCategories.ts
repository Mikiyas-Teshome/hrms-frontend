import { useQuery } from '@tanstack/react-query';
import { fetchDocumentCategories } from '../documents.actions';

export const useDocumentCategories = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['documentCategories'],
    queryFn: () => fetchDocumentCategories(),
    enabled: options?.enabled ?? true,
  });
};
