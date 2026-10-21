# DevKit — Master Implementation Prompt for Codex / Claude

## Role and mission
You are the lead product engineer, UI designer, accessibility engineer, and QA owner for **DevKit**, a completely free, privacy-first developer toolbox. Implement the full product across the five phases below. **Use the supplied DevKit design reference image as the visual source of truth.** Build a production-ready, responsive, keyboard-first static web application using **only HTML5, CSS3, and vanilla JavaScript (native ES modules)**. No React, Vue, Next.js, Tailwind, TypeScript, bundler requirement, backend, database, analytics, paid infrastructure, external runtime APIs, or third-party hosted fonts/scripts. Local assets and open-source build-time testing tools are permissible; runtime must remain framework-free.

## Mandatory design reference
The accompanying image `DevKit_DESIGN_REFERENCE.png` defines the target layout and visual direction: premium dark developer dashboard; deep navy surfaces, violet accent; left navigation sidebar; searchable eight-tool card grid; recent/favorite tools; split-pane JSON workspace; centered command palette; settings screen; tablet and mobile variants; coherent light mode; component states and palette. Recreate its structure, proportions, hierarchy, spacing, icon style, and polished feel rather than merely approximating the colors. Treat tiny text in the concept art as illustrative; use this specification for exact functional requirements. Make all eight tool cards and workspaces functional. Do not embed the mockup as a screenshot or background; implement semantic HTML components.

### Visual design tokens
- Default dark: canvas `#0B1020`, surface `#141A2B`, elevated surface `#1D2536`, text `#F3F4F6`, muted `#9CA3AF`, borders `#2A3448`.
- Light: canvas `#F7F8FC`, surface `#FFFFFF`, elevated `#F0F3FA`, text `#111827`, muted `#64748B`, borders `#DCE2ED`.
- Default accent violet `#8B5CF6`; presets Ocean `#0EA5E9`, Emerald `#10B981`, Rose `#F43F5E`, Amber `#F59E0B`, Indigo `#6366F1`; optional custom accessible hex color picker.
- Use CSS custom properties for all colors, spacing, radius, shadows, focus rings and durations. Theme/accent changes must propagate to logo treatment, buttons, cards, tabs, sidebar selection, focus rings, and active indicators. Semantic success/error/warning colors remain distinct.
- Modern system sans-serif stack and system monospace stack, no remote font dependency. Consistent 8px spacing rhythm; rounded cards 12–16px; tasteful borders, gradients, restrained glow, and purposeful elevation. Avoid visual clutter and excessive glassmorphism.
- Animation: hover 120–160ms, cards 160–200ms, route/palette 140–240ms, sidebar 200–260ms. Prefer transform/opacity; respect reduced-motion and user motion settings; never block tool actions.

## Product structure and UX
- Routes: `/#/` dashboard, `/#/tools/{id}`, `/#/settings`, `/#/about`; hash routing works on static hosts, direct refresh, browser back/forward and deep links.
- Dashboard: welcome hero, search field, responsive 8-tool grid, favorites, recent tools, privacy badge, clear empty states, keyboard navigation.
- Desktop >=1024px: collapsible ~240px sidebar, top search/command trigger, responsive content, two-panel input/output workspaces. Tablet 768–1023px: compact rail or collapsible sidebar, adaptive panels. Mobile <768px: compact header/navigation, 2-column tool cards where practical, one-column input/output, accessible sticky tool actions only if they do not obscure content; safe-area support.
- Each workspace: breadcrumb/title/description, tool-specific options, input editor, output preview, primary action, reset, copy, supported download, validation and accessible status announcements. Preserve non-secret inputs during in-session navigation; never automatically persist user text or secrets to storage.
- Command palette: Ctrl/Cmd+K, fuzzy search across tools/actions/settings, recent items, up/down navigation, Enter selection, Escape close, focus trap and restore, accessible combobox/listbox behavior. Alt+1–8 optional shortcuts (avoid collisions), Ctrl/Cmd+Enter run current tool, and dashboard `/` search only when not editing. Never override browser or assistive-technology shortcuts inappropriately.
- Settings: light/dark/system; accent presets/custom; density; editor font size, tab width, wrap, optional line numbers; default JSON indentation; timestamp preference; sidebar state; favorites/recent; motion standard/reduced/off; shortcut reference; privacy/clear-preferences/clear-session-inputs. Persist **preferences only** in localStorage, validate versioned values, gracefully handle storage denial.
- About/privacy: clear and accurate browser-local processing description, limitations, offline/install status, version, no analytics/tracking. Completely free, no subscriptions or upsells.

