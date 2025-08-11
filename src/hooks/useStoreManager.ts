import { useRef, useState, useCallback, useEffect } from 'react';
import { createNotesStore, NotesStoreType } from '@/lib/store';
import { logError, ErrorSeverity } from '@/lib/utils';
import { useTurnstile } from '@/contexts/TurnstileContext';

interface UseStoreManagerOptions {
  onError?: (error: Error) => void;
}

interface UseStoreManagerReturn {
  store: NotesStoreType | null;
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
  initializeStore: (boardId: string) => Promise<void>;
  cleanup: () => Promise<void>;
  retry: () => void;
}

const cleanupStore = async (store: NotesStoreType, context: string): Promise<void> => {
  try {
      await store.multiplayer.disconnect();
      await store.multiplayer.destroy();
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      message: `Error during store cleanup: ${context}`,
      code: 'STORE_CLEANUP_ERROR',
      severity: ErrorSeverity.MEDIUM
    });
  }
};

export const useStoreManager = (
  boardId: string,
  options: UseStoreManagerOptions = {}
): UseStoreManagerReturn => {
  const { onError } = options;
  const storeRef = useRef<NotesStoreType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const cleanupInProgress = useRef(false);
  const currentBoardId = useRef<string | null>(null);
  const { createUrlWithToken } = useTurnstile();

  const cleanup = useCallback(async (): Promise<void> => {
    if (storeRef.current && !cleanupInProgress.current) {
      cleanupInProgress.current = true;
      try {
        await cleanupStore(storeRef.current, 'manual cleanup');
      } finally {
        cleanupInProgress.current = false;
        storeRef.current = null;
        setIsInitialized(false);
      }
    }
  }, []);

  const initializeStore = useCallback(async (newBoardId: string): Promise<void> => {
    if (currentBoardId.current === newBoardId && storeRef.current && isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await cleanup();
      const tokenGenerationUrl = await createUrlWithToken('/api/generate-token');
      storeRef.current = createNotesStore(newBoardId,tokenGenerationUrl);
      currentBoardId.current = newBoardId;
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      logError(error, {
        message: `Failed to initialize board store for boardId: ${newBoardId}`,
        code: 'STORE_INIT_ERROR',
        severity: ErrorSeverity.HIGH,
        context: { boardId: newBoardId }
      });
    } finally {
      setIsLoading(false);
    }
  }, [cleanup, onError, isInitialized, createUrlWithToken]);

  const retry = useCallback(() => {
    if (boardId) {
      initializeStore(boardId);
    }
  }, [boardId, initializeStore]);

  // Initialize store when boardId changes
  useEffect(() => {
    if (boardId && boardId !== currentBoardId.current) {
      initializeStore(boardId);
    }
  }, [boardId, initializeStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (storeRef.current && !cleanupInProgress.current) {
        cleanupInProgress.current = true;
        // Use void to handle promise without awaiting in cleanup
        void cleanupStore(storeRef.current, 'component unmount').finally(() => {
          cleanupInProgress.current = false;
        });
        storeRef.current = null;
      }
    };
  }, []);

  return {
    store: storeRef.current,
    isLoading,
    error,
    isInitialized,
    initializeStore,
    cleanup,
    retry
  };
}; 