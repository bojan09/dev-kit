export const tools = [
  {
    id: "json",
    label: "JSON Studio",
    description: "Format, validate and minify JSON.",
    icon: "braces",
    color: "violet",
    keywords: "object parse pretty data",
    phase: 2,
  },
  {
    id: "base64",
    label: "Base64",
    description: "Encode and decode text with ease.",
    icon: "text",
    color: "blue",
    keywords: "unicode encode decode",
    phase: 2,
  },
  {
    id: "uuid",
    label: "UUID Generator",
    description: "Generate secure, unique identifiers.",
    icon: "cube",
    color: "indigo",
    keywords: "random identifier v4",
    phase: 2,
  },
  {
    id: "timestamp",
    label: "Timestamp",
    description: "A little clarity for Unix time.",
    icon: "clock",
    color: "rose",
    keywords: "date unix seconds milliseconds iso",
    phase: 2,
  },
  {
    id: "url",
    label: "URL Toolkit",
    description: "Encode, decode and inspect URLs.",
    icon: "link",
    color: "blue",
    keywords: "uri component percent query",
    phase: 2,
  },
  {
    id: "text",
    label: "Text Toolkit",
    description: "Transform, clean and count your text.",
    icon: "file",
    color: "emerald",
    keywords: "case words lines sort",
    phase: 2,
  },
  {
    id: "password",
    label: "Password Generator",
    description: "Create passwords. Keep them private.",
    icon: "lock",
    color: "emerald",
    keywords: "secure random secret",
    phase: 3,
  },
  {
    id: "regex",
    label: "Regex Tester",
    description: "Find your pattern. Test your expression.",
    icon: "regex",
    color: "violet",
    keywords: "regular expression match pattern",
    phase: 3,
  },
].map((t) => ({ ...t, capabilities: { execute: false, export: false } }));
export function fuzzy(query, text) {
  let i = 0;
  for (const c of text.toLowerCase()) {
    if (c === query[i]) i++;
  }
  return i === query.length;
}
export function searchTools(query = "") {
  const q = query.trim().toLowerCase();
  return tools.filter(
    (t) =>
      !q ||
      fuzzy(q, t.label.toLowerCase()) ||
      (t.id + " " + t.keywords).includes(q),
  );
}
