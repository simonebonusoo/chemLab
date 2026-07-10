# ChemLab — Plugin System

SDK: [`packages/plugins-sdk`](../packages/plugins-sdk). Registry app:
[`apps/web/src/features/plugins/registry.ts`](../apps/web/src/features/plugins/registry.ts).

## Principio di sicurezza

I plugin sono registrati **a build-time** tramite un manifest controllato. Il
browser **non** esegue codice remoto arbitrario. Un plugin contribuisce metadati
+ (opzionalmente) un componente React caricato lazy dal bundle dell'app.

## Tipi principali

```ts
interface PluginManifest {
  id; name; version; author; description; icon; category;
  routes: PluginRoute[];
  permissions: PluginPermission[];
  settings?: PluginSettingsField[];
  dependencies?: string[];
  builtIn?: boolean;
}
interface PluginModule { manifest: PluginManifest; load?: () => Promise<{default: unknown}>; }
class PluginRegistry { register(); list(); get(); isEnabled(); setEnabled(); }
```

Categorie: `calculator | visualizer | data-provider | analysis | ai |
instrument | importer | exporter`.

## Moduli core inclusi

Notebook, Draw, Calculator, Inventory, Data, Spectra, AI (predisposto, disattivo
di default). La pagina **Plugin e moduli** (`/app/plugins`) mostra stato,
versione, categoria, permessi e permette abilita/disabilita.

## Estensioni future

Il sistema è progettato per aggiungere nuovi calcolatori, visualizzatori,
provider dati, strumenti di analisi, moduli AI, integrazioni strumentali e
importatori/esportatori — senza toccare il core, dichiarando permessi nel
manifest e (in produzione) persistendoli in `organization_plugins` /
`plugin_settings`.
