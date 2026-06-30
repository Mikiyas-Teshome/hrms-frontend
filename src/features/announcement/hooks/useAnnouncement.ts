import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAndPublishAnnouncement,
  fetchAnnouncementsForCurrentUser,
} from '../announcement.actions';
import { CreateAnnouncementInput } from '../announcement.types';

export const useAnnouncementsForUser = (limit = 5, enabled = true) => {
  return useQuery({
    queryKey: ['announcements', 'current-user', limit],
    queryFn: () => fetchAnnouncementsForCurrentUser(limit),
    enabled,
  });
};

export const useCreateAndPublishAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) => createAndPublishAnnouncement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
