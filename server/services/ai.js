// Thin wrapper around the Anthropic Messages API (no SDK needed, Node 18+ fetch).
const API_URL = "https://api.anthropic.com/v1/messages";

export class AiError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}

export async function askClaude({ system, user, maxTokens = 800 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AiError("AI features are not configured (missing ANTHROPIC_API_KEY)", 503);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-haiku-5-5",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new AiError(`AI service error (${res.status})`, 502);
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!text) throw new AiError("AI returned an empty response");
    return text;
  } catch (e) {
    if (e instanceof AiError) throw e;
    if (e.name === "AbortError") throw new AiError("AI request timed out", 504);
    throw new AiError("Could not reach the AI service");
  } finally {
    clearTimeout(timer);
  }
}

// Models sometimes wrap JSON in code fences or add a sentence around it.
export function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new AiError("AI response was not valid JSON");
  try { return JSON.parse(text.slice(start, end + 1)); }
  catch { throw new AiError("AI response was not valid JSON"); }
}

// Never trust model output: enforce types, lengths and ranges before saving or returning it.
export function sanitiseReview(raw) {
  const str = (v, max) => String(v ?? "").trim().slice(0, max);
  const list = (v) => (Array.isArray(v) ? v : []).slice(0, 3).map((x) => str(x, 160)).filter(Boolean);
  const score = Math.round(Number(raw?.fitScore));
  return {
    summary: str(raw?.summary, 500),
    strengths: list(raw?.strengths),
    gaps: list(raw?.gaps),
    fitScore: Number.isFinite(score) ? Math.min(10, Math.max(1, score)) : null,
  };
}

// Simple in-memory limiter so one user cannot run up the AI bill (resets on restart).
const hits = new Map();
export const aiRateLimit = ({ max = 20, windowMs = 10 * 60 * 1000 } = {}) => (req, res, next) => {
  const now = Date.now();
  const recent = (hits.get(req.user.id) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return res.status(429).json({ message: "Too many AI requests, please try again later" });
  recent.push(now);
  hits.set(req.user.id, recent);
  next();
};
