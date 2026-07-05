import { create } from 'zustand';
import type { WebStore, WebState, WebAttachment, WebInteractionMode } from '../types';

const initialWebState: WebState = {
  isActive: false,
  position: [0, 0, 0],
  velocity: [0, 0, 0],
  attachPoint: null,
  mode: 'idle'
};

interface ExtendedWebStore extends WebStore {
  attachments: WebAttachment[];
  interactionMode: WebInteractionMode;
  addAttachment: (attachment: WebAttachment) => void;
  removeAttachment: (id: number) => void;
  clearAttachments: () => void;
  setInteractionMode: (mode: WebInteractionMode) => void;
}

export const useWebStore = create<ExtendedWebStore>((set) => ({
  webState: initialWebState,
  handData: null,
  gestureResult: null,
  attachments: [],
  interactionMode: 'shoot',

  setWebState: (state) => 
    set((prev) => ({ 
      webState: { ...prev.webState, ...state } 
    })),

  setHandData: (data) => 
    set({ handData: data }),

  setGestureResult: (result) => 
    set({ gestureResult: result }),

  shootWeb: (position, velocity) => 
    set({ 
      webState: { 
        isActive: true, 
        position, 
        velocity, 
        attachPoint: null, 
        mode: 'shooting' 
      } 
    }),

  resetWeb: () => 
    set({ webState: initialWebState }),

  addAttachment: (attachment) =>
    set((state) => ({
      attachments: [...state.attachments, attachment]
    })),

  removeAttachment: (id) =>
    set((state) => ({
      attachments: state.attachments.filter(a => a.id !== id)
    })),

  clearAttachments: () =>
    set({ attachments: [] }),

  setInteractionMode: (mode) =>
    set({ interactionMode: mode })
}));
