# DevKit

Your everyday developer toolkit. **Free, privacy-first and browser-local.** Built with semantic HTML, CSS and native JavaScript modules. No runtime dependencies, backend, accounts, tracking or remote fonts.

## Version 1.0.0

All eight utilities are functional. The responsive interface follows the supplied DevKit design: navy surfaces, violet accent, searchable cards, sidebar/rail/mobile navigation, split workspaces, command palette, settings and coherent light mode.

| Tool               | What it does                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| JSON Studio        | Validate, format with 2/4 spaces, minify, copy and JSON export            |
| Base64             | Encode Unicode as UTF-8 standard Base64; strict decoding                  |
| UUID Generator     | Secure v4 UUIDs, 1–100 at a time; copy all or individual                  |
| Timestamp          | Explicit Unix seconds/milliseconds or zoned ISO; UTC and local output     |
| URL Toolkit        | Component encode/decode; absolute URL and duplicate query-pair inspection |
| Text Toolkit       | Case transforms, trim/normalize, sort/deduplicate; code-point counts      |
| Password Generator | Web Crypto, 8–128 characters, category controls, explicit copy            |
| Regex Tester       | Disposable worker, captures, safe highlights, bounds and 750 ms timeout   |

## Run locally

Node.js 22+ is needed only for development tools. The browser application has no build or server-runtime requirement.

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. Native modules need HTTP; do not open index.html through file://.

## Verify

```sh
npm test
npm run test:browser
npm run test:tools
npm run test:security
npm run test:ux
npm run test:pwa
npm run test:a11y
npm run format:check
npm run audit:utilities
npm run audit:performance
```

Start the local server before browser checks. Test tooling is development-only. Browser scripts use installed Chrome on this Windows environment; set BROWSER_PATH to another Chromium executable. The shell suite can also use bundled Playwright Chromium after npx playwright install chromium. npm run test:edge runs the full five-suite browser matrix in installed Windows Edge. Lighthouse may need permission to attach to its local Chrome debugging port.

## Offline and installation

After one completed visit over HTTPS or localhost, a service worker caches **only a versioned allowlist of static app files**. All eight tools, including regex workers, can then work offline. Input/output text and arbitrary requests are never cached. Cache names and cleanup are scoped to the installation path, so sibling deployments are preserved.

Use a supported browser’s install menu or the Install DevKit button in About when available. Installation UI varies by browser; native OS installation was not exercised in headless tests. About displays actual offline readiness. Updates show a banner and require an explicit reload; unsaved session drafts are cleared by reload. You can defer the update and check again in About.

After changing runtime files, rebuild the shell inventory:

```sh
npm run format
npm run build:sw
```

Commit the regenerated sw.js with the release. Its content hash changes when any runtime asset changes. Publish the root files described in [deployment instructions](docs/DEPLOYMENT.md); no bundler or paid service is required.

## Preferences, privacy and limits

Only validated versioned preferences, favorite IDs and recent tool IDs persist. Non-secret input/output drafts and tool options stay in this tab’s memory and survive in-app navigation; reload clears them. Passwords never enter draft/history storage, are not downloaded by the app, and are cleared when leaving their workspace. Copy is explicit; clipboard contents remain outside DevKit’s control.

Settings include light/dark/system, six accents, density, motion, editor size/tab width/wrap/line numbers, JSON indent, timestamp units, sidebar and clearing controls. OS reduced motion takes priority. Optional freeform accent colors are omitted to keep preset contrast predictable.

Ordinary hosting requests can appear in hosting access logs. Extensions, compromised devices and browser vulnerabilities are outside app control. Read [privacy](docs/PRIVACY.md) and [tool limitations](docs/LIMITATIONS.md).

## Routes and keyboard

- /#/ dashboard; /#/all all tools; /#/favorites and /#/recent collections.
- /#/tools/{id}: json, base64, uuid, timestamp, url, text, password, regex.
- /#/settings and /#/about.
- Ctrl/Cmd+K: command palette; arrows select; Enter opens; Escape closes and restores focus; Tab stays inside it.
- Ctrl/Cmd+Enter: run the current tool.
- Slash: dashboard search outside editable fields.
- Settings tabs: arrows, Home and End. Mobile menu: Escape closes and restores focus.

Hash routes support static hosting, deep links and browser back/forward without server rewrites.

## Evidence and source map

See [phase report](docs/PHASE_REPORT.md), [test matrix](docs/TEST_PLAN.md), [final audit](docs/FINAL_AUDIT.md), screenshots/ and docs/audits/. The supplied prompt and design remain in docs/reference/. No visual pixel-parity or physical-device/screen-reader certification is claimed.

Runtime: index.html, manifest.webmanifest, sw.js, assets/icons/, css/ and js/. Development: scripts/, tests/ and package files. Documentation and screenshots do not ship as runtime dependencies. GitHub source commits are pushed to master; enabling live hosting is a separate repository setting and is unverified here.
