import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Atom } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { env } from "@/lib/env";

const DEMO_ACCOUNTS = [
  { label: "Ricercatore", email: "researcher@chemlab.demo", password: "researcher1234" },
  { label: "Studente", email: "student@chemlab.demo", password: "student1234" },
  { label: "Lab Manager", email: "labmanager@chemlab.demo", password: "labmanager1234" },
  { label: "Admin", email: "admin@chemlab.demo", password: "admin1234" },
];

export default function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("researcher@chemlab.demo");
  const [password, setPassword] = useState("researcher1234");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.ok) navigate("/app");
    else setError(res.error ?? "Errore");
  };

  const quickLogin = (acc: (typeof DEMO_ACCOUNTS)[number]) => {
    const res = login(acc.email, acc.password);
    if (res.ok) navigate("/app");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-graphite-50 px-4 dark:bg-graphite-950">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
            <Atom className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">ChemLab</span>
        </Link>

        <div className="rounded-xl border border-graphite-200 bg-white p-6 shadow-sm dark:border-graphite-800 dark:bg-graphite-900">
          <h1 className="text-lg font-semibold">Accedi</h1>
          <p className="mb-4 text-sm text-graphite-500">
            {env.isDemo ? "Modalità demo locale attiva." : "Modalità produzione (Supabase)."}
          </p>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </Field>
            <Field label="Password" htmlFor="password" error={error}>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" className="w-full">
              Accedi
            </Button>
          </form>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-graphite-400">Accesso rapido demo</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => quickLogin(a)}
                  className="rounded-lg border border-graphite-200 px-3 py-2 text-xs font-medium hover:border-brand-300 hover:bg-brand-50 dark:border-graphite-700 dark:hover:bg-brand-900/20"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-graphite-500">
          Non hai un account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
