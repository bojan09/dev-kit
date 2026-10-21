import { checkInput, result } from "../validation.js";
export function run(input, { action = "format", indent = 2 } = {}) {
  checkInput(input);
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    let detail = error.message;
    const position = detail.match(/position (\d+)/i);
    if (position) {
      const before = input.slice(0, Number(position[1]));
      const lines = before.split("\n");
      detail +=
        " · line " + lines.length + ", column " + (lines.at(-1).length + 1);
    }
    throw new Error("Invalid JSON: " + detail);
  }
  if (!["format", "minify", "validate"].includes(action))
    throw new Error("Choose a JSON action.");
  const output = JSON.stringify(
    parsed,
    null,
    action === "minify" ? 0 : indent === 4 ? 4 : 2,
  );
  return result(
    output,
    action === "validate"
      ? "Valid JSON"
      : "Valid JSON · " + (action === "minify" ? "Minified" : "Formatted"),
  );
}
