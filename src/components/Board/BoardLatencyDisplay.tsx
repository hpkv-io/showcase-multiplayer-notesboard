import React, { memo } from 'react';
import { useAverageSyncTime } from '@/contexts/BoardContext';

export const BoardLatencyDisplay: React.FC = memo(() => {
  const {averageSyncTime} = useAverageSyncTime();

  return (
    <div className="bg-white/95 backdrop-blur-lg border border-gray-300/60 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium shadow-lg">
      <span>Latency: </span>
      {averageSyncTime !== null ? (
        <>
          {averageSyncTime < 100 ? (
            <span className="text-green-600">{averageSyncTime.toFixed(0)}ms</span>
          ) : averageSyncTime < 200 ? (
            <span className="text-yellow-600">{averageSyncTime.toFixed(0)}ms</span>
          ) : (
            <span className="text-red-600">{averageSyncTime.toFixed(0)}ms</span>
          )}
        </>
      ) : (
        <span className="text-gray-500">--ms</span>
      )}
    </div>
  );
});

BoardLatencyDisplay.displayName = 'BoardLatencyDisplay'; 