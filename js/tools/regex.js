import { result as boundedResult } from "../validation.js";
import { REGEX_LIMITS } from "./regex-engine.js";
export function run(sample, { pattern = "", flags = "g", signal } = {}) {
  if (
    pattern.length > REGEX_LIMITS.pattern ||
    sample.length > REGEX_LIMITS.sample
  )
    throw new Error(
      "Regex limit: pattern 500 characters; sample 50,000 characters.",
    );
  if (typeof Worker === "undefined")
    throw new Error("This browser does not support isolated regex workers.");
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./regex-worker.js", import.meta.url), {
      type: "module",
    });
    let finished = false;
    const timer = setTimeout(
      () =>
        finish(
          new Error(
            "Regex stopped after 750 ms. Simplify the pattern or reduce the sample.",
          ),
        ),
      750,
    );
    const cancel = () => finish(new Error("Regex cancelled."));
    function finish(error, result) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker.terminate();
      signal?.removeEventListener("abort", cancel);
      if (error) reject(error);
      else {
        const output = result.matches.length
          ? result.matches
              .map(
                (m, i) =>
                  "Match " +
                  (i + 1) +
                  " · [" +
                  m.index +
                  ", " +
                  m.end +
                  ") " +
                  JSON.stringify(m.text) +
                  (m.groups.length
                    ? "\n  Groups: " + JSON.stringify(m.groups)
                    : "") +
                  (m.namedGroups
                    ? "\n  Named: " + JSON.stringify(m.namedGroups)
                    : ""),
              )
              .join("\n\n")
          : "No matches.";
        resolve({
          ...boundedResult(output),
          status:
            result.matches.length +
            " match" +
            (result.matches.length === 1 ? "" : "es") +
            (result.truncated ? " · Match limit reached" : ""),
          ...result,
          sample,
        });
      }
    }
    worker.onmessage = (e) =>
      e.data.error
        ? finish(new Error(e.data.error))
        : finish(null, e.data.result);
    worker.onerror = () =>
      finish(
        new Error(
          "Regex worker failed. Reload or check browser worker support.",
        ),
      );
    if (signal?.aborted) {
      cancel();
      return;
    }
    signal?.addEventListener("abort", cancel, { once: true });
    worker.postMessage({ pattern, flags, sample });
  });
}
