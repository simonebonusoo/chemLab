import {
  Home,
  LayoutGrid,
  FolderKanban,
  NotebookPen,
  Atom,
  FlaskConical,
  Boxes,
  Calculator,
  Files,
  Activity,
  Database,
  Puzzle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/app", icon: Home },
  { label: "Workspace", to: "/app/workspace", icon: LayoutGrid },
  { label: "Progetti", to: "/app/projects", icon: FolderKanban },
  { label: "Notebook", to: "/app/notebooks", icon: NotebookPen },
  { label: "Molecole", to: "/app/molecules", icon: Atom },
  { label: "Reazioni", to: "/app/reactions", icon: FlaskConical },
  { label: "Inventario", to: "/app/inventory", icon: Boxes },
  { label: "Calcolatori", to: "/app/calculators", icon: Calculator },
  { label: "File", to: "/app/files", icon: Files },
  { label: "Spettri", to: "/app/spectra", icon: Activity },
  { label: "Database", to: "/app/compounds", icon: Database },
  { label: "Plugin", to: "/app/plugins", icon: Puzzle },
  { label: "Impostazioni", to: "/app/settings", icon: Settings },
];
