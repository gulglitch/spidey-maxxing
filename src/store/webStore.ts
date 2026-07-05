import { create } from 'zustand';
import type { WebStore, WebState } from '../types';

const initialWebState: WebState = {
  isActive: false,
  position: [0, 0, 0],
  velocity: [0, 0, 0],
  attachPoint: null,
  mode: 'idle'
};

export const useWebStore = create<WebStore>((set) => ({
  webState: initialWebState,
  handData: null,
  gestureResult: null,

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
    set({ webState: initialWebState })
}));
