import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Note, Position, Dimensions } from '@/lib/types';
import { getPointerCoordinates, clampDimensions, isDoubleClick, constrainNotePosition } from '@/lib/utils';
import { useThrottle } from './useThrottle';
import { useResponsive } from './useResponsive';

interface UseNoteInteractionsProps {
  note: Note;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onSelectNote: (noteId: string | null) => void;
  onBringToFront: (noteId: string) => void;
  isSelected: boolean;
  boardBounds?: { width: number; height: number };
}

interface InteractionState {
  isDragging: boolean;
  isResizing: boolean;
  isEditing: boolean;
  isColorPickerOpen: boolean;
  dragOffset: { x: number; y: number };
  editText: string;
  dragStartPosition: { x: number; y: number };
  resizeStartDimensions: { width: number; height: number };
  resizeStartPosition: { x: number; y: number };
  resizeStartMousePosition?: { x: number; y: number };
}

export const useNoteInteractions = ({
  note,
  onUpdateNote,
  onSelectNote,
  onBringToFront,
  isSelected,
  boardBounds
}: UseNoteInteractionsProps) => {
  const { isMobile } = useResponsive();
  
  const updateThrottle = useThrottle({
    onUpdate: (noteId: unknown, updates: unknown) => {
      callbacksRef.current.onUpdateNote(noteId as string, updates as Partial<Note>);
    }
  });
  
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isDragging: false,
    isResizing: false,
    isEditing: false,
    isColorPickerOpen: false,
    dragOffset: { x: 0, y: 0 },
    editText: note.text,
    dragStartPosition: { x: note.position?.x || 0, y: note.position?.y || 0 },
    resizeStartDimensions: { width: note.dimensions?.width || 0, height: note.dimensions?.height || 0 },
    resizeStartPosition: { x: note.position?.x || 0, y: note.position?.y || 0 }
  });

  const lastClickTime = useRef(0);
  const noteRef = useRef<HTMLDivElement>(null);
  
  const callbacksRef = useRef({
    onUpdateNote,
    onSelectNote,
    onBringToFront
  });
  
  const valuesRef = useRef({
    noteId: note.id,
    boardBounds,
    isMobile
  });
  
  callbacksRef.current = {
    onUpdateNote,
    onSelectNote,
    onBringToFront
  };
  
  valuesRef.current = {
    noteId: note.id,
    boardBounds,
    isMobile
  };

  const handlePositionUpdate = useCallback((position: Position) => {
    // Apply mobile positioning constraints if needed
    let constrainedPosition = position;
    if (valuesRef.current.isMobile && valuesRef.current.boardBounds) {
      constrainedPosition = constrainNotePosition(
        position,
        note.dimensions,
        valuesRef.current.boardBounds,
        true
      );
    }
    updateThrottle.throttledFunction(valuesRef.current.noteId, { position: constrainedPosition });
  }, [updateThrottle, note.dimensions]);

  const handleDimensionsUpdate = useCallback((dimensions: Dimensions) => {
    const clampedDimensions = clampDimensions(dimensions, valuesRef.current.isMobile);
    updateThrottle.throttledFunction(valuesRef.current.noteId, { dimensions: clampedDimensions });
  }, [updateThrottle]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (interactionState.isEditing) return;
    e.stopPropagation();
    e.preventDefault();

    callbacksRef.current.onSelectNote(valuesRef.current.noteId);
    callbacksRef.current.onBringToFront(valuesRef.current.noteId);

    const coords = getPointerCoordinates(e);
    const target = e.target as HTMLElement;
    const isResizeHandle = target.dataset.isResizeHandle === 'true' || 
                          target.closest('[data-is-resize-handle="true"]') !== null;

    if (isResizeHandle) {
      setInteractionState(prev => ({
        ...prev,
        isResizing: true,
        resizeStartDimensions: { width: note.dimensions.width, height: note.dimensions.height },
        resizeStartPosition: { x: note.position.x, y: note.position.y },
        resizeStartMousePosition: { x: coords.x, y: coords.y }
      }));
    } else {
      setInteractionState(prev => ({
        ...prev,
        isDragging: true,
        dragOffset: {
          x: coords.x - note.position.x,
          y: coords.y - note.position.y
        },
        dragStartPosition: { x: note.position.x, y: note.position.y }
      }));
    }
  }, [note.position?.x, note.position?.y, note.dimensions?.width, note.dimensions?.height, interactionState.isEditing]);

  const handleDoubleClick = useCallback(() => {
    if (!isSelected) {
      callbacksRef.current.onSelectNote(valuesRef.current.noteId);
    }
    setInteractionState(prev => ({
      ...prev,
      isEditing: true,
      editText: note.text
    }));
  }, [isSelected, note.text]);

  const handleClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    const currentTime = Date.now();
    
    // On mobile, single tap starts editing if already selected
    if (isMobile && isSelected) {
      handleDoubleClick();
      return;
    }
    
    if (isDoubleClick(currentTime, lastClickTime.current)) {
      handleDoubleClick();
    } else {
      if (!isSelected) {
        callbacksRef.current.onSelectNote(valuesRef.current.noteId);
      }
    }
    
    lastClickTime.current = currentTime;
  }, [handleDoubleClick, isSelected, isMobile]);

  const handleTextChange = useCallback((text: string) => {
    setInteractionState(prev => ({
      ...prev,
      editText: text
    }));
  }, []);

  const handleTextBlur = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      isEditing: false
    }));
    if (interactionState.editText !== note.text) {
      callbacksRef.current.onUpdateNote(valuesRef.current.noteId, { text: interactionState.editText });
    }
  }, [interactionState.editText, note.text]);

  const handleColorChange = useCallback((color: string) => {
    updateThrottle.throttledFunction(valuesRef.current.noteId, { color });
  }, [updateThrottle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (interactionState.isEditing) {
        setInteractionState(prev => ({
          ...prev,
          isEditing: false,
          editText: note.text
        }));
      }
      if (interactionState.isColorPickerOpen) {
        setInteractionState(prev => ({
          ...prev,
          isColorPickerOpen: false
        }));
      }
    }
  }, [interactionState.isEditing, interactionState.isColorPickerOpen, note.text]);

  const setIsColorPickerOpen = useCallback((open: boolean) => {
    setInteractionState(prev => ({
      ...prev,
      isColorPickerOpen: open
    }));
  }, []);

  const isDraggingOrResizing = useMemo(() => 
    interactionState.isDragging || interactionState.isResizing, 
    [interactionState.isDragging, interactionState.isResizing]
  );

  useEffect(() => {
    if (!isDraggingOrResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const coords = getPointerCoordinates(e);

      if (interactionState.isDragging) {
        const newPosition: Position = {
          x: coords.x - interactionState.dragOffset.x,
          y: coords.y - interactionState.dragOffset.y
        };

        handlePositionUpdate(newPosition);
      }

      if (interactionState.isResizing && interactionState.resizeStartMousePosition) {
        const deltaX = coords.x - interactionState.resizeStartMousePosition.x;
        const deltaY = coords.y - interactionState.resizeStartMousePosition.y;
        
        const newDimensions = {
          width: interactionState.resizeStartDimensions.width + deltaX,
          height: interactionState.resizeStartDimensions.height + deltaY
        };

        handleDimensionsUpdate(newDimensions);
      }
    };

    const handlePointerUp = () => {
      setInteractionState(prev => ({
        ...prev,
        isDragging: false,
        isResizing: false
      }));
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingOrResizing, interactionState.isDragging, interactionState.dragOffset, interactionState.isResizing, interactionState.resizeStartMousePosition, interactionState.resizeStartDimensions, handlePositionUpdate, handleDimensionsUpdate]);

  useEffect(() => {
    if (!interactionState.isColorPickerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (noteRef.current && !noteRef.current.contains(target)) {
        setInteractionState(prev => ({
          ...prev,
          isColorPickerOpen: false
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [interactionState.isColorPickerOpen]);

  useEffect(() => {
    if (!interactionState.isEditing) {
      setInteractionState(prev => ({
        ...prev,
        editText: note.text
      }));
    }
  }, [note.text, interactionState.isEditing]);

  useEffect(() => {
    return () => {
      updateThrottle.cleanup();
    };
  }, [updateThrottle]);

  return useMemo(() => ({
    isDragging: interactionState.isDragging,
    isResizing: interactionState.isResizing,
    isEditing: interactionState.isEditing,
    editText: interactionState.editText,
    isColorPickerOpen: interactionState.isColorPickerOpen,
    noteRef,
    handlePointerDown,
    handleClick,
    handleDoubleClick,
    handleTextChange,
    handleTextBlur,
    handleColorChange,
    handleKeyDown,
    setIsColorPickerOpen,
  }), [
    interactionState.isDragging,
    interactionState.isResizing,
    interactionState.isEditing,
    interactionState.editText,
    interactionState.isColorPickerOpen,
    handlePointerDown,
    handleClick,
    handleDoubleClick,
    handleTextChange,
    handleTextBlur,
    handleColorChange,
    handleKeyDown,
    setIsColorPickerOpen
  ]);
}; 