import { useState, useEffect } from 'react';
import { RESPONSIVE_BREAKPOINTS } from '@/lib/constants';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < RESPONSIVE_BREAKPOINTS.MOBILE);
      setIsTablet(width >= RESPONSIVE_BREAKPOINTS.MOBILE && width < RESPONSIVE_BREAKPOINTS.TABLET);
      setIsDesktop(width >= RESPONSIVE_BREAKPOINTS.TABLET);
      setIsLandscape(width > height && height <= RESPONSIVE_BREAKPOINTS.LANDSCAPE_HEIGHT);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  return { isMobile, isTablet, isDesktop, isLandscape };
}; 