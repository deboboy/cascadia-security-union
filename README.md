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

The **Request Founding Invite** CTA scrolls to a form in `site/`. Submissions POST to `/api/invite`, which forwards an embed to a Discord channel webhook.

### One-time Discord setup

1. Create a channel (for example `#founding-invites`).
2. Channel settings → **Integrations** → **Webhooks** → **New Webhook**.
3. Name it something like `Cascadia Invite Form`, copy the webhook URL.
4. Add it to the Vercel project as a production env var:

```bash
vercel env add DISCORD_WEBHOOK_URL production --scope last-myle
# paste the webhook URL when prompted
```

5. Redeploy so the function picks up the secret:

```bash
vercel deploy --prod --yes --scope last-myle
```

Do not put the webhook URL in client code or commit it. Use `.env.example` as a local reference only.

## Live

- Site: https://cascadia-security-union.vercel.app
- Repo: https://github.com/deboboy/cascadia-security-union
