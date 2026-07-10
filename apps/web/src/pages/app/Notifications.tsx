import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { relativeTime } from "@/lib/utils";

export default function Notifications() {
  const db = useDb();
  const update = useDb((s) => s.update);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const list = db.notifications.filter((n) => (filter === "unread" ? !n.read : true));
  const markAll = () => db.notifications.forEach((n) => !n.read && update("notifications", n.id, { read: true }));

  return (
    <div>
      <PageHeader
        title="Notifiche"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Notifiche" }]}
        actions={<Button variant="outline" size="sm" onClick={markAll}><Check className="h-4 w-4" /> Segna tutte lette</Button>}
      />

      <div className="mb-4 flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-sm ${filter === f ? "bg-brand-600 text-white" : "bg-graphite-100 text-graphite-600 dark:bg-graphite-800"}`}>
            {f === "all" ? "Tutte" : "Non lette"}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Bell className="h-10 w-10" />} title="Nessuna notifica" />
      ) : (
        <Card>
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {list.map((n) => (
              <button
                key={n.id}
                onClick={() => update("notifications", n.id, { read: true })}
                className={`flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-graphite-50 dark:hover:bg-graphite-800/40 ${!n.read ? "bg-brand-50/40 dark:bg-brand-900/10" : ""}`}
              >
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-graphite-500">{n.body}</p>}
                </div>
                <span className="text-xs text-graphite-400">{relativeTime(n.createdAt)}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
