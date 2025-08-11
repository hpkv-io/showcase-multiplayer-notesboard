import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FiShare2, FiCopy, FiCheck } from 'react-icons/fi';

export const BoardShareButton: React.FC = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const boardId = router.query.boardId as string;
  const boardUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/boards/${boardId}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(boardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowDropdown(false);
    } catch (error) {
      console.warn('Failed to copy URL:', error);
      const textArea = document.createElement('textarea');
      textArea.value = boardUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowDropdown(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Join my Notes Board',
          text: 'Collaborate with me on this real-time notes board!',
          url: boardUrl
        });
        setShowDropdown(false);
      } catch (error) {
        console.warn('Share API failed:', error);
      }
    }
  };

  return (
    <div className="relative" style={{ zIndex: 1000 }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
          btn btn-mobile
          flex items-center gap-2 
          px-4 py-2 
          text-white text-sm font-medium
          border-0 rounded-lg
          cursor-pointer
          transition-all duration-200
          shadow-soft hover:shadow-medium hover:-translate-y-0.5
          ${copied 
            ? 'bg-accent-green hover:bg-green-600' 
            : 'bg-gradient-primary hover:from-primary-600 hover:to-secondary-600'
          }
        `}
        title="Share this board"
        aria-label="Share board options"
      >
        {copied ? <FiCheck size={16} /> : <FiShare2 size={16} />}
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-[998]"
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="
            fixed sm:absolute 
            top-16 sm:top-full 
            left-1/2 sm:left-auto
            right-auto sm:right-0 
            -translate-x-1/2 sm:translate-x-0
            sm:mt-1
            bg-white border border-gray-200 rounded-lg shadow-large
            p-2 z-[1001]
            w-[200px]
          ">
            <button
              onClick={handleCopyLink}
              className="
                w-full flex items-center gap-3
                p-3 text-sm text-gray-700
                hover:bg-gray-50 rounded-md
                transition-colors duration-150
                text-left border-0 bg-transparent cursor-pointer
              "
            >
              <FiCopy size={16} />
              <span>Copy Link</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="
                  w-full flex items-center gap-3
                  p-3 text-sm text-gray-700
                  hover:bg-gray-50 rounded-md
                  transition-colors duration-150
                  text-left border-0 bg-transparent cursor-pointer
                "
              >
                <FiShare2 size={16} />
                <span>Share via Device</span>
              </button>
            )}

            <div className="
              border-t border-gray-200 mt-2 pt-2 px-3 pb-1
              text-xs text-gray-500
            ">
              <span>Board ID:</span>
              <br />
              <code className="
                bg-gray-100 px-1 py-0.5 rounded text-xs
                font-mono break-all
              ">{boardId}</code>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 