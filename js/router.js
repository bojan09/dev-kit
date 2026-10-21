import { tools } from "./tool-registry.js";
export function resolveRoute(hash = "") {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/") return { page: "dashboard" };
  if (["/all", "/favorites", "/recent", "/settings", "/about"].includes(path))
    return { page: path.slice(1) };
  const match = path.match(/^\/tools\/([a-z0-9-]+)$/);
  if (match && tools.some((t) => t.id === match[1]))
    return { page: "tool", id: match[1] };
  return { page: "not-found" };
}
