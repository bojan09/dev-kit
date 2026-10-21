const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs/promises");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = [];
  for (const theme of ["dark", "light"]) {
    for (const route of [
      "/",
      "/tools/json",
      "/tools/base64",
      "/tools/uuid",
      "/tools/timestamp",
      "/tools/url",
      "/tools/text",
      "/tools/password",
      "/tools/regex",
      "/settings",
      "/about",
    ]) {
      await page.goto("http://127.0.0.1:4173/#" + route);
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      results.push({
        theme,
        route,
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.help,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
    await page.goto("http://127.0.0.1:4173/#/settings");
    await page.getByRole("tab", { name: "Appearance", exact: true }).click();
    await page
      .getByRole("button", {
        name: theme === "dark" ? "Dark" : "Light",
        exact: true,
      })
      .click();
    for (const accent of [
      "violet",
      "ocean",
      "emerald",
      "rose",
      "amber",
      "indigo",
    ]) {
      await page.getByRole("button", { name: accent + " accent" }).click();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      results.push({
        theme,
        route: "settings/accent/" + accent,
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.help,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
    for (const tab of [
      "Editor",
      "Tools",
      "Workspace",
      "Privacy",
      "Accessibility",
      "Shortcuts",
    ]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      results.push({
        theme,
        route: "settings/" + tab,
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.help,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
  }
  await page.goto("http://127.0.0.1:4173");
  await page.keyboard.press("Control+k");
  let result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  results.push({
    route: "palette",
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.help,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await fs.mkdir("docs/audits", { recursive: true });
  await fs.writeFile(
    "docs/audits/accessibility.json",
    JSON.stringify(
      { engine: "axe-core", scenarios: results.length, results },
      null,
      2,
    ),
  );
  await browser.close();
  const failures = results.filter((r) => r.violations.length);
  console.log(
    results.length +
      " accessibility scenarios; " +
      failures.length +
      " with violations.",
  );
  if (failures.length) {
    console.log(
      JSON.stringify(
        failures
          .map((r) => ({
            theme: r.theme,
            route: r.route,
            violations: r.violations,
          }))
          .slice(0, 2),
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
