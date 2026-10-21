import test from "node:test";
import assert from "node:assert/strict";
import { run as json } from "../js/tools/json.js";
import { run as base64 } from "../js/tools/base64.js";
import { run as uuid } from "../js/tools/uuid.js";
import { run as timestamp } from "../js/tools/timestamp.js";
import { run as url } from "../js/tools/url.js";
import { run as text } from "../js/tools/text.js";
test("JSON format, minify, validate and invalid/oversized input", () => {
  assert.equal(
    json('{"a":1}', { action: "format", indent: 2 }).output,
    '{\n  "a": 1\n}',
  );
  assert.equal(json('{ "a": 1 }', { action: "minify" }).output, '{"a":1}');
  assert.match(json("null", { action: "validate" }).status, /Valid/);
  assert.throws(() => json("{bad}"), /JSON/);
  assert.throws(() => json(" ".repeat(1000001)), /limit/);
});
test("Base64 supports UTF-8 and rejects malformed bytes", () => {
  for (const s of ["hello", "Здраво 👋", "日本語", ""])
    assert.equal(
      base64(base64(s, { action: "encode" }).output, { action: "decode" })
        .output,
      s,
    );
  assert.equal(base64("hello", { action: "encode" }).output, "aGVsbG8=");
  for (const s of ["%%%%", "a", "ab=c", "/w==", "Zh=="])
    assert.throws(() => base64(s, { action: "decode" }));
});
test("UUID is bounded secure v4 and reports missing crypto", () => {
  const out = uuid("", { count: 3 }).output.split("\n");
  assert.equal(out.length, 3);
  assert.equal(new Set(out).size, 3);
  out.forEach((x) =>
    assert.match(
      x,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    ),
  );
  assert.throws(() => uuid("", { count: 101 }));
  assert.throws(() => uuid("", { crypto: {} }), /secure/);
});
test("Timestamp explicit units, leap date, negative time and overflow", () => {
  assert.match(
    timestamp("0", { unit: "seconds" }).output,
    /1970-01-01T00:00:00.000Z/,
  );
  assert.match(
    timestamp("1700000000000", { unit: "milliseconds" }).output,
    /2023-11-14T22:13:20.000Z/,
  );
  assert.match(
    timestamp("-1", { unit: "seconds" }).output,
    /1969-12-31T23:59:59/,
  );
  assert.match(
    timestamp("2024-02-29T00:00:00Z", { unit: "iso" }).output,
    /1709164800/,
  );
  for (const s of [
    "2023-02-29T00:00:00Z",
    "2024-01-01",
    "2024-13-01T00:00:00Z",
  ])
    assert.throws(() => timestamp(s, { unit: "iso" }));
  assert.throws(() => timestamp("1e50", { unit: "seconds" }));
});
test("URL component encoding and safe query inspection", () => {
  const s = "hello /?🌍";
  assert.equal(
    url(url(s, { action: "encode" }).output, { action: "decode" }).output,
    s,
  );
  assert.throws(() => url("%broken", { action: "decode" }));
  const r = url("https://example.com/a?x=1&x=2", { action: "inspect" });
  assert.match(r.output, /example.com/);
  assert.match(r.output, /"2"/);
  assert.throws(() => url("not a URL", { action: "inspect" }));
});
test("Text transformations, code points and CRLF normalization", () => {
  assert.equal(text(" b\r\na\r\nb ", { action: "sort" }).output, " b\na\nb ");
  assert.equal(text("a\r\na\r\nb", { action: "dedupe" }).output, "a\nb");
  assert.equal(text("  a \n b ", { action: "normalize" }).output, "a b");
  assert.equal(text("hELLO world", { action: "title" }).output, "Hello World");
  assert.equal(
    text("hello. WORLD!", { action: "sentence" }).output,
    "Hello. World!",
  );
  assert.equal(text("👋", { action: "upper" }).counts.characters, 1);
  assert.equal(text("", { action: "lower" }).counts.lines, 0);
});
