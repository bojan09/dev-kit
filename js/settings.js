import { accents } from "./preferences.js";
export const settingTabs = [
  "Appearance",
  "Editor",
  "Tools",
  "Workspace",
  "Privacy",
  "Accessibility",
  "Shortcuts",
];
function segments(key, values, p) {
  return (
    '<div class="segments" role="group" aria-label="' +
    key +
    '">' +
    values
      .map(
        ([v, label]) =>
          '<button data-pref="' +
          key +
          '" data-value="' +
          v +
          '" aria-pressed="' +
          (p[key] === v) +
          '">' +
          label +
          "</button>",
      )
      .join("") +
    "</div>"
  );
}
function row(title, desc, control) {
  return (
    '<div class="setting-row"><div><strong>' +
    title +
    "</strong><small>" +
    desc +
    "</small></div>" +
    control +
    "</div>"
  );
}
function select(key, values, p, label) {
  return (
    '<select aria-label="' +
    label +
    '" data-pref="' +
    key +
    '">' +
    values
      .map(
        ([v, t]) =>
          '<option value="' +
          v +
          '" ' +
          (p[key] === v ? "selected" : "") +
          ">" +
          t +
          "</option>",
      )
      .join("") +
    "</select>"
  );
}
function toggle(key, label, p) {
  return (
    '<label class="toggle"><input type="checkbox" data-pref="' +
    key +
    '" ' +
    (p[key] ? "checked" : "") +
    "><span>" +
    label +
    "</span></label>"
  );
}
function group(title, desc, body) {
  return (
    '<section class="settings-group"><h2>' +
    title +
    "</h2><p>" +
    desc +
    "</p>" +
    body +
    "</section>"
  );
}
export function settingsMarkup(p, tab = "Appearance") {
  let content = "";
  if (tab === "Appearance")
    content =
      group(
        "Make yourself at home",
        "A workspace that feels like yours.",
        row(
          "Theme",
          "Choose your preferred appearance.",
          segments(
            "theme",
            [
              ["light", "Light"],
              ["dark", "Dark"],
              ["system", "System"],
            ],
            p,
          ),
        ) +
          row(
            "Accent color",
            "A little personality, everywhere.",
            '<div class="swatches">' +
              Object.entries(accents)
                .map(
                  ([name, hex]) =>
                    '<div class="swatch-wrap"><button class="swatch" style="--swatch:' +
                    hex +
                    '" data-pref="accent" data-value="' +
                    name +
                    '" aria-label="' +
                    name +
                    ' accent" aria-pressed="' +
                    (p.accent === name) +
                    '"></button><span>' +
                    name[0].toUpperCase() +
                    name.slice(1) +
                    "</span></div>",
                )
                .join("") +
              "</div>",
          ) +
          row(
            "Interface density",
            "Give your tools a little more room.",
            segments(
              "density",
              [
                ["comfortable", "Comfortable"],
                ["compact", "Compact"],
                ["spacious", "Spacious"],
              ],
              p,
            ),
          ),
      ) +
      group(
        "Motion",
        "Keep things moving at your pace.",
        row(
          "Animations",
          "Your operating system’s reduced-motion preference is always respected.",
          segments(
            "motion",
            [
              ["standard", "Standard"],
              ["reduced", "Reduced"],
              ["off", "Off"],
            ],
            p,
          ),
        ),
      );
  if (tab === "Editor")
    content = group(
      "Editor preferences",
      "These defaults will apply to the utilities as they launch.",
      row(
        "Font size",
        "Choose a comfortable reading size.",
        select(
          "fontSize",
          [
            [12, "12 px"],
            [14, "14 px"],
            [16, "16 px"],
            [18, "18 px"],
          ],
          p,
          "Editor font size",
        ),
      ) +
        row(
          "Tab width",
          "Spaces per indentation level.",
          select(
            "tabWidth",
            [
              [2, "2 spaces"],
              [4, "4 spaces"],
            ],
            p,
            "Tab width",
          ),
        ) +
        row(
          "Word wrap",
          "Keep long lines within the editor.",
          toggle("wrap", "Wrap lines", p),
        ) +
        row(
          "Line numbers",
          "Saved for the full editors in Phase 2.",
          toggle("lineNumbers", "Show line numbers", p),
        ),
    );
  if (tab === "Tools")
    content = group(
      "Tool defaults",
      "Set once. Get back to building.",
      row(
        "JSON indentation",
        "Default formatting for JSON Studio in Phase 2.",
        select(
          "jsonIndent",
          [
            [2, "2 spaces"],
            [4, "4 spaces"],
          ],
          p,
          "JSON indentation",
        ),
      ) +
        row(
          "Timestamp units",
          "Explicit units for timestamp conversion in Phase 2.",
          select(
            "timestampUnit",
            [
              ["seconds", "Unix seconds"],
              ["milliseconds", "Unix milliseconds"],
            ],
            p,
            "Timestamp preference",
          ),
        ),
    );
  if (tab === "Workspace")
    content = group(
      "Your workspace",
      "Navigation preferences stay in this browser.",
      row(
        "Sidebar",
        "Use a compact icon rail on desktop.",
        toggle("sidebarCollapsed", "Collapse sidebar", p),
      ) +
        row(
          "Favorites",
          p.favorites.length +
            " favorite tools. Star any tool on the dashboard.",
          '<button class="button" data-action="clear-favorites">Clear favorites</button>',
        ) +
        row(
          "Recent tools",
          p.recent.length + " recently opened tools. Passwords are excluded.",
          '<button class="button" data-action="clear-recent">Clear recent</button>',
        ),
    );
  if (tab === "Privacy")
    content = group(
      "Private by design",
      "DevKit has no analytics, accounts or external runtime services.",
      '<div class="note">Only your preferences, favorite tool IDs and recent tool IDs are saved. Editor text stays in memory for this tab and is removed on reload. Password tool input is never retained. Utilities begin in Phase 2; offline installation arrives in Phase 5.</div>' +
        row(
          "Session inputs",
          "Remove all editor drafts held in this tab.",
          '<button class="button" data-action="clear-inputs">Clear session inputs</button>',
        ) +
        row(
          "Saved preferences",
          "Restore defaults, including favorites and recents.",
          '<button class="button" data-action="reset-preferences">Reset preferences</button>',
        ),
    );
  if (tab === "Accessibility")
    content = group(
      "Comfort and access",
      "Keyboard-first controls, visible focus and native semantics.",
      row(
        "Reduce motion",
        "Operating system preferences take priority.",
        segments(
          "motion",
          [
            ["standard", "Standard"],
            ["reduced", "Reduced"],
            ["off", "Off"],
          ],
          p,
        ),
      ) +
        '<div class="note">Use Tab to move through controls. Every tool has a labeled link and a separate favorite button. The command palette keeps focus inside it and returns focus when closed. Use your browser’s zoom and text-size controls as needed.</div>',
    );
  if (tab === "Shortcuts")
    content = group(
      "A few useful shortcuts",
      "Keep your hands on the keyboard.",
      '<div class="shortcut-list">' +
        [
          ["Open command palette", "Ctrl / ⌘ K"],
          ["Focus dashboard search", "/"],
          ["Move through palette results", "↑ / ↓"],
          ["Open selected result", "Enter"],
          ["Close palette", "Escape"],
          ["Navigate controls", "Tab / Shift Tab"],
        ]
          .map(
            ([label, key]) =>
              '<div class="shortcut-row"><span>' +
              label +
              "</span><kbd>" +
              key +
              "</kbd></div>",
          )
          .join("") +
        '</div><div class="note">Shortcuts do not intercept text editing. Run-current-tool shortcuts arrive with tool execution.</div>',
    );
  return (
    '<div class="page-heading"><p class="eyebrow">YOUR WORKSPACE, YOUR WAY</p><h1 tabindex="-1">Settings</h1><p>Small details. A better everyday experience.</p></div><div class="settings-layout"><div class="settings-tabs" role="tablist" aria-label="Settings sections" aria-orientation="vertical">' +
    settingTabs
      .map(
        (t) =>
          '<button role="tab" id="tab-' +
          t +
          '" aria-controls="settings-panel" tabindex="' +
          (t === tab ? "0" : "-1") +
          '" aria-selected="' +
          (t === tab) +
          '" data-tab="' +
          t +
          '">' +
          t +
          "</button>",
      )
      .join("") +
    '</div><div class="settings-panel" id="settings-panel" role="tabpanel" aria-labelledby="tab-' +
    tab +
    '">' +
    content +
    "</div></div>"
  );
}
