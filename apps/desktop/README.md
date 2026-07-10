# ChemLab Desktop (Tauri) — scaffold

Predisposizione per distribuire la web app ChemLab come applicazione desktop
(Windows/macOS/Linux) tramite [Tauri](https://tauri.app).

> Stato: **scaffold / predisposto**. Non tutte le feature native sono
> implementate; la configurazione è pronta per essere completata.

## Come funziona

Tauri incapsula la build di `apps/web` in una webview nativa. Il `frontendDist`
punta a `../web/dist` e `beforeBuildCommand` esegue la build web.

## Requisiti

- Rust toolchain (`rustup`)
- Tauri CLI: `cargo install tauri-cli` (o `pnpm add -D @tauri-apps/cli`)

## Comandi (una volta installato il toolchain)

```bash
pnpm --filter @chemlab/web build     # genera apps/web/dist
cargo tauri dev                       # sviluppo
cargo tauri build                     # installer di produzione
```

## File

- `src-tauri/tauri.conf.json` — configurazione finestra/bundle
- `src-tauri/Cargo.toml` — crate Rust
- `src-tauri/src/main.rs` — entrypoint (comando `app_version` di esempio)
