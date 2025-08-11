import React, { memo } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { getResponsiveIconSize } from '@/lib/utils';
import { FiZap } from 'react-icons/fi';

export const BoardEmptyState: React.FC = memo(() => {
  const { isMobile } = useResponsive();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center" style={{ minWidth: '320px', maxWidth: '600px', width: '100%', padding: '0 20px' }}>
        <div className="mb-6">
          <FiZap size={getResponsiveIconSize(40, 48, isMobile)} className="opacity-40 text-slate-400 mx-auto" />
        </div>
        <h3 className={`font-semibold mb-4 text-slate-600 ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
          No notes yet
        </h3>
        <div className={`text-slate-500 leading-relaxed ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>
          {isMobile ? (
            <div>
              Tap the <strong className="text-slate-600">Add</strong> button in the bottom toolbar to create your first note, 
              or double-tap anywhere on the board.
            </div>
          ) : (
            <>
              <div className="block md:hidden">
                Tap the <strong className="text-slate-600">Add Note</strong> button above to create your first note.
              </div>
              <div className="hidden md:block">
                Double-click anywhere on the board to create your first note, or use the <strong className="text-slate-600">&quot;Add Note&quot;</strong> button above.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

BoardEmptyState.displayName = 'BoardEmptyState'; 