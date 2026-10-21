import { checkInput, result } from "../validation.js";
export function run(input, { action = "encode" } = {}) {
  checkInput(input);
  if (action === "encode") {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return result(btoa(binary), "Encoded UTF-8 → standard Base64");
  }
  if (action !== "decode") throw new Error("Choose encode or decode.");
  const clean = input.replace(/[\t\n\r ]/g, "");
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      clean,
    )
  )
    throw new Error(
      "Malformed standard Base64. Use the standard alphabet and required = padding.",
    );
  let binary;
  try {
    binary = atob(clean);
  } catch {
    throw new Error("Malformed Base64.");
  }
  if (btoa(binary) !== clean)
    throw new Error("Malformed Base64: non-canonical padding bits.");
  try {
    return result(
      new TextDecoder("utf-8", { fatal: true }).decode(
        Uint8Array.from(binary, (c) => c.charCodeAt(0)),
      ),
      "Decoded Base64 → UTF-8",
    );
  } catch {
    throw new Error("Decoded bytes are not valid UTF-8 text.");
  }
}
