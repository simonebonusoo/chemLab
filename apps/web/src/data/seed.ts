import type {
  ActivityLog,
  Compound,
  Experiment,
  FileRecord,
  InventoryItem,
  InventoryLocation,
  Molecule,
  Notebook,
  NotebookPage,
  Notification,
  Organization,
  Profile,
  Project,
  Reaction,
  SavedCalculation,
  Spectrum,
  Workspace,
} from "@chemlab/types";
import type { DemoDb } from "@/store/db";

/** Deterministic ISO date offset helpers so demo data looks realistic. */
const now = () => new Date();
const daysAgo = (d: number) =>
  new Date(now().getTime() - d * 86400000).toISOString();

// ── Users ──────────────────────────────────────────────────────────────────
export const DEMO_USERS: (Profile & { password: string })[] = [
  {
    id: "u-admin",
    email: "admin@chemlab.demo",
    password: "admin1234",
    fullName: "Alessia Conti",
    role: "platform_admin",
    organizationId: "org-1",
    avatarInitials: "AC",
    title: "Platform Administrator",
  },
  {
    id: "u-research",
    email: "researcher@chemlab.demo",
    password: "researcher1234",
    fullName: "Mario Rossi",
    role: "researcher",
    organizationId: "org-1",
    avatarInitials: "MR",
    title: "Researcher",
  },
  {
    id: "u-student",
    email: "student@chemlab.demo",
    password: "student1234",
    fullName: "Giulia Bianchi",
    role: "student",
    organizationId: "org-1",
    avatarInitials: "GB",
    title: "Studente MSc",
  },
  {
    id: "u-labman",
    email: "labmanager@chemlab.demo",
    password: "labmanager1234",
    fullName: "Laura Verdi",
    role: "lab_manager",
    organizationId: "org-1",
    avatarInitials: "LV",
    title: "Lab Manager",
  },
];

interface CompoundSeed {
  name: string;
  iupac?: string;
  formula: string;
  mw: number;
  smiles?: string;
  cas?: string;
  cid?: string;
  state?: string;
  mp?: string;
  bp?: string;
  ghs?: string[];
}

