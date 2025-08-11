import React, { memo, useCallback, useState } from 'react';
import { FiHome, FiPlus, FiShare2, FiTrash2, FiMoreHorizontal, FiCopy, FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useBoardActions } from '@/contexts/BoardContext';
import { getResponsiveConfirmMessage } from '@/lib/utils';
import { HPKVBadge } from '@/components/HPKVBadge';

interface MobileBottomToolbarProps {
  onAddNote: () => void;
}

export const MobileBottomToolbar: React.FC<MobileBottomToolbarProps> = memo(({ onAddNote }) => {
  const router = useRouter();
  const { clearBoard } = useBoardActions();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const boardId = router.query.boardId as string;
  const boardUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/boards/${boardId}`
    : '';

  const handleGoHome = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.location.href = '/';
  }, []);

  const handleClearBoard = useCallback(async () => {
    const message = getResponsiveConfirmMessage('clear', true); // true for mobile
    
    if (window.confirm(message)) {
      await clearBoard();
      setShowMoreMenu(false);
    }
  }, [clearBoard]);

  const handleAddNote = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddNote();
  }, [onAddNote]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(boardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMoreMenu(false);
    } catch (error) {
      console.warn('Failed to copy URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = boardUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMoreMenu(false);
    }
  }, [boardUrl]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Join my Notes Board',
          text: 'Collaborate with me on this real-time notes board!',
          url: boardUrl
        });
        setShowMoreMenu(false);
      } catch (error) {
        console.warn('Share API failed:', error);
      }
    }
  }, [boardUrl]);

  return (
    <>
      {/* Backdrop for more menu */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000]"
          onClick={() => setShowMoreMenu(false)}
        />
      )}

      {/* Enhanced More menu */}
      {showMoreMenu && (
        <div className="fixed bottom-16 right-4 left-4 z-[1001] max-w-sm mx-auto">
          <div className="mobile-more-menu rounded-3xl border border-gray-200/50 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <h3 className="font-semibold text-gray-900 text-base">Board Actions</h3>
              <p className="text-xs text-gray-500 mt-1">Share or manage your board</p>
            </div>
            
            <div className="p-3 space-y-1">
              {/* Share Options */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 p-4 text-left rounded-2xl hover:bg-blue-50 active:bg-blue-100 active:scale-[0.98] transition-all duration-200 mobile-touch-area group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                  {copied ? <FiCheck size={20} className="text-white" /> : <FiCopy size={20} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">{copied ? 'Copied!' : 'Copy Link'}</div>
                  <div className="text-sm text-gray-500">{copied ? 'Link copied to clipboard' : 'Share board with others'}</div>
                </div>
              </button>

              {/* Native Share (if available) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-4 p-4 text-left rounded-2xl hover:bg-purple-50 active:bg-purple-100 active:scale-[0.98] transition-all duration-200 mobile-touch-area group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                    <FiShare2 size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-base">Share via Device</div>
                    <div className="text-sm text-gray-500">Use your device&apos;s share menu</div>
                  </div>
                </button>
              )}

              {/* Clear Board */}
              <button
                onClick={handleClearBoard}
                className="w-full flex items-center gap-4 p-4 text-left rounded-2xl hover:bg-red-50 active:bg-red-100 active:scale-[0.98] transition-all duration-200 mobile-touch-area group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                  <FiTrash2 size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">Clear Board</div>
                  <div className="text-sm text-gray-500">Remove all notes permanently</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mobile-bottom-toolbar-compact">
      <div className="absolute bottom-0 left-0 z-10">
            <HPKVBadge className="scale-50 opacity-60" />
          </div>
        {/* Main toolbar content */}
        <div className="flex items-center justify-between px-6 py-2 max-w-screen-sm mx-auto relative w-80">
          
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/98 to-white/80 backdrop-blur-2xl  border-t border-white/20"></div>
          
          {/* Left side - Home button */}
          <button
            onClick={handleGoHome}
            className="relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 mobile-toolbar-button-compact group transition-all duration-200 z-10"
            title="Back to Home"
            aria-label="Go back to home page"
          >
            <FiHome size={20} className="text-gray-600 group-active:scale-90 transition-transform" />
            <span className="text-xs text-gray-600 mt-0.5 font-medium">Home</span>
          </button>

          {/* Center - Add Note Button */}
          <button
            onClick={handleAddNote}
            className="relative flex flex-col items-center justify-center mobile-toolbar-primary-compact rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 group z-10"
            title="Add New Note"
            aria-label="Add new note"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-100"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl opacity-0 group-active:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center py-2 px-4">
              <FiPlus size={22} className="text-white mb-0.5 group-active:scale-90 transition-transform" />
              <span className="text-xs text-white font-bold tracking-wide">ADD</span>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-20 -z-10 group-hover:opacity-30 transition-opacity"></div>
          </button>

          {/* Right side - More Actions Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100/80 active:bg-gray-200/80 mobile-toolbar-button-compact group transition-all duration-200 z-10"
            title="More actions"
            aria-label="More actions"
          >
            <div className="relative">
              <FiMoreHorizontal size={20} className="text-gray-600 group-active:scale-90 transition-transform" />
              {showMoreMenu && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
            <span className="text-xs text-gray-600 mt-0.5 font-medium">More</span>
          </button>
        </div>

        {/* Safe area spacing - reduced height */}
        <div className="h-safe-area-compact bg-gradient-to-t from-white to-white/95"></div>
      </div>
    </>
  );
});

MobileBottomToolbar.displayName = 'MobileBottomToolbar'; 