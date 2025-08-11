
export interface Note {
    id: string;
    position: Position;
    dimensions: Dimensions;
    text: string;
    color: string;
    zIndex: number;
    selectedBy?: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface BoardConfig {
    defaultNoteColor: string;
    minNoteWidth: number;
    minNoteHeight: number;
    maxNoteWidth: number;
    maxNoteHeight: number;
}

export interface MobileNoteConfig {
    defaultNoteColor: string;
    minNoteWidth: number;
    minNoteHeight: number;
    maxNoteWidth: number;
    maxNoteHeight: number;
    defaultWidth: number;
    defaultHeight: number;
    padding: {
        viewport: number;
        toolbar: number;
    };
}

export interface ClientInfo {
    id: string;
    name: string;
    color: string;
    position: Position & {lastUpdate?: number};
    hidden: boolean;
}

export interface ViewportState {
    panOffset: Position;
    zoomLevel: number;
}

export interface TransformedBounds {
    width: number;
    height: number;
    left: number;
    top: number;
}

export interface ViewportBounds extends TransformedBounds {
    panOffset: Position;
    zoomLevel: number;
}

