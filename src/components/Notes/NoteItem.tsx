import React, { memo } from 'react';
import { useNoteActions, useClientInfo, useNote } from '@/contexts/BoardContext';
import { useNoteInteractions } from '@/hooks/useNoteInteractions';
import { useResponsive } from '@/hooks/useResponsive';
import { NoteColorPicker } from './NoteColorPicker';
import { NoteDeleteButton } from './NoteDeleteButton';
import { NoteColorButton } from './NoteColorButton';
import { NoteResizeHandle } from './NoteResizeHandle';
import { NoteContent } from './NoteContent';

interface NoteItemProps {
  noteId: string;
  onSelect: (noteId: string | null) => void;
  boardBounds?: { width: number; height: number };
}

const NoteItemComponent: React.FC<NoteItemProps> = ({ 
  noteId, 
  onSelect,
  boardBounds 
}) => {
  const { isMobile } = useResponsive();
  const note = useNote(noteId);
  const clientInfo = useClientInfo();
  const { updateNote, deleteNote, bringToFront } = useNoteActions();

  const isSelected = note?.selectedBy !== undefined;
  const isSelectedByMe = note?.selectedBy === clientInfo.id;

  const {
    isDragging,
    isResizing,
    isEditing,
    editText,
    isColorPickerOpen,
    noteRef,
    handlePointerDown,
    handleClick,
    handleDoubleClick,
    handleTextChange,
    handleTextBlur,
    handleColorChange,
    handleKeyDown,
    setIsColorPickerOpen,
  } = useNoteInteractions({
    note,
    onUpdateNote: updateNote,
    onSelectNote: onSelect,
    onBringToFront: bringToFront,
    isSelected,
    boardBounds
  });

  const handleMobilePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    handlePointerDown(e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToggleColorPicker = () => {
    setIsColorPickerOpen(!isColorPickerOpen);
  };

  const handleColorPickerClose = () => {
    setIsColorPickerOpen(false);
  };

  // Note classes
  const baseClasses = `absolute select-none touch-none rounded-xl m-2 ${isSelected ? 'z-50' : 'z-10'} transition-shadow duration-200`;
  const animationClasses = !isDragging && !isResizing && !isSelectedByMe ? 'transition-[transform,width,height,background-color] duration-150 ease-out' : '';
  
  const noteClasses = isMobile
    ? `${baseClasses} ${animationClasses} mobile-note-optimized mobile-note-compact mobile-note-constrained touch-manipulation ${
        isSelectedByMe ? 'mobile-note-selected' : ''
      } ${isDragging ? 'mobile-note-dragging' : ''} ${isResizing ? 'mobile-note-resize-active' : ''} ${
        isEditing ? 'mobile-editing-active' : ''
      }`
    : `${baseClasses} ${animationClasses} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'cursor-nwse-resize' : ''} p-4`;

  if (!note) return null;

  return (
    <div
      ref={noteRef}
      className={noteClasses}
      style={{
        left: note.position?.x,
        top: note.position?.y,
        transform: isDragging 
          ? (isMobile ? 'scale(1.05) rotate(1deg)' : 'scale(1.02)') 
          : isResizing ? 'scale(1)' : 'scale(1)',
        width: note.dimensions?.width,
        height: note.dimensions?.height,
        backgroundColor: note.color,
        boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        // Mobile-specific constraints
        maxWidth: isMobile ? 'calc(100vw - 32px)' : undefined,
        maxHeight: isMobile ? 'calc(100vh - 120px)' : undefined,
        minWidth: isMobile ? '150px' : undefined,
        minHeight: isMobile ? '120px' : undefined,
      }}
      onPointerDown={handleMobilePointerDown}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Note ${note.id}`}
      data-note-id={note.id}
    >

      {isSelectedByMe && (
        <NoteDeleteButton
          noteId={note.id}
          isMobile={isMobile}
          onDelete={deleteNote}
        />
      )}

      {isSelectedByMe && (
        <NoteColorButton
          isMobile={isMobile}
          onToggleColorPicker={handleToggleColorPicker}
        />
      )}

      {isColorPickerOpen && (
        <NoteColorPicker
          currentColor={note.color}
          onColorChange={handleColorChange}
          onClose={handleColorPickerClose}
        />
      )}

      <NoteContent
        text={note.text}
        isEditing={isEditing}
        editText={editText}
        isMobile={isMobile}
        dimensions={note.dimensions}
        onTextChange={handleTextChange}
        onTextBlur={handleTextBlur}
        onKeyDown={handleKeyDown}
      />

      {isSelectedByMe && (
        <NoteResizeHandle
          isMobile={isMobile}
          onPointerDown={handlePointerDown}
        />
      )}
    </div>
  );
};

export const NoteItem = memo(NoteItemComponent);

NoteItem.displayName = 'NoteItem';

export default NoteItem; 