import { boundedInteger, result } from "../validation.js";
const categories = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}:,.?",
};
export function randomIndex(size, crypto = globalThis.crypto) {
  const limit = Math.floor(4294967296 / size) * size;
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % size;
}
export function run(
  input,
  { length = 24, crypto = globalThis.crypto, ...options } = {},
) {
  length = boundedInteger(length, 8, 128, "Length");
  if (
    typeof crypto?.getRandomValues !== "function" ||
    globalThis.isSecureContext === false
  )
    throw new Error(
      "A secure context with Web Crypto is required. Use HTTPS or localhost.",
    );
  const selected = Object.entries(categories)
    .filter(([key]) => options[key] !== false)
    .map(([, chars]) => chars);
  if (!selected.length)
    throw new Error("Select at least one character category.");
  const pool = selected.join("");
  const chars = selected.map((set) => set[randomIndex(set.length, crypto)]);
  while (chars.length < length)
    chars.push(pool[randomIndex(pool.length, crypto)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, crypto);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return result(
    chars.join(""),
    "Generated " +
      length +
      " characters · " +
      selected.length +
      " categories · copy explicitly",
  );
}
