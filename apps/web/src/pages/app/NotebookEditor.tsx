import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Plus,
  Copy,
  History,
  ShieldAlert,
  Beaker,
  Eye,
  FileDown,
  Save,
} from "lucide-react";
import type { NotebookPage } from "@chemlab/types";
import { Button, Card, EmptyState, IconButton } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { formatDateTime, nowIso, uid } from "@/lib/utils";

interface Version {
  version: number;
  savedAt: string;
  content: unknown;
}

export default function NotebookEditor() {
  const { id } = useParams();
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const update = useDb((s) => s.update);
  const logActivity = useDb((s) => s.logActivity);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();

  const notebook = db.notebooks.find((n) => n.id === id);
  const pages = db.notebookPages.filter((p) => p.notebookId === id).sort((a, b) => a.order - b.order);
  const [activePageId, setActivePageId] = useState<string | null>(pages[0]?.id ?? null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "idle">("saved");
  const [showVersions, setShowVersions] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];
  const versions: Version[] = (() => {
    try {
      return JSON.parse(localStorage.getItem(`chemlab.versions.${activePage?.id}`) ?? "[]");
    } catch {
      return [];
    }
  })();

  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: (activePage?.content as object) ?? { type: "doc", content: [{ type: "paragraph" }] },
      onUpdate: ({ editor }) => {
        if (!activePage) return;
        setSaveState("saving");
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          const content = editor.getJSON();
          update("notebookPages", activePage.id, { content, version: activePage.version + 1 });
          const vs: Version[] = JSON.parse(localStorage.getItem(`chemlab.versions.${activePage.id}`) ?? "[]");
          vs.unshift({ version: activePage.version + 1, savedAt: nowIso(), content });
          localStorage.setItem(`chemlab.versions.${activePage.id}`, JSON.stringify(vs.slice(0, 20)));
          if (notebook) update("notebooks", notebook.id, {});
          setSaveState("saved");
        }, 800);
      },
    },
    [activePage?.id],
  );

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  if (!notebook) {
    return <EmptyState title="Notebook non trovato" action={<Button onClick={() => navigate("/app/notebooks")}>Torna ai notebook</Button>} />;
  }

  const addPage = () => {
    const page: NotebookPage = {
      id: uid(),
      notebookId: notebook.id,
      title: `Nuova pagina ${pages.length + 1}`,
      content: { type: "doc", content: [{ type: "paragraph" }] },
      order: pages.length,
      version: 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    };
    insert("notebookPages", page);
    logActivity("create", "notebook_page", page.id, user!.id);
    setActivePageId(page.id);
    toast("Pagina aggiunta", "success");
  };

  const duplicatePage = () => {
    if (!activePage) return;
    const copy: NotebookPage = { ...activePage, id: uid(), title: `${activePage.title} (copia)`, order: pages.length, createdAt: nowIso(), updatedAt: nowIso() };
    insert("notebookPages", copy);
    setActivePageId(copy.id);
    toast("Pagina duplicata", "success");
  };

  const insertBlock = (type: "safety" | "procedure" | "observation" | "result" | "molecule" | "measurement") => {
    if (!editor) return;
    const blocks: Record<string, string> = {
      safety: "<blockquote><p>⚠️ <strong>Nota di sicurezza:</strong> descrivere i rischi, DPI richiesti e smaltimento.</p></blockquote>",
      procedure: "<h3>Fase di procedura</h3><ol><li>Passo 1…</li></ol>",
      observation: "<blockquote><p>🔬 <strong>Osservazione:</strong> …</p></blockquote>",
      result: "<blockquote><p>📊 <strong>Risultato:</strong> …</p></blockquote>",
      molecule: "<p>⚛️ <strong>Molecola:</strong> [nome] — SMILES: <code>…</code></p>",
      measurement: "<p>📐 <strong>Misura:</strong> valore = … unità</p>",
    };
    editor.chain().focus().insertContent(blocks[type]).run();
  };

  const exportHtml = () => {
    if (!editor) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${activePage?.title}</title></head><body><h1>${activePage?.title}</h1>${editor.getHTML()}<hr><small>Esportato da ChemLab · ${formatDateTime(nowIso())}</small></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePage?.title.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Esportato HTML (pronto per PDF via stampa)", "success");
  };

  const restore = (v: Version) => {
    if (!activePage || !editor) return;
    editor.commands.setContent(v.content as object);
    update("notebookPages", activePage.id, { content: v.content });
    setShowVersions(false);
    toast(`Ripristinata versione ${v.version}`, "success");
  };

  return (
    <div>
      <PageHeader
        title={notebook.name}
        subtitle={notebook.description}
        crumbs={[{ label: "Notebook", to: "/app/notebooks" }, { label: notebook.name }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-graphite-400">
              {saveState === "saving" ? "Salvataggio…" : saveState === "saved" ? "✓ Salvato automaticamente" : ""}
            </span>
            <Button variant="outline" size="sm" onClick={exportHtml}><FileDown className="h-4 w-4" /> Esporta</Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-graphite-500">Pagine</span>
            <IconButton label="Aggiungi pagina" onClick={addPage}><Plus className="h-4 w-4" /></IconButton>
          </div>
          <div className="space-y-1">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePageId(p.id)}
                className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm ${
                  p.id === activePage?.id ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-graphite-100 dark:hover:bg-graphite-800"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          {activePage ? (
            <>
              <input
                value={activePage.title}
                onChange={(e) => update("notebookPages", activePage.id, { title: e.target.value })}
                className="w-full border-b border-graphite-100 bg-transparent px-5 py-3 text-lg font-semibold outline-none dark:border-graphite-800"
              />
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 border-b border-graphite-100 px-3 py-2 dark:border-graphite-800">
                <ToolbarBtn label="Grassetto" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Corsivo" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Titolo 1" active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Titolo 2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Elenco" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Elenco numerato" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Citazione" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Codice" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></ToolbarBtn>
                <span className="mx-1 h-5 w-px bg-graphite-200 dark:bg-graphite-700" />
                <ToolbarBtn label="Nota sicurezza" onClick={() => insertBlock("safety")}><ShieldAlert className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn label="Blocco molecola" onClick={() => insertBlock("molecule")}><Beaker className="h-4 w-4" /></ToolbarBtn>
                <span className="ml-auto flex gap-1">
                  <ToolbarBtn label="Duplica pagina" onClick={duplicatePage}><Copy className="h-4 w-4" /></ToolbarBtn>
                  <ToolbarBtn label="Versioni" onClick={() => setShowVersions((v) => !v)}><History className="h-4 w-4" /></ToolbarBtn>
                </span>
              </div>

              <div className="grid gap-2 px-3 py-2 sm:grid-cols-3">
                <BlockBtn onClick={() => insertBlock("procedure")}>+ Procedura</BlockBtn>
                <BlockBtn onClick={() => insertBlock("observation")}>+ Osservazione</BlockBtn>
                <BlockBtn onClick={() => insertBlock("result")}>+ Risultato</BlockBtn>
              </div>

              <div className="px-6 py-4">
                <EditorContent editor={editor} />
              </div>

              <div className="flex items-center justify-between border-t border-graphite-100 px-5 py-2 text-xs text-graphite-400 dark:border-graphite-800">
                <span className="flex items-center gap-1"><Save className="h-3 w-3" /> v{activePage.version} · {db.profiles.find((p) => p.id === activePage.createdBy)?.fullName}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatDateTime(activePage.updatedAt)}</span>
              </div>
            </>
          ) : (
            <EmptyState title="Nessuna pagina" description="Aggiungi la prima pagina del notebook." action={<Button onClick={addPage}><Plus className="h-4 w-4" /> Aggiungi pagina</Button>} />
          )}
        </Card>
      </div>

      {showVersions && activePage && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setShowVersions(false)}>
          <div className="h-full w-80 bg-white p-5 shadow-xl dark:bg-graphite-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-semibold">Storico versioni</h3>
            {versions.length === 0 ? (
              <p className="text-sm text-graphite-400">Nessuna versione salvata ancora. Modifica il testo per creare snapshot.</p>
            ) : (
              <div className="space-y-2">
                {versions.map((v) => (
                  <button key={v.version} onClick={() => restore(v)} className="block w-full rounded-lg border border-graphite-200 px-3 py-2 text-left text-sm hover:border-brand-300 dark:border-graphite-700">
                    <span className="font-medium">Versione {v.version}</span>
                    <span className="block text-xs text-graphite-400">{formatDateTime(v.savedAt)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({ children, label, active, onClick }: { children: React.ReactNode; label: string; active?: boolean; onClick(): void }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded ${active ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" : "text-graphite-500 hover:bg-graphite-100 dark:hover:bg-graphite-800"}`}
    >
      {children}
    </button>
  );
}

function BlockBtn({ children, onClick }: { children: React.ReactNode; onClick(): void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-dashed border-graphite-300 py-1.5 text-xs text-graphite-500 hover:border-brand-300 hover:text-brand-600 dark:border-graphite-700">
      {children}
    </button>
  );
}
