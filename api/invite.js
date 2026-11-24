const crypto = require("crypto");

const MAX = {
  name: 120,
  email: 200,
  organization: 200,
  role: 120,
  notes: 1000,
  turnstile: 2048,
};

const MIN_FORM_FILL_MS = 4000;
const MAX_FORM_FILL_MS = 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const TURNSTILE_HOSTNAMES = new Set([
  "www.cascadiasecurity.org",
  "cascadiasecurity.org",
  "cascadia-security-union.vercel.app",
  "localhost",
]);

/** Best-effort per-instance limiter (serverless instances do not share memory). */
const rateBuckets = new Map();

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeDiscord(text) {
  return String(text).replace(/([\\`*_~|])/g, "\\$1").replace(/@/g, "@\u200b");
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function hashIp(ip) {
  return crypto.createHash("sha256").update(String(ip)).digest("hex");
}

function signingSecret() {
  return process.env.FORM_SIGNING_SECRET || "";
}

function turnstileSecret() {
  return process.env.TURNSTILE_SECRET_KEY || "";
}

function toBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input) {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
  return Buffer.from(padded, "base64").toString("utf8");
}

function signPayload(payload) {
  const secret = signingSecret();
  const payloadPart = toBase64Url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(payloadPart).digest("base64url");
  return `${payloadPart}.${signature}`;
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;

  const expected = crypto.createHmac("sha256", signingSecret()).update(payloadPart).digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    return JSON.parse(fromBase64Url(payloadPart));
  } catch {
    return null;
  }
}

function issueFormContext(req) {
  const now = Date.now();
  const ipHash = hashIp(clientIp(req));
  return {
    formToken: signPayload({ iat: now, ipHash, purpose: "invite-form" }),
  };
}

function pruneRateBuckets(now) {
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.start >= RATE_LIMIT_WINDOW_MS) rateBuckets.delete(key);
  }
}

function checkRateLimit(ipHash) {
  const now = Date.now();
  pruneRateBuckets(now);

  const bucket = rateBuckets.get(ipHash);
  if (!bucket || now - bucket.start >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ipHash, { start: now, count: 1 });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.start)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return { error: "Invalid JSON body." };
    }
  }
  if (!body || typeof body !== "object") {
    return { error: "Missing form data." };
  }
  return { body };
}

async function verifyTurnstile(token, ip) {
  const secret = turnstileSecret();
  if (!secret || !token) return { ok: false };

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      console.error("Turnstile siteverify failed", result["error-codes"] || result);
      return { ok: false };
    }

    if (result.hostname && !TURNSTILE_HOSTNAMES.has(result.hostname)) {
      console.error("Turnstile hostname rejected", result.hostname);
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.error("Turnstile siteverify error", err);
    return { ok: false };
  }
}

function handleOptions(res) {
  res.statusCode = 204;
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end();
}

function handleGet(req, res) {
  if (!signingSecret() || !turnstileSecret()) {
    json(res, 503, { error: "Invite intake is not configured yet." });
    return;
  }
  json(res, 200, issueFormContext(req));
}

async function handlePost(req, res) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || !signingSecret() || !turnstileSecret()) {
    json(res, 503, { error: "Invite intake is not configured yet." });
    return;
  }

  const ip = clientIp(req);
  const ipHash = hashIp(ip);
  const limited = checkRateLimit(ipHash);
  if (!limited.allowed) {
    res.setHeader("Retry-After", String(limited.retryAfterSec));
    json(res, 429, { error: "Too many requests. Please try again later." });
    return;
  }

  const parsed = parseBody(req);
  if (parsed.error) {
    json(res, 400, { error: parsed.error });
    return;
  }
  const body = parsed.body;

  // Honeypot — silently succeed for bots
  if (clean(body.company, 200)) {
    json(res, 200, { ok: true });
    return;
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const organization = clean(body.organization, MAX.organization);
  const role = clean(body.role, MAX.role);
  const notes = clean(body.notes, MAX.notes);
  const turnstileToken = clean(
    body["cf-turnstile-response"] || body.turnstileToken || "",
    MAX.turnstile
  );

  if (!name || !email || !organization || !role) {
    json(res, 400, { error: "Name, email, organization, and role are required." });
    return;
  }

  if (!isEmail(email)) {
    json(res, 400, { error: "Please provide a valid email address." });
    return;
  }

  const formToken = verifyToken(body.form_token);
  if (!formToken || formToken.purpose !== "invite-form" || formToken.ipHash !== ipHash) {
    json(res, 400, { error: "Form session is invalid. Please reload and try again." });
    return;
  }

  const ageMs = Date.now() - Number(formToken.iat);
  if (!Number.isFinite(ageMs) || ageMs < MIN_FORM_FILL_MS || ageMs > MAX_FORM_FILL_MS) {
    json(res, 400, {
      error: "Form was submitted too quickly or has expired. Please wait a moment and try again.",
    });
    return;
  }

  const turnstile = await verifyTurnstile(turnstileToken, ip);
  if (!turnstile.ok) {
    json(res, 400, { error: "Security check failed. Please try again." });
    return;
  }

  const fields = [
    { name: "Name", value: escapeDiscord(name), inline: true },
    { name: "Email", value: escapeDiscord(email), inline: true },
    { name: "Organization", value: escapeDiscord(organization), inline: true },
    { name: "Role", value: escapeDiscord(role), inline: true },
  ];

  if (notes) {
    fields.push({ name: "Notes", value: escapeDiscord(notes), inline: false });
  }

  const payload = {
    content: "New founding invite request",
    embeds: [
      {
        title: "Cascadia Security Leadership Council",
        color: 0x0d6b5e,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: "cascadia-security-union invite form" },
      },
    ],
    allowed_mentions: { parse: [] },
  };

  try {
    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordRes.ok) {
      const detail = await discordRes.text();
      console.error("Discord webhook failed", discordRes.status, detail);
      json(res, 502, { error: "Could not deliver the invite request. Please try again." });
      return;
    }
  } catch (err) {
    console.error("Discord webhook error", err);
    json(res, 502, { error: "Could not deliver the invite request. Please try again." });
    return;
  }

  json(res, 200, { ok: true });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    handleOptions(res);
    return;
  }

  if (req.method === "GET") {
    handleGet(req, res);
    return;
  }

  if (req.method === "POST") {
    await handlePost(req, res);
    return;
  }

  json(res, 405, { error: "Method not allowed." });
};
