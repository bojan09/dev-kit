const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const context = await browser.newContext({
    acceptDownloads: true,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  let n = 0;
  const eq = (a, b, msg) => {
    assert.deepEqual(a, b, msg);
    n++;
  };
  const go = async (id) => {
    await page.goto("http://127.0.0.1:4173/#/tools/" + id);
    await page.locator("#tool-run").waitFor();
  };
  const run = async (input) => {
    await page.getByLabel("Input", { exact: true }).fill(input);
    await page.locator("#tool-run").click();
    await page.waitForFunction(
      () =>
        document.querySelector("#tool-result-status").dataset.state !== "busy",
    );
    return page.locator("#tool-output").inputValue();
  };
  await page.goto("http://127.0.0.1:4173");
  await page
    .getByRole("button", { name: "Add JSON Studio to favorites" })
    .click();
  eq(
    await page
      .getByRole("heading", { name: "Your favorites", exact: true })
      .count(),
    1,
    "favorites section updates immediately",
  );
  await page
    .getByRole("button", { name: "Remove JSON Studio from favorites" })
    .click();
  eq(
    await page
      .getByRole("heading", { name: "Your favorites", exact: true })
      .count(),
    0,
    "favorites section disappears immediately",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  eq(
    await page.getByRole("button", { name: "Open navigation" }).count(),
    1,
    "Escape resets menu label",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await go("json");
  eq(await run('{"a":1}'), '{\n  "a": 1\n}', "JSON format");
  await page.getByRole("button", { name: "Minify", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector("#tool-result-status").dataset.state !== "busy",
  );
  eq(await page.locator("#tool-output").inputValue(), '{"a":1}', "JSON minify");
  await run("{broken}");
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "error",
    "JSON error",
  );
  eq(
    await page.locator("#tool-output").inputValue(),
    "",
    "error clears stale output",
  );
  await run('{"ok":true}');
  await page.getByRole("button", { name: "Copy output", exact: true }).click();
  eq(
    JSON.parse(await page.evaluate(() => navigator.clipboard.readText())),
    { ok: true },
    "explicit copy",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download output" }).click();
  eq((await download).suggestedFilename(), "devkit-json.json", "JSON export");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  eq(
    await page.getByLabel("Input", { exact: true }).inputValue(),
    "",
    "reset input",
  );
  eq(await page.locator("#tool-output").inputValue(), "", "reset output");
  await go("base64");
  eq(await run("Здраво 👋"), "0JfQtNGA0LDQstC+IPCfkYs=", "Unicode Base64");
  await page
    .getByLabel("Input", { exact: true })
    .fill("0JfQtNGA0LDQstC+IPCfkYs=");
  await page.getByRole("button", { name: "Decode", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector("#tool-result-status").dataset.state !== "busy",
  );
  eq(
    await page.locator("#tool-output").inputValue(),
    "Здраво 👋",
    "Base64 decode",
  );
  await page.getByLabel("Input", { exact: true }).fill("/w==");
  await page.getByRole("button", { name: "Decode", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector("#tool-result-status").dataset.state !== "busy",
  );
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "error",
    "bad UTF-8",
  );
  await go("uuid");
  await page.getByLabel("Batch count").fill("3");
  await page.locator("#tool-run").click();
  await page.waitForFunction(
    () =>
      document.querySelector("#tool-result-status").dataset.state !== "busy",
  );
  eq(
    (await page.locator("#tool-output").inputValue()).split("\n").length,
    3,
    "UUID batch",
  );
  eq(
    await page.getByRole("button", { name: /Copy UUID/ }).count(),
    3,
    "individual UUID copy",
  );
  await go("timestamp");
  await page.getByLabel("Input units").selectOption("milliseconds");
  assert.match(await run("1700000000000"), /2023-11-14T22:13:20.000Z/);
  n++;
  await page.getByRole("button", { name: "Use current time" }).click();
  assert.match(
    await page.getByLabel("Input", { exact: true }).inputValue(),
    /^\d+$/,
  );
  n++;
  await go("url");
  eq(await run("hello /?"), "hello%20%2F%3F", "component encode");
  await page.getByLabel("Input", { exact: true }).fill("%broken");
  await page.getByRole("button", { name: "Decode", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector("#tool-result-status").dataset.state !== "busy",
  );
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "error",
    "malformed percent",
  );
  await go("text");
  await page.getByLabel("Transformation").selectOption("dedupe");
  eq(await run("a\na\nb"), "a\nb", "dedupe lines");
  await page.getByLabel("Input", { exact: true }).fill("keep this draft");
  await go("json");
  await go("text");
  eq(
    await page.getByLabel("Input", { exact: true }).inputValue(),
    "keep this draft",
    "draft retained",
  );
  eq(
    await page.getByLabel("Transformation").inputValue(),
    "dedupe",
    "session options retained",
  );
  eq(
    await page.evaluate(() =>
      Object.values(localStorage).join("").includes("keep this draft"),
    ),
    false,
    "input not persisted",
  );
  await browser.close();
  console.log("Tool browser checks passed: " + n);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
