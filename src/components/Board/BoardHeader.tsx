import React, { memo, useCallback, useMemo } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { RESPONSIVE_BREAKPOINTS } from '@/lib/constants';
import { getResponsiveConfirmMessage } from '@/lib/utils';
import { BoardShareButton } from './BoardShareButton';
import { FiTrash2, FiZap, FiHome, FiPlus } from 'react-icons/fi';
import { useBoardActions } from '@/contexts/BoardContext';

interface BoardHeaderProps {
  onAddNote: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = memo(({ onAddNote }) => {
  const { isMobile, isLandscape } = useResponsive();
  const { clearBoard } = useBoardActions();

  const handleGoHome = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Force navigation using window.location for reliability
    window.location.href = '/';
  }, []);
  
  const handleClearBoard = useCallback(async () => {
    const message = getResponsiveConfirmMessage('clear', isMobile);
    
    if (window.confirm(message)) {
      await clearBoard();
    }
  }, [clearBoard, isMobile]);

  const headerClasses = useMemo(() => {
    const baseClasses = "sticky top-0 flex items-center justify-between rounded-2xl relative z-[100] transition-all duration-200 glass";
    
    if (isMobile) {
      if (isLandscape) {
        return `${baseClasses} mobile-landscape-header flex-row p-2 m-2 gap-2`;
      } else if (window.innerWidth <= RESPONSIVE_BREAKPOINTS.COMPACT_WIDTH) {
        return `${baseClasses} mobile-header-compact flex-col p-3 m-2 gap-3`;
      } else {
        return `${baseClasses} flex-col md:flex-row p-3 md:p-4 m-2 md:m-4 gap-3 md:gap-0`;
      }
    }
    
    return `${baseClasses} flex-col md:flex-row items-start md:items-center p-3 md:p-4 lg:px-6 m-2 md:m-4 gap-3 md:gap-0`;
  }, [isMobile, isLandscape]);

  return (
    <div className={headerClasses}>
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
        <button 
          onClick={handleGoHome}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="btn btn-secondary btn-mobile mobile-touch-feedback"
          title="Back to Home"
          aria-label="Go back to home page"
        >
          <FiHome size={18} />
          <span className={isMobile && isLandscape ? 'hidden' : 'hidden sm:inline'}>Home</span>
        </button>
        
        <h2 className={`m-0 font-semibold text-gradient ${
          isMobile ? (isLandscape ? 'text-base' : 'text-lg') : 'text-lg md:text-2xl'
        } flex-1 md:flex-none text-center md:text-left`}>
          <span className="hidden md:inline">Collaborative Notes Board</span>
          <span className="md:hidden">{isMobile && isLandscape ? 'Notes' : 'Notes Board'}</span>
        </h2>
        
        <button 
          onClick={onAddNote} 
          className="btn btn-primary btn-mobile mobile-touch-feedback md:hidden"
          title="Add New Note"
          aria-label="Add new note"
        >
          {isMobile && window.innerWidth <= RESPONSIVE_BREAKPOINTS.TINY_WIDTH ? <FiPlus size={18} /> : <FiZap size={18} />}
        </button>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end">
        <button 
          onClick={onAddNote} 
          className="btn btn-primary hidden md:flex mobile-touch-feedback"
          title="Add New Note"
          aria-label="Add new note"
        >
          <FiZap size={20} />
          Add Note
        </button>
        
        <BoardShareButton />
        
        <button 
          onClick={handleClearBoard} 
          className="btn btn-danger btn-mobile mobile-touch-feedback"
          title="Clear All Notes"
          aria-label="Clear all notes from board"
        >
          <FiTrash2 size={18} />
          <span className={isMobile && isLandscape ? 'hidden' : 'hidden sm:inline'}>Clear</span>
        </button>
      </div>
    </div>
  );
});

BoardHeader.displayName = 'BoardHeader'; 