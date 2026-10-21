import { tools, fuzzy } from "./tool-registry.js";
import { icon } from "./icons.js";
export function setupPalette({ navigate, notify, getRecent, toggleTheme }) {
  const dialog = document.querySelector("#palette"),
    input = document.querySelector("#command-input"),
    list = document.querySelector("#command-results");
  document.querySelector("#palette-search-icon").innerHTML = icon("search");
  let results = [],
    active = 0,
    trigger = null;
  const entries = [
    ...tools.map((t) => ({
      ...t,
      detail: t.description,
      run: () => navigate("/tools/" + t.id),
    })),
    {
      id: "settings",
      label: "Open Settings",
      icon: "settings",
      detail: "Customize your experience",
      run: () => navigate("/settings"),
    },
    {
      id: "theme",
      label: "Toggle Theme",
      icon: "sun",
      detail: "Switch between light and dark",
      run: toggleTheme,
    },
    {
      id: "about",
      label: "About & Privacy",
      icon: "shield",
      detail: "How DevKit protects your data",
      run: () => navigate("/about"),
    },
  ];
  function render() {
    const q = input.value.trim().toLowerCase();
    results = entries.filter(
      (t) =>
        !q ||
        fuzzy(q, t.label.toLowerCase()) ||
        ((t.keywords || "") + " " + (t.detail || "")).toLowerCase().includes(q),
    );
    if (!q) {
      const recent = getRecent();
      results.sort((a, b) => {
        const x = recent.indexOf(a.id),
          y = recent.indexOf(b.id);
        return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
      });
    }
    active = Math.max(0, Math.min(active, results.length - 1));
    list.replaceChildren();
    if (!results.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No matches. Try a tool name or “settings”.";
      list.append(empty);
      input.removeAttribute("aria-activedescendant");
      return;
    }
    results.forEach((t, i) => {
      const el = document.createElement("div");
      el.className = "command-option";
      el.id = "command-" + t.id;
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", String(active === i));
      const glyph = document.createElement("span");
      glyph.className = "tool-icon " + (t.color || "violet");
      glyph.innerHTML = icon(t.icon);
      const text = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = t.label;
      const desc = document.createElement("small");
      desc.textContent = t.detail;
      text.append(title, desc);
      el.append(glyph, text);
      if (active === i) {
        const key = document.createElement("kbd");
        key.textContent = "↵";
        el.append(key);
      }
      el.addEventListener("click", () => choose(i));
      list.append(el);
    });
    input.setAttribute(
      "aria-activedescendant",
      "command-" + results[active].id,
    );
  }
  function close() {
    dialog.close();
    input.setAttribute("aria-expanded", "false");
    if (trigger?.isConnected) trigger.focus();
  }
  function choose(i) {
    const entry = results[i];
    if (!entry) return;
    close();
    entry.run();
  }
  function open(el = document.activeElement) {
    trigger = el;
    input.value = "";
    active = 0;
    render();
    if (!dialog.open) dialog.showModal();
    input.setAttribute("aria-expanded", "true");
    input.focus();
  }
  input.addEventListener("input", () => {
    active = 0;
    render();
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      active =
        (active + (e.key === "ArrowDown" ? 1 : -1) + results.length) %
        results.length;
      render();
      document
        .getElementById("command-" + results[active].id)
        ?.scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter" && e.target === input) {
      e.preventDefault();
      choose(active);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (document.activeElement === input)
        dialog.querySelector(".close-palette").focus();
      else input.focus();
    }
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  dialog.querySelector(".close-palette").addEventListener("click", close);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        close();
    }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (dialog.open) close();
      else open();
    }
    if (
      e.key === "/" &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !dialog.open &&
      !e.target.closest("input,textarea,select,[contenteditable]")
    ) {
      const search = document.querySelector("#tool-search");
      if (search) {
        e.preventDefault();
        search.focus();
      }
    }
  });
  return { open, close };
}
