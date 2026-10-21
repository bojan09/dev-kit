import { checkInput, result } from "../validation.js";
export function run(input, { action = "encode" } = {}) {
  checkInput(input);
  try {
    if (action === "encode")
      return result(encodeURIComponent(input), "Encoded as a URL component");
    if (action === "decode")
      return result(decodeURIComponent(input), "Decoded URL component");
    if (action === "inspect") {
      const u = new URL(input);
      return result(
        JSON.stringify(
          {
            protocol: u.protocol,
            hostname: u.hostname,
            port: u.port,
            pathname: u.pathname,
            hash: u.hash,
            query: [...u.searchParams.entries()],
          },
          null,
          2,
        ),
        "URL inspected locally · query pairs preserve duplicates",
      );
    }
    throw new Error("Choose a URL action.");
  } catch (e) {
    if (e instanceof URIError)
      throw new Error(
        "Malformed percent escapes, invalid UTF-8, or an unpaired Unicode surrogate.",
      );
    if (e instanceof TypeError)
      throw new Error("Enter an absolute URL, including https://.");
    throw e;
  }
}
