import React, { memo, useCallback } from 'react';
import { FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import { useViewport, useViewportActions } from '@/contexts/BoardContext';
import { useResponsive } from '@/hooks/useResponsive';
import { VIEWPORT_CONFIG } from '@/lib/constants';

export const BoardZoomControls: React.FC = memo(() => {
  const { isMobile } = useResponsive();
  const viewport = useViewport();
  const { updateViewport, resetViewport } = useViewportActions();

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(
      VIEWPORT_CONFIG.MAX_ZOOM,
      viewport.zoomLevel + VIEWPORT_CONFIG.ZOOM_STEP
    );
    updateViewport({ zoomLevel: newZoom });
  }, [viewport.zoomLevel, updateViewport]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(
      VIEWPORT_CONFIG.MIN_ZOOM,
      viewport.zoomLevel - VIEWPORT_CONFIG.ZOOM_STEP
    );
    updateViewport({ zoomLevel: newZoom });
  }, [viewport.zoomLevel, updateViewport]);

  const handleResetView = useCallback(() => {
    resetViewport();
  }, [resetViewport]);

  const zoomPercentage = Math.round(viewport.zoomLevel * 100);

  // Mobile view - simplified with just zoom percentage and reset button
  if (isMobile) {
    return (
      <div className="fixed z-40 pointer-events-auto bottom-20 left-2">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl px-3 py-2">
          {/* Zoom Percentage */}
          <div className="text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
            {zoomPercentage}%
          </div>
          
          {/* Divider */}
          <div className="w-px h-4 bg-gray-300"></div>
          
          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="p-2 bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-600 rounded-xl transition-all duration-200 hover:shadow-md touch-manipulation active:scale-95"
            title="Reset view"
          >
            <FiMaximize size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Desktop view - full controls
  return (
    <div className="fixed z-40 pointer-events-auto bottom-4 left-4">
      <div className="flex flex-col gap-2 bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl p-2">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={viewport.zoomLevel >= VIEWPORT_CONFIG.MAX_ZOOM}
          className={`
            p-2 rounded-lg transition-all duration-200 touch-manipulation
            ${viewport.zoomLevel >= VIEWPORT_CONFIG.MAX_ZOOM
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 hover:shadow-md'
            }
          `}
          title="Zoom in"
        >
          <FiZoomIn size={20} />
        </button>

        {/* Zoom Percentage */}
        <div className="text-center text-xs font-medium text-gray-600 px-1">
          {zoomPercentage}%
        </div>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={viewport.zoomLevel <= VIEWPORT_CONFIG.MIN_ZOOM}
          className={`
            p-2 rounded-lg transition-all duration-200 touch-manipulation
            ${viewport.zoomLevel <= VIEWPORT_CONFIG.MIN_ZOOM
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 hover:shadow-md'
            }
          `}
          title="Zoom out"
        >
          <FiZoomOut size={20} />
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="p-2 bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-600 rounded-lg transition-all duration-200 hover:shadow-md touch-manipulation"
          title="Reset view"
        >
          <FiMaximize size={20} />
        </button>
      </div>
    </div>
  );
});

BoardZoomControls.displayName = 'BoardZoomControls'; 