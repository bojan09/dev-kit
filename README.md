# DevKit

Your everyday, privacy-first developer toolkit. Free, static and built with HTML, CSS and native JavaScript modules. No runtime dependencies, accounts, telemetry or remote fonts.

## Current status

**v0.1.0 — Phase 1 foundation.** Dashboard, eight workspace previews, hash routing, favorites/recent tools, command palette and settings are implemented. Utility execution, copy and export are disabled until Phases 2–3. PWA installation and offline caching are planned for Phase 5. This release is not deployed or offline-certified.

## Run locally

Requires Node.js 22 or newer for the development server and tests. The application itself runs in a modern browser with no build.

```sh
npm install
npm start
```

Open http://127.0.0.1:4173. Any static HTTP server can serve the project root. Use HTTP rather than file:// for native modules.

## Checks

```sh
npm test
npm run test:browser
npm run format:check
```

Browser tests use development-only Playwright. Run npx playwright install chromium if a browser is missing. On Windows the suite uses installed Chrome when present. Set BROWSER_PATH to use a different Chromium executable; optionally PLAYWRIGHT_PATH selects another Playwright package. Start the server before browser tests. Screenshots are written to screenshots/.

## Routes and shortcuts

- /#/ dashboard; /#/all all tools; /#/favorites and /#/recent filtered collections.
- /#/tools/{id}: json, base64, uuid, timestamp, url, text, password, regex.
- /#/settings preferences; /#/about release and privacy information.
- Ctrl/Cmd+K: command palette. Arrows select, Enter opens, Escape closes and restores focus. Tab cycles within the dialog.
- Slash: dashboard tool search outside editable fields. Settings tabs support arrows, Home and End.

## Privacy and limitations

Only validated, versioned preferences and favorite/recent tool IDs are stored in localStorage. Non-secret preview drafts stay in tab memory, survive in-app navigation and disappear on reload. Password input is disabled and password tools are excluded from recents. Clear session inputs and reset preferences from Settings → Privacy.

The app sends no editor input or output to a server. Hosting involves ordinary static-file requests; host logs, browser extensions, device security and clipboard contents are outside the app’s control. Preview editors are for non-secret drafts only.

Preferences include dark/light/system, six accent presets, density, motion, sidebar state and editor/tool defaults. Line numbers and JSON/timestamp defaults are saved for future tool implementations. The optional custom accent picker is not included. OS reduced motion always overrides animation.

## Structure

- index.html and assets/icons/: semantic entry and local branding.
- css/: tokens, base, layout, components, themes and motion.
- js/: registry, router, settings, preferences, command palette, icons and orchestration.
- tests/: Node tests and real Chromium smoke checks.
- scripts/serve.js: development server, not a production backend.
- docs/reference/: supplied specification and design; other docs contain evidence and decisions.

## Static hosting

Publish the project root to a static host. Hash routes need no server rewrites. GitHub Pages can serve a selected branch root through Settings → Pages. This phase pushes source only; deployment settings are unchanged. Later secure APIs and service workers require HTTPS or localhost.
