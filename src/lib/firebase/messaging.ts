'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, onMessage, type Messaging } from 'firebase/messaging';
import type { FirebaseWebConfig } from './config';

let messagingInstance: Messaging | null = null;

export async function getFirebaseMessaging(config: FirebaseWebConfig): Promise<Messaging | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  if (messagingInstance) {
    return messagingInstance;
  }

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        });

  messagingInstance = getMessaging(app as FirebaseApp);
  return messagingInstance;
}

export function subscribeForegroundMessages(
  messaging: Messaging,
  handler: (payload: { title: string; body: string; data: Record<string, string> }) => void,
) {
  return onMessage(messaging, (payload) => {
    const data = (payload.data ?? {}) as Record<string, string>;
    handler({
      title: data.title || payload.notification?.title || 'Notification',
      body: data.body || payload.notification?.body || '',
      data,
    });
  });
}
