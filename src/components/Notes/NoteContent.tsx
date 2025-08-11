import React, { memo } from 'react';
import { formatNoteText, getResponsivePlaceholder } from '@/lib/utils';
import { NoteTextEditor } from './NoteTextEditor';
import type { Dimensions } from '@/lib/types';

interface NoteContentProps {
  text: string;
  isEditing: boolean;
  editText: string;
  isMobile: boolean;
  dimensions: Dimensions;
  onTextChange: (text: string) => void;
  onTextBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const NoteContentComponent: React.FC<NoteContentProps> = ({
  text,
  isEditing,
  editText,
  isMobile,
  dimensions,
  onTextChange,
  onTextBlur,
  onKeyDown
}) => {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {isEditing ? (
        <NoteTextEditor
          value={editText}
          onChange={onTextChange}
          onBlur={onTextBlur}
          onKeyDown={onKeyDown}
          className={isMobile ? 'mobile-text-editor' : ''}
          dimensions={dimensions}
        />
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full w-full overflow-hidden whitespace-pre-wrap break-words outline-none p-0 text-sm text-black/80 leading-relaxed font-sans">
            {text ? (
              formatNoteText(text)
            ) : (
              <span className="opacity-50 text-black/50">
                {getResponsivePlaceholder(isMobile)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const NoteContent = memo(NoteContentComponent); 