## Eight launch tools (all mandatory)
1. **JSON Studio:** validate with JSON.parse, format 2/4-space, minify, syntax feedback with line/column when reliably derivable (otherwise clear browser error), copy and `.json` export; never execute JSON or inject it as HTML; sensible size limits. Optional highlighting must be safe.
2. **Base64:** UTF-8 Unicode text encode/decode via TextEncoder/TextDecoder with btoa/atob-compatible byte conversion, handle malformed Base64 and invalid UTF-8 explicitly, copy/export text; distinguish standard Base64 from Base64URL if offering both.
3. **UUID:** secure v4 via crypto.randomUUID() in supported secure contexts; batch count bounded (e.g. 1–100), copy all/individual, no insecure Math.random fallback; show capability error where unavailable.
4. **Timestamp:** Unix seconds and milliseconds, ISO 8601, UTC/local readable date, timezone clarity, invalid/overflow handling, current timestamp that updates efficiently and pauses when not visible; do not ambiguously guess units without showing them.
5. **URL Toolkit:** encodeURIComponent/decodeURIComponent, optional full-URL parsing via URL API and query inspection; preserve semantics and distinguish component encoding from entire URL handling; report malformed percent escapes.
6. **Text Toolkit:** upper/lower/title/sentence case, trim, whitespace normalization, sort lines, deduplicate lines, character/word/line counts; document locale/Unicode and line-ending limitations.
7. **Password Generator:** Web Crypto `crypto.getRandomValues`, adjustable length (e.g. 8–128), selected categories, at least one of each selected category where possible, unbiased random selection (rejection sampling where needed), secure shuffle, regenerate, explicit copy; no password storage, history, logging or auto-copy. Avoid misleading strength/security guarantees.
8. **Regex Tester:** native JS regex, flags, sample input, match list, capture groups and highlighted spans rendered safely as text nodes, zero-width match handling, clear syntax errors; limit sample/pattern sizes and match counts; evaluate in disposable worker where feasible with termination/time budget. Explain that pathological regex can still consume resources and avoid unsafe promises.

## Architecture and implementation conventions
Suggested tree:
```
devkit/
  index.html
  manifest.webmanifest
  sw.js
  assets/icons/
  css/{tokens,base,layout,components,themes,motion}.css
  js/{main,router,tool-registry,command-palette,preferences,clipboard,export,accessibility}.js
  js/tools/{json,base64,uuid,timestamp,url,text,password,regex}.js
  tests/
  README.md
  docs/{DESIGN_SPEC,PHASE_REPORT,TEST_PLAN}.md
```
Define a shared tool registry contract: id, label, description, icon, keywords, capabilities, mount(container, context), cleanup(), and run(input, options) or equivalent. Centralize reusable editors, buttons, toast/status, clipboard with permissions/fallback, file download via Blob/object URL with revocation, validation, size checks, keyboard handlers and event cleanup. Avoid unsafe innerHTML for user content, eval, network transmission, third-party tracking, sensitive query parameters, or secret console logging. Respect CSP where compatible with static deployment. Never claim privacy or offline capability without testing.

PWA: installable manifest with locally hosted icons; service worker precaches **versioned static app shell assets only**, no user input or output caching; robust offline fallback, update handling, cache cleanup and explicit offline testing. HTTPS or localhost needed for secure APIs/service workers. Hosting: free static deployment (GitHub Pages or equivalent), with no paid requirements.

