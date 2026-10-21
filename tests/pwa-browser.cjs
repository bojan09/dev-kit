const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
(async () => {
  let revision = 1;
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (!url.pathname.startsWith("/dev-kit/")) {
        res.writeHead(404).end();
        return;
      }
      const relative =
        decodeURIComponent(url.pathname.slice(9)) || "index.html";
      const file = path.resolve(relative);
      if (!file.startsWith(process.cwd() + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      let body = await fs.readFile(file);
      if (relative === "sw.js")
        body = body
          .toString()
          .replace(
            'const CACHE_VERSION = "',
            'const CACHE_VERSION = "test-' + revision + "-",
          );
      const mime = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".webmanifest": "application/manifest+json",
      };
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "text/plain",
        "Cache-Control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(4174, "127.0.0.1", resolve));
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let n = 0;
    const eq = (a, b, msg) => {
      assert.deepEqual(a, b, msg);
      n++;
    };
    const base = "http://127.0.0.1:4174/dev-kit/";
    await page.goto(base);
    await page.waitForFunction(
      () => !!navigator.serviceWorker.controller,
      {},
      { timeout: 10000 },
    );
    eq(
      (await (await fetch(base + "manifest.webmanifest")).json()).display,
      "standalone",
      "install manifest",
    );
    eq(
      await page.evaluate(async () => {
        const img = new Image();
        img.src = "assets/icons/icon-512.png";
        await img.decode();
        return [img.width, img.height];
      }),
      [512, 512],
      "local PNG icon",
    );
    await page.goto(base + "#/tools/json");
    await page
      .getByLabel("Input", { exact: true })
      .fill('{"marker":"PRIVATE-NEVER-CACHED-761"}');
    await page.locator("#tool-run").click();
    await page.waitForFunction(
      () =>
        document.querySelector("#tool-result-status").dataset.state ===
        "success",
    );
    eq(
      await page.evaluate(async () => {
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const req of await cache.keys()) {
            if (req.url.includes("?")) return true;
            const response = await cache.match(req);
            if ((await response.text()).includes("PRIVATE-NEVER-CACHED-761"))
              return true;
          }
        }
        return false;
      }),
      false,
      "no input or query in caches",
    );
    await page.evaluate(async () => {
      const key = (await caches.keys()).find((n) =>
        n.startsWith("devkit-shell-"),
      );
      await caches.open(key.slice(0, key.indexOf("test-")) + "obsolete");
      await caches.open("unrelated-application-cache");
      await caches.open("devkit-shell-%2Fsibling%2F-v9");
    });
    await context.setOffline(true);
    await page.reload();
    await page.locator("#tool-run").waitFor();
    eq(
      await page.getByLabel("Input", { exact: true }).inputValue(),
      "",
      "draft not cached",
    );
    for (const [id, value] of [
      ["json", '{"offline":true}'],
      ["base64", "Offline 👋"],
      ["uuid", ""],
      ["timestamp", "0"],
      ["url", "a b"],
      ["text", "hello"],
      ["password", ""],
      ["regex", "Hello offline"],
    ]) {
      await page.goto(base + "#/tools/" + id);
      if (!["uuid", "password"].includes(id))
        await page.getByLabel("Input", { exact: true }).fill(value);
      await page.locator("#tool-run").click();
      await page.waitForFunction(
        () =>
          document.querySelector("#tool-result-status").dataset.state !==
          "busy",
      );
      eq(
        await page.locator("#tool-result-status").getAttribute("data-state"),
        "success",
        id + " works offline",
      );
    }
    await page.goto(base + "#/about");
    await page.locator("#offline-state").waitFor();
    assert.match(
      await page.locator("#offline-state").textContent(),
      /Offline ready/,
    );
    n++;
    await context.setOffline(false);
    revision = 2;
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration()).update();
    });
    await page.locator("#update-notice").waitFor({ state: "visible" });
    await Promise.all([
      page.waitForEvent("load"),
      page.getByRole("button", { name: "Update & reload" }).click(),
    ]);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.waitForFunction(
      async () =>
        (await caches.keys()).some((n) => n.includes("test-2")) &&
        !(await caches.keys()).some((n) => n.includes("test-1")),
    );
    eq(
      await page.evaluate(async () =>
        (await caches.keys()).some((n) => n.endsWith("-obsolete")),
      ),
      false,
      "old shell cache cleaned",
    );
    eq(
      await page.evaluate(async () =>
        (await caches.keys()).includes("unrelated-application-cache"),
      ),
      true,
      "unrelated cache preserved",
    );
    eq(
      await page.evaluate(async () =>
        (await caches.keys()).includes("devkit-shell-%2Fsibling%2F-v9"),
      ),
      true,
      "sibling DevKit cache preserved",
    );
    await context.setOffline(true);
    await page.reload();
    await page
      .getByRole("heading", { name: "Your work. Your browser." })
      .waitFor();
    n++;
    eq(errors, [], "no page errors");
    const denied = await browser.newContext();
    await denied.addInitScript(() => {
      navigator.serviceWorker.register = () =>
        Promise.reject(new DOMException("Blocked", "SecurityError"));
    });
    const blocked = await denied.newPage();
    await blocked.goto(base);
    await blocked.getByRole("heading", { name: "Welcome to DevKit" }).waitFor();
    await blocked.goto(base + "#/about");
    await blocked.waitForFunction(() =>
      document
        .querySelector("#offline-state")
        .textContent.includes("unavailable"),
    );
    assert.match(
      await blocked.locator("#offline-state").textContent(),
      /blocked/,
    );
    n++;
    await denied.close();
    console.log(
      "PWA checks passed: " +
        n +
        "; GitHub Pages subpath, all eight offline tools, update and cache cleanup.",
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
