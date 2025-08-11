import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { NotesStoreType } from '@/lib/store';
import { useStoreManager } from '@/hooks/useStoreManager';

interface BoardContextType {
  store: NotesStoreType;
  boardId: string;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const BoardContext = createContext<BoardContextType | null>(null);

interface BoardProviderProps {
  children: ReactNode;
  boardId: string;
  onError?: (error: Error) => void;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ 
  children, 
  boardId, 
  onError 
}) => {
  const { 
    store, 
    isLoading, 
    error, 
    retry 
  } = useStoreManager(boardId, { onError });

  const contextValue = useMemo<BoardContextType | null>(() => {
    if (!store || isLoading) return null;
    return {
      store,
      boardId,
      isLoading,
      error,
      retry
    };
  }, [store, boardId, isLoading, error, retry]);

  if (isLoading || !contextValue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto p-8">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glass">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white animate-pulse"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 font-medium">
              Initializing...
            </span>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Description */}
          <p className="text-center text-gray-500 text-sm leading-relaxed">
            Setting up your collaborative workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-500">Failed to load board</div>
        <button 
          onClick={retry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

// -------------------- Utility hooks --------------------

export const useNotes = () => {
  const { store } = useBoardContext();
  return store((state) => state.notes);
};

export const useNote = (noteId: string) => {
  const { store } = useBoardContext();
  return store((state) => state.notes[noteId]);
};


export const useNoteActions = () => {
  const { store } = useBoardContext();
  return useMemo(() => {
    const state = store.getState();
    return {
      updateNote: state.updateNote,
      deleteNote: state.deleteNote,
      bringToFront: state.bringToFront
    } as const;
  }, [store]);
};

export const useBoardActions = () => {
  const { store } = useBoardContext();
  return useMemo(() => {
    const state = store.getState();
    return {
      addNote: state.addNote,
      selectNote: state.selectNote,
      clearBoard: state.clearBoard,
    } as const;
  }, [store]);
};

export const useConnectionStatus = () => {
  const { store } = useBoardContext();
  return store((state) => state.multiplayer.connectionState);
};

export const useAverageSyncTime = () => {
  const { store } = useBoardContext();
  return store((state) => state.multiplayer.performanceMetrics);
};

export const useClientInfo = () => {
  const { store } = useBoardContext();
  return store((state) => state.myInfo);
};


export const useLiveUsers = () => {
  const { store } = useBoardContext();
  return store((state) => state.liveUsers);
};

export const useLiveUserActions = () => {
  const { store } = useBoardContext();
  return {
    updateMyPosition: store((state) => state.updateMyPosition),
    removeMeFromLiveUsers: store((state) => state.removeMeFromLiveUsers),
  } as const;
};

export const useViewport = () => {
  const { store } = useBoardContext();
  return store((state) => state.viewport);
};

export const useViewportActions = () => {
  const { store } = useBoardContext();
  return useMemo(() => {
    const state = store.getState();
    return {
      updateViewport: state.updateViewport,
      resetViewport: state.resetViewport
    } as const;
  }, [store]);
};