import React from 'react';
import Image from 'next/image';
import { useResponsive } from '@/hooks/useResponsive';

interface HPKVBadgeProps {
  className?: string;
}

export function HPKVBadge({ className = '' }: HPKVBadgeProps) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    // Compact mobile version with full text
    return (
      <div className={`flex items-center gap-2 bg-white/10 rounded-lg border border-white/20 ${className}`}>
        <Image 
          src="/logo.png" 
          alt="HPKV Logo" 
          width={20} 
          height={20}
        />
        <span className="text-xs font-medium text-text-primary">
          Powered by <a href='https://hpkv.io' target='_blank' rel='noopener noreferrer' className='no-underline text-primary-500 hover:text-primary-600'>HPKV</a>
        </span>
      </div>
    );
  }

  // Full desktop version
  return (
    <div className={`flex items-center gap-3 px-5 py-3 bg-white/10 rounded-xl border border-white/20 ${className}`}>
      <Image 
        src="/logo.png" 
        alt="HPKV Logo" 
        width={32} 
        height={32}
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-text-primary">
          Powered by <a href='https://hpkv.io' target='_blank' rel='noopener noreferrer' className='no-underline border-b border-primary-500 text-primary-500 hover:text-primary-600'>HPKV</a>
        </span>
        <span className="text-xs text-text-muted">
           WebSocket API
        </span>
      </div>
    </div>
  );
} 