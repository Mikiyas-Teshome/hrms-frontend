'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  ANNOUNCEMENTS_FOR_CURRENT_USER_QUERY,
  CREATE_AND_PUBLISH_ANNOUNCEMENT_MUTATION,
} from './announcement.queries';
import { AnnouncementRecord, CreateAnnouncementInput } from './announcement.types';
import { revalidatePath } from 'next/cache';

export async function fetchAnnouncementsForCurrentUser(
  limit = 5,
): Promise<AnnouncementRecord[]> {
  const data = await gqlRequest<{ announcementsForCurrentUser: AnnouncementRecord[] }>(
    GraphQLService.NOTIFICATION,
    ANNOUNCEMENTS_FOR_CURRENT_USER_QUERY,
    { limit },
  );
  return data.announcementsForCurrentUser;
}

export async function createAndPublishAnnouncement(
  input: CreateAnnouncementInput,
): Promise<AnnouncementRecord> {
  const data = await gqlRequest<{ createAndPublishAnnouncement: AnnouncementRecord }>(
    GraphQLService.NOTIFICATION,
    CREATE_AND_PUBLISH_ANNOUNCEMENT_MUTATION,
    { input },
  );
  revalidatePath('/dashboard');
  return data.createAndPublishAnnouncement;
}
