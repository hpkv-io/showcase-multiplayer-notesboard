import React, { useRef, useEffect } from 'react';
import { COLORS } from '@/lib/constants';

interface NoteColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export const NoteColorPicker: React.FC<NoteColorPickerProps> = ({
  currentColor,
  onColorChange,
  onClose
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  const handlePresetColorClick = (color: string) => {
    onColorChange(color);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="
        absolute top-full left-1/2 transform -translate-x-1/2 mt-2
        p-4 
        rounded-xl 
        border 
        z-50
        backdrop-blur-xl
      "
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(59, 130, 246, 0.1)',
        minWidth: '200px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border-l border-t"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.6)'
        }}
      />

      <div className="grid grid-cols-4 gap-3">
        {COLORS.NOTE_COLORS.map((color) => (
          <button
            key={color}
            className={`
              w-10 h-10 
              rounded-lg 
              border-2 
              cursor-pointer 
              transition-all duration-200
              hover:scale-110 hover:shadow-lg
              ${color === currentColor ? 'ring-2 ring-offset-2' : ''}
            `}
            style={{ 
              backgroundColor: color,
              borderColor: color === currentColor ? 'var(--color-primary-blue)' : 'rgba(255, 255, 255, 0.8)',
              '--tw-ring-color': 'var(--color-primary-blue)'
            } as React.CSSProperties}
            onClick={() => handlePresetColorClick(color)}
            title={`Select ${color}`}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}; 