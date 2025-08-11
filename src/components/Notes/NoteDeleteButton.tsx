import React, { memo } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { getResponsiveConfirmMessage } from '@/lib/utils';
import { ICON_SIZES } from '@/lib/constants';

interface NoteDeleteButtonProps {
  noteId: string;
  isMobile: boolean;
  onDelete: (noteId: string) => void;
}

const NoteDeleteButtonComponent: React.FC<NoteDeleteButtonProps> = ({
  noteId,
  isMobile,
  onDelete
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const message = getResponsiveConfirmMessage('delete', isMobile);
    
    if (window.confirm(message)) {
      onDelete(noteId);
    }
  };

  const iconSize = isMobile ? ICON_SIZES.MOBILE.SMALL : ICON_SIZES.DESKTOP.MEDIUM;

  return (
    <button
      className={`
        absolute flex items-center justify-center
        rounded-full border-0 cursor-pointer
        transition-all duration-200 z-10
        hover:scale-110 touch-action manipulation
        mobile-touch-feedback note-touch-target
        bg-gradient-to-br from-accent-red to-red-600
        text-white shadow-glow
        ${isMobile 
          ? '-top-3 -right-3 w-5 h-5' 
          : '-top-2 -right-2 w-8 h-8'
        }
      `}
      onClick={handleDelete}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      title="Delete note"
      aria-label="Delete note"
    >
      <FiTrash2 size={iconSize} />
    </button>
  );
};

export const NoteDeleteButton = memo(NoteDeleteButtonComponent); 