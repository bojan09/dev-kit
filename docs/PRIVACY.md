# Privacy

DevKit processes tool text entirely in the browser. It has no application backend, analytics, tracking, account system, remote fonts or external runtime API. The content security policy disallows runtime connection requests and restricts scripts/workers to local application files.

## Data lifetime

- localStorage: validated settings, favorite tool IDs and recent tool IDs only. Unknown keys and invalid/version-mismatched values are discarded. Denied storage falls back to tab-local operation.
- Tab memory: non-secret editor drafts, outputs and options only. In-app navigation preserves them; reload closes that session. Settings → Privacy clears drafts.
- Passwords: no storage, logging, history or app download. Generated output is removed when leaving the password route. Copy requires explicit action.
- Cache Storage: versioned application shell files only, scoped by installation path. No user input/output, arbitrary navigation, query-bearing request or non-GET response is added to the cache.
- Clipboard/export: copying or downloading is an explicit action. Your clipboard and downloaded files are controlled by your OS and browser, not by DevKit.

Normal requests for static application files reach the hosting provider and may be logged there. Browser extensions, device compromise, browser engine defects and other applications reading your clipboard are outside the application’s control.

Use Settings to clear saved preferences/session drafts, and browser site-data controls to remove cached application files or uninstall the app. Updates ask before reloading because reload clears unsaved drafts.
