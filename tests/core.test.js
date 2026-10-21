import test from "node:test";
import assert from "node:assert/strict";
import { tools, searchTools } from "../js/tool-registry.js";
import { resolveRoute } from "../js/router.js";
import {
  defaults,
  loadPreferences,
  savePreferences,
  validatePreferences,
} from "../js/preferences.js";
test("eight unique tools are discoverable by label and fuzzy keywords", () => {
  assert.equal(tools.length, 8);
  assert.equal(new Set(tools.map((t) => t.id)).size, 8);
  assert.equal(searchTools("jsn")[0].id, "json");
  assert.equal(searchTools("password")[0].id, "password");
  assert.equal(searchTools("nothingmatches").length, 0);
});
test("routes resolve direct links, filters and unknown routes", () => {
  assert.deepEqual(resolveRoute("#/tools/json"), { page: "tool", id: "json" });
  assert.equal(resolveRoute("#/settings").page, "settings");
  assert.equal(resolveRoute("#/about").page, "about");
  assert.equal(resolveRoute("#/favorites").page, "favorites");
  assert.equal(resolveRoute("#/tools/nope").page, "not-found");
  assert.equal(resolveRoute("#/garbage").page, "not-found");
  assert.equal(resolveRoute("#/").page, "dashboard");
});
test("storage denial and malformed preferences fall back to defaults", () => {
  assert.deepEqual(
    loadPreferences({
      getItem() {
        throw Error("denied");
      },
    }),
    defaults,
  );
  assert.deepEqual(
    loadPreferences({
      getItem() {
        return "{broken";
      },
    }),
    defaults,
  );
  assert.deepEqual(
    loadPreferences({
      getItem() {
        return JSON.stringify({ version: 9, theme: "light" });
      },
    }),
    defaults,
  );
  assert.equal(
    savePreferences(defaults, {
      setItem() {
        throw Error("denied");
      },
    }),
    false,
  );
});
test("validated preferences discard inputs, unknown tools and invalid values", () => {
  const p = validatePreferences({
    version: 1,
    theme: "light",
    accent: "invalid",
    fontSize: 999,
    favorites: ["json", "bogus", "json"],
    recent: ["password", "json"],
    input: "secret",
    motion: "off",
  });
  assert.equal(p.theme, "light");
  assert.equal(p.accent, defaults.accent);
  assert.equal(p.fontSize, defaults.fontSize);
  assert.deepEqual(p.favorites, ["json"]);
  assert.deepEqual(p.recent, ["json"]);
  assert.equal(p.motion, "off");
  assert.equal("input" in p, false);
});
test("saved preferences never contain arbitrary user data", () => {
  let stored;
  assert.equal(
    savePreferences(
      { ...defaults, input: "secret" },
      {
        setItem(k, v) {
          stored = JSON.parse(v);
        },
      },
    ),
    true,
  );
  assert.equal("input" in stored, false);
  assert.equal(stored.version, 1);
});
