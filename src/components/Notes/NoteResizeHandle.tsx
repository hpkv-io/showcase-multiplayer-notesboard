import React, { memo } from 'react';
import { FiMove } from 'react-icons/fi';
import { ICON_SIZES } from '@/lib/constants';

interface NoteResizeHandleProps {
  isMobile: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

const NoteResizeHandleComponent: React.FC<NoteResizeHandleProps> = ({
  isMobile,
  onPointerDown
}) => {
  return (
    <button
      className={`
        absolute flex items-center justify-center
        rounded-full border-0 cursor-nw-resize
        transition-all duration-200 z-10
        hover:scale-110 touch-action manipulation
        mobile-touch-feedback note-touch-target
        bg-accent-orange text-white shadow-glow
        ${isMobile 
          ? '-bottom-3 -right-3 w-4 h-4' 
          : '-bottom-2 -right-2 w-7 h-7'
        }
      `}
      data-is-resize-handle="true"
      onPointerDown={onPointerDown}
      onMouseDown={(e) => e.stopPropagation()}
      title="Resize note"
      aria-label="Resize note"
    >
      <FiMove size={isMobile ? ICON_SIZES.MOBILE.MEDIUM : ICON_SIZES.DESKTOP.SMALL} />
    </button>
  );
};

export const NoteResizeHandle = memo(NoteResizeHandleComponent); 