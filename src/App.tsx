import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import { DashboardPage } from "./features/dashboard/DashboardPage.tsx";
import { WordTypingPage } from "./features/word-mode/WordTypingPage.tsx";
import { ArticleTypingPage } from "./features/article-mode/ArticleTypingPage.tsx";
import { MaterialListPage } from "./features/material/MaterialListPage.tsx";
import { StatsPage } from "./features/stats/StatsPage.tsx";
import { SettingsPage } from "./features/settings/SettingsPage.tsx";
import { useDefaultMaterials } from "./hooks/useDefaultMaterials.ts";

export default function App() {
  useDefaultMaterials();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/word" element={<WordTypingPage />} />
        <Route path="/article" element={<ArticleTypingPage />} />
        <Route path="/materials" element={<MaterialListPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
