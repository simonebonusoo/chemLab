import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-graphite-50 px-4 text-center dark:bg-graphite-950">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-semibold">Pagina non trovata</h1>
      <p className="mt-2 text-graphite-500">La risorsa richiesta non esiste o è stata spostata.</p>
      <Link
        to="/app"
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
      >
        Vai alla dashboard
      </Link>
    </div>
  );
}
