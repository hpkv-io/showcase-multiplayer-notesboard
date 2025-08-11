import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiClock, FiTrash2, FiUsers, FiUser } from 'react-icons/fi';
import { getRecentBoards, handleAPIError, removeRecentBoard, type RecentBoard } from '@/lib/utils';
import { useTurnstile } from '@/contexts/TurnstileContext';

export const RecentBoards: React.FC = () => {
  const router = useRouter();
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([]);
  const { createUrlWithToken } = useTurnstile();
  
  useEffect(() => {
    setRecentBoards(getRecentBoards());
  }, []);

  const handleJoinBoard = (boardId: string) => {
    router.push(`/boards/${boardId}`);
  };

  const handleRemoveBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const deleteUrl = await createUrlWithToken('/api/delete-board', { boardId });
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `Failed to delete board: ${response.status}`);
      }

      removeRecentBoard(boardId);
      setRecentBoards(getRecentBoards());
    } catch (error) {
      console.error('Error deleting board:', error);
      handleAPIError('delete-board-from-recent', error);
    }
  };

  const formatLastAccessed = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (recentBoards.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <FiClock size={16} className="text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary m-0">
          Recent Boards
        </h3>
      </div>

      <div className="
        recent-boards-scroll
        grid 
        grid-cols-[repeat(auto-fill,minmax(280px,1fr))] 
        gap-3 
        max-h-[400px] 
        overflow-y-auto 
        pr-1
      ">
        {recentBoards.slice(0, 4).map((board) => (
          <div
            key={board.id}
            onClick={() => handleJoinBoard(board.id)}
            className="
              flex flex-col gap-3 
              p-4 
              bg-white/80 
              border border-white/40 
              rounded-2xl 
              cursor-pointer 
              transition-all duration-300 ease-out
              relative 
              backdrop-blur-lg 
              min-h-[140px]
              motion-reduce:transition-none
              motion-reduce:hover:transform-none
              hover:bg-white/95 
              hover:-translate-y-1 
              hover:scale-[1.02] 
              hover:shadow-[0_20px_40px_rgba(0,0,0,0.12),0_8px_32px_rgba(59,130,246,0.08)]
            "
          >
            <div className="
              h-15 
              bg-gradient-to-br from-primary-blue/5 to-primary-purple/5 
              rounded-lg 
              flex items-center justify-center 
              relative 
              overflow-hidden
            ">
              <div className="
                absolute top-2 left-2 
                w-5 h-4 
                bg-yellow-200 
                rounded-sm 
                -rotate-3 
                opacity-80
              " />
              <div className="
                absolute top-3 right-3 
                w-[18px] h-[14px] 
                bg-red-200 
                rounded-sm 
                rotate-[5deg] 
                opacity-80
              " />
              <div className="
                absolute bottom-2 left-4 
                w-6 h-[18px] 
                bg-green-200 
                rounded-sm 
                rotate-2 
                opacity-80
              " />

            </div>

            <div className="flex items-start gap-3">
              <div className="
                w-9 h-9 
                bg-primary-gradient 
                rounded-lg 
                flex items-center justify-center 
                text-white 
                flex-shrink-0
              ">
                {board.isOwner ? <FiUser size={16} /> : <FiUsers size={16} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="
                  text-sm 
                  font-medium 
                  text-text-primary 
                  mb-0.5 
                  overflow-hidden 
                  text-ellipsis 
                  whitespace-nowrap
                ">
                  {board.name || board.id}
                </div>
                <div className="
                  text-xs 
                  text-text-muted 
                  flex items-center 
                  gap-2
                ">
                  <span>{formatLastAccessed(board.lastAccessed)}</span>
                  <span>•</span>
                  <span>{board.isOwner ? 'Owner' : 'Member'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => handleRemoveBoard(board.id, e)}
              className="
                w-7 h-7 
                bg-accent-red/10 
                border-0 
                rounded-md 
                text-accent-red 
                cursor-pointer 
                flex items-center justify-center 
                transition-all duration-normal 
                opacity-70 
                flex-shrink-0
                hover:bg-accent-red/20 
                hover:opacity-100
              "
              title="Remove from recent boards"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 