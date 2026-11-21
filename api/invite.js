const MAX = {
  name: 120,
  email: 200,
  organization: 200,
  role: 120,
  notes: 1000,
};

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

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    json(res, 503, { error: "Invite intake is not configured yet." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      json(res, 400, { error: "Invalid JSON body." });
      return;
    }
  }

  if (!body || typeof body !== "object") {
    json(res, 400, { error: "Missing form data." });
    return;
  }

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

  if (!name || !email || !organization || !role) {
    json(res, 400, { error: "Name, email, organization, and role are required." });
    return;
  }

  if (!isEmail(email)) {
    json(res, 400, { error: "Please provide a valid email address." });
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
        title: "Cascadia Security Leadership Circle",
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
};
