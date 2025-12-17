// src/AppSync.tsx
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNetworkStore } from './store/networkStore';
import { useSosStore } from './store/sosStore';
import { usePushRegister } from "./hooks/usePushRegister";
import { useLocation } from "./hooks/useLocation";
import { useNotificationHandler } from "./hooks/useNotificationHandler";


const AppSync: React.FC = () => {

  useNotificationHandler();

  usePushRegister();   // 🔔 push token register + sync
  useLocation();       // 📍 live location tracking

  const isOnline = useNetworkStore((s) => s.isOnline);
  const retryPending = useSosStore((s) => s.retryPending);
  const initialized = useRef(false);
  const intervalRef = useRef<number | null>(null);

  // retry on app resume
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        retryPending().catch((e) => console.log('[AppSync] retryPending on resume', e));
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [retryPending]);

  // periodic sync only when online
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
    }

    // clear old interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isOnline) {
      // attempt an immediate retry
      retryPending().catch(() => {});
      // then periodic
      intervalRef.current = setInterval(() => {
        retryPending().catch(() => {});
      }, 20_000) as unknown as number;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOnline, retryPending]);

  return null;
};

export default AppSync;
