'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NoteDraftState {
  title: string;
  body: string;
  setTitle: (t: string) => void;
  setBody: (b: string) => void;
  clear: () => void;
}

export const useNoteDraftStore = create<NoteDraftState>()(
  persist(
    (set) => ({
      title: '',
      body: '',
      setTitle: (t: string) => set({ title: t }),
      setBody: (b: string) => set({ body: b }),
      clear: () => set({ title: '', body: '' }),
    }),
    {
      name: 'learnessence-note-draft',
      version: 1,
    }
  )
);

export default useNoteDraftStore;
