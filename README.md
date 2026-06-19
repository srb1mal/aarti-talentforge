# Aarti TalentForge — AI Resume Intelligence

**Aarti TalentForge** is the in-house, **fully client-side** HR platform for Aarti Steels Ltd.
HR uploads a candidate resume, the engine scores it against the exact skills each plant function
needs, and the strongest applicants are ranked and shortlisted for interview.

Everything runs in the browser (no server, no database), so it can be hosted **free on GitHub
Pages**. The theme is a true-dark / black UI with the sky-blue Aarti brand colour.

## Departments (14)

Each function has its own AI scoring profile tuned to the work that actually happens there:

| | | |
|---|---|---|
| 🔩 Rolling Mill | 🔥 Steel Melting Shop (SMS) | 🔬 Metallurgy & Quality (QA/QC) |
| ⚡ Power Plant | 🛠️ Maintenance & Engineering | 🛡️ Cyber Security |
| 💻 Information & Technology (IT) | 🧩 SAP | 📈 Account & Finance |
| 🚚 Procurement & Supply Chain | 🦺 Safety & Environment (EHS) | 🗓️ Production Planning (PPC) |
| 🧑‍💼 Human Resources | 📣 Sales & Marketing | |

Add or edit departments in the `DEPARTMENTS` object in `js/app.js` — each one defines
`core` skills, `tools`, `certs`, relevant job `titles` and education `fields`.

## Advanced scoring engine

Every resume is scored out of 100 across **8 weighted, department-aware dimensions**:

| Dimension | Weight | What it measures |
|---|---|---|
| Core Skills | 30 | Match against the department's primary domain skills |
| Tools & Systems | 12 | Software / equipment / platforms (e.g. SCADA, SAP GUI, Splunk) |
| Certifications | 8 | Department-relevant qualifications (e.g. CEH, BOE, CA, NEBOSH) |
| Experience | 16 | Years detected vs. the minimum required |
| Education | 14 | Highest degree + bonus if the field matches the department |
| Achievements / Impact | 8 | Action verbs + quantified results (%, MT, ₹, MW…) |
| Contact Info | 6 | Email / phone / LinkedIn completeness |
| Structure | 6 | Section coverage and ideal resume length |

Results include an animated score ring, a verdict (Excellent / Strong / Average / Below
Threshold), a full breakdown, **AI Insights** (plain-language strengths and gaps), matched vs.
missing skill chips, and a **keyword-highlighted view** of the resume text.

## Features

- **Resume Scanner** — upload `PDF`/`TXT` or paste text; PDF text extracted in-browser via pdf.js.
- **Department selector** with a live hint describing what each profile looks for.
- **Keyword highlighting** — see exactly which terms matched inside the resume.
- **Candidate Pool** — auto-ranked table, filter by department/score/status, search,
  ⭐ shortlist for interview, 🗑️ remove, and **export to CSV**.
- **Dark, high-contrast UI** — black background, sky-blue Aarti branding, no low-visibility text.
- **Local persistence** — candidates saved in your browser (`localStorage`).

## Project structure

```
.
├── index.html        # Home, Scanner, Pool, About
├── css/styles.css    # dark theme + sky-blue branding
├── js/app.js         # 14 dept profiles + 8-dimension scoring engine
├── .nojekyll         # lets GitHub Pages serve the css/ and js/ folders
└── README.md
```

## Run locally

For PDF parsing to work, serve over a local web server (not `file://`):

```bash
python -m http.server 8080
# open http://localhost:8080
```

---

## How to host it on GitHub Pages (free)

### Option A — GitHub website (easiest)

1. **Create a repo** at <https://github.com/new> — e.g. `aarti-talentforge`, set **Public**, Create.
2. **Upload files** — click *uploading an existing file*, drag in `index.html`, the `css` and
   `js` folders, and `.nojekyll` (keep the folder structure). Commit.
3. **Enable Pages** — Settings → Pages → Source: **Deploy from a branch** → Branch **main**,
   folder **/ (root)** → Save.
4. **Open** `https://<your-username>.github.io/aarti-talentforge/` after ~1 minute.

### Option B — Git on your computer

From inside `D:\Aarti` (replace `<your-username>`):

```bash
git init
git add .
git commit -m "Aarti TalentForge — AI Resume Intelligence"
git branch -M main
git remote add origin https://github.com/<your-username>/aarti-talentforge.git
git push -u origin main
```

Then do **step 3 (Enable Pages)** above.

> Tip: name the repo exactly `<your-username>.github.io` to host at the root URL with no sub-path.

---

## Notes & limitations

- Scoring is **heuristic** — a decision-support aid, not a replacement for human review.
- **Scanned/image-only PDFs** have no selectable text and can't be parsed — use the paste option.
- Candidate data is stored only in the browser that scanned it (not shared across devices/users).
  Shared multi-user storage would need a backend, which is outside free static hosting.

[pdf.js]: https://mozilla.github.io/pdf.js/

---

## New in v3 — advanced HR features

All of these run **100% client-side** (no backend, still free on GitHub Pages):

- **Job-Description mode** — in the Scanner, paste a real JD. The score then blends the
  department profile (50%) with that exact role's extracted keywords (50%), so scoring is
  role-specific, not just department-specific.
- **Bulk scanning** — the **Bulk Scan** tab accepts many resumes at once (up to ~30), parses and
  scores each locally, ranks them, flags likely **duplicates by email**, and adds the batch to the
  pool in one click.
- **Smarter parsing** — auto-extracts candidate **name**, **email**, **phone** and **years of
  experience** from the resume, and flags duplicate applicants by email on save and in bulk.
- **Blind screening** — a header toggle that hides identity cues (name, email, phone) across the
  Pool, Bulk results, comparison and scorecard to reduce bias. Scoring itself is already
  identity-blind; this hides the cues from the reviewer's eyes.
- **Side-by-side comparison** — tick 2–3 candidates in the Pool and click **Compare** to see
  scores, experience, education, stage, matched skills and gaps in one modal.
- **Hiring analytics** — the **Analytics** tab shows KPIs, a hiring **funnel**, **department
  demand**, **source effectiveness** (avg score per source) and **time-to-hire** (avg days from
  applied to Selected, tracked as you move candidates through stages).
- **PDF scorecard** — the Scanner's **PDF Scorecard** button opens a clean printable candidate
  report; use your browser's "Save as PDF" to export and share with hiring managers.

## Integrations

- **Google Sheets / Excel / HRMS** — the CSV export (Pool and Analytics) imports directly into
  Sheets, Excel and most HRMS/SAP upload templates.
- **Job-post generator** — in Analytics, "Generate Job Post" builds ready-to-paste hiring text
  (for the most in-demand department) and opens LinkedIn so you can paste it.
- Direct API posting to Naukri/LinkedIn requires their developer accounts plus a backend, so the
  app provides the paste-ready text rather than auto-posting.

## Shared storage (optional, needs your backend)

By default each browser keeps its own data (`localStorage`). To let the whole HR team share one
candidate pool, an optional Supabase scaffold is included at `js/cloud.js`:

1. Create a free project at <https://supabase.com> and a `candidates` table.
2. Enable Row Level Security and add policies for your team/auth.
3. Put your project URL and anon key in `js/cloud.js`.
4. Add these scripts to `index.html` **before** `js/app.js`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="js/cloud.js"></script>
   ```
5. Wire `Cloud.load()` / `Cloud.upsert()` / `Cloud.remove()` into the app's save/load points.

This is intentionally left disabled so the static build keeps working offline with zero setup.