## Phased execution plan
**Work sequentially. At the end of each phase run checks, update docs, show screenshots/preview if available, report what passed/failed and stop for approval unless explicitly instructed to proceed through all phases.** Do not silently claim tests, hardware checks, deployment, or visual verification that were not performed.

### Phase 1 — Foundation and visual fidelity
- Inspect repository and existing constraints; preserve user work and avoid unrelated modifications.
- Build semantic app shell, hash router, responsive dashboard, sidebar/mobile navigation, tool-card grid, placeholder workspaces, global command palette, settings UI, theme/accent engine, local preferences, reusable component primitives.
- Match design reference on desktop, tablet, mobile and light/dark; add visible focus, proper labels and reduced-motion behavior from day one.
- Acceptance: all routes work; all eight tools discoverable; responsive layouts at 360x640, 390x844, 768x1024, 1024x768, 1440x900; no horizontal overflow, broken focus or console errors; theme and accent persist; command palette keyboard interaction works. Provide visual comparison screenshots if browser testing is available.

### Phase 2 — Six core utilities
- Implement JSON, Base64, UUID, Timestamp, URL, Text with tool registry and shared workspace components.
- Implement copy/reset/export, feedback, robust invalid input handling, Unicode tests and clear tool help.
- Acceptance: all six tools pass automated deterministic tests and manual smoke paths; outputs are accurate, accessible and never transmitted; no input is silently persisted.

### Phase 3 — Password and regex, security hardening
- Implement secure password generation with constraints and crypto API checks; regex worker/limits and match rendering.
- Audit all user-supplied input rendering, injection, storage, cleanup, clipboard, browser capability fallback and privacy statements.
- Acceptance: all eight tools usable; invalid inputs recover; passwords not logged/stored; regex limits and zero-width cases tested; documented residual risks.

### Phase 4 — Premium polish and accessibility
- Refine pixel-level fidelity to supplied design reference; transitions, states, skeletons only where needed, hover/focus/active/disabled, toast confirmations, tool tips, compact mobile actions, sidebar animations and light-mode consistency.
- Keyboard-only walkthrough, focus trapping/restoration, screen-reader status, contrast and reduced-motion checks; verify custom accent accessibility.
- Acceptance: consistent appearance and behavior across every tool and screen; no interaction blocked by animation; keyboard and touch paths verified; no viewport overflow.

### Phase 5 — PWA, QA, documentation, release
- Add manifest, service worker, local icons, offline-first static asset caching, update flow; optimize assets and startup performance.
- Test browsers where available; test responsive sizes, themes, secure-context features, offline reload, clipboard, exports, deep links and storage-disabled cases. Build automated unit/integration/browser smoke tests using free tooling if appropriate (test dependencies must not ship as runtime dependencies).
- Write complete README, tool limitations, privacy policy, keyboard reference, test matrix, setup/deployment steps and phase completion report. Deploy to an authorized free static host only if credentials/permission are available; otherwise provide exact instructions and clearly mark deployment unverified.
- Acceptance: fully functional eight-tool app, installable/offline-capable on supported browsers, passing tests, accessible core flows, no paid service or backend, truthful verification report.

## Quality gates and delivery format
For every phase provide: (1) concise implementation summary; (2) changed files; (3) screenshots or working preview where available; (4) exact test commands and results; (5) unresolved issues/risks; (6) acceptance checklist; (7) next phase readiness. Maintain a changelog and do not silently skip requirements. When the design reference and functional accessibility conflict, preserve functionality/accessibility while maintaining visual intent. Do not invent tests or claim visual parity without comparing actual rendered screens. If source control is configured, commit only scoped work when authorized; do not push or deploy without authorization.

**Start with Phase 1 only unless I explicitly tell you to execute all phases. First inspect the project, read the attached visual reference, and write a brief implementation plan. Then implement and test Phase 1.**
