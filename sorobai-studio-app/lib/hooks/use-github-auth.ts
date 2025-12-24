'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GitHubAuthState {
  isConnected: boolean;
  username: string | null;
  avatarUrl: string | null;
  connect: (username: string, avatarUrl: string) => void;
  disconnect: () => void;
}

export const useGitHubAuth = create<GitHubAuthState>()(
  persist(
    (set) => ({
      isConnected: false,
      username: null,
      avatarUrl: null,
      connect: (username, avatarUrl) => 
        set({ isConnected: true, username, avatarUrl }),
      disconnect: () => 
        set({ isConnected: false, username: null, avatarUrl: null }),
    }),
    {
      name: 'github-auth-storage',
    }
  )
);
