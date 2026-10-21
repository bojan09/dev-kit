import { checkInput, result } from "../validation.js";
export function run(input, { action = "upper" } = {}) {
  checkInput(input);
  const s = input.replace(/\r\n?/g, "\n");
  let output;
  switch (action) {
    case "upper":
      output = s.toUpperCase();
      break;
    case "lower":
      output = s.toLowerCase();
      break;
    case "title":
      output = s
        .toLowerCase()
        .replace(
          /(^|[^\p{L}\p{N}])([\p{L}])/gu,
          (m, a, b) => a + b.toUpperCase(),
        );
      break;
    case "sentence":
      output = s
        .toLowerCase()
        .replace(/(^|[.!?]\s+)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
      break;
    case "trim":
      output = s.trim();
      break;
    case "normalize":
      output = s.trim().replace(/\s+/gu, " ");
      break;
    case "sort":
      output = s.split("\n").sort().join("\n");
      break;
    case "dedupe":
      output = [...new Set(s.split("\n"))].join("\n");
      break;
    default:
      throw new Error("Choose a text transformation.");
  }
  const counts = {
    characters: [...s].length,
    words: s.trim() ? s.trim().split(/\s+/u).length : 0,
    lines: s ? s.split("\n").length : 0,
  };
  return result(
    output,
    counts.characters +
      " characters · " +
      counts.words +
      " words · " +
      counts.lines +
      " lines (input)",
    { counts },
  );
}
