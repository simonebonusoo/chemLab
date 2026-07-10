import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Atom } from "lucide-react";
import type { Role } from "@chemlab/types";
import { Button, Field, Input, Select } from "@/components/ui";
import { useAuth } from "@/store/auth";

export default function Register() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Compila nome ed email");
      return;
    }
    const res = register({ fullName, email, role });
    if (res.ok) navigate("/app");
    else setError(res.error ?? "Errore");
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
          <h1 className="text-lg font-semibold">Crea account demo</h1>
          <p className="mb-4 text-sm text-graphite-500">
            In modalità demo l'account resta nel tuo browser.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Nome completo" htmlFor="name">
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Ruolo" htmlFor="role" error={error}>
              <Select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="student">Studente</option>
                <option value="researcher">Ricercatore</option>
                <option value="lab_manager">Lab Manager</option>
                <option value="organization_admin">Org Admin</option>
              </Select>
            </Field>
            <Button type="submit" className="w-full">
              Registrati
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-graphite-500">
          Hai già un account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
