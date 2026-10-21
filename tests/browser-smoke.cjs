const path = require("node:path");
const os = require("node:os");
let pw;
try {
  pw = require(process.env.PLAYWRIGHT_PATH || "playwright");
} catch {
  pw = require(
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    ),
  );
}
const { chromium } = pw;
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH
      ? { executablePath: process.env.BROWSER_PATH }
      : require("node:fs").existsSync(
            "C:/Program Files/Google/Chrome/Application/chrome.exe",
          )
        ? {
            executablePath:
              "C:/Program Files/Google/Chrome/Application/chrome.exe",
          }
        : {}),
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let checks = 0;
  const ok = (a, b, msg) => {
    assert.deepEqual(a, b, msg);
    checks++;
  };
  await page.goto("http://127.0.0.1:4173");
  await page.getByRole("heading", { name: "Welcome to DevKit" }).waitFor();
  ok(await page.locator(".tool-card").count(), 8, "eight cards");
  await page.getByRole("button", { name: "Search tools and commands" }).focus();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("no-result-at-all");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  ok(
    await page.locator("#palette").evaluate((el) => el.open),
    true,
    "zero results do not close",
  );
  await page.keyboard.press("Escape");
  ok(
    await page
      .getByRole("button", { name: "Search tools and commands" })
      .evaluate((el) => el === document.activeElement),
    true,
    "restore focus",
  );
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("jsn");
  await page.keyboard.press("Tab");
  ok(
    await page
      .getByRole("button", { name: "Close command palette" })
      .evaluate((el) => el === document.activeElement),
    true,
    "tab trapped",
  );
  await page.keyboard.press("Tab");
  ok(
    await page
      .getByRole("combobox")
      .evaluate((el) => el === document.activeElement),
    true,
    "tab cycles",
  );
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  ok(page.url(), "http://127.0.0.1:4173/", "Close Enter does not navigate");
  ok(
    await page.locator("#palette").evaluate((el) => el.open),
    false,
    "Close Enter closes palette",
  );
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("Toggle Theme");
  await page.keyboard.press("Enter");
  ok(
    await page
      .getByRole("button", { name: "Search tools and commands" })
      .evaluate((el) => el === document.activeElement),
    true,
    "theme palette restores focus",
  );
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("jsn");
  await page.keyboard.press("Enter");
  await page
    .getByRole("heading", { name: "JSON Studio", exact: true })
    .waitFor();
  await page.getByLabel("Input", { exact: true }).fill('{"draft":"private"}');
  await page.goto("http://127.0.0.1:4173/#/all");
  await page.getByRole("link", { name: /JSON Studio Format/ }).click();
  ok(
    await page.getByLabel("Input", { exact: true }).inputValue(),
    '{"draft":"private"}',
    "session draft preserved",
  );
  ok(
    await page.evaluate(() =>
      localStorage.getItem("devkit.preferences.v1").includes("private"),
    ),
    false,
    "no input stored",
  );
  await page.reload();
  ok(
    await page.getByLabel("Input", { exact: true }).inputValue(),
    "",
    "draft removed on reload",
  );
  await page.goto("http://127.0.0.1:4173/#/settings");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByRole("button", { name: "ocean accent" }).click();
  ok(
    await page.locator("html").getAttribute("data-theme"),
    "light",
    "light theme",
  );
  await page.reload();
  ok(
    await page.locator("html").getAttribute("data-theme"),
    "light",
    "theme persisted",
  );
  ok(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent"),
    ),
    "#0EA5E9",
    "accent persisted",
  );
  await page.getByRole("tab", { name: "Workspace", exact: true }).click();
  await page.getByRole("button", { name: "Clear recent", exact: true }).click();
  ok(
    await page
      .getByRole("button", { name: "Clear recent", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
    "clear recent retains focus",
  );
  await page.getByRole("tab", { name: "Editor", exact: true }).click();
  await page.getByLabel("Editor font size").selectOption("18");
  await page.reload();
  await page.getByRole("tab", { name: "Editor", exact: true }).click();
  ok(
    await page.getByLabel("Editor font size").inputValue(),
    "18",
    "editor preference persisted",
  );
  await page.goto("http://127.0.0.1:4173/#/");
  await page
    .getByRole("button", { name: "Add JSON Studio to favorites" })
    .click();
  await page.goto("http://127.0.0.1:4173/#/favorites");
  ok(await page.locator(".tool-card").count(), 1, "favorite filter");
  await page.goto("http://127.0.0.1:4173/#/unknown");
  await page
    .getByRole("heading", { name: "This page wandered off." })
    .waitFor();
  checks++;
  await page.goto("http://127.0.0.1:4173/#/tools/password");
  ok(
    await page.getByLabel("Input", { exact: true }).isDisabled(),
    true,
    "password preview disabled",
  );
  ok(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("devkit.preferences.v1")).recent.includes(
        "password",
      ),
    ),
    false,
    "password excluded from recent",
  );
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await fs.mkdir("screenshots", { recursive: true });
  for (const [width, height] of [
    [360, 640],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    for (const route of [
      "/",
      "/all",
      "/favorites",
      "/recent",
      "/settings",
      "/about",
      ...[
        "json",
        "base64",
        "uuid",
        "timestamp",
        "url",
        "text",
        "password",
        "regex",
      ].map((id) => "/tools/" + id),
    ]) {
      await page.goto("http://127.0.0.1:4173/#" + route);
      await page.locator("main h1").waitFor();
      ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        "overflow " + width + " " + route,
      );
    }
    await page.goto("http://127.0.0.1:4173/#/");
    if (width < 768)
      ok(
        await page.locator(".hero-privacy").isVisible(),
        false,
        "mobile hero hides badge",
      );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "screenshots/dashboard-" + width + "-dark.png",
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/#/settings");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "screenshots/settings-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.goto("http://127.0.0.1:4173/#/");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "screenshots/desktop-light.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "screenshots/mobile-light.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "About", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Your work. Your browser." })
    .waitFor();
  checks++;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/#/settings");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.getByRole("button", { name: "violet accent" }).click();
  await page.goto("http://127.0.0.1:4173/#/tools/json");
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector("#tool-result-status").dataset.state === "success",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "screenshots/workspace-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.keyboard.press("Control+k");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "screenshots/command-palette.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "reduce" });
  ok(
    await page
      .locator(".route-view")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
    "OS reduced motion",
  );
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("http://127.0.0.1:4173/#/settings");
  await page.getByRole("button", { name: "System", exact: true }).click();
  ok(
    await page.locator("html").getAttribute("data-theme"),
    "light",
    "system light",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "dark",
  );
  ok(
    await page.locator("html").getAttribute("data-theme"),
    "dark",
    "system dark",
  );
  ok(errors, [], "no console errors");
  const denied = await browser.newContext();
  await denied.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  const blockedPage = await denied.newPage();
  await blockedPage.goto("http://127.0.0.1:4173");
  await blockedPage
    .getByRole("heading", { name: "Welcome to DevKit" })
    .waitFor();
  ok(
    await blockedPage.locator(".tool-card").count(),
    8,
    "denied storage works",
  );
  await blockedPage.goto("http://127.0.0.1:4173/#/settings");
  await blockedPage.getByRole("button", { name: "Light", exact: true }).click();
  ok(
    await blockedPage.locator("html").getAttribute("data-theme"),
    "light",
    "denied storage allows setting",
  );
  await browser.close();
  console.log(
    "Browser smoke passed: " +
      checks +
      " assertions; 14 routes × 5 viewports; no page errors.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
