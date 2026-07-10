import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/Toaster";
import { LoadingState } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { useDb } from "@/store/db";
import { useUi } from "@/store/ui";

// Public pages
const Landing = lazy(() => import("@/pages/public/Landing"));
const Login = lazy(() => import("@/pages/public/Login"));
const Register = lazy(() => import("@/pages/public/Register"));
const Docs = lazy(() => import("@/pages/public/Docs"));
const Legal = lazy(() => import("@/pages/public/Legal"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

// App pages
const Dashboard = lazy(() => import("@/pages/app/Dashboard"));
const Workspace = lazy(() => import("@/pages/app/Workspace"));
const Projects = lazy(() => import("@/pages/app/Projects"));
const ProjectDetail = lazy(() => import("@/pages/app/ProjectDetail"));
const Notebooks = lazy(() => import("@/pages/app/Notebooks"));
const NotebookEditor = lazy(() => import("@/pages/app/NotebookEditor"));
const Experiments = lazy(() => import("@/pages/app/Experiments"));
const ExperimentDetail = lazy(() => import("@/pages/app/ExperimentDetail"));
const Molecules = lazy(() => import("@/pages/app/Molecules"));
const MoleculeDetail = lazy(() => import("@/pages/app/MoleculeDetail"));
const Draw = lazy(() => import("@/pages/app/Draw"));
const Reactions = lazy(() => import("@/pages/app/Reactions"));
const ReactionDetail = lazy(() => import("@/pages/app/ReactionDetail"));
const Inventory = lazy(() => import("@/pages/app/Inventory"));
const InventoryDetail = lazy(() => import("@/pages/app/InventoryDetail"));
const Calculators = lazy(() => import("@/pages/app/Calculators"));
const CalculatorHistory = lazy(() => import("@/pages/app/CalculatorHistory"));
const Compounds = lazy(() => import("@/pages/app/Compounds"));
const CompoundDetail = lazy(() => import("@/pages/app/CompoundDetail"));
const Files = lazy(() => import("@/pages/app/Files"));
const Spectra = lazy(() => import("@/pages/app/Spectra"));
const Plugins = lazy(() => import("@/pages/app/Plugins"));
const Notifications = lazy(() => import("@/pages/app/Notifications"));
const Profile = lazy(() => import("@/pages/app/Profile"));
const Settings = lazy(() => import("@/pages/app/Settings"));
const Admin = lazy(() => import("@/pages/app/Admin"));

export function App() {
  const initAuth = useAuth((s) => s.init);
  const hydrate = useDb((s) => s.hydrate);
  const initTheme = useUi((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    hydrate();
    initAuth();
  }, [initAuth, hydrate, initTheme]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState label="Caricamento ChemLab…" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/legal/:doc" element={<Legal />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="workspace" element={<Workspace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="notebooks" element={<Notebooks />} />
            <Route path="notebooks/:id" element={<NotebookEditor />} />
            <Route path="experiments" element={<Experiments />} />
            <Route path="experiments/:id" element={<ExperimentDetail />} />
            <Route path="molecules" element={<Molecules />} />
            <Route path="molecules/:id" element={<MoleculeDetail />} />
            <Route path="draw" element={<Draw />} />
            <Route path="reactions" element={<Reactions />} />
            <Route path="reactions/:id" element={<ReactionDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/:id" element={<InventoryDetail />} />
            <Route path="calculators" element={<Calculators />} />
            <Route path="calculators/history" element={<CalculatorHistory />} />
            <Route path="compounds" element={<Compounds />} />
            <Route path="compounds/:id" element={<CompoundDetail />} />
            <Route path="files" element={<Files />} />
            <Route path="spectra" element={<Spectra />} />
            <Route path="plugins" element={<Plugins />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  );
}
