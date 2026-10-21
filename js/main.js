import { workspaceMarkup, mountWorkspace } from "./workspace.js";
import { tools, searchTools } from "./tool-registry.js";
import { resolveRoute } from "./router.js";
import {
  loadPreferences,
  savePreferences,
  validatePreferences,
  applyPreferences,
  defaults,
} from "./preferences.js";
import { icon } from "./icons.js";
import { settingsMarkup, settingTabs } from "./settings.js";
import { setupPalette } from "./command-palette.js";
let prefs = loadPreferences(),
  route = resolveRoute(location.hash),
  tab = "Appearance",
  query = "",
  drafts = new Map(),
  toastTimer,
  cleanupWorkspace;
applyPreferences(prefs);
const app = document.querySelector("#app");
const navigation = [
  ["dashboard", "/", "dashboard", "Dashboard"],
  ["all", "/all", "dashboard", "All Tools"],
  ["favorites", "/favorites", "star", "Favorites"],
  ["recent", "/recent", "clock", "Recent"],
  ["settings", "/settings", "settings", "Settings"],
  ["about", "/about", "info", "About"],
];
function logo() {
  return '<span class="logo" aria-hidden="true"><span>›_</span></span>';
}
function navItem([id, path, glyph, label]) {
  const selected = route.page === id || (route.page === "tool" && id === "all");
  return (
    '<a class="nav-item ' +
    (selected ? "active" : "") +
    '" href="#' +
    path +
    '" aria-label="' +
    label +
    '" ' +
    (selected ? 'aria-current="page"' : "") +
    ">" +
    icon(glyph) +
    '<span class="nav-text">' +
    label +
    "</span>" +
    (id === "all" ? '<span class="nav-count">8</span>' : "") +
    "</a>"
  );
}
function notify(message) {
  const status = document.querySelector("#status");
  status.textContent = message;
  status.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => status.classList.remove("show"), 3000);
}
function updatePreferences(patch) {
  prefs = validatePreferences({ ...prefs, ...patch });
  applyPreferences(prefs);
  document
    .querySelectorAll("button[data-pref]")
    .forEach((el) =>
      el.setAttribute(
        "aria-pressed",
        String(el.dataset.value === String(prefs[el.dataset.pref])),
      ),
    );
  if (!savePreferences(prefs))
    notify("Preferences apply for this tab. Browser storage is unavailable.");
}
function navigate(path) {
  if (location.hash === "#" + path) {
    render(true);
    return;
  }
  location.hash = path;
}
const palette = setupPalette({
  navigate,
  notify,
  getRecent: () => prefs.recent,
  toggleTheme: () => {
    updatePreferences({
      theme:
        document.documentElement.dataset.theme === "dark" ? "light" : "dark",
    });
    notify("Theme updated");
  },
});
function render(focus = false) {
  cleanupWorkspace?.();
  cleanupWorkspace = null;
  route = resolveRoute(location.hash);
  const current = tools.find((t) => t.id === route.id);
  document.title =
    (current?.label ||
      {
        dashboard: "Dashboard",
        all: "All Tools",
        favorites: "Favorites",
        recent: "Recent",
        settings: "Settings",
        about: "About & Privacy",
      }[route.page] ||
      "Page not found") + " — DevKit";
  app.innerHTML =
    '<div class="app-shell"><aside class="sidebar" aria-label="Primary navigation"><a class="brand" href="#/" aria-label="DevKit home">' +
    logo() +
    '<div class="brand-copy"><div class="brand-name">DevKit</div><div class="brand-sub">Your everyday toolkit</div></div></a><p class="nav-label">WORKSPACE</p><nav>' +
    navigation.slice(0, 4).map(navItem).join("") +
    '<div class="sidebar-divider"></div>' +
    navigation.slice(4).map(navItem).join("") +
    '</nav><div class="sidebar-bottom"><div class="local-note">' +
    icon("shield") +
    '<div><strong>A little peace of mind.</strong><span class="muted">Your work stays in your browser.</span></div></div><div class="sidebar-footer"><span>DEVKIT <span class="muted">v0.4.0</span></span><button class="icon-button" data-action="collapse" aria-label="' +
    (prefs.sidebarCollapsed ? "Expand" : "Collapse") +
    ' sidebar">' +
    icon("collapse") +
    '</button></div></div></aside><div class="main-shell"><header class="topbar"><a class="mobile-brand" href="#/">' +
    logo() +
    'DevKit</a><button class="top-search" data-action="palette" aria-label="Search tools and commands">' +
    icon("search") +
    '<span class="search-copy">Search tools, actions, or settings…</span><kbd>Ctrl K</kbd></button><div class="top-actions"><span class="top-privacy"><span class="dot"></span> Local. Private. Yours.</span><button class="icon-button" data-action="theme" aria-label="Toggle theme">' +
    icon("sun") +
    '</button><a class="icon-button" href="#/settings" aria-label="Open settings">' +
    icon("settings") +
    '</a></div><button class="mobile-menu icon-button" data-action="menu" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-drawer">' +
    icon("menu") +
    '</button></header><nav class="nav-drawer" id="mobile-drawer" aria-label="Mobile navigation" hidden>' +
    navigation.map(navItem).join("") +
    '</nav><main class="main-content" id="main" tabindex="-1"><div class="route-view">' +
    pageMarkup() +
    '</div><footer class="page-footer"><span>' +
    icon("shield") +
    'Built for your workflow. Private by design.</span><span>Made for the little things you do every day.</span></footer></main></div></div><nav class="bottom-nav" aria-label="Quick navigation">' +
    [navigation[0], navigation[1], navigation[2], navigation[4]]
      .map(
        ([id, path, glyph, label]) =>
          '<a href="#' +
          path +
          '" ' +
          (route.page === id ? 'class="active" aria-current="page"' : "") +
          ">" +
          icon(glyph) +
          "<span>" +
          (id === "dashboard" ? "Home" : id === "all" ? "Tools" : label) +
          "</span></a>",
      )
      .join("") +
    "</nav>";
  bind();
  if (current)
    cleanupWorkspace = mountWorkspace(document.querySelector("main"), {
      tool: current,
      prefs,
      state: drafts.get(current.id),
      saveState: (state) => drafts.set(current.id, state),
      notify,
    });
  if (focus) document.querySelector("main h1")?.focus({ preventScroll: true });
}
function card(t) {
  const fav = prefs.favorites.includes(t.id);
  return (
    '<article class="tool-card"><a class="tool-link" href="#/tools/' +
    t.id +
    '"><span class="tool-icon ' +
    t.color +
    '">' +
    icon(t.icon) +
    "</span><h3>" +
    t.label +
    "</h3><p>" +
    t.description +
    "</p>" +
    icon("arrow", "card-arrow") +
    '</a><button class="favorite-button" data-favorite="' +
    t.id +
    '" aria-label="' +
    (fav ? "Remove " + t.label + " from" : "Add " + t.label + " to") +
    ' favorites" aria-pressed="' +
    fav +
    '">' +
    icon("star") +
    "</button></article>"
  );
}
function recentCard(t) {
  return (
    '<a class="recent-card" href="#/tools/' +
    t.id +
    '"><span class="tool-icon ' +
    t.color +
    '">' +
    icon(t.icon) +
    "</span><div><strong>" +
    t.label +
    "</strong><small>Recently opened</small></div></a>"
  );
}
function empty(title, detail, glyph = "search") {
  return (
    '<div class="empty-state">' +
    icon(glyph) +
    "<strong>" +
    title +
    "</strong><p>" +
    detail +
    "</p></div>"
  );
}
function dashboard() {
  const isHome = route.page === "dashboard",
    heading =
      { all: "All Tools", favorites: "Favorites", recent: "Recent Tools" }[
        route.page
      ] || "All Tools";
  let subset = searchTools(query);
  if (route.page === "favorites")
    subset = subset.filter((t) => prefs.favorites.includes(t.id));
  if (route.page === "recent")
    subset = prefs.recent
      .map((id) => subset.find((t) => t.id === id))
      .filter(Boolean);
  return (
    (isHome
      ? '<section class="hero"><div><div class="eyebrow">A LITTLE LESS FRICTION. A LOT MORE FLOW.</div><h1 tabindex="-1">Welcome to DevKit</h1><p>Your everyday developer toolkit. Fast, focused, and entirely yours.</p></div><div class="hero-art" aria-hidden="true"></div><div class="hero-privacy">' +
        icon("shield") +
        "<div><strong>100% in your browser</strong><small>No accounts. No tracking.<br>Just you and your tools.</small></div></div></section>"
      : '<div class="page-heading"><p class="eyebrow">YOUR EVERYDAY TOOLKIT</p><h1 tabindex="-1">' +
        heading +
        "</h1><p>" +
        (route.page === "favorites"
          ? "Your go-to tools, a little closer."
          : route.page === "recent"
            ? "Pick up where you left off."
            : "Eight small tools. One thoughtful workspace.") +
        "</p></div>") +
    '<div class="tools-toolbar"><h2>' +
    (isHome ? "Your tools" : heading) +
    '<span class="count-badge" id="tool-count">' +
    subset.length +
    '</span></h2><label class="filter-search">' +
    icon("search") +
    '<input id="tool-search" type="search" placeholder="Filter tools…" aria-label="Filter tools" autocomplete="off"><kbd>/</kbd></label></div><div class="tool-grid" id="tool-grid">' +
    (subset.length
      ? subset.map(card).join("")
      : empty(
          route.page === "favorites"
            ? "Your favorites start here"
            : route.page === "recent"
              ? "A fresh start"
              : "No matching tools",
          route.page === "favorites"
            ? "Star a tool to keep it close."
            : route.page === "recent"
              ? "Open a tool and it will appear here."
              : "Try another name or keyword.",
        )) +
    "</div>" +
    (isHome
      ? '<div class="section-head"><h2>Recent tools</h2><a href="#/recent">View all ' +
        icon("arrow") +
        '</a></div><div class="recent-grid">' +
        (prefs.recent.length
          ? prefs.recent
              .slice(0, 4)
              .map((id) => recentCard(tools.find((t) => t.id === id)))
              .join("")
          : '<div class="empty-state recent-empty">' +
            icon("clock") +
            "<div><strong>A fresh workspace, ready when you are.</strong><p>Your recently opened tools will appear here.</p></div></div>") +
        "</div>" +
        (prefs.favorites.length
          ? '<div class="section-head"><h2>Your favorites</h2><a href="#/favorites">View favorites</a></div><div class="recent-grid">' +
            prefs.favorites
              .slice(0, 4)
              .map((id) => recentCard(tools.find((t) => t.id === id)))
              .join("") +
            "</div>"
          : "")
      : "")
  );
}
function workspace() {
  const tool = tools.find((t) => t.id === route.id);
  return workspaceMarkup(tool, prefs, prefs.favorites.includes(tool.id));
}
function pageMarkup() {
  if (["dashboard", "all", "favorites", "recent"].includes(route.page))
    return dashboard();
  if (route.page === "settings") return settingsMarkup(prefs, tab);
  if (route.page === "tool") return workspace();
  if (route.page === "about")
    return (
      '<div class="prose"><div class="page-heading"><p class="eyebrow">SMALL TOOLS. THOUGHTFULLY MADE.</p><h1 tabindex="-1">Your work. Your browser.</h1><p>DevKit is a free, privacy-first developer toolkit.</p></div><section class="settings-group"><h2>Less friction, more flow</h2><p>Everyday developer tasks deserve a simple home. DevKit brings eight focused utilities into one calm workspace, without accounts, subscriptions or upsells.</p><h2>Privacy is a default</h2><p>This application uses no analytics, tracking scripts, external fonts or runtime APIs. Only preferences, favorite IDs and recent tool IDs are stored in this browser. Workspace drafts stay in tab memory and disappear on reload. Generated passwords are cleared when you leave their workspace and password tools are excluded from recent history.</p><p>Your hosting provider may receive normal requests for application files and keep access logs. Browser extensions, your device and clipboard are outside DevKit’s control.</p><h2>Current release</h2><p>Version 0.4.0 · All eight utilities are functional. Passwords use Web Crypto; regular expressions run in time-limited disposable workers. Installability and offline caching are planned for Phase 5 and are not available in this release.</p><a class="button" href="#/settings">Privacy & preferences ' +
      icon("arrow") +
      "</a></section></div>"
    );
  return (
    '<div class="page-heading"><h1 tabindex="-1">This page wandered off.</h1><p>The route does not exist. Your tools are right here.</p></div><a class="button primary" href="#/">Back to dashboard ' +
    icon("arrow") +
    "</a>"
  );
}
function updateGrid() {
  let subset = searchTools(query);
  if (route.page === "favorites")
    subset = subset.filter((t) => prefs.favorites.includes(t.id));
  if (route.page === "recent")
    subset = prefs.recent
      .map((id) => subset.find((t) => t.id === id))
      .filter(Boolean);
  document.querySelector("#tool-grid").innerHTML = subset.length
    ? subset.map(card).join("")
    : empty("No matching tools", "Try another name or keyword.");
  document.querySelector("#tool-count").textContent = subset.length;
  bindFavorites();
}
function bindFavorites() {
  document.querySelectorAll("[data-favorite]").forEach((button) =>
    button.addEventListener("click", () => {
      const id = button.dataset.favorite;
      const added = !prefs.favorites.includes(id);
      updatePreferences({
        favorites: added
          ? [...prefs.favorites, id]
          : prefs.favorites.filter((x) => x !== id),
      });
      button.setAttribute("aria-pressed", String(added));
      button.setAttribute(
        "aria-label",
        (added ? "Remove " : "Add ") +
          tools.find((t) => t.id === id).label +
          (added ? " from" : " to") +
          " favorites",
      );
      notify(added ? "Added to favorites" : "Removed from favorites");
      if (route.page === "dashboard") {
        const scroll = window.scrollY;
        render();
        document
          .querySelector('[data-favorite="' + id + '"]')
          ?.focus({ preventScroll: true });
        window.scrollTo(0, scroll);
      }
      if (route.page === "favorites") {
        updateGrid();
        const next =
          document.querySelector("[data-favorite]") ||
          document.querySelector("main h1");
        next?.focus();
      }
    }),
  );
}
function bind() {
  bindFavorites();
  const search = document.querySelector("#tool-search");
  if (search) {
    search.value = query;
    search.addEventListener("input", () => {
      query = search.value;
      updateGrid();
    });
  }
  document.querySelectorAll("[data-action]").forEach((b) =>
    b.addEventListener("click", () => {
      const action = b.dataset.action;
      if (action === "palette") palette.open(b);
      if (action === "collapse") {
        updatePreferences({ sidebarCollapsed: !prefs.sidebarCollapsed });
        b.setAttribute(
          "aria-label",
          (prefs.sidebarCollapsed ? "Expand" : "Collapse") + " sidebar",
        );
      }
      if (action === "theme") {
        updatePreferences({
          theme:
            document.documentElement.dataset.theme === "dark"
              ? "light"
              : "dark",
        });
        notify("Theme updated");
      }
      if (action === "menu") {
        const drawer = document.querySelector("#mobile-drawer");
        drawer.hidden = !drawer.hidden;
        b.setAttribute("aria-expanded", String(!drawer.hidden));
        b.setAttribute(
          "aria-label",
          drawer.hidden ? "Open navigation" : "Close navigation",
        );
        document.querySelector("main").inert = !drawer.hidden;
        document.querySelector(".bottom-nav").inert = !drawer.hidden;
        if (!drawer.hidden) drawer.querySelector("a").focus();
      }
      if (action === "reset-draft") {
        drafts.delete(route.id);
        const input = document.querySelector("#tool-input");
        input.value = "";
        document.querySelector("#input-count").textContent =
          "0 characters · Nothing saved to storage";
        notify("Draft cleared");
      }
      if (action === "clear-inputs") {
        drafts.clear();
        notify("Session inputs cleared");
      }
      if (action === "clear-favorites") {
        updatePreferences({ favorites: [] });
        render();
        document.querySelector('[data-action="clear-favorites"]').focus();
        notify("Favorites cleared");
      }
      if (action === "clear-recent") {
        updatePreferences({ recent: [] });
        render();
        document.querySelector('[data-action="clear-recent"]').focus();
        notify("Recent tools cleared");
      }
      if (action === "reset-preferences") {
        prefs = validatePreferences(defaults);
        applyPreferences(prefs);
        savePreferences(prefs);
        drafts.clear();
        render();
        document.querySelector('[data-action="reset-preferences"]').focus();
        notify("Preferences restored to defaults");
      }
    }),
  );
  document.querySelectorAll("[data-tab]").forEach((b) => {
    b.addEventListener("click", () => {
      tab = b.dataset.tab;
      render();
      document.querySelector('[data-tab="' + tab + '"]').focus();
    });
    b.addEventListener("keydown", (e) => {
      const keys = [
        "ArrowDown",
        "ArrowRight",
        "ArrowUp",
        "ArrowLeft",
        "Home",
        "End",
      ];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      let i = settingTabs.indexOf(tab);
      i =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? settingTabs.length - 1
            : (i +
                (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1) +
                settingTabs.length) %
              settingTabs.length;
      tab = settingTabs[i];
      render();
      document.querySelector('[data-tab="' + tab + '"]').focus();
    });
  });
  document.querySelectorAll("[data-pref]").forEach((el) => {
    const event = el.tagName === "BUTTON" ? "click" : "change";
    el.addEventListener(event, () => {
      const key = el.dataset.pref;
      let value =
        el.tagName === "BUTTON"
          ? el.dataset.value
          : el.type === "checkbox"
            ? el.checked
            : el.value;
      if (["fontSize", "tabWidth", "jsonIndent"].includes(key))
        value = Number(value);
      updatePreferences({ [key]: value });
      if (el.tagName === "BUTTON") {
        document
          .querySelectorAll('[data-pref="' + key + '"]')
          .forEach((b) =>
            b.setAttribute("aria-pressed", String(b.dataset.value === value)),
          );
      }
    });
  });
}
window.addEventListener("hashchange", () => {
  query = "";
  route = resolveRoute(location.hash);
  if (route.page === "tool" && route.id !== "password")
    updatePreferences({
      recent: [route.id, ...prefs.recent.filter((id) => id !== route.id)].slice(
        0,
        8,
      ),
    });
  render(true);
  window.scrollTo(0, 0);
});
matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
  if (prefs.theme === "system") applyPreferences(prefs);
});
document.addEventListener("keydown", (e) => {
  const drawer = document.querySelector("#mobile-drawer");
  if (drawer && !drawer.hidden && e.key === "Tab") {
    const nodes = [
      document.querySelector('[data-action="menu"]'),
      ...drawer.querySelectorAll("a"),
    ];
    const i = nodes.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      nodes.at(-1).focus();
    } else if (!e.shiftKey && i === nodes.length - 1) {
      e.preventDefault();
      nodes[0].focus();
    }
  }
  if (e.key === "Escape" && drawer && !drawer.hidden) {
    drawer.hidden = true;
    document.querySelector("main").inert = false;
    document.querySelector(".bottom-nav").inert = false;
    const b = document.querySelector('[data-action="menu"]');
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-label", "Open navigation");
    b.focus();
  }
});
document.querySelector(".skip-link").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector("#main").focus();
});
if (route.page === "tool" && route.id !== "password")
  updatePreferences({
    recent: [route.id, ...prefs.recent.filter((id) => id !== route.id)].slice(
      0,
      8,
    ),
  });
render();
