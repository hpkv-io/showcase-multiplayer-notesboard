import React from 'react';

export function Header() {
  return (
    <>
      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight m-0 max-w-4xl">
        Create & Collaborate with
        <span className="text-gradient"> Digital Notes</span>
      </h1>
      
      {/* Description */}
      <p className="text-xl m-0 text-text-secondary leading-relaxed max-w-3xl w-full text-center">
        Real-time collaborative note-taking powered by HPKV&apos;s{' '}
        <a href='https://github.com/hpkv-io/zustand-multiplayer' target='_blank'  rel="noopener noreferrer"
          className="no-underline border-b border-primary-500 text-primary-500 hover:text-primary-600">
            Multiplayer 
        </a>{' '}
        middleware for{' '}
        <a 
          href="https://zustand.docs.pmnd.rs/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="no-underline border-b border-primary-500 text-primary-500 hover:text-primary-600"
        >
          <code>zustand</code>
        </a>. 
        Create sticky notes, share boards instantly, and collaborate with others in real-time.
      </p>
    </>
  );
} 