# Read This First — Offline Navigation

**Reviewed edition:** If GitHub Milestones, PR review or CI/CD are new to you, start with `10_GITHUB_HANDS_ON_LAB.md` rather than trying to absorb the entire general GitHub/DevOps chapter in one sitting. For visual design begin `12_UI_IMPLEMENTATION_SPEC.md`; for testing begin `11_TESTING_HANDS_ON_LAB.md`. `14_AUDIT_AND_VERIFICATION.md` tells you exactly what has and has not been executed.

The bundle works as your **offline engineering mentor and handoff**. It cannot replace hands-on implementation, but it is written to prevent you from having to re-explain the project.

## Reading order
1. `00_SOURCE_OF_TRUTH.md` — what is being built, what is excluded, what counts as done.
2. `01_FIRST_PRINCIPLES.md` — why servers, authentication, data constraints and tests exist.
3. `02_BUILD_GUIDE.md` — chronological install/build commands and their purpose.
4. `03_GITHUB_DEVOPS.md` — GitHub clicks, issues, milestones, PRs, CI/CD and releases.
5. `04_TESTING_PLAYBOOK.md` — unit/integration/E2E, boundary/security test cases.
6. `05_UI_ENGINEERING.md` — how to get a premium UI with free legal components.
7. `06_RUNBOOK_TROUBLESHOOTING.md` — failure diagnosis, migrations, deployment problems.
8. `07_PROGRESS_TRACKER.md` — update after each work session.
9. `08_RISK_DECISIONS.md` — why we made decisions, what needs reevaluation.
10. `starter/README.md` — exact starter overlay and first end-to-end practice path.

## A first 90-minute session (adapt freely)
- Read source of truth (10 min). Open GitHub and create a private repository (10 min).
- Install/verify Node and create-next-app, run empty app (15 min).
- Create Milestone M0 and its first issue from templates (15 min).
- Put docs into repository; inspect `.gitignore` and make first focused PR (20 min).
- Explain in your own words: why Next.js contains backend code, why client requests cannot be trusted, how CI checks your change (20 min).

## Golden rule
If blocked: capture **command, expected result, actual output, versions, relevant file** (redact secrets) and use `06_RUNBOOK_TROUBLESHOOTING.md`. Return to AI with this precise context instead of “it doesn't work.”

## Completion criteria for this bundle
This bundle gives a **well-defined plan, playbooks, templates and scaffold**. It is not a compiled/deployed application, a real GitHub issue board, a functioning Neon database, or a substitute for running tests with your own credentials. Its job is to equip you to build these deliberately.


## Detailed offline curriculum after your first session

1. GitHub milestone, Issue and first PR → `10_GITHUB_HANDS_ON_LAB.md`.
2. Backend reasoning (no copy/paste) → `15_BACKEND_MASTERCLASS.md`.
3. Guided commands and schema/auth integration → `02_BUILD_GUIDE.md`.
4. Exact free component strategy → `12_UI_IMPLEMENTATION_SPEC.md`.
5. Build features one by one → `13_FEATURE_IMPLEMENTATION_RECIPES.md`.
6. Write unit, integration and browser tests → `11_TESTING_HANDS_ON_LAB.md`.
7. Before claiming successful deployment → `14_AUDIT_AND_VERIFICATION.md`.

**If you have no internet:** read the PDF/Markdown offline, plan Issues in local notes, and run existing local code/tests if dependencies are cached. Installing npm packages, pulling from GitHub, applying Neon migrations, or deploying to Vercel normally requires a network connection.
