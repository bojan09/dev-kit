const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let n = 0;
  const eq = (a, b, msg) => {
    assert.deepEqual(a, b, msg);
    n++;
  };
  const go = async (id) => {
    await page.goto("http://127.0.0.1:4173/#/tools/" + id);
    await page.locator("#tool-run").waitFor();
  };
  const run = async () => {
    await page.locator("#tool-run").click();
    await page.waitForFunction(
      () =>
        document.querySelector("#tool-result-status").dataset.state !== "busy",
    );
  };
  await go("password");
  await page.getByLabel("Password length").fill("32");
  await run();
  const secret = await page.locator("#tool-output").inputValue();
  eq(secret.length, 32, "password length");
  eq(
    await page.evaluate(
      (s) => Object.values(localStorage).join("").includes(s),
      secret,
    ),
    false,
    "password not stored",
  );
  eq(
    await page.getByRole("button", { name: "Download output" }).isVisible(),
    false,
    "password downloads omitted",
  );
  for (const label of ["lowercase", "uppercase", "numbers", "symbols"])
    await page.getByRole("checkbox", { name: new RegExp(label) }).uncheck();
  await run();
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "error",
    "empty categories error",
  );
  await go("json");
  await go("password");
  eq(
    await page.locator("#tool-output").inputValue(),
    "",
    "password cleared on navigation",
  );
  await go("regex");
  await page.getByLabel("Regular expression").fill("(?<word>Hello)");
  await page
    .getByLabel("Input", { exact: true })
    .fill("Hello <img src=x onerror=alert(1)> Hello");
  await run();
  eq(
    await page.locator("#regex-highlight mark").count(),
    2,
    "highlighted matches",
  );
  eq(
    await page.locator("#regex-highlight img").count(),
    0,
    "sample never becomes HTML",
  );
  eq(await page.locator("#regex-groups details").count(), 2, "capture groups");
  await page.getByLabel("Regular expression").fill("[");
  await run();
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "error",
    "syntax error recovers",
  );
  await page.getByLabel("Regular expression").fill("(?:)");
  await page.getByLabel("Regex flags").fill("gu");
  await page.getByLabel("Input", { exact: true }).fill("😀");
  await run();
  eq(
    await page.locator("#regex-highlight mark").count(),
    2,
    "zero-width Unicode matches",
  );
  await page.getByLabel("Regular expression").fill("(?=(.*))");
  await page.getByLabel("Regex flags").fill("g");
  await page.getByLabel("Input", { exact: true }).fill("a".repeat(50000));
  await run();
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "error",
    "aggregate capture budget",
  );
  await page.evaluate(() => {
    const Original = window.Worker;
    window.__activeRegex = 0;
    window.Worker = class extends Original {
      constructor(...args) {
        super(...args);
        window.__activeRegex++;
        this.counted = true;
      }
      terminate() {
        if (this.counted) {
          window.__activeRegex--;
          this.counted = false;
        }
        super.terminate();
      }
    };
  });
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await page.getByLabel("Input", { exact: true }).fill("a".repeat(20000) + "!");
  await page.locator("#tool-run").click();
  await page.waitForFunction(() => window.__activeRegex === 1);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  eq(
    await page.evaluate(() => window.__activeRegex),
    0,
    "reset immediately terminates worker",
  );
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await page.getByLabel("Regex flags").fill("g");
  await page.getByLabel("Input", { exact: true }).fill("a".repeat(20000) + "!");
  const started = Date.now();
  await run();
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "error",
    "pathological regex terminated",
  );
  assert.ok(Date.now() - started < 4000, "worker timeout responsive");
  n++;
  await page.getByLabel("Regular expression").fill("a+");
  await page.getByLabel("Input", { exact: true }).fill("aaa");
  await run();
  eq(
    await page.locator("#tool-result-status").getAttribute("data-state"),
    "success",
    "fresh worker after timeout",
  );
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await page.getByLabel("Input", { exact: true }).fill("a".repeat(20000) + "!");
  await page.locator("#tool-run").click();
  await page.goto("http://127.0.0.1:4173/#/");
  await page.getByRole("heading", { name: "Welcome to DevKit" }).waitFor();
  eq(errors, [], "no unhandled exceptions");
  await browser.close();
  console.log("Security browser checks passed: " + n);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
