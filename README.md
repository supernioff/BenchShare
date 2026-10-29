# BenchShare

**A trusted platform for safely sharing underused laboratory equipment.**
Built for Code Conqueror India 2026, problem statement: *Unlock Underused Equipment and Spaces*.

Team: **aryannarwariya06** (Aryan Narwariya, Priyanshu Kaushal, Deepak Kushwah)

Live product: https://bench-share.vercel.app/

## What it does

An institutional lab lists shared instruments (NMR, cryo-EM, ultracentrifuge, UHPLC and more). Students, researchers and startups find them, check eligibility, request time, and the lab decides. Every step is recorded.

Full lifecycle in the prototype:

1. Owner manages an instrument listing (availability, maintenance blackout, rates)
2. User searches and sees required training badges and which ones are missing
3. User submits a booking request (project or grant code, purpose, supervisor endorsement)
4. System checks badges and weekly quota (off-peak hours count less)
5. Manager approves, rejects, or waitlists, and must write a reason
6. User checks in with a pre-use checklist and photo
7. User returns with a post-use checklist, photo, and condition
8. Faults and damage are reported as incidents; a rule-based assistant drafts a summary
9. Manager resolves or escalates the incident
10. All actions are written to a SHA-256 hash-chained audit trail that can be verified

## Try it (no login needed)

1. Open the live link.
2. Use the **role switcher** in the navigation bar to act as Student, Owner, Manager or Admin.
3. Follow the **Guided Tour** banner for the full journey.

Data is fictional and lives in the browser, so it resets when the page reloads.

## Features

- Search and category filter, badge-based eligibility check
- Weekly quota with peak and off-peak weighting
- Manager review queue with mandatory decision reasons
- Check-in and return station (checklists, photos, return condition)
- Incident reporting with a rule-based assistant (human decides)
- Hash-chained audit trail with chain verification and a tamper simulator
- Owner dashboard (availability, blackout windows, rates)
- Admin dashboard (safety training registry, quota policy, ledger export)

## About the "assistant"

The incident assistant is a **deterministic rule-based engine**. It maps keywords in the report to a draft summary, risk level, and corrective actions. **No external AI model is called in the deployed product.** The manager makes every final decision. The `@google/genai` package is listed in `package.json` but is not used.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide icons. Hosted on Vercel.

## Run locally

```bash
npm install --legacy-peer-deps
npm run dev
```

The `.npmrc` file already sets `legacy-peer-deps=true`.

## Known limitations

- No login; roles are switched in the interface and are not enforced by a server
- No database; state resets on reload
- Notifications are on-screen messages only
- No automatic no-show release, queue promotion, extensions, or overdue workflow yet
- No automatic overlap detection; conflicts are handled through manager review
- The audit chain runs in the browser, so it demonstrates tamper-evidence but is not a server-side guarantee
- No real payments or identity verification

## Future work

Real authentication and database, server-side audit ledger, automatic waitlist and no-show handling, email and SMS reminders, overlap detection, language-model summaries under human review, multi-institution network and integration with national portals such as I-STEM.

## Disclosure

- **Build period:** developed during the official hackathon window (28 Oct 2026, 10:00 AM to 30 Oct 2026, 10:00 AM IST); see the commit history.
- **Templates:** No third-party starter template or pre-existing project was reused. The scaffold and most application code were generated with AI assistance in Google AI Studio (Gemini), then edited, tested, and deployed by the team.
- **AI and tools used:** Google AI Studio and Gemini (code generation), Claude (research support, documentation, code fixes), NotebookLM (research), GitHub (hosting and history), Vercel (deployment).
- **Libraries:** React, Vite, Tailwind CSS, Motion, Lucide (open source, used under their licenses).
- All demo data is fictional.
