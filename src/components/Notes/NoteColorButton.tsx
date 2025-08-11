import React, { memo } from 'react';
import { FiDroplet } from 'react-icons/fi';
import { ICON_SIZES } from '@/lib/constants';

interface NoteColorButtonProps {
  isMobile: boolean;
  onToggleColorPicker: () => void;
}

const NoteColorButtonComponent: React.FC<NoteColorButtonProps> = ({
  isMobile,
  onToggleColorPicker
}) => {
  const handleColorIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleColorPicker();
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
        bg-gradient-primary text-white shadow-glow
        ${isMobile 
          ? '-top-3 -left-3 w-5 h-5' 
          : '-top-2 -left-2 w-8 h-8'
        }
      `}
      onClick={handleColorIconClick}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      title="Change color"
      aria-label="Change note color"
    >
      <FiDroplet size={iconSize} />
    </button>
  );
};

export const NoteColorButton = memo(NoteColorButtonComponent); 