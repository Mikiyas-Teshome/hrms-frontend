'use client';

import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from './messaging';
import type { FirebaseWebConfig } from './config';

const SW_PATH = '/firebase-messaging-sw.js';

async function ensureServiceWorker(config: FirebaseWebConfig): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.register(SW_PATH);
  await navigator.serviceWorker.ready;

  const target = registration.active ?? registration.installing ?? registration.waiting;
  target?.postMessage({
    type: 'FIREBASE_CONFIG',
    config: {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    },
  });

  return registration;
}

export async function requestPushToken(config: FirebaseWebConfig): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const registration = await ensureServiceWorker(config);
  if (!registration) {
    return null;
  }

  const messaging = await getFirebaseMessaging(config);
  if (!messaging) {
    return null;
  }

  return getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration,
  });
}

export async function clearPushToken(config: FirebaseWebConfig, token: string): Promise<void> {
  const messaging = await getFirebaseMessaging(config);
  if (!messaging) {
    return;
  }

  const { deleteToken } = await import('firebase/messaging');
  await deleteToken(messaging);
  void token;
}
