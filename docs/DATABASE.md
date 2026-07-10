# ChemLab — Database

Schema completo: [`supabase/schema.sql`](../supabase/schema.sql).

## Multi-tenancy

Ogni dato privato è collegato a `workspace_id` (e transitivamente a
`organization_id`). Le tabelle tenant abilitano **Row Level Security** con una
policy generata per select e per scrittura:

```sql
using (is_platform_admin() or workspace_id in (select user_workspace_ids()))
```

Funzioni helper `security definer`: `user_workspace_ids()`, `user_org_ids()`,
`is_platform_admin()`.

## Gruppi di tabelle

- **Auth/Org**: `profiles, organizations, organization_members, workspaces,
  workspace_members, invitations`
- **Progetti**: `projects, project_members, project_tags, folders`
- **Notebook**: `notebooks, notebook_pages, notebook_page_versions, experiments,
  experiment_versions, comments`
- **Chimica**: `compounds, compound_names, compound_identifiers,
  compound_properties, compound_sources, molecules, reactions,
  reaction_components, reaction_conditions, reaction_results`
- **Inventario**: `inventory_items, inventory_batches, inventory_locations,
  inventory_movements, stock_alerts, prepared_solutions`
- **File**: `files, file_versions, file_links`
- **Calcoli/Spettri**: `saved_calculations, spectra, spectrum_peaks,
  spectrum_annotations`
- **Collaborazione**: `notifications, activity_logs`
- **Plugin**: `plugins, organization_plugins, plugin_settings`

## Convenzioni

- Chiavi primarie `uuid` (`uuid_generate_v4()`).
- `created_at` / `updated_at` con trigger `set_updated_at()`.
- `created_by` / `updated_by` dove utile.
- `deleted_at` per soft delete sulle entità principali.
- Indici su chiavi esterne, stato, `inchikey`, `formula`, e trigram sul nome
  composto (`pg_trgm`) per ricerca testuale.

## Provenienza dati chimici

I dati esterni non vengono mai fusi silenziosamente: `compound_sources`
conserva `provider`, `external_id`, `source_url`, `fetched_at`, `raw_data`.
`compound_properties` conserva `source`, `reliability` e `note` per ogni valore.

## Migrazioni

Per l'MVP lo schema è un singolo file idempotente. Passando a Supabase CLI si
può spezzare in migrazioni versionate in `supabase/migrations/`.
