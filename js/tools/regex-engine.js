export const REGEX_LIMITS = {
  pattern: 500,
  sample: 50000,
  matches: 500,
  captureCharacters: 200000,
};
export function evaluateRegex({ pattern = "", flags = "g", sample = "" }) {
  if (
    typeof pattern !== "string" ||
    typeof flags !== "string" ||
    typeof sample !== "string"
  )
    throw new Error("Pattern, flags and sample must be text.");
  if (
    pattern.length > REGEX_LIMITS.pattern ||
    sample.length > REGEX_LIMITS.sample
  )
    throw new Error(
      "Regex limit: pattern 500 characters; sample 50,000 characters.",
    );
  if (!/^[dgimsuvy]*$/.test(flags) || new Set(flags).size !== flags.length)
    throw new Error(
      "Use valid, unique JavaScript regex flags: d g i m s u v y.",
    );
  const regex = new RegExp(pattern, flags);
  const matches = [];
  let match,
    characters = 0;
  while ((match = regex.exec(sample)) !== null) {
    const groups = match.slice(1),
      namedGroups = match.groups || null;
    characters +=
      match[0].length +
      groups.reduce((n, g) => n + (g?.length || 0), 0) +
      Object.values(namedGroups || {}).reduce(
        (n, g) => n + (g?.length || 0),
        0,
      );
    if (characters > REGEX_LIMITS.captureCharacters)
      throw new Error(
        "Regex capture results exceed the 200,000-character limit. Reduce the sample or capture groups.",
      );
    matches.push({
      index: match.index,
      end: match.index + match[0].length,
      text: match[0],
      groups,
      namedGroups,
    });
    if (
      matches.length >= REGEX_LIMITS.matches ||
      (!regex.global && !regex.sticky)
    )
      break;
    if (match[0] === "") {
      const pos = regex.lastIndex;
      if (pos >= sample.length) break;
      regex.lastIndex =
        pos +
        ((regex.unicode || regex.unicodeSets) && sample.codePointAt(pos) > 65535
          ? 2
          : 1);
    }
  }
  return { matches, truncated: matches.length === REGEX_LIMITS.matches };
}
