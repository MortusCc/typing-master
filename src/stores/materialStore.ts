import { create } from "zustand";
import type { Material } from "../types/material.ts";
import { getAllMaterials } from "../services/db/repositories.ts";

interface MaterialStore {
  materials: Material[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useMaterialStore = create<MaterialStore>((set) => ({
  materials: [],
  loading: false,
  refresh: async () => {
    set({ loading: true });
    try {
      const materials = await getAllMaterials();
      set({ materials, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
