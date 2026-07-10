import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const DOCS: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "Questo è un documento placeholder per l'MVP di ChemLab.",
      "In modalità demo i dati restano nel browser dell'utente (localStorage) e non vengono trasmessi ad alcun server.",
      "In produzione i dati sarebbero gestiti tramite Supabase secondo un accordo di trattamento dedicato.",
    ],
  },
  cookie: {
    title: "Cookie Policy",
    body: [
      "ChemLab in modalità demo non utilizza cookie di tracciamento.",
      "Vengono usati solo storage locali tecnici per sessione, tema e dati demo.",
    ],
  },
  terms: {
    title: "Termini di Servizio",
    body: [
      "Documento placeholder. ChemLab è fornito come MVP dimostrativo senza garanzie.",
      "L'uso in contesti critici richiede validazione professionale indipendente.",
    ],
  },
  "data-processing": {
    title: "Data Processing",
    body: [
      "L'architettura è predisposta per un futuro accordo di trattamento dati (DPA).",
      "Non viene dichiarata alcuna conformità certificata in questa versione.",
    ],
  },
  disclaimer: {
    title: "Scientific Data Disclaimer",
    body: [
      "ChemLab supporta il lavoro scientifico ma non sostituisce la verifica professionale.",
      "I dati chimici importati da fonti esterne devono essere verificati.",
      "Le informazioni di sicurezza devono essere confermate tramite SDS ufficiali.",
      "Le funzioni di calcolo devono essere validate prima dell'uso in contesti critici.",
      "Non è dichiarata conformità a GLP, GMP, ISO o 21 CFR Part 11: l'architettura è solo predisposta per future estensioni.",
    ],
  },
};

export default function Legal() {
  const { doc } = useParams();
  const content = DOCS[doc ?? "privacy"] ?? DOCS.privacy;
  return (
    <div className="min-h-screen bg-white dark:bg-graphite-950">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-graphite-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Torna alla home
        </Link>
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <div className="mt-6 space-y-4 text-graphite-600 dark:text-graphite-300">
          {content.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
