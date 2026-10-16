# GitHub Hands-On Lab — From First Repository to Your First Release

**Audience:** You know `git add`, `commit`, `push`, `pull`, and branches, but have never used professional GitHub planning or CI/CD. **Do this lab yourself, in sequence.** All commands assume Windows PowerShell in VS Code. UI names can move; use the linked official docs if the menu differs.

## Mental model first

- **Git:** records changes locally. GitHub is a remote hosting/collaboration platform; they are not the same thing.
- **Repository:** the project's history and code.
- **Issue:** a problem/task with a testable outcome. **Milestone:** a target that groups Issues/PRs. **Project:** the board tracking all work/statuses. These are three different objects.
- **Branch:** a separate line of commits; **Pull Request:** a proposal to merge them, with review discussion and automated status checks.
- **CI:** automatically validates proposed code. **CD:** moves accepted changes toward a release (delivery) or deploys automatically (deployment).
- **Release:** a tested snapshot, usually identified with a version/tag. **Environment:** a specific deployment plus its own configuration/data.

## Lab 0 — Verify your environment; don't publish secrets

1. On your PC install Node.js and Git. Open Windows PowerShell inside VS Code.
2. Run `node -v`, `npm -v`, `git --version`; record output in `docs/07_PROGRESS_TRACKER.md`. Follow supported version requirements from `02_BUILD_GUIDE.md`.
3. Enable 2FA for GitHub. Configure your local Git identity and test `git config --global --list`.
4. Create a GitHub account/repository manually; GitHub credentials are handled through browser or Git Credential Manager, never embedded in command lines.
5. Make sure `.env` and `.env.local` are ignored. `git check-ignore .env` should identify an ignored file if it exists; `.env.example` (placeholder values only) may be tracked. Run `git status` before any push.

## Lab 1 — Create project and link local code (M0)

1. In PowerShell execute the documented `create-next-app` command from `02_BUILD_GUIDE.md`; choose TypeScript, App Router, Tailwind, ESLint, `src/` directory and npm. Enter the project directory.
2. Run `npm run dev`, open `http://localhost:3000`, stop with Ctrl+C.
3. Run `git status` and `git log -1 --oneline`. `create-next-app` may have already initialized the repo and made a commit; don't duplicate.
4. On GitHub select **+** (top right) → **New repository**, name `controldesk`, select **Private** (you can share it publicly later after security review), do **not** initialize remote README/LICENSE if they already exist locally, click **Create repository**.
5. Copy the HTTPS remote URL that GitHub shows. In local project run:

```powershell
git branch -M main
git remote -v
# Only if there is no origin yet:
git remote add origin https://github.com/YOUR_USERNAME/controldesk.git
# If origin exists and is wrong, inspect it before modifying it.
git status
# Commit only if git status says there are tracked/untracked changes you intend to publish:
git add .
git diff --cached --stat
git diff --cached
git commit -m "chore: initialize ControlDesk"  # skip if nothing to commit
git push -u origin main
```

6. Refresh GitHub repository page: confirm `main` contains your code, no `.env` or tokens were published, and the latest commit matches locally.
7. **Stop and verify:** the local `git remote -v` URL is the correct repository, and `git status` says clean.

## Lab 2 — Create your first GitHub Milestone

1. Open **GitHub → your repository → Issues**. If missing and you have admin rights, **Settings → General → Features → Issues**.
2. Near the Issues search field choose **Milestones** → **New milestone**.
3. Title: `M0 — Spec & Repo`.
4. Description: `Requirements approved, repo created, decision log committed, and first issue → branch → pull request → CI → merge workflow demonstrated.`
5. Due date: leave blank until you have a realistic schedule. Click **Create milestone**.
6. Return to Milestones; verify it is listed with **0%** or no closed issues.
7. Later create `M1 — UI Shell` through `M7 — Production Hardening` using `03_GITHUB_DEVOPS.md` milestone table. You don't need to make all the Issues today.

**Remember:** A milestone is not a folder in the repository; GitHub computes its progress from linked open/closed Issues/PRs. Official guide: https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/creating-and-editing-milestones-for-issues-and-pull-requests

