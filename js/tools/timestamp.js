import { checkInput, result } from "../validation.js";
export function run(input, { unit = "seconds" } = {}) {
  checkInput(input);
  const s = input.trim();
  let ms;
  if (unit === "iso") {
    const m = s.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/,
    );
    if (!m)
      throw new Error(
        "Use ISO 8601 with time and timezone, e.g. 2024-01-01T00:00:00Z.",
      );
    const [y, month, day, hour, minute, second] = m.slice(1, 7).map(Number);
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0),
      days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > days[month - 1] ||
      hour > 23 ||
      minute > 59 ||
      second > 59
    )
      throw new Error("Invalid calendar date or time.");
    ms = Date.parse(s);
  } else {
    if (!["seconds", "milliseconds"].includes(unit) || !/^[-+]?\d+$/.test(s))
      throw new Error(
        "Enter an integer timestamp and select seconds or milliseconds.",
      );
    const n = Number(s);
    if (!Number.isSafeInteger(n))
      throw new Error("Timestamp is outside the safe integer range.");
    ms = unit === "seconds" ? n * 1000 : n;
  }
  const date = new Date(ms);
  if (!Number.isFinite(ms) || Number.isNaN(date.getTime()))
    throw new Error("Invalid or overflowing timestamp.");
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result(
    "Unix seconds: " +
      Math.floor(ms / 1000) +
      "\nUnix milliseconds: " +
      ms +
      "\nISO 8601: " +
      date.toISOString() +
      "\nUTC: " +
      date.toUTCString() +
      "\nLocal (" +
      zone +
      "): " +
      date.toLocaleString(),
    "Converted · UTC and local timezone shown",
  );
}
