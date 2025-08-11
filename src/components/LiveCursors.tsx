import React, { useEffect, useMemo, useRef } from 'react';
import { useClientInfo, useLiveUserActions, useLiveUsers, useViewport } from '@/contexts/BoardContext';
import { LIVE_USER_CONFIG, VIEWPORT_CONFIG } from '@/lib/constants';
import { useThrottle } from '@/hooks/useThrottle';

interface LiveCursorsProps {
  boardRef: React.RefObject<HTMLDivElement|null>;
  getBoardBounds: () => { width: number; height: number; left: number; top: number; } | null;
}

const LiveCursorsComponent: React.FC<LiveCursorsProps> = ({ boardRef, getBoardBounds }) => {
 
  const liveUsers = useLiveUsers();
  const {updateMyPosition, removeMeFromLiveUsers} = useLiveUserActions();
  const myInfo = useClientInfo();
  const viewport = useViewport();
  
  // Use ref for getBoardBounds to avoid stale closures
  const getBoardBoundsRef = useRef(getBoardBounds);
  
  useEffect(() => {
    getBoardBoundsRef.current = getBoardBounds;
  }, [getBoardBounds]);
  
  const positionThrottle = useThrottle({
    onUpdate: (position: unknown) => {
      updateMyPosition(position as { x: number; y: number });
    }
  });

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const handleMouseMove = (e: MouseEvent) => {
      const boardBounds = getBoardBoundsRef.current();
      if (!boardBounds || !boardRef.current) return;

      const isWithinBoard = 
        e.clientX >= boardBounds.left && 
        e.clientX <= boardBounds.left + boardBounds.width &&
        e.clientY >= boardBounds.top && 
        e.clientY <= boardBounds.top + boardBounds.height;

      if (isWithinBoard) {
        const boardX = e.clientX - boardBounds.left;
        const boardY = e.clientY - boardBounds.top;
        
        const CANVAS_CENTER = VIEWPORT_CONFIG.CANVAS_CENTER/viewport.zoomLevel;
        
        // Convert board coordinates to canvas coordinates
        const canvasX = (boardX - viewport.panOffset.x) / viewport.zoomLevel + CANVAS_CENTER;
        const canvasY = (boardY - viewport.panOffset.y) / viewport.zoomLevel + CANVAS_CENTER;

        positionThrottle.throttledFunction({ x: canvasX, y: canvasY });
      }
    };

    board.addEventListener('mousemove', handleMouseMove);
    return () => {
      board.removeEventListener('mousemove', handleMouseMove);
    };
  }, [positionThrottle, viewport, boardRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      removeMeFromLiveUsers();
    }, LIVE_USER_CONFIG.UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [removeMeFromLiveUsers]);

  useEffect(() => {
    return positionThrottle.cleanup;
  }, [positionThrottle]);

  const activeCursors = useMemo(() => {
    const now = Date.now();   
    const filtered = Object.values(liveUsers).filter(user => 
      user.id !== myInfo.id && 
      user.position?.lastUpdate &&
      now - user.position.lastUpdate <= LIVE_USER_CONFIG.INACTIVE_THRESHOLD &&
      !user.hidden &&
      user.name &&
      user.color
    );
    
    return filtered;
  }, [liveUsers, myInfo.id]);

  if (activeCursors.length === 0) {
    return null;
  }

  // Get fresh board bounds for positioning using the ref
  const boardBounds = getBoardBoundsRef.current();
  const boardPosition = boardBounds || { left: 0, top: 0 };

  // Force re-render when viewport changes to ensure correct positioning
  const currentViewport = viewport;


  return (
    <>
      {activeCursors.map((user) => {
        // Convert canvas coordinates to screen coordinates for display
        const CANVAS_CENTER = VIEWPORT_CONFIG.CANVAS_CENTER/currentViewport.zoomLevel;
        
        // Calculate board-relative position
        const boardX = (user.position.x - CANVAS_CENTER) * currentViewport.zoomLevel + currentViewport.panOffset.x;
        const boardY = (user.position.y - CANVAS_CENTER) * currentViewport.zoomLevel + currentViewport.panOffset.y;
        
        // Convert to screen coordinates
        const screenX = boardPosition.left + boardX;
        const screenY = boardPosition.top + boardY;

        return (
          <div
            key={user.id}
            className="fixed pointer-events-none z-[9999]"
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
            }}
          >
            {/* Main cursor SVG */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative drop-shadow-lg"
              style={{
                filter: `drop-shadow(0 2px 4px ${user.color}60)`,
              }}
            >
              <defs>
                <linearGradient id={`gradient-${user.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="#f8f9fa" />
                </linearGradient>
              </defs>
              {/* Cursor arrow shape */}
              <path
                d="M2 2 L2 16 L6.5 12.5 L9 18 L11.5 17 L9 11.5 L15 11.5 L2 2 Z"
                fill={`url(#gradient-${user.id})`}
                stroke={user.color}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Inner highlight for depth */}
              <path
                d="M3.5 3.5 L3.5 13.5 L6.5 11 L8.5 15.5 L9.5 15 L7.5 10.5 L12.5 10.5 L3.5 3.5 Z"
                fill="white"
                opacity="0.9"
              />
            </svg>
            
            {/* Enhanced user name label with better styling */}
            <div
              className="absolute ml-6 mt-1 px-3 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap shadow-xl border border-white/20 backdrop-blur-sm"
              style={{
                backgroundColor: `${user.color}E6`, // Semi-transparent background
                boxShadow: `0 4px 16px ${user.color}40, 0 2px 8px rgba(0,0,0,0.1)`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="tracking-wide">{user.name}</span>
                
                {/* Online indicator */}
                <div className="w-2 h-2 bg-green-400 rounded-full ring-1 ring-green-300/50" />
              </div>
              
              {/* Tooltip arrow */}
              <div
                className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-transparent"
                style={{
                  borderRightColor: `${user.color}E6`,
                }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default LiveCursorsComponent; 