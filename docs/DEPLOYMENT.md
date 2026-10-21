# Free static deployment

The source is prepared for GitHub Pages at the repository subpath. The automated PWA suite tests /dev-kit/ URLs, offline modules and workers, update activation and scope-specific cache cleanup.

## GitHub Pages

1. Run npm ci and the checks in README. Run npm run format then npm run build:sw after any runtime change.
2. Commit runtime files and generated sw.js. Push to master only.
3. In bojan09/dev-kit repository Settings → Pages, choose Deploy from a branch, master, /(root), then Save.
4. After GitHub finishes publishing, verify the expected URL https://bojan09.github.io/dev-kit/ . This URL is expected, not confirmed deployed by this task.
5. Check a deep link such as /dev-kit/#/tools/json, install/offline readiness, airplane-mode reload, every tool and the update banner over HTTPS.

No backend, paid infrastructure, token or runtime environment variables are needed. Publish index.html, manifest.webmanifest, sw.js, assets/, css/ and js/ together. Other documentation/development files are not needed by the app. Do not publish node_modules or .git.

## Release updates

Bump package.json version, format sources, rebuild sw.js, test and commit. The shell hash is content-derived. A new worker waits while the old version is active; the app asks before applying/reloading. Application caches are isolated by scope and old caches for that scope are removed on activation. A failed precache does not activate a partial new version.

## Verified versus unverified

Verified locally in Chrome and Edge: hash/deep links, subpath assets, all eight tools offline, update/reload and cache cleanup, cached-data privacy and blocked-worker fallback. Live GitHub Pages configuration/deployment and native OS installation are not performed or claimed.
