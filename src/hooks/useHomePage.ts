import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { 
  addRecentBoard, 
  isLocalStorageAvailable 
} from '../lib/utils/localStorage';

export interface UseHomePageReturn {
  isLoading: boolean;
  createNewBoard: () => Promise<void>;
}

export const useHomePage = (): UseHomePageReturn => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const addToRecentBoards = useCallback((boardId: string, isOwner: boolean = false) => {
    if (isLocalStorageAvailable()) {
      addRecentBoard({
        id: boardId,
        name: isOwner ? `Board ${new Date().toLocaleDateString()}` : undefined,
        isOwner
      });
    }
  }, []);

  const navigateToBoard = useCallback((boardId: string) => {
    router.push(`/boards/${boardId}`);
  }, [router]);

  const createNewBoard = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newBoardId = uuidv4();
      addToRecentBoards(newBoardId, true);;
      navigateToBoard(newBoardId);
    } catch (error) {
      console.error('Failed to create board:', error);
      setIsLoading(false);
    }
  }, [isLoading, addToRecentBoards, navigateToBoard]);

  return {
    isLoading,
    createNewBoard,
  };
}; 