import React, { createContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export const AUTO_LOCK_STORAGE_KEY = '@afrikad_auto_lock_seconds';

/** Seconds after leaving app before locking. 0 = immediately, -1 = never (still lock on app open). */
export type AutoLockSeconds = number;

export const AUTO_LOCK_OPTIONS: { value: AutoLockSeconds; label: string }[] = [
  { value: 0, label: 'Immediately' },
  { value: 15, label: '15 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 900, label: '15 minutes' },
  { value: -1, label: 'Never' },
];

interface LockContextType {
  isLocked: boolean;
  unlock: () => void;
  autoLockSeconds: AutoLockSeconds;
  setAutoLockSeconds: (seconds: AutoLockSeconds) => Promise<void>;
}

export const LockContext = createContext<LockContextType | undefined>(undefined);

export const useLock = () => {
  const context = React.useContext(LockContext);
  if (context === undefined) {
    throw new Error('useLock must be used within a LockProvider');
  }
  return context;
};

export const LockProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isLocked, setLocked] = useState(false);
  const [autoLockSeconds, setAutoLockSecondsState] = useState<AutoLockSeconds>(0);
  const backgroundedAtRef = useRef<number | null>(null);

  const loadAutoLock = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTO_LOCK_STORAGE_KEY);
      if (raw != null) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) setAutoLockSecondsState(n);
      }
    } catch (e) {
      console.error('Error loading auto-lock setting', e);
    }
  }, []);

  useEffect(() => {
    loadAutoLock();
  }, [loadAutoLock]);

  const setAutoLockSeconds = useCallback(async (seconds: AutoLockSeconds) => {
    setAutoLockSecondsState(seconds);
    await AsyncStorage.setItem(AUTO_LOCK_STORAGE_KEY, String(seconds));
  }, []);

  // When app becomes authenticated (e.g. on load or after login), require unlock (lock on open/refresh).
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      setLocked(true);
    } else {
      setLocked(false);
    }
  }, [isAuthenticated, isLoading]);

  // AppState: lock when returning from background after timeout.
  const autoLockSecondsRef = useRef(autoLockSeconds);
  autoLockSecondsRef.current = autoLockSeconds;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAtRef.current = Date.now();
      }
      if (nextState === 'active') {
        const now = Date.now();
        const at = backgroundedAtRef.current;
        const elapsed = at != null ? (now - at) / 1000 : 0;
        backgroundedAtRef.current = null;
        const timeout = autoLockSecondsRef.current;
        if (timeout === -1) return;
        if (timeout === 0 || elapsed >= timeout) {
          setLocked(true);
        }
      }
    });
    return () => sub.remove();
  }, []);

  const unlock = useCallback(() => {
    setLocked(false);
  }, []);

  return (
    <LockContext.Provider
      value={{
        isLocked,
        unlock,
        autoLockSeconds,
        setAutoLockSeconds,
      }}
    >
      {children}
    </LockContext.Provider>
  );
};
