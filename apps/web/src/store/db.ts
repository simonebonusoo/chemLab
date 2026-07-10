import { create } from "zustand";
import type {
  ActivityLog,
  Comment,
  Compound,
  Experiment,
  FileRecord,
  InventoryItem,
  InventoryLocation,
  InventoryMovement,
  Molecule,
  Notification,
  Notebook,
  NotebookPage,
  Organization,
  Profile,
  Project,
  Reaction,
  SavedCalculation,
  Spectrum,
  Workspace,
} from "@chemlab/types";
import { buildSeed } from "@/data/seed";
import { nowIso, uid } from "@/lib/utils";

const STORAGE_KEY = "chemlab.db.v1";

export interface DemoDb {
  profiles: Profile[];
  organizations: Organization[];
  workspaces: Workspace[];
  projects: Project[];
  notebooks: Notebook[];
  notebookPages: NotebookPage[];
  experiments: Experiment[];
  molecules: Molecule[];
  compounds: Compound[];
  reactions: Reaction[];
  inventoryItems: InventoryItem[];
  inventoryLocations: InventoryLocation[];
  inventoryMovements: InventoryMovement[];
  files: FileRecord[];
  spectra: Spectrum[];
  savedCalculations: SavedCalculation[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  comments: Comment[];
}

/** Collections that hold BaseEntity records (support generic CRUD helpers). */
export type EntityCollection = Exclude<keyof DemoDb, "profiles">;

interface DbStore extends DemoDb {
  ready: boolean;
  hydrate(): void;
  reset(): void;
  insert<K extends EntityCollection>(c: K, record: DemoDb[K][number]): DemoDb[K][number];
  update<K extends EntityCollection>(
    c: K,
    id: string,
    patch: Partial<DemoDb[K][number]>,
  ): void;
  remove<K extends EntityCollection>(c: K, id: string): void;
  logActivity(action: string, entity: string, entityId?: string, userId?: string): void;
  notify(n: Omit<Notification, "id" | "createdAt" | "updatedAt" | "read">): void;
}

function persist(db: DemoDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage quota / private mode — demo continues in-memory */
  }
}

function load(): DemoDb | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoDb;
  } catch {
    return null;
  }
}

const emptyDb = (): DemoDb => ({
  profiles: [],
  organizations: [],
  workspaces: [],
  projects: [],
  notebooks: [],
  notebookPages: [],
  experiments: [],
  molecules: [],
  compounds: [],
  reactions: [],
  inventoryItems: [],
  inventoryLocations: [],
  inventoryMovements: [],
  files: [],
  spectra: [],
  savedCalculations: [],
  notifications: [],
  activityLogs: [],
  comments: [],
});

function snapshot(get: () => DbStore): DemoDb {
  const s = get();
  return {
    profiles: s.profiles,
    organizations: s.organizations,
    workspaces: s.workspaces,
    projects: s.projects,
    notebooks: s.notebooks,
    notebookPages: s.notebookPages,
    experiments: s.experiments,
    molecules: s.molecules,
    compounds: s.compounds,
    reactions: s.reactions,
    inventoryItems: s.inventoryItems,
    inventoryLocations: s.inventoryLocations,
    inventoryMovements: s.inventoryMovements,
    files: s.files,
    spectra: s.spectra,
    savedCalculations: s.savedCalculations,
    notifications: s.notifications,
    activityLogs: s.activityLogs,
    comments: s.comments,
  };
}

export const useDb = create<DbStore>((set, get) => ({
  ...emptyDb(),
  ready: false,

  hydrate() {
    if (get().ready) return;
    const stored = load();
    const db = stored ?? buildSeed();
    if (!stored) persist(db);
    set({ ...db, ready: true });
  },

  reset() {
    const db = buildSeed();
    persist(db);
    set({ ...db, ready: true });
  },

  insert(c, record) {
    set((state) => {
      const next = [...(state[c] as unknown[]), record];
      const patch = { [c]: next } as unknown as Partial<DbStore>;
      return patch;
    });
    persist(snapshot(get));
    return record;
  },

  update(c, id, patch) {
    set((state) => {
      const list = state[c] as Array<{ id: string }>;
      const next = list.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r,
      );
      return { [c]: next } as unknown as Partial<DbStore>;
    });
    persist(snapshot(get));
  },

  remove(c, id) {
    set((state) => {
      const list = state[c] as Array<{ id: string }>;
      return { [c]: list.filter((r) => r.id !== id) } as unknown as Partial<DbStore>;
    });
    persist(snapshot(get));
  },

  logActivity(action, entity, entityId, userId) {
    const log: ActivityLog = {
      id: uid(),
      action,
      entity,
      entityId,
      userId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    set((state) => ({ activityLogs: [log, ...state.activityLogs].slice(0, 200) }));
    persist(snapshot(get));
  },

  notify(n) {
    const notification: Notification = {
      ...n,
      id: uid(),
      read: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    set((state) => ({ notifications: [notification, ...state.notifications] }));
    persist(snapshot(get));
  },
}));
