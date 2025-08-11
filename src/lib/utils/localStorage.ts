import { handleStorageError } from '.';

export interface RecentBoard {
  id: string;
  name?: string;
  lastAccessed: number;
  isOwner: boolean;
}

const STORAGE_KEYS = {
  RECENT_BOARDS: 'notes-board:recent-boards'
} as const;

export const getRecentBoards = (): RecentBoard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_BOARDS);
    if (!stored) return [];
    
    const boards: RecentBoard[] = JSON.parse(stored);

    return boards
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 10);
  } catch (error) {
    handleStorageError('getRecentBoards', error);
    return [];
  }
};

export const addRecentBoard = (board: Omit<RecentBoard, 'lastAccessed'>): void => {
  try {
    const recentBoards = getRecentBoards();
    const existingIndex = recentBoards.findIndex(b => b.id === board.id);
    
    const newBoard: RecentBoard = {
      ...board,
      lastAccessed: Date.now()
    };
    
    if (existingIndex >= 0) {
      recentBoards[existingIndex] = newBoard;
    } else {
      recentBoards.unshift(newBoard);
    }
    
    const trimmedBoards = recentBoards.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.RECENT_BOARDS, JSON.stringify(trimmedBoards));
  } catch (error) {
    handleStorageError('addRecentBoard', error);
  }
};

export const removeRecentBoard = (boardId: string): void => {
  try {
    const recentBoards = getRecentBoards();
    const filteredBoards = recentBoards.filter(b => b.id !== boardId);
    localStorage.setItem(STORAGE_KEYS.RECENT_BOARDS, JSON.stringify(filteredBoards));
  } catch (error) {
    handleStorageError('removeRecentBoard', error);
  }
};

export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    handleStorageError('isLocalStorageAvailable', error);
    return false;
  }
}; 