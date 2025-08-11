import React from 'react';
import { FiZap } from 'react-icons/fi';
import { HPKVBadge } from '../HPKVBadge';

export function Footer() {
  return (
    <div className="mt-12 flex flex-col items-center gap-6 w-full">
      <div className="flex items-center gap-8 flex-wrap justify-center w-full">
        <HPKVBadge />
        <div className="flex items-center gap-3 px-5 py-3 bg-white/10 rounded-xl border border-white/20">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <FiZap size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary">
              Real-time Sync
            </span>
            <span className="text-xs text-text-muted">
              Live collaboration
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 