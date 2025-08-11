import { useAverageSyncTime } from '@/contexts/BoardContext';
import { useRef, useCallback } from 'react';

interface ThrottleConfig {
  onUpdate: (...args: unknown[]) => void;
}


const TARGET_LATENCY_MS = parseInt(process.env.NEXT_PUBLIC_TARGET_LATENCY_MS || '100'); // ms
const BASE_RATE = parseInt(process.env.NEXT_PUBLIC_BASE_RATE || '28'); // requests/second (default: ~35ms delay)
const MIN_RATE = parseInt(process.env.NEXT_PUBLIC_MIN_RATE || '2'); // requests/second (default: ~500ms delay)
const DEFAULT_DELAY = parseInt(process.env.NEXT_PUBLIC_THROTTLE_DEFAULT_DELAY_MS || '35'); // Fallback delay in ms

export const useThrottle = ({ onUpdate }: ThrottleConfig) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const pendingArgsRef = useRef<unknown[]>([]);
  const { averageSyncTime } = useAverageSyncTime();

  const throttledFunction = useCallback((...args: unknown[]) => {
    const now = Date.now();
    // Calculate scaling factor: S = min(1, L_target / L_current)
    const scalingFactor = averageSyncTime > 0 ? Math.min(1, TARGET_LATENCY_MS / averageSyncTime) : 1;
    // Calculate rate: R = R_base * S, with a minimum of R_min
    const rate = Math.max(MIN_RATE, BASE_RATE * scalingFactor);
    // Convert rate (requests/second) to delay (milliseconds)
    const delay = averageSyncTime > 0 ? 1000 / rate : DEFAULT_DELAY;

    pendingArgsRef.current = args;

    if (now - lastUpdateRef.current >= delay) {
      onUpdate(...args);
      lastUpdateRef.current = now;
      pendingArgsRef.current = [];
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const remaining = delay - (now - lastUpdateRef.current);
      timeoutRef.current = setTimeout(() => {
        if (pendingArgsRef.current.length > 0) {
          onUpdate(...pendingArgsRef.current);
          lastUpdateRef.current = Date.now();
          pendingArgsRef.current = [];
        }
        timeoutRef.current = null;
      }, remaining);
    }
  }, [averageSyncTime, onUpdate]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    throttledFunction,
    cleanup
  };
};