import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Position, Dimensions } from '@/lib/types';
import { BOARD_CONFIG, MOBILE_NOTE_CONFIG, UI_TIMING, VIEWPORT_CONFIG } from '@/lib/constants';
import { 
  getOptimalNoteDimensions, 
  getSmartNotePosition} from '@/lib/utils/geometry';
import { useResponsive } from './useResponsive';
import { useViewport, useViewportActions, useNotes } from '@/contexts/BoardContext';

interface BoardBounds {
  width: number;
  height: number;
  left: number;
  top: number;
}

interface UseBoardInteractionsProps {
  addNote: (partialNote: Partial<{ position: Position; dimensions: Dimensions; text: string; color: string }>) => void;
  selectNote: (noteId: string | null) => void;
}

export const useBoardInteractions = ({
  addNote,
  selectNote,

}: UseBoardInteractionsProps) => {
  const { isMobile } = useResponsive();
  const viewport = useViewport();
  const { updateViewport } = useViewportActions();
  const notes = useNotes();
  
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [startPanOffset, setStartPanOffset] = useState({ x: 0, y: 0 });
  const [cachedBounds, setCachedBounds] = useState<BoardBounds | null>(null);
  
  // Pinch-to-zoom state
  const [isPinching, setIsPinching] = useState(false);
  const [startPinchDistance, setStartPinchDistance] = useState(0);
  const [startPinchZoom, setStartPinchZoom] = useState(1);
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 });
  
  // Mobile double-tap state
  const lastTouchTime = useRef(0);
  const lastTouchPosition = useRef({ x: 0, y: 0 });
  const touchMoveThreshold = 10; // pixels

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const updateBounds = () => {
      const rect = board.getBoundingClientRect();
      setCachedBounds({
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      });
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(board);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const getBoardBounds = useCallback(() => {
    return cachedBounds;
  }, [cachedBounds]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!cachedBounds) return { x: 0, y: 0 };
    
    const CANVAS_CENTER = VIEWPORT_CONFIG.CANVAS_CENTER / viewport.zoomLevel;
    const boardX = screenX - cachedBounds.left;
    const boardY = screenY - cachedBounds.top;
    
    return {
      x: (boardX - viewport.panOffset.x) / viewport.zoomLevel + CANVAS_CENTER,
      y: (boardY - viewport.panOffset.y) / viewport.zoomLevel + CANVAS_CENTER
    };
  }, [cachedBounds, viewport]);

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    if (!cachedBounds) return { x: 0, y: 0 };
    
    const CANVAS_CENTER = VIEWPORT_CONFIG.CANVAS_CENTER / viewport.zoomLevel;
    const boardX = (canvasX - CANVAS_CENTER) * viewport.zoomLevel + viewport.panOffset.x;
    const boardY = (canvasY - CANVAS_CENTER) * viewport.zoomLevel + viewport.panOffset.y;
    
    return {
      x: boardX + cachedBounds.left,
      y: boardY + cachedBounds.top
    };
  }, [cachedBounds, viewport]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const isBoard = target === boardRef.current || 
                   (target.parentElement === boardRef.current && !target.closest('[role="button"]'));
    
    if (isBoard && e.button === VIEWPORT_CONFIG.PAN_BUTTON) {
      setIsPanning(true);
      setStartPanPosition({
        x: e.clientX,
        y: e.clientY
      });
      setStartPanOffset({
        x: viewport.panOffset.x,
        y: viewport.panOffset.y
      });
      boardRef.current!.style.cursor = 'grabbing';
    }
  }, [viewport]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning && boardRef.current) {
      const dx = e.clientX - startPanPosition.x;
      const dy = e.clientY - startPanPosition.y;
      
      updateViewport({
        panOffset: {
          x: startPanOffset.x + dx,
          y: startPanOffset.y + dy
        }
      });
    }
  }, [isPanning, startPanPosition, startPanOffset, updateViewport]);

  const handlePointerUp = useCallback(() => {
    if (boardRef.current && isPanning) {
      setIsPanning(false);
      boardRef.current.style.cursor = 'grab';
    }
  }, [isPanning]);

  const handleBoardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isDirectBoardClick = target === boardRef.current || 
                              target === canvasRef.current ||
                              (target.parentElement === canvasRef.current && target.classList.contains('relative')); 
    const clickedOnNote = target.closest('[role="button"][aria-label*="Note"]') || 
                         target.closest('.absolute.select-none.touch-none') ||
                         target.getAttribute('role') === 'button';
    
    if (isDirectBoardClick && !clickedOnNote) {
      selectNote(null);
    }
  }, [selectNote]);

  // Get existing notes for smart positioning
  const getExistingNotes = useCallback(() => {
    return Object.values(notes || {}).map(note => ({
      position: note.position,
      dimensions: note.dimensions
    }));
  }, [notes]);

  const createNoteConfig = useMemo(() => {
    const dimensions = getOptimalNoteDimensions(isMobile);
    const color = isMobile ? MOBILE_NOTE_CONFIG.defaultNoteColor : BOARD_CONFIG.defaultNoteColor;
    
    return {
      dimensions,
      color,
      text: ''
    };
  }, [isMobile]);

  const handleAddNote = useCallback(() => {
    const bounds = getBoardBounds();
    if (!bounds) return;

    const viewportBounds = { width: bounds.width, height: bounds.height };
    const existingNotes = getExistingNotes();
    
    // Calculate center position in canvas coordinates
    const centerScreen = {
      x: bounds.width / 2,
      y: bounds.height / 2
    };
    
    const centerCanvas = screenToCanvas(
      centerScreen.x + bounds.left,
      centerScreen.y + bounds.top
    );

    let position: Position;
    if (isMobile) {
      position = getSmartNotePosition(viewportBounds, existingNotes, true);
      // Convert smart position to canvas coordinates
      const screenPos = canvasToScreen(position.x, position.y);
      position = screenToCanvas(screenPos.x, screenPos.y);
    } else {
      position = {
        x: centerCanvas.x - createNoteConfig.dimensions.width / 2,
        y: centerCanvas.y - createNoteConfig.dimensions.height / 2
      };
    }

    addNote({ 
      position,
      color: createNoteConfig.color,
      dimensions: createNoteConfig.dimensions,
      text: createNoteConfig.text
    });

  }, [getBoardBounds, createNoteConfig, isMobile, getExistingNotes, screenToCanvas, canvasToScreen, addNote]);

  const createNoteAtPosition = useCallback((clientX: number, clientY: number) => {
    const bounds = getBoardBounds();
    if (!bounds) return;

    const canvasPos = screenToCanvas(clientX, clientY);
    
    const position: Position = {
      x: canvasPos.x - createNoteConfig.dimensions.width / 2,
      y: canvasPos.y - createNoteConfig.dimensions.height / 2
    };

    addNote({
      position,
      color: createNoteConfig.color,
      dimensions: createNoteConfig.dimensions,
      text: createNoteConfig.text
    });

  }, [getBoardBounds, createNoteConfig, screenToCanvas, addNote]);

  const handleDoubleClickBoard = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    const isDirectBoardClick = target === boardRef.current || 
                              target === canvasRef.current ||
                              (target.parentElement === canvasRef.current && target.classList.contains('relative'));
    
    const clickedOnNote = target.closest('[role="button"][aria-label*="Note"]') || 
                         target.closest('.absolute.select-none.touch-none') ||
                         target.getAttribute('role') === 'button';
    
    if (isDirectBoardClick && !clickedOnNote) {
      createNoteAtPosition(e.clientX, e.clientY);
    }
  }, [createNoteAtPosition]);

  // Mouse wheel zoom handler
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!cachedBounds) return;
    
    e.preventDefault();
    
    const delta = -e.deltaY * VIEWPORT_CONFIG.ZOOM_WHEEL_SENSITIVITY;
    const newZoom = Math.max(
      VIEWPORT_CONFIG.MIN_ZOOM,
      Math.min(VIEWPORT_CONFIG.MAX_ZOOM, viewport.zoomLevel + delta)
    );
    
    // Calculate zoom around mouse position
    const mouseX = e.clientX - cachedBounds.left;
    const mouseY = e.clientY - cachedBounds.top;
    
    const zoomRatio = newZoom / viewport.zoomLevel;
    
    const newPanX = mouseX - (mouseX - viewport.panOffset.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - viewport.panOffset.y) * zoomRatio;
    
    updateViewport({
      zoomLevel: newZoom,
      panOffset: {
        x: newPanX,
        y: newPanY
      }
    });
  }, [cachedBounds, viewport, updateViewport]);

  // Mobile touch handlers for double-tap
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    
    // Handle pinch-to-zoom
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      setIsPinching(true);
      setStartPinchDistance(distance);
      setStartPinchZoom(viewport.zoomLevel);
      setPinchCenter({ x: centerX, y: centerY });
      
      return;
    }
    
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    
    const isDirectBoardClick = target === boardRef.current || 
                              target === canvasRef.current ||
                              (target.parentElement === canvasRef.current && target.classList.contains('relative'));
    
    const clickedOnNote = target.closest('[role="button"][aria-label*="Note"]') || 
                         target.closest('.absolute.select-none.touch-none') ||
                         target.getAttribute('role') === 'button';
    
    if (!isDirectBoardClick || clickedOnNote) return;
    
    const currentTime = Date.now();
    const currentPosition = { x: touch.clientX, y: touch.clientY };
    
    // Check if this is a double-tap
    const timeDiff = currentTime - lastTouchTime.current;
    const distanceFromLast = Math.sqrt(
      Math.pow(currentPosition.x - lastTouchPosition.current.x, 2) + 
      Math.pow(currentPosition.y - lastTouchPosition.current.y, 2)
    );
    
    if (timeDiff < UI_TIMING.DOUBLE_CLICK_THRESHOLD && distanceFromLast < touchMoveThreshold) {
      // Double-tap detected - create note
      e.preventDefault();
      e.stopPropagation();
      createNoteAtPosition(touch.clientX, touch.clientY);
      // Reset to prevent triple-tap
      lastTouchTime.current = 0;
      lastTouchPosition.current = { x: 0, y: 0 };
    } else {
      // Single tap - update tracking
      lastTouchTime.current = currentTime;
      lastTouchPosition.current = currentPosition;
    }
  }, [isMobile, createNoteAtPosition, touchMoveThreshold, viewport.zoomLevel]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !isPinching || !cachedBounds) return;
    
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const scale = distance / startPinchDistance;
      const newZoom = Math.max(
        VIEWPORT_CONFIG.MIN_ZOOM,
        Math.min(VIEWPORT_CONFIG.MAX_ZOOM, startPinchZoom * scale)
      );
      
      // Calculate zoom around pinch center
      const boardX = pinchCenter.x - cachedBounds.left;
      const boardY = pinchCenter.y - cachedBounds.top;
      
      const zoomRatio = newZoom / viewport.zoomLevel;
      
      const newPanX = boardX - (boardX - viewport.panOffset.x) * zoomRatio;
      const newPanY = boardY - (boardY - viewport.panOffset.y) * zoomRatio;
      
      updateViewport({
        zoomLevel: newZoom,
        panOffset: {
          x: newPanX,
          y: newPanY
        }
      });
    }
  }, [isMobile, isPinching, cachedBounds, startPinchDistance, startPinchZoom, pinchCenter, viewport, updateViewport]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    
    // End pinch-to-zoom
    if (isPinching) {
      setIsPinching(false);
      return;
    }
    
    const target = e.target as HTMLElement;
    const isDirectBoardClick = target === boardRef.current || 
                              target === canvasRef.current ||
                              (target.parentElement === canvasRef.current && target.classList.contains('relative'));
    
    const clickedOnNote = target.closest('[role="button"][aria-label*="Note"]') || 
                         target.closest('.absolute.select-none.touch-none') ||
                         target.getAttribute('role') === 'button';
    
    if (isDirectBoardClick && !clickedOnNote) {
      selectNote(null);
    }
  }, [isMobile, isPinching, selectNote]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const handlePointerMoveGlobal = (e: PointerEvent) => {
      handlePointerMove(e as unknown as React.PointerEvent);
    };

    const handlePointerUpGlobal = () => {
      if (isPanning) {
        handlePointerUp();
      }
    };

    const handleTouchMoveGlobal = (e: TouchEvent) => {
      handleTouchMove(e as unknown as React.TouchEvent<HTMLDivElement>);
    };

    board.addEventListener('pointermove', handlePointerMoveGlobal);
    window.addEventListener('pointerup', handlePointerUpGlobal);
    board.addEventListener('wheel', handleWheel, { passive: false });
    board.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });

    return () => {
      board.removeEventListener('pointermove', handlePointerMoveGlobal);
      window.removeEventListener('pointerup', handlePointerUpGlobal);
      board.removeEventListener('wheel', handleWheel);
      board.removeEventListener('touchmove', handleTouchMoveGlobal);
    };
  }, [handlePointerMove, handlePointerUp, isPanning, handleWheel, handleTouchMove]);


  return useMemo(() => ({
    boardRef,
    canvasRef,
    getBoardBounds,
    screenToCanvas,
    canvasToScreen,
    handleBoardClick,
    handleAddNote,
    createNoteAtPosition,
    handleDoubleClickBoard,
    handlePointerDown,
    handleTouchStart,
    handleTouchEnd,
  }), [
    getBoardBounds,
    screenToCanvas,
    canvasToScreen,
    handleBoardClick,
    handleAddNote,
    createNoteAtPosition,
    handleDoubleClickBoard,
    handlePointerDown,
    handleTouchStart,
    handleTouchEnd,
  ]);
}; 