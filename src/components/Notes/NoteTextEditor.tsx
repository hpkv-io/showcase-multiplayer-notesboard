import React, { useRef, useEffect, useState } from 'react';
import { validateNoteContent } from '@/lib/utils';
import { VALIDATION_RULES, MOBILE_TEXT_CONFIG } from '@/lib/constants';
import { formatNoteText } from '@/lib/utils';
import { Dimensions } from '@/lib/types';
import { useResponsive } from '@/hooks/useResponsive';

interface NoteTextEditorProps {
  value: string;
  onChange: (text: string) => void;
  onBlur: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  dimensions: Dimensions;
}

export const NoteTextEditor: React.FC<NoteTextEditorProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder = 'Type your note here...',
  maxLength = VALIDATION_RULES.NOTE_TEXT_MAX_LENGTH,
  className = '',
  dimensions
}) => {
  const { isMobile } = useResponsive();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // On mobile, select all text for easier editing
      if (isMobile) {
        textareaRef.current.select();
      }
    }
  }, [isMobile]);

  // Handle mobile keyboard detection
  useEffect(() => {
    if (!isMobile) return;

    const initialViewportHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Keyboard is likely open if viewport height decreased significantly
      setIsKeyboardOpen(heightDifference > 150);
    };

    const handleFocus = () => {
      setIsKeyboardOpen(true);
      // Scroll note into view on mobile
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 300); // Wait for keyboard animation
      }
    };

    const handleBlurEvent = () => {
      setIsKeyboardOpen(false);
      
      // Reset viewport zoom after keyboard dismissal on mobile
      if (isMobile) {
        // Force viewport reset by setting meta viewport
        setTimeout(() => {
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            const content = viewport.getAttribute('content');
            viewport.setAttribute('content', content + ', initial-scale=1');
            // Reset back to original
            setTimeout(() => {
              viewport.setAttribute('content', content || 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
            }, 50);
          }
        }, 300);
      }
    };

    const currentTextarea = textareaRef.current;
    
    window.addEventListener('resize', handleResize);
    currentTextarea?.addEventListener('focus', handleFocus);
    currentTextarea?.addEventListener('blur', handleBlurEvent);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentTextarea?.removeEventListener('focus', handleFocus);
      currentTextarea?.removeEventListener('blur', handleBlurEvent);
    };
  }, [isMobile]);

  // Dynamic height calculation
  useEffect(() => {
    if (textareaRef.current) {
      const baseHeight = isMobile ? 
        Math.min(dimensions.height * 0.85, 200) : 
        dimensions.height * 0.85;
      
      textareaRef.current.style.height = `${baseHeight}px`;
      
      // Auto-resize on mobile for better text visibility
      if (isMobile && isKeyboardOpen) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
      }
    }
  }, [dimensions, isMobile, isKeyboardOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Only do basic validation during typing, no sanitization
    if (newText.length <= maxLength) {
      onChange(newText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleSaveAndBlur();
      return;
    }

    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return; // Allow line breaks with Shift+Enter
      } else if (isMobile) {
        // On mobile, Enter saves and closes
        e.preventDefault();
        handleSaveAndBlur();
        return;
      } else {
        // On desktop, Enter without shift saves
        e.preventDefault();
        handleSaveAndBlur();
        return;
      }
    }

    // Mobile-specific: Save on specific keys
    if (isMobile && (e.key === 'Tab' || (e.ctrlKey && e.key === 'Enter'))) {
      e.preventDefault();
      handleSaveAndBlur();
      return;
    }

    onKeyDown?.(e);
  };

  const handleSaveAndBlur = () => {
    // Sanitize content when user finishes editing
    if (textareaRef.current) {
      const currentText = textareaRef.current.value;
      const validation = validateNoteContent(currentText);
      if (validation.isValid && validation.sanitized !== undefined) {
        onChange(validation.sanitized);
      }
    }
    onBlur();
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const noteContainer = textareaRef.current?.closest('[data-note-id]');
    
    if (relatedTarget && noteContainer?.contains(relatedTarget)) {
      return;
    }

    handleSaveAndBlur();
  };

  const mobileStyles = isMobile ? {
    fontSize: '16px', // Fixed 16px to prevent zoom on focus
    lineHeight: MOBILE_TEXT_CONFIG.lineHeight,
    padding: MOBILE_TEXT_CONFIG.padding,
  } : {};

  return (
    <>
      <textarea
        ref={textareaRef}
        value={formatNoteText(value)}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          w-full h-full
          p-0 
          border-0 
          outline-none 
          bg-transparent 
          text-sm 
          leading-relaxed 
          whitespace-pre-wrap 
          break-words
          resize-none
          overflow-hidden
          ${isMobile ? 'mobile-text-editor' : ''}
          ${className}
        `}
        style={{
          color: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: isMobile ? '60px' : '80px',
          ...mobileStyles
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={1}
        aria-label="Note text editor"
        // Mobile-specific attributes
        autoComplete="off"
        autoCorrect={isMobile ? "on" : "off"}
        autoCapitalize={isMobile ? "sentences" : "off"}
        spellCheck={isMobile}
        inputMode={isMobile ? "text" : undefined}
      />
      
      {/* Mobile editing helper */}
      {isMobile && isKeyboardOpen && (
        <div className="absolute bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 p-2 text-xs text-blue-700 text-center">
          <span>Press Enter to save • Shift+Enter for new line</span>
        </div>
      )}
    </>
  );
}; 