## Lab 3 — Create your first issue

1. GitHub repository → **Issues → New issue**.
2. Title: `docs: add a reproducible development workflow`.
3. Paste the acceptance criteria from `templates/FIRST_ISSUE_EXAMPLE.md`, replacing the placeholder PR number later.
4. Right sidebar: choose **Milestone → M0 — Spec & Repo**. Optionally add label `documentation` (create under **Issues → Labels → New label** if needed).
5. Click **Submit new issue**. Note the **real issue number** from GitHub (for example, `#1`). Planning ID `P-03` in CSV is **not** the real issue number.
6. Check Milestone view; issue should appear there as open. Keep its URL in your development journal.

## Lab 4 — Create a GitHub Project board (different from a milestone)

1. Click your profile picture → **Your profile → Projects** → **New project** → choose **Board**.
2. Title: `ControlDesk Development`. If offered, enable **Import items from a repository**, select `controldesk`; otherwise open your project and add your first Issue using **Add item** and its URL or search.
3. Configure workflow statuses: **Todo**, **In Progress**, **In Review**, **Done**. The exact UI for renaming/editing statuses may vary.
4. Place the documentation Issue in **Todo** and then **In Progress** when beginning work.
5. Optional later: add views filtered by milestone/assignee/priority. **Do not duplicate issues as draft cards** if the real issue already exists.
6. Evidence: screenshot the board showing the first real linked issue.

Official GitHub Projects walkthrough: https://docs.github.com/en/get-started/start-your-journey/planning-your-work

## Lab 5 — Branch and make one tiny change

```powershell
git switch main
git pull --ff-only origin main
git switch -c docs/first-pr-workflow
# Open README.md in VS Code, add one line linking the docs folder, save.
git status
git diff
git add README.md
git diff --cached
git commit -m "docs: link the engineering playbook"
git push -u origin docs/first-pr-workflow
```

**Why these commands?** `pull --ff-only` avoids silently creating a merge commit; `switch -c` isolates work; `diff` shows exactly what you propose; `add` stages; `commit` records; `push -u` publishes and tracks your branch.

**Mistake drills:** Run `git status` on the wrong branch, see branch name, switch back. If you accidentally stage an unrelated file, run `git restore --staged path/to/file` before committing. Never copy/paste `git reset --hard`, `push --force`, or history rewrite commands unless you understand what will be lost.

## Lab 6 — Create and self-review a Pull Request

1. GitHub → repository → **Pull requests → New pull request**. Base should be **main**, compare should be **docs/first-pr-workflow**.
2. Title: `docs: document engineering workflow`.
3. In description explain **What changed**, **Why**, **How tested**, **Risk**, **Screenshots (if UI)**, and put `Closes #<your real issue number>`; never leave placeholder unchanged.
4. Click **Create pull request**. GitHub may also display a **Compare & pull request** shortcut after your push.
5. Open **Files changed**. Review every added/deleted line as though a teammate wrote it. Are there secrets? Is this scope limited? Does it actually satisfy acceptance criteria?
6. Open **Checks** to see workflow status (only if `.github/workflows/ci.yml` is committed and matching scripts/dependencies work). A workflow does not run until it exists in the PR branch and is permitted to execute.
7. Click **Review changes** to understand its review interface. When working alone, write a checklist comment on your PR. **You cannot count self-approval as an independent code review**; ask a peer for real review later, when possible.
8. If changes are needed, edit locally on the **same branch**, commit, push; the PR updates automatically. Mark it **In Review** on Project board.
9. Merge when checks pass, and choose **Squash and merge** if enabled. The GitHub `Closes #N` keyword should close the linked issue when the PR merges to default branch. Check the issue and milestone status afterwards. Move project item to **Done**.
10. Clean up:

```powershell
git switch main
git pull --ff-only origin main
git branch -d docs/first-pr-workflow
git fetch --prune
```

You now have proof of a real end-to-end workflow, not just a push.

## Lab 7 — Add CI and deliberately watch a failing run

