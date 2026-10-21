export async function copyText(text) {
  if (!text) throw new Error("There is no output to copy.");
  if (globalThis.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* Native selection fallback below. */
    }
  }
  const previous = document.activeElement;
  const field = document.createElement("textarea");
  field.value = text;
  field.className = "clipboard-fallback";
  field.setAttribute("aria-label", "Copy text");
  document.body.append(field);
  field.focus();
  field.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    field.remove();
    previous?.focus();
  }
  if (!copied)
    throw new Error(
      "Clipboard unavailable. Select the output and use your browser’s copy command.",
    );
}
