const { chromium } = require("playwright");
const { readFile, stat, writeFile } = require("node:fs/promises");
const { gzipSync } = require("node:zlib");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  try {
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:4173");
    const metrics = await page.evaluate(async () => {
      const inputs = {
        json: JSON.stringify({
          items: Array.from({ length: 10000 }, (_, id) => ({
            id,
            name: "DevKit",
          })),
        }),
        base64: "Hello🌍".repeat(20000),
        text: Array.from(
          { length: 20000 },
          (_, i) => "line " + (20000 - i),
        ).join("\n"),
      };
      const out = [];
      for (const [id, input] of Object.entries(inputs)) {
        const module = await import("./js/tools/" + id + ".js");
        const begin = performance.now();
        const result = module.run(
          input,
          id === "text" ? { action: "sort" } : {},
        );
        out.push({
          tool: id,
          inputCodeUnits: input.length,
          outputCodeUnits: result.output.length,
          durationMs: Math.round((performance.now() - begin) * 100) / 100,
        });
      }
      return out;
    });
    const sw = await readFile("sw.js", "utf8");
    const assets = JSON.parse(sw.match(/const ASSETS = (\[[\s\S]*?\]);/)[1]);
    let raw = 0,
      gzip = 0;
    for (const file of assets) {
      const body = await readFile(file);
      raw += body.length;
      gzip += gzipSync(body).length;
    }
    const report = {
      environment:
        "Headless installed Chrome, localhost, unthrottled utility samples; single runs, not hardware guarantees",
      utilities: metrics,
      shell: {
        assets: assets.length,
        rawBytes: raw,
        theoreticalGzipBytes: gzip,
      },
      runtimeDependencies: 0,
    };
    await writeFile(
      "docs/audits/utility-performance.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
