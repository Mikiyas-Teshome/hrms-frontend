'use server';

import { revalidatePath } from 'next/cache';
import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MY_NOTIFICATIONS_QUERY,
  REGISTER_PUSH_DEVICE_TOKEN_MUTATION,
  UNREGISTER_PUSH_DEVICE_TOKEN_MUTATION,
} from './notification.queries';
import { NotificationRecord } from './notification.types';

export async function fetchMyNotifications(): Promise<NotificationRecord[]> {
  try {
    const data = await gqlRequest<{ myNotifications: NotificationRecord[] }>(
      GraphQLService.NOTIFICATION,
      MY_NOTIFICATIONS_QUERY,
      {},
    );
    return data.myNotifications ?? [];
  } catch {
    return [];
  }
}

export async function markNotificationAsRead(
  id: string,
): Promise<ActionResult<NotificationRecord>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ markNotificationAsRead: NotificationRecord }>(
      GraphQLService.NOTIFICATION,
      MARK_NOTIFICATION_AS_READ_MUTATION,
      { id },
    );
    revalidatePath('/dashboard');
    return data.markNotificationAsRead;
  });
}

export async function registerPushDeviceToken(
  token: string,
  platform?: string,
  userAgent?: string,
): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    await gqlRequest<{ registerPushDeviceToken: { id: string } }>(
      GraphQLService.NOTIFICATION,
      REGISTER_PUSH_DEVICE_TOKEN_MUTATION,
      { token, platform, userAgent },
    );
    return true;
  });
}

export async function unregisterPushDeviceToken(
  token: string,
): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    await gqlRequest<{ unregisterPushDeviceToken: boolean }>(
      GraphQLService.NOTIFICATION,
      UNREGISTER_PUSH_DEVICE_TOKEN_MUTATION,
      { token },
    );
    return true;
  });
}
