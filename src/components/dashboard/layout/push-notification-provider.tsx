'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyFirebaseWebConfig } from '@/features/company/company.actions';
import { registerPushDeviceToken, unregisterPushDeviceToken } from '@/features/notification/notification.actions';
import { getEnvFirebaseConfig, type FirebaseWebConfig } from '@/lib/firebase/config';
import { subscribeForegroundMessages, getFirebaseMessaging } from '@/lib/firebase/messaging';
import { clearPushToken, requestPushToken } from '@/lib/firebase/register-push';
import { toast } from '@/hooks/use-toast';

const FCM_TOKEN_STORAGE_KEY = 'hrms.fcmToken';
const FCM_PROMPT_DISMISSED_KEY = 'hrms.fcmPromptDismissed';

function mapCompanyConfig(config: {
  firebaseApiKey?: string | null;
  firebaseAppId?: string | null;
  firebaseProjectId?: string | null;
  firebaseMessagingSenderId?: string | null;
  firebaseVapidKey?: string | null;
}): FirebaseWebConfig | null {
  if (
    !config.firebaseApiKey ||
    !config.firebaseAppId ||
    !config.firebaseProjectId ||
    !config.firebaseMessagingSenderId ||
    !config.firebaseVapidKey
  ) {
    return null;
  }

  return {
    apiKey: config.firebaseApiKey,
    authDomain: `${config.firebaseProjectId}.firebaseapp.com`,
    projectId: config.firebaseProjectId,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
    vapidKey: config.firebaseVapidKey,
  };
}

async function resolveFirebaseConfig(): Promise<FirebaseWebConfig | null> {
  const envConfig = getEnvFirebaseConfig();
  if (envConfig) {
    return envConfig;
  }

  const companyConfig = await fetchCompanyFirebaseWebConfig();
  if (!companyConfig?.configured) {
    return null;
  }

  return mapCompanyConfig(companyConfig);
}

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const configRef = useRef<FirebaseWebConfig | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      const storedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      const config = configRef.current;

      if (storedToken) {
        void unregisterPushDeviceToken(storedToken);
        if (config) {
          void clearPushToken(config, storedToken);
        }
        localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
      }

      initializedRef.current = false;
      configRef.current = null;
      return;
    }

    if (initializedRef.current) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const setup = async () => {
      const config = await resolveFirebaseConfig();
      if (!config || cancelled) {
        return;
      }

      configRef.current = config;

      const messaging = await getFirebaseMessaging(config);
      if (!messaging || cancelled) {
        return;
      }

      unsubscribe = subscribeForegroundMessages(messaging, ({ title, body, data }) => {
        if (data.companyId && data.companyId !== user.companyId) {
          return;
        }

        toast({
          title,
          description: body,
        });
        void queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      });

      const permission = Notification.permission;
      if (permission === 'denied') {
        return;
      }

      if (permission === 'default' && localStorage.getItem(FCM_PROMPT_DISMISSED_KEY) === '1') {
        return;
      }

      const token = await requestPushToken(config);
      if (!token || cancelled) {
        if (permission === 'default') {
          localStorage.setItem(FCM_PROMPT_DISMISSED_KEY, '1');
        }
        return;
      }

      const result = await registerPushDeviceToken(token, 'web', navigator.userAgent);
      if (result.success) {
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        initializedRef.current = true;
      }
    };

    void setup();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [isAuthenticated, user, queryClient]);

  return <>{children}</>;
}
