import type { Position, Dimensions } from '../types';
import { BOARD_CONFIG, UI_TIMING, MOBILE_NOTE_CONFIG } from '../constants';

export const clampDimensions = (dimensions: Dimensions, isMobile: boolean = false): Dimensions => {
  const config = isMobile ? MOBILE_NOTE_CONFIG : BOARD_CONFIG;
  return {
    width: Math.min(Math.max(config.minNoteWidth, dimensions.width), config.maxNoteWidth),
    height: Math.min(Math.max(config.minNoteHeight, dimensions.height), config.maxNoteHeight)
  };
};

// Get optimal note dimensions for device type
export const getOptimalNoteDimensions = (isMobile: boolean = false): Dimensions => {
  if (isMobile) {
    return {
      width: MOBILE_NOTE_CONFIG.defaultWidth,
      height: MOBILE_NOTE_CONFIG.defaultHeight
    };
  }
  return {
    width: BOARD_CONFIG.minNoteWidth,
    height: BOARD_CONFIG.minNoteHeight
  };
};

// Constrain note position to stay within viewport bounds
export const constrainNotePosition = (
  position: Position, 
  dimensions: Dimensions, 
  viewportBounds: { width: number; height: number },
  isMobile: boolean = false
): Position => {
  if (!viewportBounds) return position;

  const padding = isMobile ? MOBILE_NOTE_CONFIG.padding : { viewport: 20, toolbar: 0 };
  
  const minX = padding.viewport;
  const minY = padding.viewport;
  const maxX = viewportBounds.width - dimensions.width - padding.viewport;
  const maxY = viewportBounds.height - dimensions.height - padding.viewport - (isMobile ? padding.toolbar : 0);

  return {
    x: Math.min(Math.max(minX, position.x), maxX),
    y: Math.min(Math.max(minY, position.y), maxY)
  };
};

// Get smart positioning for new notes on mobile
export const getSmartNotePosition = (
  viewportBounds: { width: number; height: number },
  existingNotes: Array<{ position: Position; dimensions: Dimensions }> = [],
  isMobile: boolean = false
): Position => {
  const dimensions = getOptimalNoteDimensions(isMobile);
  const padding = isMobile ? MOBILE_NOTE_CONFIG.padding : { viewport: 20, toolbar: 0 };

  // Try center first
  let position: Position = {
    x: (viewportBounds.width - dimensions.width) / 2,
    y: (viewportBounds.height - dimensions.height - (isMobile ? padding.toolbar : 0)) / 2
  };

  // Check if center position overlaps with existing notes
  if (existingNotes.length > 0) {
    const isOverlapping = existingNotes.some(note => 
      isPositionOverlapping(position, dimensions, note.position, note.dimensions)
    );

    if (isOverlapping) {
      // Find a non-overlapping position
      position = findNonOverlappingPosition(
        dimensions, 
        viewportBounds, 
        existingNotes, 
        isMobile
      );
    }
  }

  return constrainNotePosition(position, dimensions, viewportBounds, isMobile);
};

// Check if two notes overlap
const isPositionOverlapping = (
  pos1: Position, 
  dim1: Dimensions, 
  pos2: Position, 
  dim2: Dimensions,
  buffer: number = 10
): boolean => {
  return !(
    pos1.x + dim1.width + buffer < pos2.x ||
    pos2.x + dim2.width + buffer < pos1.x ||
    pos1.y + dim1.height + buffer < pos2.y ||
    pos2.y + dim2.height + buffer < pos1.y
  );
};

// Find a position that doesn't overlap with existing notes
const findNonOverlappingPosition = (
  dimensions: Dimensions,
  viewportBounds: { width: number; height: number },
  existingNotes: Array<{ position: Position; dimensions: Dimensions }>,
  isMobile: boolean = false
): Position => {
  const padding = isMobile ? MOBILE_NOTE_CONFIG.padding : { viewport: 20, toolbar: 0 };
  const step = isMobile ? 30 : 40;
  const maxAttempts = 20;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const offsetX = (attempt % 4) * step;
    const offsetY = Math.floor(attempt / 4) * step;
    
    const candidate: Position = {
      x: padding.viewport + offsetX,
      y: padding.viewport + offsetY
    };

    const constrainedPosition = constrainNotePosition(
      candidate, 
      dimensions, 
      viewportBounds, 
      isMobile
    );

    const isOverlapping = existingNotes.some(note => 
      isPositionOverlapping(constrainedPosition, dimensions, note.position, note.dimensions)
    );

    if (!isOverlapping) {
      return constrainedPosition;
    }
  }

  // Fallback to random position if no non-overlapping position found
  return {
    x: padding.viewport + Math.random() * 100,
    y: padding.viewport + Math.random() * 100
  };
};

export const getPointerCoordinates = (e: React.PointerEvent | PointerEvent): Position => {
  return {
    x: e.clientX,
    y: e.clientY
  };
};

export const isDoubleClick = (currentTime: number, lastClickTime: number): boolean => {
  return currentTime - lastClickTime < UI_TIMING.DOUBLE_CLICK_THRESHOLD;
}; 