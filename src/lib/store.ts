import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {  multiplayer, WithMultiplayer } from '@hpkv/zustand-multiplayer';
import { v4 as uuidv4 } from 'uuid';
import type { Note, ClientInfo, Position, ViewportState } from './types';
import { BOARD_CONFIG, LIVE_USER_CONFIG, VIEWPORT_CONFIG } from './constants';
import { getStoredClientInfo } from '@/lib/utils';


export interface NotesBoardState {
  // State
  notes: Record<string, Note>;
  clientZCounter: number;
  myInfo: ClientInfo;
  liveUsers: Record<string, ClientInfo>;
  viewport: ViewportState;

  // Note actions
  addNote: (partialNote: Partial<Omit<Note, 'id' | 'zIndex'>>) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  selectNote: (noteId: string | null) => void;
  bringToFront: (noteId: string) => void;
  
  // Board actions
  clearBoard: () => Promise<void>;
  
  // Live user actions
  updateMyPosition: (position: Position) => void;
  removeMeFromLiveUsers: (onlyIfIdle?: boolean) => void;
  
  // Viewport actions
  updateViewport: (viewport: Partial<ViewportState>) => void;
  resetViewport: () => void;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_HPKV_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_HPKV_API_BASE_URL environment variable");
}

// Creates the main store for the notes board for a given boardId
export const createNotesStore = (boardId: string, tokenGenerationUrl: string) => {
  const store = create<WithMultiplayer<NotesBoardState>>()(
    multiplayer(
      immer(
      (set) => ({
      notes: {},
      clientZCounter: 1,
      myInfo: getStoredClientInfo(),
      liveUsers: {},
      viewport: {
        panOffset: { x: 0, y: 0 },
        zoomLevel: VIEWPORT_CONFIG.DEFAULT_ZOOM
      },

      addNote: (partialNote: Partial<Omit<Note, 'id' | 'zIndex'>>) => {     
        set(state => {
          const id = uuidv4();
          state.clientZCounter = state.clientZCounter + 1;
          state.notes[id] = {
            id,
            position: partialNote.position || { x: 50, y: 50 },
            dimensions: partialNote.dimensions || {
              width: BOARD_CONFIG.minNoteWidth,
              height: BOARD_CONFIG.minNoteHeight,
            },
            text: partialNote.text || '',
            color: partialNote.color || BOARD_CONFIG.defaultNoteColor,
            zIndex: state.clientZCounter,
          } 
        });
      },

      updateNote: (noteId: string, updates: Partial<Note>) => {
        set(state => {
          if (!state.notes[noteId]) return;
          
          // Hide cursor when dragging
          if (updates.position && state.liveUsers[state.myInfo.id]?.hidden === false) {
            state.liveUsers[state.myInfo.id].hidden = true;
          }
          
          // Apply updates
          Object.assign(state.notes[noteId], updates);
        });
      },

      deleteNote: (noteId: string) => {
        set(state => {
          delete state.notes[noteId];
        });
      },

      selectNote: (noteId: string | null) => {
        set(state => { 
          Object.values(state.notes).forEach(note => {
            if (note.id === noteId && noteId !== null) {
              note.selectedBy = state.myInfo.id;
            } else if (note.selectedBy === state.myInfo.id) {
              delete note.selectedBy;
            }
          });
        });
      },

      bringToFront: (noteId: string) => {
        set(state => {
          state.notes[noteId].zIndex = state.clientZCounter;
        });
      },

      clearBoard: async () => {
        set(state => {
          state.clientZCounter = 1;
          state.notes = {};
        });
      },

      updateMyPosition: (position: Position) => {
        set(state => {
          if (!state.liveUsers[state.myInfo.id]) {
            state.liveUsers[state.myInfo.id] = {
              id: state.myInfo.id,
              name: state.myInfo.name,
              color: state.myInfo.color,
              position: {
                x: position.x,
                y: position.y,
                lastUpdate: Date.now()
              },
              hidden: false
            };
          } else {
            if(state.liveUsers[state.myInfo.id].hidden) {
              state.liveUsers[state.myInfo.id].hidden = false;
            }
            state.liveUsers[state.myInfo.id].position = {
              x: position.x,
              y: position.y,
              lastUpdate: Date.now()
            };
          }
        });
      },

      removeMeFromLiveUsers: (onlyIfIdle: boolean = true) => {
        set(state => {
          const shouldRemove = onlyIfIdle ? 
            (state.liveUsers[state.myInfo.id]?.position &&
              !state.liveUsers[state.myInfo.id].hidden &&
              (Date.now() - (state.liveUsers[state.myInfo.id].position?.lastUpdate ?? 0) >= LIVE_USER_CONFIG.INACTIVE_THRESHOLD)) :
            true;
          if (shouldRemove) {
            delete state.liveUsers[state.myInfo.id];
          }
        });
      },

      updateViewport: (viewportUpdate: Partial<ViewportState>) => {
        set(state => {
          state.viewport = {
            ...state.viewport,
            ...viewportUpdate
          };
        });
      },

      resetViewport: () => {
        set(state => {
          state.viewport = {
            panOffset: { x: 0, y: 0 },
            zoomLevel: VIEWPORT_CONFIG.DEFAULT_ZOOM
          };
        });
      },
    })),
    {
      namespace: `notes-board-${boardId}`,
      tokenGenerationUrl: tokenGenerationUrl,
      apiBaseUrl: apiBaseUrl!,
      sync: ['notes', 'clientZCounter', 'liveUsers' ],
      rateLimit: parseInt(process.env.NEXT_PUBLIC_HPKV_RPS_LIMIT || '10'),
    }
  )
);

  return store;
};

export type NotesStoreType = ReturnType<typeof createNotesStore>;