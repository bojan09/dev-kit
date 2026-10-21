import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { writeFile, mkdir } from "node:fs/promises";
const chrome = await chromeLauncher.launch({
  chromePath:
    process.env.BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  chromeFlags: ["--headless=new", "--disable-gpu", "--no-first-run"],
});
try {
  await mkdir("docs/audits", { recursive: true });
  for (const desktop of [false, true]) {
    const options = {
      port: chrome.port,
      logLevel: "error",
      output: "html",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      ...(desktop
        ? {
            formFactor: "desktop",
            screenEmulation: {
              mobile: false,
              width: 1440,
              height: 900,
              deviceScaleFactor: 1,
              disabled: false,
            },
            throttling: {
              rttMs: 40,
              throughputKbps: 10240,
              cpuSlowdownMultiplier: 1,
            },
          }
        : {}),
    };
    const result = await lighthouse("http://127.0.0.1:4173/", options);
    const lhr = result.lhr;
    const summary = {
      lighthouseVersion: lhr.lighthouseVersion,
      fetchTime: lhr.fetchTime,
      environment: lhr.environment,
      settings: lhr.configSettings,
      scores: Object.fromEntries(
        Object.entries(lhr.categories).map(([k, v]) => [
          k,
          Math.round(v.score * 100),
        ]),
      ),
      metrics: Object.fromEntries(
        [
          "first-contentful-paint",
          "largest-contentful-paint",
          "total-blocking-time",
          "cumulative-layout-shift",
          "speed-index",
          "interactive",
        ].map((k) => [
          k,
          {
            value: lhr.audits[k]?.numericValue,
            display: lhr.audits[k]?.displayValue,
          },
        ]),
      ),
      failedAudits: Object.entries(lhr.audits)
        .filter(([, v]) => v.score !== null && v.score < 0.9)
        .map(([id, v]) => ({
          id,
          title: v.title,
          score: v.score,
          display: v.displayValue,
        })),
    };
    const name = "docs/audits/performance-" + (desktop ? "desktop" : "mobile");
    await writeFile(name + ".json", JSON.stringify(summary, null, 2));
    await writeFile(name + ".html", result.report);
    console.log(
      JSON.stringify({
        formFactor: desktop ? "desktop" : "mobile",
        scores: summary.scores,
        metrics: summary.metrics,
      }),
    );
  }
} finally {
  await chrome.kill();
}