1. Confirm scripts exist locally: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`. If tests are not configured, **set them up before turning on the full workflow**. Don't commit a workflow that depends on scripts you have not defined.
2. Copy `starter/.github/workflows/ci.yml` into your real repository under `.github/workflows/ci.yml`. Keep the file path and YAML indentation exact.
3. Commit through `chore/add-ci` branch, open a PR, navigate to **Actions** tab and to PR **Checks**. First run may show **approval required** in some contexts.
4. The workflow's steps are: checkout source → set Node version → `npm ci` → `prisma generate` → ESLint → TypeScript → Vitest → `next build`. These verify *different* classes of failure.
5. To practice diagnostics, create another temporary feature branch and deliberately add a failing **unit assertion** to an existing test; open a draft PR, observe red `test` step, open logs, locate failing assertion. Fix the assertion/implementation, push; verify green. Do this **only in a sandbox branch**, never deliberately break `main`.
6. If GitHub reports missing `package-lock.json`, your `npm ci` cannot work: run `npm install` locally (after checking dependencies) and commit the lockfile. If tests fail because Prisma Client was never generated, verify schema output and the generate step.
7. **E2E is not in this starter CI:** Playwright is intentionally local until you configure isolated test DB, test data, and browser setup. Add it in M7 rather than running E2E against production.

**Never put Neon production credentials into GitHub Actions for untrusted PRs.** Build-only placeholders may be used for builds that don't query DB. Migrations use a separate trusted release procedure. Official Node CI guide: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs

## Lab 8 — Branch protection and the GitHub Free limitation

**Verified 14 October 2026:** GitHub documents enforceable protected branches as available in **public** repos with GitHub Free, but **private** repos generally need Pro/Team/Enterprise for that feature. Your private Free repo can still use branches, Issues, Milestones, Projects, PRs and CI; simply self-enforce discipline. Check your plan rather than assuming a rule exists.

If available: **Repo → Settings → Branches → Add branch protection rule**, or **Settings → Rules → Rulesets**. Target `main`; require pull request, block force pushes and require CI checks **after the CI job has run and names are visible**. Don't require checks that don't exist or every PR will be blocked. In a one-person repository, mandatory approval from another reviewer may prevent merging; use self-review + passing CI until you have collaborators.

Source: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches

## Lab 9 — CI versus deployment and your first tag

- **On PR:** validate changes with CI. The PR's branch is not automatically your production release.
- **On merge to main:** Vercel's Git integration can deploy the main branch; deployments require correct env vars and an already migrated database.
- **Preview:** a PR deployment may be accessible at a different origin; Better Auth URL/session configuration and DB isolation matter. Never let preview deploy against live customer data.
- **Migrations:** `prisma migrate dev` is for local/dev; `prisma migrate deploy` is an intentional, trusted release step. A Vercel frontend rollback does *not* roll back a destructive DB migration.
- **When acceptance tests pass:** create the release in GitHub → **Releases → Draft a new release**; create tag `v0.1.0`, choose `main`, add release notes describing implemented features, known limitations and checks. Or tag locally using the commands in `03_GITHUB_DEVOPS.md`.
- **GitHub Actions is CI, not by itself proof of production security or reliability.** Add logs, backups, incident response and performance checks in later milestones.

## Real-world cycle, every feature

Issue → move to In Progress → branch off updated main → write failing/negative test when suitable → implement smallest slice → format/lint/types/unit tests → manual verification → push → PR with `Closes #N` → self-review + CI → merge → confirm issue/milestone/project progress → deployed smoke check → learnings in journal.

## Completion evidence for this lab

- [ ] A real repository exists and remote URL matches local project.
- [ ] `M0 — Spec & Repo` milestone created.
- [ ] First real Issue belongs to M0 and is on Project board.
- [ ] Branch `docs/first-pr-workflow` was created and pushed.
- [ ] PR links Issue; diff was reviewed; merged successfully.
- [ ] Issue closed automatically or closed after proof; milestone moved forward.
- [ ] GitHub Actions shows a run (and you can explain each step).
- [ ] You know where to read a failing check's logs.
- [ ] The project journal records real URLs and a screenshot of the board.
