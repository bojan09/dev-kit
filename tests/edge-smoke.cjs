const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const executable =
  process.env.BROWSER_PATH ||
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
if (!fs.existsSync(executable))
  throw new Error("Edge is not installed; set BROWSER_PATH to its executable.");
for (const file of [
  "browser-smoke.cjs",
  "tools-browser.cjs",
  "security-browser.cjs",
  "ux-browser.cjs",
  "pwa-browser.cjs",
]) {
  const result = spawnSync(process.execPath, ["tests/" + file], {
    env: { ...process.env, BROWSER_PATH: executable },
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
