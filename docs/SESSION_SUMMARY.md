# Session Summary — Cascadia Security Leadership Council

Progress log for building the community concept, site, and launch packaging.

---

## 2026-11-20 — Concept package and first site

### Goal

Stand up a starter package for a Seattle-area security leadership community: charter, operating plan, and a shareable landing page for recruiting founding members.

### What shipped

- **Planning docs**
  - `CHARTER.md` — purpose, membership, principles, governance, confidentiality, sponsor policy
  - `PROGRAM_BLUEPRINT.md` — year-one cadence, themes, session formats, metrics
  - `LAUNCH_PLAN.md` — 90-day foundation → recruitment → launch checklist
  - `PRD.md` — early product/requirements notes (draft handoff text)
- **Static microsite**
  - `index.html`, `styles.css`, `script.js`
  - Sections: value props, program rhythm, year-one themes, founding criteria, FAQ
  - Light interactions (theme chips, FAQ accordion)

### Concept at end of day

Audience framed as CISOs, CSOs, and security executives. Format: monthly in-person Seattle-area roundtables plus online sessions. Positioning: peer-first, curated, practical outcomes.

---

## 2026-11-21 — Editable content, nonprofit focus, GitHub + Vercel

### Goal

Make site copy easy to edit, narrow the community to nonprofit cybersecurity readiness, then publish.

### What shipped

1. **Content-driven site**
   - Added `content.js` as the single source of public copy
   - Refactored `index.html` / `script.js` to bind and render from `SITE_CONTENT`
   - Added `README.md` with edit and local-preview instructions

2. **Strategic narrowing**
   - Repositioned Cascadia Security Leadership Council (then still named Circle) for **nonprofit leaders**
   - Core mission: develop **strategies and operational playbooks** for current and future cybersecurity threats
   - Updated value props, program labels, year-one themes, membership criteria, and FAQ accordingly

3. **Layout polish**
   - Full-width span for the last “Why this community exists” card so a lone fourth card does not sit alone on a row

4. **Publish**
   - Initialized git; first commit on `main`
   - GitHub repo: https://github.com/deboboy/cascadia-security-union
   - Production deploy on Vercel (`last-myle` team), GitHub connected for future deploys
   - Live URL: https://cascadia-security-union.vercel.app

### Current product framing

| Dimension | Current state |
| --- | --- |
| Name | Cascadia Security Leadership Council |
| Audience | Nonprofit executives / ops / IT / security leaders |
| Offer | Peer strategies + operational playbooks for cyber threats |
| Geography | Seattle-area in person + online |
| Edit path | Change copy in `site/content.js`, refresh / redeploy |
| Hosting | Vercel production alias above |

### Later the same day — project structure cleanup

Reorganized the repo to match common static-site practice and committed the result:

```
docs/   CHARTER.md, PROGRAM_BLUEPRINT.md, LAUNCH_PLAN.md, PRD.md, SESSION_SUMMARY.md
site/   index.html, styles.css, script.js, content.js
```

Also updated:

- `README.md` — nonprofit framing, directory layout, `site/` preview path, live links
- Root `vercel.json` — `outputDirectory: "site"` so Vercel serves the microsite from the nested folder
- This `SESSION_SUMMARY.md` — captured Nov 20–21 progress and the restructure

### Later the same day — founding invite form → Discord

Replaced the public email contact with a lightweight invite form and shipped it to `main`:

- Form fields: name, work email, organization, role, optional notes (+ honeypot)
- Client posts to `/api/invite` (`api/invite.js`)
- Vercel serverless function validates input and posts an embed to `DISCORD_WEBHOOK_URL`
- Webhook URL stays server-side (env var); setup steps + `.env.example` documented in `README.md`
- Primary CTA now targets `#invite`

**Still needed from you:** create the Discord channel webhook, set `DISCORD_WEBHOOK_URL` on the Vercel project, confirm redeploy, then send a test submission.

---

## 2026-11-23 — Rename to Council

Renamed the community from **Cascadia Security Leadership Circle** to **Cascadia Security Leadership Council** across site copy, API Discord embed title, README, charter, PRD, and this summary. CSS `radial-gradient(circle…)` values left unchanged (not branding).

### Later the same day — favicon + Open Graph

- Added brand icon assets: `site/icon.png`, `favicon.svg`, `favicon-16/32.png`, `apple-touch-icon.png`
- Added `site/og-image.png` social card
- Wired favicon links plus static `og:*` / `twitter:*` meta in `site/index.html` (crawlers do not run JS)
- Site URL/image also mirrored in `content.js` / `script.js` for runtime updates

### Later the same day — local folder rename

Renamed the local project directory to `cascadia-security-leadership-council` to match the community name. GitHub repo and Vercel project slugs remain `cascadia-security-union` for now (live URL unchanged).

### Later the same day — analytics + invite form hardening

- **Vercel Web Analytics:** script tags in `site/index.html` (static HTML path; no `@vercel/analytics` / Next.js). Enable Analytics in the Vercel dashboard, then redeploy.
- **Invite bot resistance** adapted from Codex Express scaffold to existing `api/invite.js` + static form (kept Discord webhook delivery; skipped Express/Helmet packages and NDJSON file storage):
  - `GET /api/invite` issues HMAC-signed form + math-challenge tokens (`FORM_SIGNING_SECRET`)
  - `POST` enforces honeypot, field limits, timing window (~4s–1h), challenge answer, IP-bound tokens, and best-effort per-instance rate limit (5 / 15 min)
  - Client loads session tokens on page load and refreshes after submit
  - Security headers via `vercel.json`; README + `.env.example` document both secrets

### Later the same day — custom domain

Custom domain live: **https://www.cascadiasecurity.org/** (Vercel project still `cascadia-security-union`). Canonical, Open Graph, Twitter image, and `content.js` meta URLs updated to the custom domain; README lists it as the primary site URL.

### Later the same day — Cloudflare Turnstile

Replaced the math challenge with **Cloudflare Turnstile**: widget on the invite form, server-side `siteverify` in `api/invite.js` using `TURNSTILE_SECRET_KEY`. Kept honeypot, signed timing token, and rate limiting. Site key is public in the page; secret stays in env only.

### Open follow-ups

- Confirm `TURNSTILE_SECRET_KEY` is set on Vercel production and redeploy after this change
- Align `docs/CHARTER.md`, `docs/PROGRAM_BLUEPRINT.md`, `docs/LAUNCH_PLAN.md` with the nonprofit focus (docs still partly reflect the earlier CISO/CSO framing)
- Clean up or replace the noisy draft text in `docs/PRD.md`
- Optional: redirect apex `cascadiasecurity.org` → `www` if not already configured in Vercel/DNS

---

## How to continue

```bash
# Edit site copy
# → site/content.js

# Local preview
cd site && python3 -m http.server 8080

# Ship updates
git add -A && git commit -m "…" && git push
# Vercel auto-deploys from main (serves site/ via vercel.json)
```
