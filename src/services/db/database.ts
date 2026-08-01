import Dexie, { type Table } from "dexie";
import type { Material } from "../../types/material.ts";
import type { TypingSession } from "../../types/typing.ts";
import type { DailyStats } from "../../types/stats.ts";

export class TypingMasterDB extends Dexie {
  materials!: Table<Material, string>;
  sessions!: Table<TypingSession, string>;
  dailyStats!: Table<DailyStats, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super("TypingMasterDB");
    this.version(1).stores({
      materials: "id, type, source, importedAt, name",
      sessions: "id, materialId, startedAt, mode",
      dailyStats: "date",
      settings: "key",
    });
  }
}

export const db = new TypingMasterDB();
