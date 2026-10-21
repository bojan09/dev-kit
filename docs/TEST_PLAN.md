# Release test matrix — 1.0.0

Start npm start on port 4173 before browser/audit commands. PWA suite starts its own test-only static server on port 4174 with a /dev-kit/ scope and revision-controlled worker response; it does not modify production files.

| Command                   | Coverage                                                                                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm test                  | 16 deterministic tests: registry/routes/preferences, six utilities, crypto category/rejection cases, regex captures/zero-width/bounds and aggregate capture budget                     |
| npm run test:browser      | 99 assertions: 14 routes at 360×640, 390×844, 768×1024, 1024×768 and 1440×900; palette/focus/theme/storage/drafts; screenshots                                                         |
| npm run test:tools        | 24 checks: both reported UI bugs, six tool workflows, error recovery, Unicode, clipboard, downloads and in-session options                                                             |
| npm run test:security     | 16 checks: no stored password, secret clearing, safe highlights/captures, syntax error, zero-width, aggregate output budget, immediate cancellation, pathological timeout and recovery |
| npm run test:ux           | 10 focused paths: tablet hero, selected navigation, aligned panels, inert mobile drawer, theme synchronization, editor preferences and run shortcut                                    |
| npm run test:pwa          | 19 checks: manifest/icon, all eight offline tools, subpath, cache privacy, update/reload, same-scope cleanup, sibling preservation and blocked registration                            |
| npm run test:a11y         | 47 axe WCAG A/AA scenarios across tools, settings sections, themes, all six accents and palette; zero violations                                                                       |
| npm run test:edge         | Repeats all five browser suites with installed Edge                                                                                                                                    |
| npm run format:check      | Source/document formatting                                                                                                                                                             |
| npm run audit:utilities   | Browser utility sample timings and static shell raw/theoretical gzip bytes                                                                                                             |
| npm run audit:performance | Mobile/desktop Lighthouse scores and timing reports                                                                                                                                    |

## Evidence

Screenshots are in screenshots/. Accessibility before/after JSON demonstrates the contrast correction. Lighthouse HTML and JSON include measured settings. Screenshots disable animations for stable frames; they do not prove pixel parity. Functional runs use real local browser engines with mobile/tablet viewport emulation.

## Not performed

Physical touch devices, real screen-reader walkthrough, native OS install acceptance, Firefox/WebKit, production network conditions and live-host verification. Local tests verify deployment readiness, not actual publication.