const COMPOUNDS: CompoundSeed[] = [
  { name: "Acqua", iupac: "oxidane", formula: "H2O", mw: 18.02, smiles: "O", cas: "7732-18-5", cid: "962", state: "Liquido", mp: "0 °C", bp: "100 °C" },
  { name: "Etanolo", iupac: "ethanol", formula: "C2H6O", mw: 46.07, smiles: "CCO", cas: "64-17-5", cid: "702", state: "Liquido", bp: "78 °C", ghs: ["GHS02"] },
  { name: "Acido acetico", iupac: "acetic acid", formula: "C2H4O2", mw: 60.05, smiles: "CC(=O)O", cas: "64-19-7", cid: "176", state: "Liquido", bp: "118 °C", ghs: ["GHS02", "GHS05"] },
  { name: "Cloruro di sodio", formula: "NaCl", mw: 58.44, cas: "7647-14-5", cid: "5234", state: "Solido", mp: "801 °C" },
  { name: "Glucosio", iupac: "D-glucose", formula: "C6H12O6", mw: 180.16, smiles: "OCC1OC(O)C(O)C(O)C1O", cas: "50-99-7", cid: "5793", state: "Solido" },
  { name: "Acido acetilsalicilico", iupac: "2-acetoxybenzoic acid", formula: "C9H8O4", mw: 180.16, smiles: "CC(=O)Oc1ccccc1C(=O)O", cas: "50-78-2", cid: "2244", state: "Solido", mp: "135 °C" },
  { name: "Acido salicilico", iupac: "2-hydroxybenzoic acid", formula: "C7H6O3", mw: 138.12, smiles: "OC(=O)c1ccccc1O", cas: "69-72-7", cid: "338", state: "Solido", mp: "158 °C", ghs: ["GHS07"] },
  { name: "Anidride acetica", formula: "C4H6O3", mw: 102.09, smiles: "CC(=O)OC(C)=O", cas: "108-24-7", cid: "7918", state: "Liquido", ghs: ["GHS02", "GHS05"] },
  { name: "Bicarbonato di sodio", formula: "NaHCO3", mw: 84.01, cas: "144-55-8", cid: "516892", state: "Solido" },
  { name: "Acido solforico", formula: "H2SO4", mw: 98.08, cas: "7664-93-9", cid: "1118", state: "Liquido", ghs: ["GHS05"] },
  { name: "Acido cloridrico", formula: "HCl", mw: 36.46, cas: "7647-01-0", cid: "313", state: "Gas/Soluzione", ghs: ["GHS05", "GHS07"] },
  { name: "Idrossido di sodio", formula: "NaOH", mw: 40.0, cas: "1310-73-2", cid: "14798", state: "Solido", ghs: ["GHS05"] },
  { name: "Permanganato di potassio", formula: "KMnO4", mw: 158.03, cas: "7722-64-7", cid: "516875", state: "Solido", ghs: ["GHS03", "GHS07", "GHS09"] },
  { name: "Solfato di rame(II)", formula: "CuSO4", mw: 159.61, cas: "7758-98-7", cid: "24462", state: "Solido", ghs: ["GHS07", "GHS09"] },
  { name: "Carbonato di calcio", formula: "CaCO3", mw: 100.09, cas: "471-34-1", cid: "10112", state: "Solido" },
  { name: "Ammoniaca", formula: "NH3", mw: 17.03, smiles: "N", cas: "7664-41-7", cid: "222", state: "Gas", ghs: ["GHS05", "GHS07", "GHS09"] },
  { name: "Acetone", iupac: "propan-2-one", formula: "C3H6O", mw: 58.08, smiles: "CC(C)=O", cas: "67-64-1", cid: "180", state: "Liquido", bp: "56 °C", ghs: ["GHS02", "GHS07"] },
  { name: "Metanolo", formula: "CH4O", mw: 32.04, smiles: "CO", cas: "67-56-1", cid: "887", state: "Liquido", bp: "65 °C", ghs: ["GHS02", "GHS06", "GHS08"] },
  { name: "Acido benzoico", formula: "C7H6O2", mw: 122.12, smiles: "OC(=O)c1ccccc1", cas: "65-85-0", cid: "243", state: "Solido", mp: "122 °C" },
  { name: "Acido citrico", formula: "C6H8O7", mw: 192.12, cas: "77-92-9", cid: "311", state: "Solido" },
  { name: "EDTA", formula: "C10H16N2O8", mw: 292.24, cas: "60-00-4", cid: "6049", state: "Solido" },
  { name: "Caffeina", formula: "C8H10N4O2", mw: 194.19, smiles: "Cn1cnc2c1c(=O)n(C)c(=O)n2C", cas: "58-08-2", cid: "2519", state: "Solido" },
  { name: "Paracetamolo", iupac: "N-(4-hydroxyphenyl)acetamide", formula: "C8H9NO2", mw: 151.16, smiles: "CC(=O)Nc1ccc(O)cc1", cas: "103-90-2", cid: "1983", state: "Solido" },
  { name: "Ibuprofene", formula: "C13H18O2", mw: 206.28, smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O", cas: "15687-27-1", cid: "3672", state: "Solido" },
  { name: "Carbonato di sodio", formula: "Na2CO3", mw: 105.99, cas: "497-19-8", cid: "10340", state: "Solido" },
  { name: "Idrossido di potassio", formula: "KOH", mw: 56.11, cas: "1310-58-3", cid: "14797", state: "Solido", ghs: ["GHS05"] },
  { name: "Solfato di magnesio", formula: "MgSO4", mw: 120.37, cas: "7487-88-9", cid: "24083", state: "Solido" },
  { name: "Cloruro di ferro(III)", formula: "FeCl3", mw: 162.2, cas: "7705-08-0", cid: "24380", state: "Solido", ghs: ["GHS05", "GHS07"] },
  { name: "Nitrato d'argento", formula: "AgNO3", mw: 169.87, cas: "7761-88-8", cid: "24470", state: "Solido", ghs: ["GHS03", "GHS05", "GHS09"] },
  { name: "Toluene", formula: "C7H8", mw: 92.14, smiles: "Cc1ccccc1", cas: "108-88-3", cid: "1140", state: "Liquido", bp: "111 °C", ghs: ["GHS02", "GHS07", "GHS08"] },
];

function buildCompounds(): Compound[] {
  return COMPOUNDS.map((c, i) => ({
    id: `cmp-${i + 1}`,
    workspaceId: "ws-1",
    preferredName: c.name,
    iupacName: c.iupac,
    synonyms: [],
    formula: c.formula,
    molarMass: c.mw,
    smiles: c.smiles,
    canonicalSmiles: c.smiles,
    casNumber: c.cas,
    casSource: c.cas ? "Dato pubblico (verificare con SDS ufficiale)" : undefined,
    pubchemCid: c.cid,
    physicalState: c.state,
    meltingPoint: c.mp,
    boilingPoint: c.bp,
    ghsPictograms: c.ghs ?? [],
    hazardStatements: [],
    precautionaryStatements: [],
    properties: [],
    sourceProvider: c.cid ? "PubChem (riferimento CID)" : "Locale",
    sourceUrl: c.cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${c.cid}` : undefined,
    createdAt: daysAgo(40 - (i % 30)),
    updatedAt: daysAgo(5),
    createdBy: "u-research",
  }));
}

function buildInventory(): InventoryItem[] {
  const base: Array<Partial<InventoryItem> & { name: string; category: InventoryItem["category"] }> = [
    { name: "Acido cloridrico 37%", category: "reagent", compoundId: "cmp-11", quantity: 250, unit: "mL", minStock: 500, expiryDate: daysAgo(-15), status: "low", ghsPictograms: ["GHS05", "GHS07"], lotNumber: "HCL-2401" },
    { name: "Acetone", category: "solvent", compoundId: "cmp-17", quantity: 500, unit: "mL", minStock: 1000, expiryDate: daysAgo(-40), status: "low", ghsPictograms: ["GHS02"], lotNumber: "ACE-2305" },
    { name: "Etanolo assoluto", category: "solvent", compoundId: "cmp-2", quantity: 750, unit: "mL", minStock: 1000, expiryDate: daysAgo(-5), status: "low", ghsPictograms: ["GHS02"], lotNumber: "ETA-2312" },
    { name: "Acido salicilico", category: "reagent", compoundId: "cmp-7", quantity: 100, unit: "g", minStock: 25, status: "in_stock", lotNumber: "SAL-2402" },
    { name: "Anidride acetica", category: "reagent", compoundId: "cmp-8", quantity: 500, unit: "mL", minStock: 100, status: "in_stock", ghsPictograms: ["GHS02", "GHS05"], lotNumber: "ANH-2401" },
    { name: "Cloruro di sodio", category: "reagent", compoundId: "cmp-4", quantity: 1000, unit: "g", minStock: 250, status: "in_stock", lotNumber: "NACL-2310" },
    { name: "Idrossido di sodio in pellet", category: "reagent", compoundId: "cmp-12", quantity: 500, unit: "g", minStock: 100, status: "in_stock", ghsPictograms: ["GHS05"], lotNumber: "NAOH-2402" },
    { name: "Solfato di rame(II) pentaidrato", category: "reagent", compoundId: "cmp-14", quantity: 250, unit: "g", minStock: 50, status: "in_stock", ghsPictograms: ["GHS07", "GHS09"], lotNumber: "CUSO4-2311" },
    { name: "Permanganato di potassio", category: "standard", compoundId: "cmp-13", quantity: 100, unit: "g", minStock: 20, status: "in_stock", ghsPictograms: ["GHS03"], lotNumber: "KMNO4-2401" },
    { name: "Glucosio anidro", category: "reagent", compoundId: "cmp-5", quantity: 500, unit: "g", minStock: 100, status: "in_stock", lotNumber: "GLU-2312" },
    { name: "Acido solforico conc.", category: "reagent", compoundId: "cmp-10", quantity: 1000, unit: "mL", minStock: 250, status: "in_stock", ghsPictograms: ["GHS05"], lotNumber: "H2SO4-2401" },
    { name: "Metanolo HPLC", category: "solvent", compoundId: "cmp-18", quantity: 2500, unit: "mL", minStock: 1000, status: "in_stock", ghsPictograms: ["GHS02", "GHS06"], lotNumber: "MEOH-2312" },
    { name: "Toluene", category: "solvent", compoundId: "cmp-30", quantity: 1000, unit: "mL", minStock: 500, status: "in_stock", ghsPictograms: ["GHS02", "GHS08"], lotNumber: "TOL-2311" },
    { name: "Acido benzoico standard", category: "standard", compoundId: "cmp-19", quantity: 50, unit: "g", minStock: 10, status: "in_stock", lotNumber: "BENZ-2401" },
    { name: "EDTA disodico", category: "reagent", compoundId: "cmp-21", quantity: 250, unit: "g", minStock: 50, status: "in_stock", lotNumber: "EDTA-2310" },
    { name: "Caffeina standard analitico", category: "standard", compoundId: "cmp-22", quantity: 10, unit: "g", minStock: 2, status: "in_stock", lotNumber: "CAF-2402" },
    { name: "Nitrato d'argento 0.1 M", category: "solution", compoundId: "cmp-29", quantity: 500, unit: "mL", minStock: 100, status: "in_stock", ghsPictograms: ["GHS05", "GHS09"], lotNumber: "AGNO3-2401" },
    { name: "Carbonato di calcio", category: "reagent", compoundId: "cmp-15", quantity: 1000, unit: "g", minStock: 200, status: "in_stock", lotNumber: "CACO3-2309" },
    { name: "Acetato di etile", category: "solvent", quantity: 2500, unit: "mL", minStock: 1000, status: "in_stock", ghsPictograms: ["GHS02"], lotNumber: "ETOAC-2312" },
    { name: "Guanti nitrile (M)", category: "consumable", quantity: 300, unit: "pz", minStock: 100, status: "in_stock", lotNumber: "GLV-2401" },
    { name: "Provette vetro 15 mL", category: "consumable", quantity: 150, unit: "pz", minStock: 50, status: "in_stock" },
    { name: "Azoto compresso", category: "gas", quantity: 1, unit: "bombola", minStock: 1, status: "low", lotNumber: "N2-2312" },
    { name: "Aspirina grezza (sintesi)", category: "synthesized", compoundId: "cmp-6", quantity: 12.5, unit: "g", minStock: 0, status: "in_stock", lotNumber: "ASA-2405-01" },
    { name: "Soluzione tampone pH 7", category: "solution", quantity: 500, unit: "mL", minStock: 200, expiryDate: daysAgo(-60), status: "in_stock", lotNumber: "BUF7-2401" },
    { name: "Solfato di magnesio anidro", category: "reagent", compoundId: "cmp-27", quantity: 500, unit: "g", minStock: 100, status: "in_stock", lotNumber: "MGSO4-2311" },
  ];

  return base.map((it, i) => ({
    id: `inv-${i + 1}`,
    workspaceId: "ws-1",
    supplier: ["Merck", "Sigma-Aldrich", "Carlo Erba", "VWR", "Honeywell"][i % 5],
    productCode: `PC-${1000 + i}`,
    purity: it.category === "solvent" ? "≥99.5%" : "≥98%",
    initialQuantity: it.quantity,
    purchaseDate: daysAgo(60 + i),
    locationId: `loc-${(i % 4) + 1}`,
    locationName: ["Armadio A1", "Frigo F1", "Scaffale S2", "Cappa C1"][i % 4],
    ownerId: "u-labman",
    storageTemp: it.category === "solvent" ? "Ambiente (infiammabili)" : "Ambiente",
    ghsPictograms: it.ghsPictograms ?? [],
    createdAt: daysAgo(60 + i),
    updatedAt: daysAgo(i),
    createdBy: "u-labman",
    ...it,
  })) as InventoryItem[];
}

function buildProjects(): Project[] {
  const specs: Array<[string, string, string, string, Project["status"], string[]]> = [
    ["Sintesi di Aspirina", "Acetilazione dell'acido salicilico", "#2f66f6", "flask", "active", ["sintesi", "organica"]],
    ["Studio catalizzatore eterogeneo", "Screening catalizzatori per ossidazione", "#14b8a6", "atom", "active", ["catalisi"]],
    ["Formulazione gel polimerico", "Sviluppo idrogel biocompatibile", "#8b5cf6", "beaker", "paused", ["materiali"]],
    ["Analisi HPLC nuovi campioni", "Metodo analitico per caffeina", "#f59e0b", "chart", "active", ["analitica"]],
    ["Ricerca inibitori chinasi", "Studio biochimico preliminare", "#ef4444", "dna", "draft", ["biochimica"]],
  ];
  return specs.map(([name, description, color, icon, status, tags], i) => ({
    id: `prj-${i + 1}`,
    workspaceId: i < 4 ? "ws-1" : "ws-2",
    name,
    description,
    color,
    icon,
    status,
    tags,
    ownerId: "u-research",
    memberIds: ["u-research", "u-student"],
    starred: i === 0,
    createdAt: daysAgo(30 - i),
    updatedAt: daysAgo(i),
    createdBy: "u-research",
  }));
}

const ASPIRIN_PAGE = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Sintesi dell'aspirina" }] },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "1. Obiettivo" }] },
    { type: "paragraph", content: [{ type: "text", text: "Sintetizzare l'aspirina (acido acetilsalicilico) tramite acetilazione dell'acido salicilico con anidride acetica, usando acido solforico come catalizzatore." }] },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "2. Reagenti" }] },
    { type: "bulletList", content: [
      { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Acido salicilico 2.00 g (reagente limitante)" }] }] },
      { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Anidride acetica 5.0 mL" }] }] },
      { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Acido solforico conc. 5 gocce (catalizzatore)" }] }] },
    ] },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "3. Osservazioni" }] },
    { type: "paragraph", content: [{ type: "text", text: "Cristalli bianchi aghiformi dopo raffreddamento e filtrazione. Resa grezza ~85%." }] },
  ],
};

function buildNotebooksAndPages(): { notebooks: Notebook[]; pages: NotebookPage[] } {
  const notebooks: Notebook[] = [
    { id: "nb-1", projectId: "prj-1", workspaceId: "ws-1", name: "Notebook di laboratorio", description: "Sintesi di Aspirina", createdAt: daysAgo(20), updatedAt: daysAgo(1), createdBy: "u-research" },
    { id: "nb-2", projectId: "prj-2", workspaceId: "ws-1", name: "Note catalisi", description: "Studio catalizzatore", createdAt: daysAgo(18), updatedAt: daysAgo(2), createdBy: "u-research" },
    { id: "nb-3", projectId: "prj-3", workspaceId: "ws-1", name: "Appunti formulazione", description: "Gel polimerico", createdAt: daysAgo(15), updatedAt: daysAgo(3), createdBy: "u-student" },
    { id: "nb-4", projectId: "prj-4", workspaceId: "ws-1", name: "Risultati HPLC", description: "Analisi caffeina", createdAt: daysAgo(10), updatedAt: daysAgo(4), createdBy: "u-research" },
  ];
  const pages: NotebookPage[] = [
    { id: "pg-1", notebookId: "nb-1", title: "Sintesi dell'aspirina", content: ASPIRIN_PAGE, order: 0, version: 3, createdAt: daysAgo(20), updatedAt: daysAgo(1), createdBy: "u-research" },
    { id: "pg-2", notebookId: "nb-1", title: "Purificazione e resa", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Ricristallizzazione da etanolo/acqua. Resa purificata 71%." }] }] }, order: 1, version: 1, createdAt: daysAgo(19), updatedAt: daysAgo(1), createdBy: "u-research" },
    { id: "pg-3", notebookId: "nb-2", title: "Screening iniziale", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Test di 5 catalizzatori a temperatura variabile." }] }] }, order: 0, version: 2, createdAt: daysAgo(18), updatedAt: daysAgo(2), createdBy: "u-research" },
    { id: "pg-4", notebookId: "nb-4", title: "Metodo HPLC caffeina", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Colonna C18, fase mobile metanolo/acqua 40:60." }] }] }, order: 0, version: 1, createdAt: daysAgo(10), updatedAt: daysAgo(4), createdBy: "u-research" },
  ];
  return { notebooks, pages };
}

function buildExperiments(): Experiment[] {
  const specs: Array<[string, string, Experiment["status"]]> = [
    ["Sintesi Aspirina - Batch 4", "Acetilazione acido salicilico", "completed"],
    ["Reazione esterificazione", "Esterificazione di Fischer", "running"],
    ["Catalisi test temperatura", "Ossidazione catalitica a 60°C", "completed"],
    ["Analisi spettroscopica", "Caratterizzazione IR/NMR", "planned"],
    ["Estrazione liquido-liquido", "Estrazione caffeina", "paused"],
    ["Titolazione acido-base", "Standardizzazione NaOH", "completed"],
    ["Ricristallizzazione", "Purificazione acido benzoico", "completed"],
    ["Sintesi paracetamolo", "Acetilazione p-amminofenolo", "failed"],
    ["Determinazione pKa", "Titolazione potenziometrica", "planned"],
    ["Cromatografia TLC", "Analisi purezza aspirina", "completed"],
  ];
  return specs.map(([title, objective, status], i) => ({
    id: `exp-${i + 1}`,
    projectId: `prj-${(i % 4) + 1}`,
    workspaceId: "ws-1",
    code: `EXP-2024-${String(i + 1).padStart(3, "0")}`,
    title,
    objective,
    hypothesis: "",
    procedure: "",
    observations: "",
    results: "",
    conclusions: "",
    status,
    temperature: 20 + i * 3,
    atmosphere: "Aria",
    durationMinutes: 60 + i * 15,
    reactionIds: [],
    tags: ["demo"],
    createdAt: daysAgo(25 - i),
    updatedAt: daysAgo(i),
    createdBy: "u-research",
  }));
}

function buildReactions(): Reaction[] {
  const specs: Array<[string, string, Reaction["status"]]> = [
    ["Sintesi aspirina", "RXN-001", "completed"],
    ["Esterificazione di Fischer", "RXN-002", "running"],
    ["Saponificazione", "RXN-003", "completed"],
    ["Ossidazione alcol primario", "RXN-004", "completed"],
    ["Riduzione chetone", "RXN-005", "planned"],
    ["Sostituzione nucleofila SN2", "RXN-006", "completed"],
    ["Nitrazione aromatica", "RXN-007", "planned"],
    ["Idrolisi ammide", "RXN-008", "paused"],
    ["Condensazione aldolica", "RXN-009", "completed"],
    ["Neutralizzazione acido-base", "RXN-010", "completed"],
  ];
  return specs.map(([name, code, status], i) => ({
    id: `rxn-${i + 1}`,
    workspaceId: "ws-1",
    projectId: `prj-${(i % 4) + 1}`,
    name,
    code,
    scheme: "",
    components:
      i === 0
        ? [
            { id: "rc-1", role: "reactant", name: "Acido salicilico", formula: "C7H6O3", molarMass: 138.12, amount: 2, amountUnit: "g", equivalents: 1, limiting: true },
            { id: "rc-2", role: "reagent", name: "Anidride acetica", formula: "C4H6O3", molarMass: 102.09, amount: 5, amountUnit: "mL", equivalents: 3.6 },
            { id: "rc-3", role: "product", name: "Acido acetilsalicilico", formula: "C9H8O4", molarMass: 180.16, equivalents: 1 },
          ]
        : [],
    temperature: 25 + i * 2,
    atmosphere: "Aria",
    durationMinutes: 45 + i * 10,
    theoreticalYield: i === 0 ? 2.61 : undefined,
    actualYield: i === 0 ? 2.22 : undefined,
    yieldPercent: i === 0 ? 85 : undefined,
    status,
    createdAt: daysAgo(22 - i),
    updatedAt: daysAgo(i),
    createdBy: "u-research",
  }));
}

function buildMolecules(): Molecule[] {
  const specs = [
    ["Acido acetilsalicilico", "CC(=O)Oc1ccccc1C(=O)O", "C9H8O4", 180.16],
    ["Caffeina", "Cn1cnc2c1c(=O)n(C)c(=O)n2C", "C8H10N4O2", 194.19],
    ["Paracetamolo", "CC(=O)Nc1ccc(O)cc1", "C8H9NO2", 151.16],
    ["Etanolo", "CCO", "C2H6O", 46.07],
    ["Acido benzoico", "OC(=O)c1ccccc1", "C7H6O2", 122.12],
    ["Ibuprofene", "CC(C)Cc1ccc(cc1)C(C)C(=O)O", "C13H18O2", 206.28],
  ] as const;
  return specs.map(([name, smiles, formula, mw], i) => ({
    id: `mol-${i + 1}`,
    workspaceId: "ws-1",
    name,
    smiles,
    formula,
    molarMass: mw,
    createdAt: daysAgo(20 - i),
    updatedAt: daysAgo(i),
    createdBy: "u-research",
  }));
}

function buildCalculations(): SavedCalculation[] {
  const specs: Array<[string, string, string]> = [
    ["molarity", "Molarità (NaCl)", "0.4000 M"],
    ["dilution", "Diluizione (C1V1=C2V2)", "0.1000 M"],
    ["ph-strong-acid", "pH acido forte (HCl)", "1.00"],
    ["percent-yield", "Resa percentuale", "85.7 %"],
    ["molar-mass", "Massa molare (C6H12O6)", "180.16 g/mol"],
    ["moles", "Moli da massa (Na2CO3)", "0.2500 mol"],
    ["solution-prep", "Preparazione soluzione", "250 mL"],
    ["beer-lambert", "Beer-Lambert (conc.)", "1.0×10⁻⁴ M"],
    ["ph-weak-acid", "pH acido debole (acetico)", "2.87"],
    ["henderson", "Henderson-Hasselbalch", "4.76"],
    ["ideal-gas", "Gas ideali (V)", "22.41 L"],
    ["density", "Densità/massa/volume", "0.789 g/mL"],
    ["std-dev", "Deviazione standard", "0.021"],
    ["ppm", "ppm/ppb", "50 ppm"],
    ["atom-economy", "Atom economy", "75.0 %"],
  ];
  return specs.map(([calculatorId, title, result], i) => ({
    id: `calc-${i + 1}`,
    workspaceId: "ws-1",
    calculatorId,
    title,
    inputs: {},
    result,
    createdAt: daysAgo(12 - (i % 12)),
    updatedAt: daysAgo(i % 12),
    createdBy: "u-research",
  }));
}

function buildFiles(): FileRecord[] {
  const specs: Array<[string, string, string, number]> = [
    ["Spettro_NMR_aspirina.pdf", "application/pdf", "pdf", 245000],
    ["dati_hplc_caffeina.csv", "text/csv", "csv", 18400],
    ["struttura_aspirina.mol", "chemical/x-mdl-molfile", "mol", 2100],
    ["protocollo_sintesi.pdf", "application/pdf", "pdf", 512000],
    ["risultati_titolazione.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx", 33000],
    ["spettro_IR.jdx", "chemical/x-jcamp-dx", "jdx", 91000],
    ["foto_cristalli.jpg", "image/jpeg", "jpg", 1240000],
    ["reazione_batch4.rxn", "chemical/x-mdl-rxnfile", "rxn", 3400],
    ["dataset_composti.sdf", "chemical/x-mdl-sdfile", "sdf", 145000],
    ["note_meeting.txt", "text/plain", "txt", 4200],
  ];
  return specs.map(([name, mimeType, extension, sizeBytes], i) => ({
    id: `file-${i + 1}`,
    workspaceId: "ws-1",
    name,
    mimeType,
    extension,
    sizeBytes,
    folder: ["Spettri", "Analisi", "Strutture", "Protocolli"][i % 4],
    tags: ["demo"],
    projectId: `prj-${(i % 4) + 1}`,
    checksum: (0xabcdef + i).toString(16),
    createdAt: daysAgo(14 - i),
    updatedAt: daysAgo(i),
    createdBy: "u-research",
  }));
}

function buildSpectra(): Spectrum[] {
  const gauss = (center: number, width: number, n: number, xMin: number, xMax: number): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      const x = xMin + ((xMax - xMin) * i) / (n - 1);
      const y = Math.exp(-((x - center) ** 2) / (2 * width ** 2));
      out.push([x, Number(y.toFixed(4))]);
    }
    return out;
  };
  return [
    { id: "spec-1", workspaceId: "ws-1", name: "UV-Vis caffeina", type: "UV-Vis", xLabel: "λ (nm)", yLabel: "Assorbanza", data: gauss(273, 12, 120, 220, 340), peaks: [{ x: 273, y: 1, label: "λmax 273 nm" }], compoundId: "cmp-22", createdAt: daysAgo(8), updatedAt: daysAgo(8), createdBy: "u-research" },
    { id: "spec-2", workspaceId: "ws-1", name: "IR aspirina", type: "IR", xLabel: "Numero d'onda (cm⁻¹)", yLabel: "Trasmittanza", data: gauss(1750, 40, 150, 500, 4000), peaks: [{ x: 1750, y: 1, label: "C=O stretch" }], compoundId: "cmp-6", createdAt: daysAgo(6), updatedAt: daysAgo(6), createdBy: "u-research" },
    { id: "spec-3", workspaceId: "ws-1", name: "UV-Vis KMnO4", type: "UV-Vis", xLabel: "λ (nm)", yLabel: "Assorbanza", data: gauss(525, 20, 120, 400, 650), peaks: [{ x: 525, y: 1, label: "λmax 525 nm" }], compoundId: "cmp-13", createdAt: daysAgo(4), updatedAt: daysAgo(4), createdBy: "u-research" },
  ];
}

function buildNotifications(): Notification[] {
  const specs: Array<[Notification["type"], string, string]> = [
    ["low_stock", "Acido cloridrico 37% sta per esaurirsi", "Quantità 250 mL sotto la soglia di 500 mL"],
    ["experiment_update", 'Esperimento "Reazione esterificazione" aggiornato', "Stato: in corso"],
    ["mention", "Laura Verdi ti ha menzionato in un commento", "Progetto Sintesi di Aspirina"],
    ["file_shared", "Nuovo file condiviso nel progetto Sintesi di Aspirina", "Spettro_NMR_aspirina.pdf"],
    ["invite", "Invito a collaborare in Studio catalizzatore eterogeneo", "Ruolo: ricercatore"],
    ["expiry", "Etanolo assoluto in scadenza", "Scadenza tra 5 giorni"],
    ["comment", "Nuovo commento sull'esperimento Batch 4", "Mario Rossi"],
    ["task_assigned", "Attività assegnata: preparare tampone pH 7", "Scadenza domani"],
    ["processing_done", "Calcolo massa molare completato", "C6H12O6 = 180.16 g/mol"],
    ["low_stock", "Acetone sotto soglia", "500 mL / 1000 mL"],
    ["expiry", "Soluzione tampone pH 7 da verificare", "Controllo periodico"],
    ["mention", "Giulia Bianchi ti ha menzionato", "Notebook HPLC"],
    ["experiment_update", "Titolazione acido-base completata", "Risultato validato"],
    ["import_error", "Errore importazione CSV", "Riga 12: colonna quantità non valida"],
    ["file_shared", "Dataset composti condiviso", "dataset_composti.sdf"],
  ];
  return specs.map(([type, title, body], i) => ({
    id: `ntf-${i + 1}`,
    userId: "u-research",
    type,
    title,
    body,
    read: i > 4,
    link: undefined,
    createdAt: daysAgo(i * 0.3),
    updatedAt: daysAgo(i * 0.3),
  }));
}

function buildActivity(): ActivityLog[] {
  const specs: Array<[string, string, string]> = [
    ["update", "project", "prj-1"],
    ["create", "experiment", "exp-1"],
    ["complete", "experiment", "exp-6"],
    ["create", "compound", "cmp-6"],
    ["update", "inventory", "inv-1"],
    ["create", "reaction", "rxn-1"],
    ["create", "notebook_page", "pg-1"],
    ["create", "molecule", "mol-1"],
    ["update", "notebook_page", "pg-2"],
    ["create", "file", "file-1"],
    ["adjust", "inventory", "inv-3"],
    ["create", "calculation", "calc-1"],
    ["create", "spectrum", "spec-1"],
    ["update", "project", "prj-2"],
    ["create", "experiment", "exp-3"],
    ["complete", "reaction", "rxn-3"],
    ["create", "compound", "cmp-22"],
    ["update", "inventory", "inv-2"],
    ["create", "file", "file-6"],
    ["create", "notebook", "nb-4"],
  ];
  return specs.map(([action, entity, entityId], i) => ({
    id: `act-${i + 1}`,
    userId: ["u-research", "u-labman", "u-student"][i % 3],
    action,
    entity,
    entityId,
    createdAt: daysAgo(i * 0.5),
    updatedAt: daysAgo(i * 0.5),
  }));
}

export function buildSeed(): DemoDb {
  const organizations: Organization[] = [
    { id: "org-1", name: "Università ChemLab", slug: "chemlab-uni", createdAt: daysAgo(120), updatedAt: daysAgo(1) },
  ];
  const workspaces: Workspace[] = [
    { id: "ws-1", organizationId: "org-1", name: "Laboratorio Chimica Organica", description: "Sintesi e caratterizzazione", createdAt: daysAgo(100), updatedAt: daysAgo(2) },
    { id: "ws-2", organizationId: "org-1", name: "Laboratorio Biochimica", description: "Studi biochimici", createdAt: daysAgo(90), updatedAt: daysAgo(3) },
  ];
  const { notebooks, pages } = buildNotebooksAndPages();
  const locations: InventoryLocation[] = [
    { id: "loc-1", workspaceId: "ws-1", building: "Edificio Chimica", lab: "Lab 1", room: "R101", cabinet: "Armadio A1", name: "Armadio A1", createdAt: daysAgo(100), updatedAt: daysAgo(100) },
    { id: "loc-2", workspaceId: "ws-1", building: "Edificio Chimica", lab: "Lab 1", room: "R101", storage: "Frigo F1", name: "Frigo F1", createdAt: daysAgo(100), updatedAt: daysAgo(100) },
    { id: "loc-3", workspaceId: "ws-1", building: "Edificio Chimica", lab: "Lab 1", room: "R102", shelf: "Scaffale S2", name: "Scaffale S2", createdAt: daysAgo(100), updatedAt: daysAgo(100) },
    { id: "loc-4", workspaceId: "ws-1", building: "Edificio Chimica", lab: "Lab 1", room: "R102", storage: "Cappa C1", name: "Cappa C1", createdAt: daysAgo(100), updatedAt: daysAgo(100) },
  ];

  return {
    profiles: DEMO_USERS.map(({ password: _pw, ...p }) => p),
    organizations,
    workspaces,
    projects: buildProjects(),
    notebooks,
    notebookPages: pages,
    experiments: buildExperiments(),
    molecules: buildMolecules(),
    compounds: buildCompounds(),
    reactions: buildReactions(),
    inventoryItems: buildInventory(),
    inventoryLocations: locations,
    inventoryMovements: [],
    files: buildFiles(),
    spectra: buildSpectra(),
    savedCalculations: buildCalculations(),
    notifications: buildNotifications(),
    activityLogs: buildActivity(),
    comments: [],
  };
}
