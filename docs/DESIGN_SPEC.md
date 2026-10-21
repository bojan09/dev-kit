# DevKit design implementation

The supplied reference image and master prompt in docs/reference define visual intent and requirements. The approved plan is docs/superpowers/plans/2026-10-21-phase-1.md.

## Structure

Desktop uses a 232px sidebar, 82px top bar, bounded content and four-column grid. Tablet at 768–1023px uses an 84px rail. Mobile below 768px uses a compact header, drawer, bottom navigation and two-column grid. Workspace panels stack on mobile. Settings tabs scroll horizontally.

The dashboard preserves the reference’s search, hero, violet ribbons, privacy badge, eight cards, recents and favorites. Decorative ribbons are CSS, not an embedded mockup. Fresh installations show truthful empty recent history. Fonts are system sans/monospace stacks.

## Tokens and access

Dark/light palette and six accents follow the specification. Colors, spacing unit, radii, shadows, focus, durations and editor size use custom properties. Semantic status colors stay independent of accents. Selected button backgrounds darken the accent for white text. Hover, selected, disabled and focus states are distinct.

The palette uses a native modal dialog, input combobox and active-descendant listbox navigation. User search and editor text are inserted as text/value. HTML templates only interpolate fixed registry data or validated enums. Navigation focuses page headings; rerendered action controls recover focus.

Reduced motion respects OS and app settings. Tablet/mobile preserve access through labeled controls. Full contrast and screen-reader audits remain for Phase 4.

## Phase 1 limits

Utility primary actions are disabled and clearly labeled. Line-number display, JSON indentation and timestamp preferences are saved for future implementations. No worker, clipboard, export, manifest or service worker ships in Phase 1. Optional custom accent support is omitted.

## Final release additions

All eight workspaces are functional. Shared editors include line gutters, tool-specific actions/options, explicit copy/export, state feedback and non-secret tab-memory drafts. Password values are ephemeral and regex results are worker-bounded safe text. Local install/offline/update components follow the same tokens. The measured light-theme muted token is #59677E for small-text contrast, with darker accent-dependent text. Screenshot captures scroll to the top to avoid full-page sticky-element artifacts. See FINAL_AUDIT.md for final visual/keyboard/performance evidence and explicit limits.
