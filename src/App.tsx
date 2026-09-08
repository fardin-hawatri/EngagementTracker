import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DatasetProvider } from "./hooks/useDataset";
import { FilterProvider } from "./hooks/useFilters";
import { ThemeProvider } from "./hooks/useTheme";
import { AllReelsPage } from "./pages/AllReels/AllReelsPage";
import { ContentTopicsPage } from "./pages/ContentTopics/ContentTopicsPage";
import { InsightsPage } from "./pages/Insights/InsightsPage";
import { OverviewPage } from "./pages/Overview/OverviewPage";
import { PerformancePage } from "./pages/Performance/PerformancePage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { TopicDetailPage } from "./pages/TopicDetail/TopicDetailPage";

export default function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <DatasetProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/topics" element={<ContentTopicsPage />} />
                <Route path="/topics/:slug" element={<TopicDetailPage />} />
                <Route path="/reels" element={<AllReelsPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DatasetProvider>
      </FilterProvider>
    </ThemeProvider>
  );
}
