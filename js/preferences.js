import { tools } from "./tool-registry.js";
export const storageKey = "devkit.preferences.v1";
export const defaults = {
  version: 1,
  theme: "dark",
  accent: "violet",
  density: "comfortable",
  fontSize: 14,
  tabWidth: 2,
  wrap: true,
  lineNumbers: true,
  jsonIndent: 2,
  timestampUnit: "seconds",
  sidebarCollapsed: false,
  motion: "standard",
  favorites: [],
  recent: [],
};
const choices = {
  theme: ["dark", "light", "system"],
  accent: ["violet", "ocean", "emerald", "rose", "amber", "indigo"],
  density: ["comfortable", "compact", "spacious"],
  motion: ["standard", "reduced", "off"],
  fontSize: [12, 14, 16, 18],
  tabWidth: [2, 4],
  jsonIndent: [2, 4],
  timestampUnit: ["seconds", "milliseconds"],
};
export function validatePreferences(value) {
  const p = { ...defaults, favorites: [], recent: [] };
  if (!value || value.version !== 1) return p;
  for (const [k, allowed] of Object.entries(choices))
    if (allowed.includes(value[k])) p[k] = value[k];
  for (const k of ["wrap", "lineNumbers", "sidebarCollapsed"])
    if (typeof value[k] === "boolean") p[k] = value[k];
  for (const k of ["favorites", "recent"])
    if (Array.isArray(value[k]))
      p[k] = [
        ...new Set(
          value[k].filter(
            (id) =>
              tools.some((t) => t.id === id) &&
              (k !== "recent" || id !== "password"),
          ),
        ),
      ].slice(0, 8);
  return p;
}
export function loadPreferences(storage) {
  try {
    return validatePreferences(
      JSON.parse((storage || localStorage).getItem(storageKey)),
    );
  } catch {
    return validatePreferences(null);
  }
}
export function savePreferences(value, storage) {
  try {
    (storage || localStorage).setItem(
      storageKey,
      JSON.stringify(validatePreferences(value)),
    );
    return true;
  } catch {
    return false;
  }
}
export const accents = {
  violet: "#8B5CF6",
  ocean: "#0EA5E9",
  emerald: "#10B981",
  rose: "#F43F5E",
  amber: "#F59E0B",
  indigo: "#6366F1",
};
export function applyPreferences(p) {
  const r = document.documentElement;
  r.dataset.theme =
    p.theme === "system"
      ? matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : p.theme;
  r.dataset.density = p.density;
  r.dataset.motion = p.motion;
  r.dataset.collapsed = p.sidebarCollapsed;
  r.style.setProperty("--accent", accents[p.accent]);
  r.style.setProperty("--editor-size", p.fontSize + "px");
}
