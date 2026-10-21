import test from "node:test";
import assert from "node:assert/strict";
import { run as password, randomIndex } from "../js/tools/password.js";
import { evaluateRegex } from "../js/tools/regex-engine.js";
test("password length, category guarantee and secure source", () => {
  for (let i = 0; i < 30; i++) {
    const s = password("", { length: 24 }).output;
    assert.equal(s.length, 24);
    assert.match(s, /[a-z]/);
    assert.match(s, /[A-Z]/);
    assert.match(s, /[0-9]/);
    assert.match(s, /[!@#$%^&*()_+\-=\[\]{}:,.?]/);
  }
  const digits = password("", {
    length: 128,
    lowercase: false,
    uppercase: false,
    symbols: false,
  }).output;
  assert.match(digits, /^\d{128}$/);
  assert.throws(() => password("", { length: 7 }));
  assert.throws(() => password("", { length: 129 }));
  assert.throws(
    () =>
      password("", {
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
      }),
    /category/,
  );
  assert.throws(() => password("", { crypto: {} }), /secure/);
});
test("random selection rejects biased range before using a value", () => {
  let calls = 0;
  const source = {
    getRandomValues(array) {
      array[0] = calls++ === 0 ? 4294967295 : 5;
      return array;
    },
  };
  assert.equal(randomIndex(10, source), 5);
  assert.equal(calls, 2);
});
test("regex captures, flags and no global matches", () => {
  let r = evaluateRegex({
    pattern: "(?<word>hi)(!)?",
    flags: "gi",
    sample: "Hi! hi",
  });
  assert.equal(r.matches.length, 2);
  assert.deepEqual(r.matches[0].groups, ["Hi", "!"]);
  assert.equal(r.matches[0].namedGroups.word, "Hi");
  assert.equal(r.matches[1].index, 4);
  assert.equal(
    evaluateRegex({ pattern: "a", flags: "", sample: "aaa" }).matches.length,
    1,
  );
  assert.equal(
    evaluateRegex({ pattern: "x", flags: "g", sample: "aaa" }).matches.length,
    0,
  );
});
test("regex zero-width Unicode advance, size and match limits", () => {
  assert.deepEqual(
    evaluateRegex({ pattern: "(?:)", flags: "gu", sample: "😀" }).matches.map(
      (m) => m.index,
    ),
    [0, 2],
  );
  assert.deepEqual(
    evaluateRegex({ pattern: "$", flags: "g", sample: "abc" }).matches.map(
      (m) => m.index,
    ),
    [3],
  );
  assert.equal(
    evaluateRegex({ pattern: "a", flags: "g", sample: "a".repeat(600) }).matches
      .length,
    500,
  );
  assert.throws(() => evaluateRegex({ pattern: "[", flags: "", sample: "" }));
  assert.throws(() => evaluateRegex({ pattern: "x", flags: "gg", sample: "" }));
  assert.throws(
    () => evaluateRegex({ pattern: "x".repeat(501), flags: "", sample: "" }),
    /limit/,
  );
  assert.throws(
    () =>
      evaluateRegex({ pattern: "x", flags: "g", sample: "x".repeat(50001) }),
    /limit/,
  );
});
