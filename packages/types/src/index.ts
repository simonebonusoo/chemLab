/** Shared domain types for ChemLab. */

export type UUID = string;
export type ISODate = string;

export type Role =
  | "student"
  | "researcher"
  | "lab_manager"
  | "organization_admin"
  | "platform_admin";

export interface BaseEntity {
  id: UUID;
  createdAt: ISODate;
  updatedAt: ISODate;
  createdBy?: UUID;
  updatedBy?: UUID;
  deletedAt?: ISODate | null;
}

export interface Profile {
  id: UUID;
  email: string;
  fullName: string;
  role: Role;
  organizationId?: UUID;
  avatarInitials?: string;
  title?: string;
}

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
}

export interface Workspace extends BaseEntity {
  organizationId: UUID;
  name: string;
  description?: string;
}

export type ProjectStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface Project extends BaseEntity {
  workspaceId: UUID;
  name: string;
  description?: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  tags: string[];
  ownerId: UUID;
  memberIds: UUID[];
  starred?: boolean;
}

export interface Notebook extends BaseEntity {
  projectId?: UUID;
  workspaceId: UUID;
  name: string;
  description?: string;
}

export interface NotebookPage extends BaseEntity {
  notebookId: UUID;
  title: string;
  /** TipTap JSON document. */
  content: unknown;
  order: number;
  version: number;
}

export type ExperimentStatus =
  | "planned"
  | "running"
  | "completed"
  | "failed"
  | "paused"
  | "archived";

export interface Experiment extends BaseEntity {
  projectId?: UUID;
  workspaceId: UUID;
  code: string;
  title: string;
  objective?: string;
  hypothesis?: string;
  procedure?: string;
  observations?: string;
  results?: string;
  conclusions?: string;
  status: ExperimentStatus;
  temperature?: number;
  pressure?: number;
  atmosphere?: string;
  durationMinutes?: number;
  reactionIds: UUID[];
  tags: string[];
}

// ── Chemistry ──────────────────────────────────────────────────────────────
export interface Molecule extends BaseEntity {
  workspaceId: UUID;
  name: string;
  smiles?: string;
  molfile?: string;
  formula?: string;
  molarMass?: number;
  inchi?: string;
  inchiKey?: string;
  notes?: string;
}

export interface CompoundProperty {
  key: string;
  value: string;
  unit?: string;
  source?: string;
  fetchedAt?: ISODate;
  reliability?: "high" | "medium" | "low" | "unverified";
}

export interface Compound extends BaseEntity {
  workspaceId: UUID;
  preferredName: string;
  iupacName?: string;
  synonyms: string[];
  formula?: string;
  molarMass?: number;
  smiles?: string;
  canonicalSmiles?: string;
  inchi?: string;
  inchiKey?: string;
  pubchemCid?: string;
  chebiId?: string;
  casNumber?: string;
  casSource?: string;
  physicalState?: string;
  meltingPoint?: string;
  boilingPoint?: string;
  density?: string;
  logP?: string;
  color?: string;
  ghsPictograms: string[];
  hazardStatements: string[];
  precautionaryStatements: string[];
  sdsUrl?: string;
  properties: CompoundProperty[];
  sourceProvider?: string;
  sourceUrl?: string;
}

export type ReactionComponentRole =
  | "reactant"
  | "product"
  | "reagent"
  | "catalyst"
  | "solvent";

export interface ReactionComponent {
  id: UUID;
  role: ReactionComponentRole;
  name: string;
  formula?: string;
  molarMass?: number;
  amount?: number;
  amountUnit?: string;
  moles?: number;
  equivalents?: number;
  density?: number;
  concentration?: number;
  purity?: number;
  limiting?: boolean;
}

export interface Reaction extends BaseEntity {
  workspaceId: UUID;
  projectId?: UUID;
  name: string;
  code: string;
  scheme?: string;
  components: ReactionComponent[];
  temperature?: number;
  pressure?: number;
  atmosphere?: string;
  durationMinutes?: number;
  theoreticalYield?: number;
  actualYield?: number;
  yieldPercent?: number;
  reference?: string;
  notes?: string;
  status: ExperimentStatus;
}

// ── Inventory ────────────────────────────────────────────────────────────────
export type InventoryStatus = "in_stock" | "low" | "out" | "expired";
export type InventoryCategory =
  | "reagent"
  | "solvent"
  | "solution"
  | "sample"
  | "material"
  | "standard"
  | "consumable"
  | "gas"
  | "synthesized";

export interface InventoryLocation extends BaseEntity {
  workspaceId: UUID;
  building?: string;
  lab?: string;
  room?: string;
  cabinet?: string;
  shelf?: string;
  storage?: string;
  name: string;
}

export interface InventoryItem extends BaseEntity {
  workspaceId: UUID;
  name: string;
  compoundId?: UUID;
  category: InventoryCategory;
  supplier?: string;
  productCode?: string;
  lotNumber?: string;
  purity?: string;
  concentration?: string;
  quantity: number;
  unit: string;
  initialQuantity?: number;
  minStock?: number;
  purchaseDate?: ISODate;
  openedDate?: ISODate;
  expiryDate?: ISODate;
  locationId?: UUID;
  locationName?: string;
  ownerId?: UUID;
  status: InventoryStatus;
  storageTemp?: string;
  ghsPictograms: string[];
  sdsUrl?: string;
  notes?: string;
  barcode?: string;
}

export interface InventoryMovement extends BaseEntity {
  itemId: UUID;
  type: "in" | "out" | "adjust";
  quantity: number;
  unit: string;
  reason?: string;
  userId?: UUID;
}

// ── Files ─────────────────────────────────────────────────────────────────────
export interface FileRecord extends BaseEntity {
  workspaceId: UUID;
  name: string;
  mimeType: string;
  sizeBytes: number;
  extension: string;
  folder?: string;
  tags: string[];
  projectId?: UUID;
  experimentId?: UUID;
  checksum?: string;
  /** Data URL for demo-local storage; a storage key in production. */
  storageRef?: string;
}

// ── Spectra ────────────────────────────────────────────────────────────────
export type SpectrumType = "NMR" | "IR" | "UV-Vis" | "MS" | "HPLC" | "GC";

export interface SpectrumPeak {
  x: number;
  y: number;
  label?: string;
}

export interface Spectrum extends BaseEntity {
  workspaceId: UUID;
  name: string;
  type: SpectrumType;
  xLabel: string;
  yLabel: string;
  data: Array<[number, number]>;
  peaks: SpectrumPeak[];
  compoundId?: UUID;
  experimentId?: UUID;
}

// ── Calculations ─────────────────────────────────────────────────────────────
export interface SavedCalculation extends BaseEntity {
  workspaceId: UUID;
  calculatorId: string;
  title: string;
  inputs: Record<string, unknown>;
  result: string;
  resultValue?: number;
}

// ── Collaboration ────────────────────────────────────────────────────────────
export type NotificationType =
  | "invite"
  | "mention"
  | "comment"
  | "experiment_update"
  | "low_stock"
  | "expiry"
  | "file_shared"
  | "task_assigned"
  | "import_error"
  | "processing_done";

export interface Notification extends BaseEntity {
  userId: UUID;
  type: NotificationType;
  title: string;
  body?: string;
  read: boolean;
  link?: string;
}

export interface ActivityLog extends BaseEntity {
  userId?: UUID;
  action: string;
  entity: string;
  entityId?: UUID;
  metadata?: Record<string, unknown>;
}

export interface Comment extends BaseEntity {
  entity: string;
  entityId: UUID;
  userId: UUID;
  body: string;
}
