const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const page = await browser.newPage({
    viewport: { width: 768, height: 1024 },
  });
  await page.goto("http://127.0.0.1:4173");
  assert.equal(
    await page.locator(".hero-privacy").isVisible(),
    false,
    "compact tablet hero",
  );
  await page.goto("http://127.0.0.1:4173/#/tools/json");
  assert.equal(
    await page.locator(".sidebar a[aria-current=page]").getAttribute("href"),
    "#/all",
    "tool workspace selects All Tools",
  );
  assert.equal(
    await page
      .locator(".editor-head")
      .first()
      .evaluate((el) => el.offsetHeight),
    await page
      .locator(".editor-head")
      .last()
      .evaluate((el) => el.offsetHeight),
    "aligned panel headers",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  assert.equal(
    await page.locator("main").evaluate((el) => el.inert),
    true,
    "drawer makes covered main inert",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("main").evaluate((el) => el.inert),
    false,
    "Escape restores main",
  );
  assert.equal(
    await page.getByRole("button", { name: "Open navigation" }).count(),
    1,
    "label restored",
  );
  await page.goto("http://127.0.0.1:4173/#/settings");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("Toggle Theme");
  await page.keyboard.press("Enter");
  assert.equal(
    await page
      .getByRole("button", { name: "Light", exact: true })
      .getAttribute("aria-pressed"),
    "true",
    "palette theme synchronizes settings",
  );
  await page.getByRole("tab", { name: "Editor", exact: true }).click();
  await page.getByLabel("Editor font size").selectOption("18");
  await page.getByLabel("Show line numbers").uncheck();
  await page.goto("http://127.0.0.1:4173/#/tools/json");
  assert.equal(
    await page
      .locator("#tool-input")
      .evaluate((el) => getComputedStyle(el).fontSize),
    "18px",
  );
  assert.equal(await page.locator(".line-gutter").first().isVisible(), false);
  await page.getByRole("button", { name: "Load example" }).click();
  await page.keyboard.press("Control+Enter");
  await page.waitForFunction(
    () =>
      document.querySelector("#tool-result-status").dataset.state === "success",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "screenshots/mobile-tool.png",
    fullPage: true,
    animations: "disabled",
  });
  await browser.close();
  console.log("UI/UX checks passed: 10 assertions");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
