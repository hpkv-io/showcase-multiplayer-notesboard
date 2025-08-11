import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { FiMaximize2, FiMinus, FiPlus } from 'react-icons/fi';
import { useNotes, useViewport, useViewportActions } from '@/contexts/BoardContext';
import { useResponsive } from '@/hooks/useResponsive';
import { debounce } from 'lodash';
import { VIEWPORT_CONFIG } from '@/lib/constants';

interface BoardMinimapProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

interface MinimapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

const MinimapCanvas: React.FC<{
  width: number;
  height: number;
  minimapNotes: Array<{ id: string; x: number; y: number; width: number; height: number; color: string }>;
  viewportRect: { x: number; y: number; width: number; height: number };
}> = ({ width, height, minimapNotes, viewportRect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    const gridSize = Math.max(width / 20, 8);
    ctx.strokeStyle = 'rgba(229, 231, 235, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw notes
    minimapNotes.forEach(note => {
      ctx.fillStyle = note.color;
      ctx.fillRect(note.x, note.y, note.width, note.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeRect(note.x, note.y, note.width, note.height);
    });

    // Draw viewport rectangle
    ctx.strokeStyle = 'rgba(59, 130, 246, 1)';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 2;
    ctx.fillRect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height);
    ctx.strokeRect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height);
  }, [width, height, minimapNotes, viewportRect]);

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 touch-manipulation" />;
};

