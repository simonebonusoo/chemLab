import { describe, it, expect } from "vitest";
import { can } from "./permissions";

describe("permissions", () => {
  it("students cannot manage inventory or the platform", () => {
    expect(can("student", "inventory:manage")).toBe(false);
    expect(can("student", "platform:manage")).toBe(false);
    expect(can("student", "project:create")).toBe(true);
  });

  it("lab managers manage inventory but not the organization", () => {
    expect(can("lab_manager", "inventory:manage")).toBe(true);
    expect(can("lab_manager", "location:manage")).toBe(true);
    expect(can("lab_manager", "organization:manage")).toBe(false);
  });

  it("platform admins can do everything checked", () => {
    expect(can("platform_admin", "platform:manage")).toBe(true);
    expect(can("platform_admin", "organization:manage")).toBe(true);
    expect(can("platform_admin", "inventory:manage")).toBe(true);
  });

  it("undefined role has no capabilities", () => {
    expect(can(undefined, "project:create")).toBe(false);
  });
});
