import { boundedInteger, result } from "../validation.js";
export function run(input, { count = 1, crypto = globalThis.crypto } = {}) {
  count = boundedInteger(count, 1, 100, "Count");
  if (typeof crypto?.randomUUID !== "function")
    throw new Error(
      "A secure context with crypto.randomUUID is required. Use HTTPS or localhost.",
    );
  const values = Array.from({ length: count }, () => crypto.randomUUID());
  return result(
    values.join("\n"),
    "Generated " + count + " secure v4 UUID" + (count === 1 ? "" : "s"),
    { values },
  );
}
