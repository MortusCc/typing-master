import { db } from "./database.ts";
import type { Material } from "../../types/material.ts";
import type { TypingSession } from "../../types/typing.ts";
import type { DailyStats } from "../../types/stats.ts";

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ── Materials ──

export async function getAllMaterials(): Promise<Material[]> {
  return db.materials.orderBy("importedAt").reverse().toArray();
}

export async function getMaterialById(id: string): Promise<Material | undefined> {
  return db.materials.get(id);
}

export async function saveMaterial(material: Material): Promise<string> {
  await db.materials.put(material);
  return material.id;
}

export async function deleteMaterial(id: string): Promise<void> {
  await db.materials.delete(id);
}

// ── Sessions ──

export async function saveSession(session: TypingSession): Promise<string> {
  await db.sessions.put(session);
  return session.id;
}

export async function getRecentSessions(limit = 50): Promise<TypingSession[]> {
  return db.sessions.orderBy("startedAt").reverse().limit(limit).toArray();
}

// ── DailyStats ──

export async function updateDailyStats(date: string, stats: DailyStats): Promise<void> {
  await db.dailyStats.put({ ...stats, date });
}

export async function getDailyStats(date: string): Promise<DailyStats | undefined> {
  return db.dailyStats.get(date);
}

// ── Settings ──

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const row = await db.settings.get(key);
  return row?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}
