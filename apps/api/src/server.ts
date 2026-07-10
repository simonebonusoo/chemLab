/**
 * ChemLab API gateway (Fastify) — scaffold.
 *
 * Purpose: a thin, typed backend that (a) proxies the Python chemistry-engine,
 * (b) will host the REST endpoints backed by Supabase/Postgres with RLS, and
 * (c) centralises validation, logging, timeouts and rate limiting.
 *
 * This file is a working, typechecked scaffold. The data endpoints return 501
 * until wired to Supabase (see docs/ROADMAP.md) — no fake data is returned.
 */
import Fastify from "fastify";
import { z } from "zod";

const PORT = Number(process.env.PORT) || 3001;
const CHEMISTRY_ENGINE_URL = process.env.CHEMISTRY_ENGINE_URL ?? "http://localhost:8000";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const app = Fastify({ logger: true });

// Minimal CORS (a real deploy would use @fastify/cors + @fastify/rate-limit).
app.addHook("onSend", async (_req, reply) => {
  reply.header("Access-Control-Allow-Origin", CORS_ORIGIN);
  reply.header("Access-Control-Allow-Headers", "content-type,authorization");
  reply.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
});

app.get("/health", async () => ({ status: "ok", service: "chemlab-api" }));

// ── Chemistry proxy (typed input validation) ─────────────────────────────────
const smilesSchema = z.object({ smiles: z.string().min(1).max(2000) });

app.post("/chemistry/molecular-properties", async (req, reply) => {
  const parsed = smilesSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(422).send({ error: "Input non valido", issues: parsed.error.issues });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(`${CHEMISTRY_ENGINE_URL}/chemistry/molecular-properties`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return reply.status(res.status).send(data);
  } catch {
    // Never expose stack traces; return a clear, generic error.
    return reply.status(502).send({ error: "Chemistry engine non raggiungibile" });
  }
});

// ── Data endpoints (predisposed — 501 until Supabase-backed) ─────────────────
const RESOURCES = [
  "organizations", "workspaces", "projects", "notebooks", "experiments",
  "compounds", "molecules", "reactions", "inventory", "calculations",
  "files", "spectra", "plugins", "notifications",
] as const;

for (const resource of RESOURCES) {
  app.get(`/${resource}`, async (_req, reply) =>
    reply.status(501).send({ error: `Endpoint /${resource} predisposto: collegare Supabase.` }),
  );
}

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => app.log.info(`ChemLab API on :${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
