import { create } from "zustand";
import type { TypingSession } from "../types/typing.ts";
import { getRecentSessions, saveSession } from "../services/db/repositories.ts";

interface StatsStore {
  recentSessions: TypingSession[];
  loading: boolean;
  loadRecent: () => Promise<void>;
  recordSession: (session: TypingSession) => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set) => ({
  recentSessions: [],
  loading: false,

  loadRecent: async () => {
    set({ loading: true });
    try {
      const sessions = await getRecentSessions(50);
      set({ recentSessions: sessions, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  recordSession: async (session) => {
    await saveSession(session);
    // Reload to update the list
    const sessions = await getRecentSessions(50);
    set({ recentSessions: sessions });
  },
}));
