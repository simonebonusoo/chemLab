import { describe, it, expect, beforeEach } from "vitest";
import { useDb } from "./db";
import type { Project } from "@chemlab/types";
import { nowIso, uid } from "@/lib/utils";

const makeProject = (): Project => ({
  id: uid(),
  workspaceId: "ws-1",
  name: "Test project",
  color: "#2f66f6",
  icon: "flask",
  status: "active",
  tags: [],
  ownerId: "u-research",
  memberIds: ["u-research"],
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

describe("demo database store (integration)", () => {
  beforeEach(() => {
    localStorage.clear();
    useDb.setState({ ready: false });
    useDb.getState().hydrate();
  });

  it("hydrates with seed data", () => {
    expect(useDb.getState().projects.length).toBeGreaterThan(0);
    expect(useDb.getState().compounds.length).toBeGreaterThanOrEqual(30);
    expect(useDb.getState().inventoryItems.length).toBeGreaterThanOrEqual(25);
  });

  it("inserts, updates and removes a project", () => {
    const p = makeProject();
    const before = useDb.getState().projects.length;
    useDb.getState().insert("projects", p);
    expect(useDb.getState().projects.length).toBe(before + 1);

    useDb.getState().update("projects", p.id, { name: "Renamed" });
    expect(useDb.getState().projects.find((x) => x.id === p.id)?.name).toBe("Renamed");

    useDb.getState().remove("projects", p.id);
    expect(useDb.getState().projects.find((x) => x.id === p.id)).toBeUndefined();
  });

  it("persists inserts to localStorage", () => {
    const p = makeProject();
    useDb.getState().insert("projects", p);
    const raw = JSON.parse(localStorage.getItem("chemlab.db.v1")!);
    expect(raw.projects.some((x: Project) => x.id === p.id)).toBe(true);
  });

  it("logActivity prepends an entry", () => {
    const before = useDb.getState().activityLogs.length;
    useDb.getState().logActivity("create", "project", "prj-x", "u-research");
    expect(useDb.getState().activityLogs.length).toBe(before + 1);
    expect(useDb.getState().activityLogs[0].action).toBe("create");
  });
});
