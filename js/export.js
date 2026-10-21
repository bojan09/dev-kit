export function downloadText(text, filename, mime = "text/plain") {
  if (!text) throw new Error("There is no output to download.");
  const url = URL.createObjectURL(
    new Blob([text], { type: mime + ";charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
