export const MAX_INPUT = 1000000;
export const MAX_OUTPUT = 4000000;
export function checkInput(input) {
  if (typeof input !== "string") throw new Error("Enter text to continue.");
  if (input.length > MAX_INPUT)
    throw new Error("Input exceeds the 1,000,000-character limit.");
  return input;
}
export function boundedInteger(value, min, max, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max)
    throw new Error(
      label + " must be an integer from " + min + " to " + max + ".",
    );
  return n;
}
export function result(output, status = "Done", extra = {}) {
  if (output.length > MAX_OUTPUT)
    throw new Error(
      "Output exceeds the 4,000,000-character limit. Try a smaller input.",
    );
  return { output, status, ...extra };
}