export const BoardMinimap: React.FC<BoardMinimapProps> = memo(({ boardRef, className = '' }) => {
  const { isMobile } = useResponsive();
  const notes = useNotes();
  const viewport = useViewport();
  const { updateViewport, resetViewport } = useViewportActions();
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [contentBounds, setContentBounds] = useState<MinimapBounds>({
    minX: 0,
    minY: 0,
    maxX: 1000,
    maxY: 1000,
    width: 1000,
    height: 1000
  });
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });
  const lastPinchDistance = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const updateDimensions = debounce(() => {
      setBoardDimensions({
        width: board.clientWidth,
        height: board.clientHeight
      });
    }, 50);

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(board);

    return () => {
      resizeObserver.disconnect();
      updateDimensions.cancel();
    };
  }, [boardRef]);

  const calculateContentBounds = useCallback(() => {
    const notesArray = Object.values(notes || {});
    const CANVAS_CENTER = VIEWPORT_CONFIG.CANVAS_CENTER;

    if (notesArray.length === 0) {
      setContentBounds({
        minX: CANVAS_CENTER - 1000,
        minY: CANVAS_CENTER - 1000,
        maxX: CANVAS_CENTER + 1000,
        maxY: CANVAS_CENTER + 1000,
        width: 2000,
        height: 2000
      });
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    notesArray.forEach(note => {
      if (note.position && note.dimensions) {
        minX = Math.min(minX, note.position.x);
        minY = Math.min(minY, note.position.y);
        maxX = Math.max(maxX, note.position.x + note.dimensions.width);
        maxY = Math.max(maxY, note.position.y + note.dimensions.height);
      }
    });

    const padding = 200;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const minWidth = 2000;
    const minHeight = 2000;

    if (maxX - minX < minWidth) {
      const diff = minWidth - (maxX - minX);
      minX -= diff / 2;
      maxX += diff / 2;
    }

    if (maxY - minY < minHeight) {
      const diff = minHeight - (maxY - minY);
      minY -= diff / 2;
      maxY += diff / 2;
    }

    setContentBounds({
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    });
  }, [notes]);

  useEffect(() => {
    calculateContentBounds();
  }, [calculateContentBounds]);

  const getMinimapDimensions = useCallback(() => {
    const width = isMobile ? (isExpanded ? 240 : 180) : (isExpanded ? 360 : 240);
    const height = isMobile ? (isExpanded ? 100 : 90) : (isExpanded ? 160 : 120);
    const scaleX = width / contentBounds.width;
    const scaleY = height / contentBounds.height;

    return { width, height, scaleX, scaleY };
  }, [contentBounds, isMobile, isExpanded]);

  const canvasToMinimap = useCallback(
    (x: number, y: number) => {
      const { scaleX, scaleY } = getMinimapDimensions();
      return {
        x: (x - contentBounds.minX) * scaleX,
        y: (y - contentBounds.minY) * scaleY
      };
    },
    [contentBounds, getMinimapDimensions]
  );

  const minimapToCanvas = useCallback(
    (x: number, y: number) => {
      const { scaleX, scaleY } = getMinimapDimensions();
      return {
        x: x / scaleX + contentBounds.minX,
        y: y / scaleY + contentBounds.minY
      };
    },
    [contentBounds, getMinimapDimensions]
  );

  const getViewportRect = useCallback(() => {
    if (!boardDimensions.width || !boardDimensions.height || !viewport.zoomLevel) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const { width: minimapWidth, height: minimapHeight } = getMinimapDimensions();
    const CANVAS_CENTER = VIEWPORT_CONFIG.CANVAS_CENTER / viewport.zoomLevel;

    const topLeft = {
      x: -viewport.panOffset.x / viewport.zoomLevel + CANVAS_CENTER,
      y: -viewport.panOffset.y / viewport.zoomLevel + CANVAS_CENTER
    };

    const bottomRight = {
      x: topLeft.x + boardDimensions.width / viewport.zoomLevel,
      y: topLeft.y + boardDimensions.height / viewport.zoomLevel
    };

    const minimapTopLeft = canvasToMinimap(topLeft.x, topLeft.y);
    const minimapBottomRight = canvasToMinimap(bottomRight.x, bottomRight.y);

    const x = Math.max(0, Math.min(minimapWidth - (minimapBottomRight.x - minimapTopLeft.x), minimapTopLeft.x));
    const y = Math.max(0, Math.min(minimapHeight - (minimapBottomRight.y - minimapTopLeft.y), minimapTopLeft.y));
    const width = Math.min(minimapWidth, minimapBottomRight.x - minimapTopLeft.x);
    const height = Math.min(minimapHeight, minimapBottomRight.y - minimapTopLeft.y);

    return { x, y, width, height };
  }, [viewport, boardDimensions, canvasToMinimap, getMinimapDimensions]);

  const handleMinimapInteraction = useCallback(
    (clientX: number, clientY: number) => {
      if (!minimapRef.current || !boardRef.current) return;

      const rect = minimapRef.current.getBoundingClientRect();
      const minimapX = clientX - rect.left;
      const minimapY = clientY - rect.top - (isMobile ? 20 : 26);

      const canvasCoords = minimapToCanvas(minimapX, minimapY);
      const CANVAS_CENTER = VIEWPORT_CONFIG.CANVAS_CENTER / viewport.zoomLevel;

      const centerX = boardDimensions.width / 2 / viewport.zoomLevel;
      const centerY = boardDimensions.height / 2 / viewport.zoomLevel;

      updateViewport({
        panOffset: {
          x: -(canvasCoords.x - centerX - CANVAS_CENTER) * viewport.zoomLevel,
          y: -(canvasCoords.y - centerY - CANVAS_CENTER) * viewport.zoomLevel
        }
      });
    },
    [minimapToCanvas, boardDimensions, viewport.zoomLevel, updateViewport, isMobile, boardRef]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging || isTouchDragging) return;
      handleMinimapInteraction(e.clientX, e.clientY);
    },
    [handleMinimapInteraction, isDragging, isTouchDragging]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      touchStartTime.current = Date.now();
      touchStartPosition.current = { x: touch.clientX, y: touch.clientY };
      
      // Don't prevent default to avoid passive event listener issues
      handleMinimapInteraction(touch.clientX, touch.clientY);
    },
    [handleMinimapInteraction]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const currentTime = Date.now();
        const timeDiff = currentTime - touchStartTime.current;
        
        // Start dragging if touch has moved and enough time has passed
        if (touchStartPosition.current && timeDiff > 100) {
          const distance = Math.hypot(
            touch.clientX - touchStartPosition.current.x,
            touch.clientY - touchStartPosition.current.y
          );
          
          if (distance > 10) {
            setIsTouchDragging(true);
            handleMinimapInteraction(touch.clientX, touch.clientY);
          }
        }
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );

        if (!lastPinchDistance.current) {
          lastPinchDistance.current = distance;
          return;
        }

        const delta = distance - lastPinchDistance.current;
        const zoomChange = delta / 100;
        updateViewport({
          zoomLevel: Math.max(0.2, Math.min(5, viewport.zoomLevel + zoomChange))
        });
        lastPinchDistance.current = distance;
      }
    },
    [updateViewport, viewport.zoomLevel, handleMinimapInteraction]
  );

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = null;
    setIsTouchDragging(false);
    touchStartPosition.current = null;
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMinimapInteraction(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMinimapInteraction]);

  const minimapNotes = Object.values(notes || {})
    .filter(note => note.position && note.dimensions && note.color)
    .map(note => {
      const minimapPos = canvasToMinimap(note.position!.x, note.position!.y);
      const { scaleX, scaleY } = getMinimapDimensions();
      return {
        id: note.id,
        x: minimapPos.x,
        y: minimapPos.y,
        width: Math.max(note.dimensions!.width * scaleX, 2),
        height: Math.max(note.dimensions!.height * scaleY, 2),
        color: note.color!
      };
    });

  const { width: minimapWidth, height: minimapHeight } = getMinimapDimensions();
  const viewportRect = getViewportRect();

  return (
    <div
      className={`
        fixed z-50 pointer-events-auto transition-all duration-300
        ${isMobile ? 'bottom-20 right-2' : 'bottom-4 right-4'}
        ${className}
      `}
    >
      <div
        ref={minimapRef}
        role="region"
        aria-label="Minimap for navigating the canvas"
        tabIndex={0}
        onKeyDown={(e) => {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = 100 / viewport.zoomLevel;
            const panOffset = { ...viewport.panOffset };
            if (e.key === 'ArrowUp') panOffset.y += step;
            if (e.key === 'ArrowDown') panOffset.y -= step;
            if (e.key === 'ArrowLeft') panOffset.x += step;
            if (e.key === 'ArrowRight') panOffset.x -= step;
            updateViewport({ panOffset });
          }
        }}
        className={`
          bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl 
          shadow-2xl hover:shadow-3xl transition-all duration-300 select-none overflow-hidden
          ${(isDragging || isTouchDragging) ? 'cursor-grabbing scale-[1.02]' : 'cursor-grab hover:scale-[1.02]'}
          ${isExpanded ? 'ring-2 ring-blue-400/50 shadow-blue-500/20' : ''}
          ${isMobile ? 'mx-auto' : ''}
          ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        style={{
          width: `${minimapWidth}px`,
          height: `${minimapHeight + (isMobile ? 30 : 32)}px`,
          maxWidth: isMobile ? '100%' : 'none'
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-100/90 to-gray-50/90 border-b border-gray-200/50 p-1 flex justify-between items-center">
          <div className="flex gap-1">
            <button
              className={`bg-blue-500/20 hover:bg-blue-500/40 rounded flex items-center justify-center transition-colors touch-manipulation ${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <FiMinus size={isMobile ? 12 : 8} /> : <FiPlus size={isMobile ? 12 : 8} />}
            </button>
            <button
              className={`bg-green-500/20 hover:bg-green-500/40 rounded flex items-center justify-center transition-colors touch-manipulation ${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`}
              onClick={(e) => {
                e.stopPropagation();
                resetViewport();
              }}
              title="Go to origin"
            >
              <FiMaximize2 size={isMobile ? 12 : 8} />
            </button>
          </div>
        </div>
        <div
          className={`relative overflow-hidden touch-manipulation ${isMobile ? 'mt-6' : 'mt-5'}`}
          style={{
            width: `${minimapWidth}px`,
            height: `${minimapHeight}px`,
            background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.05), transparent 70%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.05), transparent 70%), #fafafa'
          }}
          onClick={handleClick}
        >
          <MinimapCanvas
            width={minimapWidth}
            height={minimapHeight}
            minimapNotes={minimapNotes}
            viewportRect={viewportRect}
          />
        </div>
      </div>
    </div>
  );
});

BoardMinimap.displayName = 'BoardMinimap';