import { useState, useEffect } from "react";
import { Card } from "../ui/Card.tsx";
import { Button } from "../ui/Button.tsx";
import { ImportWizard } from "../../features/material/ImportWizard.tsx";
import { useMaterialStore } from "../../stores/materialStore.ts";

interface MaterialPickerProps {
  filterType: "wordlist" | "article";
  onSelect: (id: string) => void;
}

export function MaterialPicker({ filterType, onSelect }: MaterialPickerProps) {
  const { materials, refresh } = useMaterialStore();
  const [showImport, setShowImport] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = materials.filter(
    (m) => filterType === "article"
      ? m.type === "article_en" || m.type === "article_zh"
      : m.type === "wordlist"
  );

  if (filtered.length === 0) {
    return (
      <div className="space-y-3">
        <div className="py-8 text-center text-gray-400">
          <p className="text-2xl mb-2">No materials</p>
          <p className="text-sm">Import to get started</p>
        </div>
        <div className="text-center">
          <Button onClick={() => setShowImport(true)}>Import</Button>
        </div>
        <ImportWizard open={showImport} onClose={() => setShowImport(false)} onImported={() => { refresh(); setShowImport(false); }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{filtered.length} materials</span>
        <Button size="sm" variant="ghost" onClick={() => setShowImport(true)}>Import</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((m) => (
          <Card key={m.id} hover className="cursor-pointer" onClick={() => onSelect(m.id)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {m.entries?.length != null ? m.entries?.length + " words" : (m.wordCount ?? 0) + " chars"}
                  {m.source === "builtin" && <span className="ml-1 text-indigo-500">builtin</span>}
                </p>
              </div>
              <span className="text-xs text-indigo-500">Start</span>
            </div>
          </Card>
        ))}
      </div>
      <ImportWizard open={showImport} onClose={() => setShowImport(false)} onImported={() => { refresh(); setShowImport(false); }} />
    </div>
  );
}