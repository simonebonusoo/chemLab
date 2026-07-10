-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  ChemLab — PostgreSQL / Supabase schema (MVP)                              ║
-- ║  Multi-tenant (organization_id / workspace_id) with Row Level Security.   ║
-- ║  Apply with: supabase db push  (or psql -f supabase/schema.sql)           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type role_type as enum
    ('student','researcher','lab_manager','organization_admin','platform_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('draft','active','paused','completed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type experiment_status as enum
    ('planned','running','completed','failed','paused','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_status as enum ('in_stock','low','out','expired');
exception when duplicate_object then null; end $$;

-- ── Helper: updated_at trigger ───────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

-- ════════════════════════════════════════════════════════════════════════════
-- AUTH & ORGANIZATIONS
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role role_type not null default 'student',
  organization_id uuid,
  avatar_initials text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role role_type not null default 'researcher',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role role_type not null default 'researcher',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists invitations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  email text not null,
  role role_type not null default 'researcher',
  token text unique not null default encode(gen_random_bytes(16),'hex'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

-- ════════════════════════════════════════════════════════════════════════════
-- PROJECTS
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  color text default '#2f66f6',
  icon text default 'flask',
  status project_status not null default 'active',
  tags text[] default '{}',
  starred boolean default false,
  owner_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role role_type not null default 'researcher',
  unique (project_id, user_id)
);

create table if not exists project_tags (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  tag text not null
);

create table if not exists folders (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  parent_id uuid references folders(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- NOTEBOOKS & EXPERIMENTS
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists notebooks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists notebook_pages (
  id uuid primary key default uuid_generate_v4(),
  notebook_id uuid not null references notebooks(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  "order" int not null default 0,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id)
);

create table if not exists notebook_page_versions (
  id uuid primary key default uuid_generate_v4(),
  page_id uuid not null references notebook_pages(id) on delete cascade,
  version int not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table if not exists experiments (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  code text not null,
  title text not null,
  objective text,
  hypothesis text,
  procedure text,
  observations text,
  results text,
  conclusions text,
  status experiment_status not null default 'planned',
  temperature numeric,
  pressure numeric,
  atmosphere text,
  duration_minutes int,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists experiment_versions (
  id uuid primary key default uuid_generate_v4(),
  experiment_id uuid not null references experiments(id) on delete cascade,
  version int not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  entity text not null,
  entity_id uuid not null,
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- CHEMISTRY
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists compounds (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  preferred_name text not null,
  iupac_name text,
  formula text,
  molar_mass numeric,
  smiles text,
  canonical_smiles text,
  inchi text,
  inchikey text,
  pubchem_cid text,
  chebi_id text,
  cas_number text,
  cas_source text,
  physical_state text,
  melting_point text,
  boiling_point text,
  density text,
  logp text,
  color text,
  ghs_pictograms text[] default '{}',
  hazard_statements text[] default '{}',
  precautionary_statements text[] default '{}',
  sds_url text,
  source_provider text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists compound_names (
  id uuid primary key default uuid_generate_v4(),
  compound_id uuid not null references compounds(id) on delete cascade,
  name text not null,
  kind text default 'synonym'
);

create table if not exists compound_identifiers (
  id uuid primary key default uuid_generate_v4(),
  compound_id uuid not null references compounds(id) on delete cascade,
  kind text not null,       -- cid | inchikey | smiles | cas | chebi
  value text not null,
  source text
);

create table if not exists compound_properties (
  id uuid primary key default uuid_generate_v4(),
  compound_id uuid not null references compounds(id) on delete cascade,
  key text not null,
  value text,
  unit text,
  source text,
  reliability text default 'unverified',
  fetched_at timestamptz,
  note text
);

create table if not exists compound_sources (
  id uuid primary key default uuid_generate_v4(),
  compound_id uuid not null references compounds(id) on delete cascade,
  provider text not null,
  external_id text,
  source_url text,
  fetched_at timestamptz,
  raw_data jsonb
);

create table if not exists molecules (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  smiles text,
  molfile text,
  formula text,
  molar_mass numeric,
  inchi text,
  inchikey text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists reactions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  name text not null,
  code text not null,
  scheme text,
  temperature numeric,
  pressure numeric,
  atmosphere text,
  duration_minutes int,
  theoretical_yield numeric,
  actual_yield numeric,
  yield_percent numeric,
  reference text,
  notes text,
  status experiment_status not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists reaction_components (
  id uuid primary key default uuid_generate_v4(),
  reaction_id uuid not null references reactions(id) on delete cascade,
  role text not null,     -- reactant | product | reagent | catalyst | solvent
  name text not null,
  compound_id uuid references compounds(id),
  formula text,
  molar_mass numeric,
  amount numeric,
  amount_unit text,
  moles numeric,
  equivalents numeric,
  density numeric,
  concentration numeric,
  purity numeric,
  limiting boolean default false
);

create table if not exists reaction_conditions (
  id uuid primary key default uuid_generate_v4(),
  reaction_id uuid not null references reactions(id) on delete cascade,
  key text not null,
  value text
);

create table if not exists reaction_results (
  id uuid primary key default uuid_generate_v4(),
  reaction_id uuid not null references reactions(id) on delete cascade,
  key text not null,
  value text,
  unit text
);

-- ════════════════════════════════════════════════════════════════════════════
-- INVENTORY
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists inventory_locations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  building text, lab text, room text, cabinet text, shelf text, storage text,
  created_at timestamptz not null default now()
);

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  compound_id uuid references compounds(id),
  category text not null,
  supplier text,
  product_code text,
  lot_number text,
  purity text,
  concentration text,
  quantity numeric not null default 0,
  unit text not null default 'g',
  initial_quantity numeric,
  min_stock numeric,
  purchase_date date,
  opened_date date,
  expiry_date date,
  location_id uuid references inventory_locations(id),
  owner_id uuid references profiles(id),
  status inventory_status not null default 'in_stock',
  storage_temp text,
  ghs_pictograms text[] default '{}',
  sds_url text,
  barcode text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists inventory_batches (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  lot_number text,
  quantity numeric not null,
  expiry_date date,
  received_date date default now()
);

create table if not exists inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  type text not null,          -- in | out | adjust
  quantity numeric not null,
  unit text not null,
  reason text,
  user_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists stock_alerts (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  type text not null,          -- low_stock | expiry
  resolved boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists prepared_solutions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  solvent text,
  solutes jsonb default '[]'::jsonb,
  concentration numeric,
  concentration_unit text,
  total_volume numeric,
  prepared_by uuid references profiles(id),
  protocol text,
  expiry_date date,
  internal_lot text,
  prepared_at timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- FILES
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists files (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  mime_type text,
  size_bytes bigint,
  extension text,
  folder text,
  tags text[] default '{}',
  project_id uuid references projects(id) on delete set null,
  experiment_id uuid references experiments(id) on delete set null,
  checksum text,
  storage_ref text,      -- Supabase Storage object key
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

create table if not exists file_versions (
  id uuid primary key default uuid_generate_v4(),
  file_id uuid not null references files(id) on delete cascade,
  version int not null,
  storage_ref text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists file_links (
  id uuid primary key default uuid_generate_v4(),
  file_id uuid not null references files(id) on delete cascade,
  entity text not null,
  entity_id uuid not null
);

-- ════════════════════════════════════════════════════════════════════════════
-- CALCULATIONS / SPECTRA
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists saved_calculations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  calculator_id text not null,
  title text not null,
  inputs jsonb not null default '{}'::jsonb,
  result text,
  result_value numeric,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table if not exists spectra (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  type text not null,
  x_label text,
  y_label text,
  data jsonb not null default '[]'::jsonb,
  compound_id uuid references compounds(id),
  experiment_id uuid references experiments(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table if not exists spectrum_peaks (
  id uuid primary key default uuid_generate_v4(),
  spectrum_id uuid not null references spectra(id) on delete cascade,
  x numeric not null,
  y numeric,
  label text
);

create table if not exists spectrum_annotations (
  id uuid primary key default uuid_generate_v4(),
  spectrum_id uuid not null references spectra(id) on delete cascade,
  x numeric,
  text text,
  created_by uuid references profiles(id)
);

-- ════════════════════════════════════════════════════════════════════════════
-- COLLABORATION
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- PLUGINS
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists plugins (
  id text primary key,
  name text not null,
  version text not null,
  author text,
  description text,
  category text,
  manifest jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists organization_plugins (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plugin_id text not null references plugins(id) on delete cascade,
  enabled boolean not null default true,
  unique (organization_id, plugin_id)
);

create table if not exists plugin_settings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plugin_id text not null references plugins(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  unique (organization_id, plugin_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_projects_workspace on projects(workspace_id);
create index if not exists idx_notebooks_workspace on notebooks(workspace_id);
create index if not exists idx_pages_notebook on notebook_pages(notebook_id);
create index if not exists idx_experiments_workspace on experiments(workspace_id);
create index if not exists idx_compounds_workspace on compounds(workspace_id);
create index if not exists idx_compounds_inchikey on compounds(inchikey);
create index if not exists idx_compounds_formula on compounds(formula);
create index if not exists idx_compounds_name_trgm on compounds using gin (preferred_name gin_trgm_ops);
create index if not exists idx_inventory_workspace on inventory_items(workspace_id);
create index if not exists idx_inventory_status on inventory_items(status);
create index if not exists idx_movements_item on inventory_movements(item_id);
create index if not exists idx_files_workspace on files(workspace_id);
create index if not exists idx_notifications_user on notifications(user_id, read);
create index if not exists idx_activity_workspace on activity_logs(workspace_id);

-- (pg_trgm needed for the name index)
create extension if not exists pg_trgm;

-- ── updated_at triggers ──────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'organizations','workspaces','projects','notebooks','notebook_pages',
    'experiments','compounds','molecules','reactions','inventory_items',
    'files','spectra','profiles'
  ] loop
    execute format(
      'drop trigger if exists trg_%1$s_updated on %1$s;
       create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (multi-tenancy). Backend enforcement — never trust the FE.
-- ════════════════════════════════════════════════════════════════════════════
-- Membership helper: workspaces the current user can access.
create or replace function user_workspace_ids() returns setof uuid as $$
  select workspace_id from workspace_members where user_id = auth.uid();
$$ stable language sql security definer;

create or replace function user_org_ids() returns setof uuid as $$
  select organization_id from organization_members where user_id = auth.uid();
$$ stable language sql security definer;

create or replace function is_platform_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'platform_admin');
$$ stable language sql security definer;

-- Enable RLS and add workspace-scoped policies for tenant tables.
do $$
declare t text;
begin
  foreach t in array array[
    'projects','notebooks','experiments','compounds','molecules','reactions',
    'inventory_items','inventory_locations','files','spectra','saved_calculations',
    'prepared_solutions'
  ] loop
    execute format('alter table %1$s enable row level security;', t);
    execute format($f$
      drop policy if exists %1$s_select on %1$s;
      create policy %1$s_select on %1$s for select
        using (is_platform_admin() or workspace_id in (select user_workspace_ids()));
      drop policy if exists %1$s_modify on %1$s;
      create policy %1$s_modify on %1$s for all
        using (is_platform_admin() or workspace_id in (select user_workspace_ids()))
        with check (is_platform_admin() or workspace_id in (select user_workspace_ids()));
    $f$, t);
  end loop;
end $$;

-- Profiles: users see themselves and members of their orgs.
alter table profiles enable row level security;
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select
  using (id = auth.uid() or is_platform_admin()
         or organization_id in (select user_org_ids()));
drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles for update using (id = auth.uid());

-- Notifications: only the recipient.
alter table notifications enable row level security;
drop policy if exists notifications_own on notifications;
create policy notifications_own on notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Organizations / workspaces: members only.
alter table organizations enable row level security;
drop policy if exists org_member_select on organizations;
create policy org_member_select on organizations for select
  using (is_platform_admin() or id in (select user_org_ids()));

alter table workspaces enable row level security;
drop policy if exists ws_member_select on workspaces;
create policy ws_member_select on workspaces for select
  using (is_platform_admin() or id in (select user_workspace_ids()));

-- NOTE: activity_logs / audit are append-only; a service role writes them.
-- The architecture is PREDISPOSED for future compliance features (not certified
-- for GLP/GMP/ISO/21 CFR Part 11).
