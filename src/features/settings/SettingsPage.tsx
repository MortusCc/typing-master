import { useState } from "react";
import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { db } from "../../services/db/database.ts";
import { saveMaterial } from "../../services/db/repositories.ts";
import type { Material } from "../../types/material.ts";
import type { TypingSession } from "../../types/typing.ts";

export default function 设置Page() {
  const [msg, setMsg] = useState("");

  const handleExport = async () => {
    try {
      const materials = await db.materials.toArray();
      const sessions = await db.sessions.toArray();
      const data = JSON.stringify({ materials, sessions, exportedAt: Date.now() }, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `typing-master-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("数据导出成功!");
    } catch (e) {
      setMsg("导出失败: " + String(e));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.materials) {
        for (const m of data.materials as Material[]) {
          await saveMaterial(m);
        }
      }
      if (data.sessions) {
        for (const s of data.sessions as TypingSession[]) {
          await db.sessions.put(s);
        }
      }
      setMsg(`已导入 ${data.materials?.length ?? 0} 个素材和 ${data.sessions?.length ?? 0} 条记录。`);
    } catch (err) {
      setMsg("导入失败: " + String(err));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      <Card>
        <h2 className="mb-3 font-semibold">数据备份</h2>
        <p className="mb-3 text-sm text-gray-500">导出所有素材和练习记录为 JSON 文件，或导入之前的备份。</p>
        <div className="flex gap-3">
          <Button onClick={handleExport}>导出数据 (JSON)</Button>
          <label className="cursor-pointer">
            <Button variant="secondary" onClick={() => document.getElementById("import-file")?.click()}>
              导入数据
            </Button>
            <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        {msg && <p className="mt-3 text-sm text-indigo-600 dark:text-indigo-400">{msg}</p>}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-red-600">危险操作</h2>
        <p className="mb-3 text-sm text-gray-500">Clear all local data. This cannot be undone. Make sure to export a backup first.</p>
        <Button
          variant="ghost"
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={async () => {
            if (!confirm("Delete ALL data? This cannot be undone!")) return;
            await db.delete();
            localStorage.clear();
            window.location.reload();
          }}
        >
          清除所有数据
        </Button>
      </Card>
    </div>
  );
}