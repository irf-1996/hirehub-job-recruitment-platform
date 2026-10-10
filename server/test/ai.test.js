import { test } from "node:test";
import assert from "node:assert/strict";
import { askClaude, parseJson, sanitiseReview, AiError } from "../services/ai.js";

test("parseJson handles code fences and surrounding text", () => {
  assert.deepEqual(parseJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(parseJson('Here you go: {"a":2} thanks'), { a: 2 });
});

test("parseJson rejects non-JSON", () => {
  assert.throws(() => parseJson("no json here"), AiError);
  assert.throws(() => parseJson("{broken"), AiError);
});

test("sanitiseReview clamps score, trims lists and handles junk", () => {
  const r = sanitiseReview({ summary: "  ok ", strengths: ["a", "b", "c", "d"], gaps: "nope", fitScore: 42 });
  assert.equal(r.summary, "ok");
  assert.equal(r.strengths.length, 3);
  assert.deepEqual(r.gaps, []);
  assert.equal(r.fitScore, 10);
  assert.equal(sanitiseReview({ fitScore: "abc" }).fitScore, null);
  assert.equal(sanitiseReview({ fitScore: 0 }).fitScore, 1);
});

test("askClaude fails clearly without an API key", async () => {
  delete process.env.ANTHROPIC_API_KEY;
  await assert.rejects(() => askClaude({ system: "s", user: "u" }), (e) => e.status === 503);
});

test("askClaude sends the right request and returns the text", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  const realFetch = globalThis.fetch;
  let seen;
  globalThis.fetch = async (url, opts) => {
    seen = { url, opts };
    return { ok: true, json: async () => ({ content: [{ type: "text", text: "hello" }] }) };
  };
  try {
    assert.equal(await askClaude({ system: "s", user: "u" }), "hello");
    assert.equal(seen.url, "https://api.anthropic.com/v1/messages");
    assert.equal(seen.opts.headers["x-api-key"], "test-key");
    assert.equal(JSON.parse(seen.opts.body).messages[0].content, "u");
  } finally { globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY; }
});

test("askClaude maps API failures to a 502", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 500 });
  try { await assert.rejects(() => askClaude({ system: "s", user: "u" }), (e) => e.status === 502); }
  finally { globalThis.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY; }
});
