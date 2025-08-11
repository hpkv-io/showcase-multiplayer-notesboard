import React from 'react';
import { FiGithub } from 'react-icons/fi';

export function GitHubIcon() {
  return (
    <a
      href="https://github.com/hpkv-io/showcase-multiplayer-notesboard"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-gradient-primary shadow-medium hover:shadow-large hover:-translate-y-0.5 transition-all duration-200 group"
      aria-label="View source code on GitHub"
    >
      <FiGithub 
        size={24} 
        className="text-white group-hover:text-white/90 transition-colors duration-200" 
      />
    </a>
  );
} 