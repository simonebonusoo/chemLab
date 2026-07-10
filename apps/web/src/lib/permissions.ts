import type { Role } from "@chemlab/types";

/**
 * Capability model. The demo enforces these in the UI/service layer; the
 * production schema enforces the equivalent rules with Postgres RLS
 * (see supabase/schema.sql). Never rely on frontend checks alone in prod.
 */
export type Capability =
  | "project:create"
  | "notebook:create"
  | "calculator:use"
  | "compound:read"
  | "molecule:create"
  | "reaction:create"
  | "experiment:manage"
  | "inventory:read"
  | "inventory:manage"
  | "location:manage"
  | "audit:read"
  | "members:manage"
  | "organization:manage"
  | "platform:manage"
  | "plugins:manage";

const MATRIX: Record<Role, Capability[]> = {
  student: [
    "project:create",
    "notebook:create",
    "calculator:use",
    "compound:read",
    "molecule:create",
    "reaction:create",
    "inventory:read",
  ],
  researcher: [
    "project:create",
    "notebook:create",
    "calculator:use",
    "compound:read",
    "molecule:create",
    "reaction:create",
    "experiment:manage",
    "inventory:read",
  ],
  lab_manager: [
    "project:create",
    "notebook:create",
    "calculator:use",
    "compound:read",
    "molecule:create",
    "reaction:create",
    "experiment:manage",
    "inventory:read",
    "inventory:manage",
    "location:manage",
    "audit:read",
    "members:manage",
  ],
  organization_admin: [
    "project:create",
    "notebook:create",
    "calculator:use",
    "compound:read",
    "molecule:create",
    "reaction:create",
    "experiment:manage",
    "inventory:read",
    "inventory:manage",
    "location:manage",
    "audit:read",
    "members:manage",
    "organization:manage",
    "plugins:manage",
  ],
  platform_admin: [
    "project:create",
    "notebook:create",
    "calculator:use",
    "compound:read",
    "molecule:create",
    "reaction:create",
    "experiment:manage",
    "inventory:read",
    "inventory:manage",
    "location:manage",
    "audit:read",
    "members:manage",
    "organization:manage",
    "platform:manage",
    "plugins:manage",
  ],
};

export function can(role: Role | undefined, capability: Capability): boolean {
  if (!role) return false;
  return MATRIX[role].includes(capability);
}

export const ROLE_LABELS: Record<Role, string> = {
  student: "Studente",
  researcher: "Ricercatore",
  lab_manager: "Lab Manager",
  organization_admin: "Org Admin",
  platform_admin: "Platform Admin",
};
