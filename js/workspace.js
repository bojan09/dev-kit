import { icon } from "./icons.js";
import { copyText } from "./clipboard.js";
import { downloadText } from "./export.js";
import { MAX_INPUT } from "./validation.js";
const config = {
  json: {
    actions: [
      ["format", "Format"],
      ["minify", "Minify"],
      ["validate", "Validate"],
    ],
    help: "JSON.parse validates your data without executing it. Large integers may lose precision under JavaScript number rules; duplicate object keys keep the last value. Maximum input: 1,000,000 characters.",
    example:
      '{"name":"DevKit","version":"1.0","features":["Fast","Beautiful","Privacy-first","Browser-based"]}',
    extension: "json",
  },
  base64: {
    actions: [
      ["encode", "Encode"],
      ["decode", "Decode"],
    ],
    help: "Standard Base64 with padding, not Base64URL. Encoding uses UTF-8; decoding rejects malformed Base64 and invalid UTF-8. Whitespace around Base64 is ignored.",
    example: "Hello, world! 👋",
  },
  uuid: {
    actions: [["generate", "Generate"]],
    help: "Cryptographically secure version 4 UUIDs, generated with crypto.randomUUID. Requires HTTPS or localhost. Batch limit: 100. No insecure random fallback.",
  },
  timestamp: {
    actions: [["convert", "Convert"]],
    help: "Choose units explicitly. ISO input requires a time and timezone (Z or ±HH:MM). Unix inputs are integers; output labels UTC and your browser’s local timezone.",
    example: "1700000000",
  },
  url: {
    actions: [
      ["encode", "Encode"],
      ["decode", "Decode"],
      ["inspect", "Inspect URL"],
    ],
    help: "Encode and Decode operate on a URL component using encodeURIComponent/decodeURIComponent. Inspect parses an absolute URL and lists query pairs without visiting it.",
    example: "https://example.com/search?q=hello world",
  },
  text: {
    actions: [["transform", "Transform"]],
    help: "Character counts use Unicode code points, not grapheme clusters. Words are separated by whitespace. Case conversion is locale-independent; title/sentence case is heuristic. CRLF/CR become LF. Sort uses UTF-16 order; deduplicate compares exact lines.",
    example: "Hello world\nBuild something great\nHello world",
  },
  password: {
    actions: [["generate", "Generate"]],
    help: "Secure password generation arrives in Phase 3.",
  },
  regex: {
    actions: [["test", "Test expression"]],
    help: "Isolated regex testing arrives in Phase 3.",
  },
};
function select(name, label, values, value) {
  return (
    '<label class="tool-option">' +
    label +
    '<select name="' +
    name +
    '" aria-label="' +
    label +
    '">' +
    values
      .map(
        ([v, t]) =>
          '<option value="' +
          v +
          '" ' +
          (v === String(value) ? "selected" : "") +
          ">" +
          t +
          "</option>",
      )
      .join("") +
    "</select></label>"
  );
}
export function workspaceMarkup(t, prefs, favorite) {
  const c = config[t.id],
    enabled = t.capabilities.execute;
  let opts = "";
  if (t.id === "json")
    opts = select(
      "indent",
      "Indentation",
      [
        ["2", "2 spaces"],
        ["4", "4 spaces"],
      ],
      prefs.jsonIndent,
    );
  if (t.id === "uuid")
    opts =
      '<label class="tool-option">Batch count<input name="count" aria-label="Batch count" type="number" min="1" max="100" value="1"></label>';
  if (t.id === "timestamp")
    opts =
      select(
        "unit",
        "Input units",
        [
          ["seconds", "Unix seconds"],
          ["milliseconds", "Unix milliseconds"],
          ["iso", "ISO 8601"],
        ],
        prefs.timestampUnit,
      ) +
      '<span class="live-time" id="live-time"></span><button class="button" data-workspace="now">Use current time</button>';
  if (t.id === "text")
    opts = select(
      "action",
      "Transformation",
      [
        ["upper", "UPPERCASE"],
        ["lower", "lowercase"],
        ["title", "Title Case"],
        ["sentence", "Sentence case"],
        ["trim", "Trim edges"],
        ["normalize", "Normalize whitespace"],
        ["sort", "Sort lines"],
        ["dedupe", "Deduplicate lines"],
      ],
      "upper",
    );
  return (
    '<div class="breadcrumbs"><a href="#/all">' +
    icon("arrow") +
    " All Tools</a><span>›</span><span>" +
    t.label +
    '</span></div><div class="workspace-header"><div class="workspace-title"><span class="tool-icon ' +
    t.color +
    '">' +
    icon(t.icon) +
    '</span><div><h1 tabindex="-1">' +
    t.label +
    "</h1><p>" +
    t.description +
    '</p></div></div><div class="workspace-actions">' +
    c.actions
      .map(
        ([id, label], i) =>
          '<button class="button ' +
          (i === 0 ? "primary" : "") +
          '" ' +
          (i === 0 ? 'id="tool-run"' : "") +
          ' data-run="' +
          id +
          '" ' +
          (!enabled ? "disabled" : "") +
          ">" +
          label +
          "</button>",
      )
      .join("") +
    '<button class="button" data-workspace="reset">Reset</button><button class="icon-button" data-favorite="' +
    t.id +
    '" aria-label="Favorite ' +
    t.label +
    '" aria-pressed="' +
    favorite +
    '">' +
    icon("star") +
    "</button></div></div>" +
    (!enabled
      ? '<div class="note phase-note">Workspace preview · ' +
        t.label +
        " arrives in Phase 3.</div>"
      : "") +
    '<div class="tool-options" id="tool-options">' +
    opts +
    (c.example && enabled
      ? '<button class="text-button" data-workspace="example">Load example</button>'
      : "") +
    '</div><div class="workspace-panels"><section class="editor-panel"><div class="editor-head"><label for="tool-input">Input</label><span class="editor-meta">' +
    (t.id === "uuid" ? "No input required" : "Session only") +
    '</span></div><div class="editor-body"><pre class="line-gutter" aria-hidden="true"></pre><textarea id="tool-input" aria-describedby="workspace-help" spellcheck="false" autocomplete="off" autocapitalize="off" maxlength="1000000" ' +
    (!enabled || t.id === "uuid" ? "disabled" : "") +
    ' placeholder="' +
    (t.id === "uuid"
      ? "Set a batch count, then generate."
      : t.id === "json"
        ? "Paste your JSON here…"
        : "Enter your input here…") +
    '"></textarea></div></section><section class="editor-panel"><div class="editor-head"><label for="tool-output">Output</label><div class="editor-controls"><button class="editor-button" data-workspace="copy" aria-label="Copy output" disabled>' +
    icon("copy") +
    ' Copy</button><button class="editor-button" data-workspace="download" aria-label="Download output" disabled>' +
    icon("download") +
    '</button></div></div><div class="editor-body"><pre class="line-gutter" aria-hidden="true"></pre><textarea id="tool-output" readonly spellcheck="false" placeholder="Your result will appear here…"></textarea></div><div id="individual-results"></div></section></div><div class="workspace-status"><span id="tool-result-status" role="status" aria-live="polite" data-state="idle">' +
    (enabled ? "Ready when you are" : "Available in Phase 3") +
    '</span><span id="input-count">0 characters · Session only</span></div><section class="workspace-help" id="workspace-help"><h2>Good to know</h2><p>' +
    c.help +
    "</p><p>Processing happens in this browser. Inputs and results are never saved to storage.</p></section>"
  );
}
export function mountWorkspace(
  container,
  { tool, prefs, state = {}, saveState, notify },
) {
  const abort = new AbortController(),
    signal = abort.signal;
  const input = container.querySelector("#tool-input"),
    output = container.querySelector("#tool-output"),
    status = container.querySelector("#tool-result-status"),
    options = container.querySelector("#tool-options");
  let action = state.action || config[tool.id].actions[0][0],
    disposed = false,
    working = 0,
    timer = null;
  input.value = state.input || "";
  output.value = state.output || "";
  for (const el of options.querySelectorAll("[name]"))
    if (state.options?.[el.name] !== undefined)
      el.value = state.options[el.name];
  for (const field of [input, output]) {
    field.wrap = prefs.wrap ? "soft" : "off";
    field.style.tabSize = prefs.tabWidth;
    field
      .closest(".editor-body")
      .classList.toggle("with-lines", prefs.lineNumbers);
    field.addEventListener(
      "scroll",
      () => {
        field.previousElementSibling.scrollTop = field.scrollTop;
      },
      { signal },
    );
  }
  function opts() {
    return Object.fromEntries(
      [...options.querySelectorAll("[name]")].map((el) => [
        el.name,
        el.type === "checkbox" ? el.checked : el.value,
      ]),
    );
  }
  function save() {
    if (tool.id !== "password")
      saveState({
        input: input.value,
        output: output.value,
        options: opts(),
        action,
      });
  }
  function lines() {
    for (const field of [input, output])
      field.previousElementSibling.textContent = Array.from(
        { length: Math.min(5000, field.value.split("\n").length) },
        (_, i) => i + 1,
      ).join("\n");
    container.querySelector("#input-count").textContent =
      input.value.length.toLocaleString() + " characters · Session only";
  }
  function available() {
    for (const el of container.querySelectorAll(
      '[data-workspace="copy"],[data-workspace="download"]',
    ))
      el.disabled = !output.value;
  }
  function message(text, kind = "success") {
    status.textContent = text;
    status.dataset.state = kind;
    input.setAttribute("aria-invalid", String(kind === "error"));
  }
  function clearResult() {
    output.value = "";
    container.querySelector("#individual-results").replaceChildren();
    available();
    lines();
  }
  async function run(nextAction = action) {
    if (!tool.capabilities.execute) return;
    action = nextAction;
    const sequence = ++working;
    message("Working…", "busy");
    try {
      if (input.value.length > MAX_INPUT)
        throw new Error("Input exceeds the 1,000,000-character limit.");
      const module = await tool.load();
      const result = await module.run(input.value, {
        ...opts(),
        action: tool.id === "text" ? opts().action : action,
      });
      if (disposed || sequence !== working) return;
      output.value = result.output;
      message(result.status);
      container
        .querySelectorAll("[data-run]")
        .forEach((b) =>
          b.classList.toggle("primary", b.dataset.run === action),
        );
      const list = container.querySelector("#individual-results");
      list.replaceChildren();
      if (result.values?.length > 1)
        result.values.forEach((value, i) => {
          const row = document.createElement("div");
          row.className = "individual-result";
          const text = document.createElement("code");
          text.textContent = value;
          const copy = document.createElement("button");
          copy.className = "editor-button";
          copy.textContent = "Copy";
          copy.setAttribute("aria-label", "Copy UUID " + (i + 1));
          copy.addEventListener(
            "click",
            () =>
              copyText(value)
                .then(() => notify("UUID copied"))
                .catch((e) => notify(e.message)),
            { signal },
          );
          row.append(text, copy);
          list.append(row);
        });
      available();
      lines();
      save();
    } catch (error) {
      if (disposed || sequence !== working) return;
      clearResult();
      message(error.message, "error");
      save();
    }
  }
  input.addEventListener(
    "input",
    () => {
      working++;
      clearResult();
      message("Input changed · run to update output", "idle");
      save();
    },
    { signal },
  );
  options.addEventListener(
    "change",
    () => {
      working++;
      clearResult();
      message("Options changed · run to update output", "idle");
      save();
    },
    { signal },
  );
  container
    .querySelectorAll("[data-run]")
    .forEach((b) =>
      b.addEventListener("click", () => run(b.dataset.run), { signal }),
    );
  container.querySelectorAll("[data-workspace]").forEach((b) =>
    b.addEventListener(
      "click",
      async () => {
        try {
          const task = b.dataset.workspace;
          if (task === "copy") {
            await copyText(output.value);
            notify("Output copied");
          }
          if (task === "download") {
            downloadText(
              output.value,
              "devkit-" + tool.id + "." + (config[tool.id].extension || "txt"),
              tool.id === "json" ? "application/json" : "text/plain",
            );
            notify("Download started");
          }
          if (task === "reset") {
            working++;
            input.value = "";
            clearResult();
            message("Workspace reset", "idle");
            save();
            notify("Workspace reset");
          }
          if (task === "example") {
            input.value = config[tool.id].example;
            if (tool.id === "timestamp" && opts().unit === "milliseconds")
              input.value = "1700000000000";
            working++;
            clearResult();
            lines();
            save();
            message("Example loaded · ready to run", "idle");
          }
          if (task === "now") {
            const unit = opts().unit;
            input.value =
              unit === "iso"
                ? new Date().toISOString()
                : String(
                    unit === "milliseconds"
                      ? Date.now()
                      : Math.floor(Date.now() / 1000),
                  );
            lines();
            save();
            run();
          }
        } catch (error) {
          notify(error.message);
        }
      },
      { signal },
    ),
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        e.key === "Enter" &&
        !document.querySelector("#palette").open
      ) {
        e.preventDefault();
        run();
      }
    },
    { signal },
  );
  function startClock() {
    clearInterval(timer);
    if (document.hidden || tool.id !== "timestamp") return;
    const update = () => {
      container.querySelector("#live-time").textContent =
        "Now · " + Math.floor(Date.now() / 1000) + " s";
    };
    update();
    timer = setInterval(update, 1000);
  }
  if (tool.id === "timestamp") {
    document.addEventListener("visibilitychange", startClock, { signal });
    startClock();
  }
  lines();
  available();
  return () => {
    disposed = true;
    working++;
    clearInterval(timer);
    abort.abort();
  };
}
