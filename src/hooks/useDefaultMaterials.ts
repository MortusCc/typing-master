import { useEffect } from "react";
import { DEFAULT_MATERIALS, DEFAULT_MATERIALS_VERSION } from "../data/defaultMaterialsRegistry.ts";
import { getMaterialById, saveMaterial, getSetting, setSetting } from "../services/db/repositories.ts";

const STORAGE_KEY = "default_materials_loaded";

export function useDefaultMaterials() {
  useEffect(() => {
    const initDefaults = async () => {
      try {
        // Check if already imported
        const loadedVersion = localStorage.getItem(STORAGE_KEY);
        if (loadedVersion === DEFAULT_MATERIALS_VERSION) {
          return; // Already imported
        }

        // Also double-check in IndexedDB settings
        const dbFlag = await getSetting<string>(STORAGE_KEY);
        if (dbFlag === DEFAULT_MATERIALS_VERSION) {
          // Sync localStorage if DB has the flag
          localStorage.setItem(STORAGE_KEY, DEFAULT_MATERIALS_VERSION);
          return;
        }

        // Import defaults one by one
        for (const def of DEFAULT_MATERIALS) {
          const existing = await getMaterialById(def.id);
          if (!existing) {
            const material = await def.buildMaterial();
            await saveMaterial(material);
          }
        }

        // Mark as loaded in both places
        localStorage.setItem(STORAGE_KEY, DEFAULT_MATERIALS_VERSION);
        await setSetting(STORAGE_KEY, DEFAULT_MATERIALS_VERSION);
      } catch (err) {
        console.error("Failed to import default materials:", err);
      }
    };

    initDefaults();
  }, []);
}
