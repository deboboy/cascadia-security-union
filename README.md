# Cascadia Security Leadership Council

Seattle-area peer community for nonprofit leaders building cybersecurity strategies and operational playbooks — with a static recruiting site and planning docs.

## Directory layout

```
docs/                 Planning and working docs
  CHARTER.md
  PROGRAM_BLUEPRINT.md
  LAUNCH_PLAN.md
  PRD.md
  SESSION_SUMMARY.md
site/                 Public microsite
  index.html
  styles.css
  script.js
  content.js          ← edit site copy here
```

## Edit the site

All public copy lives in:

```
site/content.js
```

Change headlines, CTA labels, program items, themes, criteria, FAQ, contact email, or footer there. Refresh the browser to see updates. Leave the object keys and array structure as-is unless you are adding or removing list items.

Layout and styling stay in `site/index.html` and `site/styles.css`. Behavior stays in `site/script.js`.

## Local preview

```bash
cd site
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Docs

- `docs/CHARTER.md` — mission, principles, governance
- `docs/PROGRAM_BLUEPRINT.md` — cadence, themes, formats
- `docs/LAUNCH_PLAN.md` — 90-day kickoff checklist
- `docs/SESSION_SUMMARY.md` — progress log across working sessions

## Founding invite form → Discord

The **Request Founding Invite** CTA scrolls to a form in `site/`. The browser fetches signed session tokens from `GET /api/invite`, then submissions `POST` to the same route, which validates input and forwards an embed to a Discord channel webhook.

Bot resistance (Vercel serverless, no Express): Cloudflare Turnstile (server-side `siteverify`), honeypot, HMAC-signed timing token (min ~4s fill), field limits, Discord mention escaping, and best-effort per-instance rate limiting (5 posts / 15 min / IP).

### One-time Discord + secrets setup

1. Create a channel (for example `#founding-invites`).
2. Channel settings → **Integrations** → **Webhooks** → **New Webhook**.
3. Name it something like `Cascadia Invite Form`, copy the webhook URL.
4. Create a Turnstile widget in Cloudflare for `www.cascadiasecurity.org` (and any preview hosts you need).
5. Add production env vars on the Vercel project:

```bash
vercel env add DISCORD_WEBHOOK_URL production --scope last-myle
# paste the webhook URL when prompted

vercel env add FORM_SIGNING_SECRET production --scope last-myle
# paste output of: openssl rand -hex 32

vercel env add TURNSTILE_SECRET_KEY production --scope last-myle
# paste the Turnstile secret key (not the site key)
```

6. Redeploy so the function picks up the secrets:

```bash
vercel deploy --prod --yes --scope last-myle
```

The Turnstile **site key** is public and lives in `site/index.html` / `site/content.js`. Do not put the Turnstile **secret**, Discord webhook, or form signing secret in client code or git. Use `.env.example` as a local reference only.

### Analytics

Vercel Web Analytics is wired via script tags in `site/index.html`. Enable **Web Analytics** for the project in the Vercel dashboard, then redeploy so `/_vercel/insights/*` is available.

## Live

- Site: https://www.cascadiasecurity.org/
- Vercel alias: https://cascadia-security-union.vercel.app
- Repo: https://github.com/deboboy/cascadia-security-union
