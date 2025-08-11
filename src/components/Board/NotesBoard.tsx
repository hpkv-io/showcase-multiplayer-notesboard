import React, { memo } from 'react';
import { useNotes, useBoardActions, useViewport } from '@/contexts/BoardContext';
import { useBoardInteractions } from '@/hooks/useBoardInteractions';
import { useResponsive } from '@/hooks/useResponsive';
import ConnectionOverlay from '../ConnectionOverlay';
import LiveCursors from '../LiveCursors';
import { BoardHeader } from './BoardHeader';
import { MobileBottomToolbar } from './MobileBottomToolbar';
import { BoardEmptyState } from './BoardEmptyState';
import { BoardLatencyDisplay } from './BoardLatencyDisplay';
import { BoardNotes } from './BoardNotes';
import { BoardMinimap } from './BoardMinimap';
import { BoardZoomControls } from './BoardZoomControls';
import { HPKVBadge } from '../HPKVBadge';
import { VIEWPORT_CONFIG } from '@/lib/constants';

const NotesBoardComponent: React.FC = () => {
  const notes = useNotes();
  const { addNote, selectNote } = useBoardActions();
  const { isMobile } = useResponsive();
  const viewport = useViewport();

  const {
    boardRef,
    canvasRef,
    getBoardBounds,
    handleBoardClick,
    handleAddNote,
    handleDoubleClickBoard,
    handlePointerDown,
    handleTouchStart,
    handleTouchEnd,
  } = useBoardInteractions({ addNote, selectNote });

  const showEmptyState = !notes || Object.keys(notes).length === 0;
  
  const canvasTransform = {
    transform: `translate(${viewport.panOffset.x}px, ${viewport.panOffset.y}px) scale(${viewport.zoomLevel})`,
    transformOrigin: '0 0',
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent" tabIndex={0}>
      <ConnectionOverlay />   
      <LiveCursors boardRef={boardRef} getBoardBounds={getBoardBounds} />      
      
      {/* Desktop Header - hidden on mobile */}
      {!isMobile && <BoardHeader onAddNote={handleAddNote} />}

      <div 
        ref={boardRef}
        className={`
          flex-1 relative overflow-hidden board-glass rounded-2xl
          ${isMobile 
            ? 'm-2 mb-20' // Extra bottom margin for mobile toolbar
            : 'm-2 md:m-4'
          }
        `}
        onClick={handleBoardClick}
        onDoubleClick={handleDoubleClickBoard}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: 'grab',
          minHeight: isMobile 
            ? 'calc(100vh - 100px)' // More space without title bar
            : 'calc(100vh - 200px)',
          touchAction: 'none',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
        }}
        role="application"
        aria-label="Notes board area"
        tabIndex={-1}
      >
        {/* Canvas container that will be transformed */}
        <div 
          ref={canvasRef}
          className="absolute origin-top-left"
          style={{
            ...canvasTransform,
            width: '10000px',
            height: '10000px',
            left: `-${VIEWPORT_CONFIG.CANVAS_CENTER}px`,
            top: `-${VIEWPORT_CONFIG.CANVAS_CENTER}px`,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0'
          }}
        >
          <BoardNotes />
        </div>
        
        {showEmptyState && <BoardEmptyState />}
        
        {/* Latency Display - positioned within board area */}
        <div className="absolute top-4 right-4 z-30 pointer-events-auto">
          <BoardLatencyDisplay />
        </div>
      </div>

      {/* Mobile Bottom Toolbar - only on mobile */}
      {isMobile && <MobileBottomToolbar onAddNote={handleAddNote} />}

      {/* Zoom Controls */}
      <BoardZoomControls />

      {/* Board Minimap */}
      <BoardMinimap boardRef={boardRef} />

      {/* Fixed elements at bottom of viewport */}
      {/* HPKV Badge - only show on desktop since mobile has it in toolbar */}
      {!isMobile && (
        <div className="fixed pointer-events-none z-20 bottom-4 left-1/2 transform -translate-x-1/2">
          <HPKVBadge />
        </div>
      )}
    </div>
  );
};

export default memo(NotesBoardComponent);