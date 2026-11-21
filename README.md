# Cascadia Security Leadership Circle

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

## Live

- Site: https://cascadia-security-union.vercel.app
- Repo: https://github.com/deboboy/cascadia-security-union
