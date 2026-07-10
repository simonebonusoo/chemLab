import type { DemoDb } from "@/store/db";

export interface SearchResult {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  to: string;
}

/**
 * Global text search across the local demo database. In production the same
 * shape is served by the API `/search` endpoint (Postgres full-text + optional
 * RDKit structure search — see docs/ARCHITECTURE.md §Search).
 */
export function globalSearch(db: DemoDb, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  const match = (...vals: (string | undefined)[]) =>
    vals.some((v) => v && v.toLowerCase().includes(q));

  for (const p of db.projects)
    if (match(p.name, p.description, ...p.tags))
      results.push({ id: p.id, category: "Progetti", title: p.name, subtitle: p.description, to: `/app/projects/${p.id}` });

  for (const n of db.notebooks)
    if (match(n.name, n.description))
      results.push({ id: n.id, category: "Notebook", title: n.name, subtitle: n.description, to: `/app/notebooks/${n.id}` });

  for (const e of db.experiments)
    if (match(e.title, e.code, e.objective))
      results.push({ id: e.id, category: "Esperimenti", title: e.title, subtitle: e.code, to: `/app/experiments/${e.id}` });

  for (const m of db.molecules)
    if (match(m.name, m.formula, m.smiles))
      results.push({ id: m.id, category: "Molecole", title: m.name, subtitle: m.formula, to: `/app/molecules/${m.id}` });

  for (const c of db.compounds)
    if (match(c.preferredName, c.formula, c.casNumber, c.iupacName, ...c.synonyms))
      results.push({ id: c.id, category: "Composti", title: c.preferredName, subtitle: c.formula, to: `/app/compounds/${c.id}` });

  for (const r of db.reactions)
    if (match(r.name, r.code))
      results.push({ id: r.id, category: "Reazioni", title: r.name, subtitle: r.code, to: `/app/reactions/${r.id}` });

  for (const i of db.inventoryItems)
    if (match(i.name, i.lotNumber, i.supplier))
      results.push({ id: i.id, category: "Inventario", title: i.name, subtitle: `${i.quantity} ${i.unit}`, to: `/app/inventory/${i.id}` });

  for (const f of db.files)
    if (match(f.name, ...f.tags))
      results.push({ id: f.id, category: "File", title: f.name, subtitle: f.extension.toUpperCase(), to: `/app/files` });

  for (const u of db.profiles)
    if (match(u.fullName, u.email))
      results.push({ id: u.id, category: "Utenti", title: u.fullName, subtitle: u.email, to: `/app/settings` });

  for (const c of db.savedCalculations)
    if (match(c.title, c.result))
      results.push({ id: c.id, category: "Calcoli", title: c.title, subtitle: c.result, to: `/app/calculators/history` });

  return results.slice(0, 40);
}
