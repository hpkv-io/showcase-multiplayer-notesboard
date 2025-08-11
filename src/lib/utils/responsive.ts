
export const getResponsiveConfirmMessage = (action: string, isMobile: boolean): string => {
  const mobileMessage = action === 'delete' 
    ? 'Delete this note?' 
    : action === 'clear' 
    ? 'Clear all notes? This cannot be undone.'
    : `${action}?`;
    
  const desktopMessage = action === 'delete'
    ? 'Are you sure you want to delete this note?'
    : action === 'clear'
    ? 'Are you sure you want to clear all notes? This action cannot be undone.'
    : `Are you sure you want to ${action}?`;
    
  return isMobile ? mobileMessage : desktopMessage;
};

export const getResponsivePlaceholder = (isMobile: boolean): string => {
  return isMobile ? 'Tap to edit' : 'Double-click to edit';
};

export const getResponsiveIconSize = (mobileSize: number, desktopSize: number, isMobile: boolean): number => {
  return isMobile ? mobileSize : desktopSize;
}; 