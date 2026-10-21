# Test plan

## Commands

Start server with npm start. Run npm test, npm run test:browser and npm run format:check.

## Deterministic coverage

Eight unique tools and fuzzy discovery; direct/unknown routes; denied/malformed/version-mismatched storage; invalid enums and numbers; duplicate/unknown tool IDs; no password recents; no arbitrary user data in preference serialization.

## Chromium coverage

All 14 valid routes at 360×640, 390×844, 768×1024, 1024×768 and 1440×900, with overflow assertions. Command open/search/zero results/arrows/Enter/Escape/Tab/focus restoration, Close button activation, theme action focus, mobile navigation, settings controls, persistence, clear-recent focus, favorites, draft navigation/reload/privacy, password exclusion, system theme, OS reduced motion, denied storage and page exceptions.

## Visual evidence

screenshots/ contains five dark dashboard sizes, desktop/mobile light mode, settings, workspace and palette. Capture disables animations to avoid transition frames. Compare hierarchy, sidebar/rail, grid, tabs, panels and mobile navigation with the reference. Screenshots do not prove pixel parity.

## Deferred validation

Phase 2: conversion/Unicode/errors, clipboard and export. Phase 3: crypto and regex workers. Phase 4: contrast audit, screen-reader walkthrough and physical touch devices. Phase 5: Firefox/WebKit, secure APIs, actual offline/install/update and deployed-host checks. Deferred checks are not claimed as performed.
