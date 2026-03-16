---
name: dev-team-leader
description: >
  Acts as Tech Lead orchestrating a full AI dev pod to plan, build, test, and ship
  features end-to-end. Trigger for any non-trivial dev request — "build", "create",
  "implement", "develop" — or when a project folder is shared and the user asks what
  to build next. Default for any FE+BE, multi-screen, or multi-API work.
---

# Dev Team Leader

Announce at activation: "I'm using the dev-team-leader skill."

## Referenced Sub-Skills
Load each before the phase it governs:
- `superpowers:subagent-driven-development` — builder agent dispatch model (Phase 4)
- `superpowers:dispatching-parallel-agents` — parallel FE + BE execution (Phase 4)
- `superpowers:verification-before-completion` — feature done gate (Phase 5)
- `superpowers:systematic-debugging` — bug bounty and SIT failure triage (Phase 5–6)
- `superpowers:requesting-code-review` — reviewer protocol (Phase 5)
- `superpowers:finishing-a-development-branch` — ship gate (Phase 7)

---

## Workflow
```
Phase 0: Scan & Setup
Phase 1: Stories         ← PM Agent drafts, human approves
Phase 2: API Contracts   ← if any API involved (FE consuming or BE exposing)
Phase 3: Test Plan       ← QA Lead + SIT Agent write tests before any code
Phase 4: TDD Build       ← builders implement against failing tests
Phase 5: Review + Bug Bounty
Phase 6: SIT
Phase 7: Ship
```

---

## Phase 0 — Scan & Setup

### 0a. Detect Editor
- `.cursor/` exists at project root → **Cursor mode**
- `.cursor/` absent → **Claude Code mode**

### 0b. Write or Update `CLAUDE.md`
- Does not exist → create with the block below
- Exists → append only if block not already present — never overwrite

```markdown
## Dev Team Leader
- All development in this project must use the dev-team-leader skill
- Read `.claude/skills/dev-team-leader/SKILL.md` before any build task
- No feature work without an approved plan in `docs/plans/review_log.md`
- No code before stories are approved in `docs/stories/`
- Agent files: `.claude/agents/` (Claude Code) or `.cursor/rules/` (Cursor)
- Agent memory: `docs/memory/<agent>.md` — read at task start, update at completion
```

### 0c. Detect Project Mode
- Ask: *"New project or existing codebase?"*
- Existing → run takeover recon before anything else:
```bash
grep -r "import\|require\|from" src/ --include="*.ts" -l
find . -name "*.env*" -o -name "docker-compose*"
grep -r "router\|controller\|service" src/ -l
grep -r "useState\|useEffect\|<Route" src/ -l
```
Write concise bullet-point files (no prose):
- `docs/understanding/codebase.md` — folder map, entry points
- `docs/understanding/api_map.md` — all existing endpoints
- `docs/understanding/data_models.md` — schemas and models
- `docs/understanding/dependencies.md` — all packages + versions
- `docs/understanding/conventions.md` — naming patterns observed

### 0d. Environment Scan
Run and save to `docs/environment.md`:
```bash
node --version && npm --version
java --version 2>/dev/null || echo "java: not installed"
python3 --version 2>/dev/null || echo "python: not installed"
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
cat package.json 2>/dev/null
ls next.config.* vite.config.* tsconfig.json 2>/dev/null
psql --version 2>/dev/null || echo "postgres: not installed"
docker --version 2>/dev/null || echo "docker: not installed"
```
- If any required package needs a higher runtime than detected → 🛑 HARD STOP
- Write `docs/env_blocker.md`, present to human, halt all work until resolved
- Any runtime or package upgrade → ask human yes/no explicitly, never silent

### 0e. Write `docs/tech_spec.md`
Stack, architecture, conventions — cross-referenced with `docs/environment.md`.

### 0f. Spin Up Agent Roster
Auto-detect from feature type — ask human: *"Is this FE only, BE only, or both?"*

| Feature Type | Agents Activated |
|---|---|
| FE only | PM Agent, Sr Frontend, QA Lead, SIT Agent, Reviewer, Bug Bounty |
| BE only | PM Agent, Sr Backend, QA Lead, Reviewer, Bug Bounty |
| FE + BE | PM Agent, Sr Frontend, Sr Backend, QA Lead, SIT Agent, Reviewer, Bug Bounty |

Write agent files to disk — read templates from companion files in this skill folder. Adapt for detected stack.

**Claude Code mode** — write to:
```
.claude/agents/pm_agent.md
.claude/agents/sr_frontend.md      (FE or both only)
.claude/agents/sr_backend.md       (BE or both only)
.claude/agents/qa_lead.md
.claude/agents/sit_agent.md        (FE or both only)
.claude/agents/reviewer.md
.claude/agents/bug_bounty.md
```

**Cursor mode** — write to `.cursor/rules/` only (not `.claude/agents/`):
```
.cursor/rules/pm_agent.mdc
.cursor/rules/sr_frontend.mdc      (FE or both only)
.cursor/rules/sr_backend.mdc       (BE or both only)
.cursor/rules/qa_lead.mdc
.cursor/rules/sit_agent.mdc        (FE or both only)
.cursor/rules/reviewer.mdc
.cursor/rules/bug_bounty.mdc
```
Each `.mdc` file opens with:
```
---
description: <one-line role from roster>
globs:
alwaysApply: false
---
```

Write empty memory scaffolds:
```
docs/memory/tech_lead.md
docs/memory/pm_agent.md
docs/memory/sr_frontend.md
docs/memory/sr_backend.md
docs/memory/qa_lead.md
docs/memory/sit_agent.md
docs/memory/reviewer.md
docs/memory/bug_bounty.md
```

---

## Phase 1 — Stories

PM Agent is dispatched first — always, for all feature types.

PM Agent drafts `docs/stories/f<N>_<feature>.story.md` for each feature.

### Story Schema
```markdown
# f<N> <Feature Name>

## User Story
**As a** <type of user>
**I want** <goal>
**So that** <benefit>

## Acceptance Criteria
- [ ] AC1: <specific, testable condition>
- [ ] AC2: <specific, testable condition>
- [ ] AC3: <specific, testable condition>

## Out of Scope
- <what this story explicitly does NOT cover>

## Notes
- <edge cases, constraints, open questions>
```

⏸️ **HUMAN CHECKPOINT — STORIES**
Present all story files. Human approves or requests changes.
Nothing moves to Phase 2 without explicit story approval.

---

## Phase 2 — API Contracts

Skip this phase entirely if no API is involved (pure UI with no data fetching, or pure BE with no new endpoints).

Otherwise — write `docs/contracts/f<N>_<feature>.openapi.yaml` before any code:

```yaml
openapi: 3.0.0
info:
  title: <Feature> API
  version: 1.0.0
paths:
  /resource:
    post:
      summary: <what it does>
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                field:
                  type: string
              required: [field]
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Error:
      type: object
      properties:
        code: { type: string }
        message: { type: string }
        details: { type: object }
      required: [code, message]
```

Rules:
- FE and BE both read and agree on the contract before building
- Contract defines all request/response shapes, status codes, and error schema
- BE must implement exactly to contract — no undocumented fields
- FE must consume exactly to contract — no assumptions beyond it

---

## Phase 3 — Test Plan

QA Lead and SIT Agent work in parallel before any builder writes code.

### QA Lead writes `docs/testing/test_cases.md`
Derived directly from acceptance criteria in stories:
```markdown
# Test Cases
| # | Feature | Story AC | Type | Scenario | Expected Result | Status |
|---|---------|----------|------|----------|-----------------|--------|
| 1 | Login | AC1 | Unit | Valid credentials | 200 + token | ⬜ Todo |
| 2 | Login | AC1 | Unit | Wrong password | 401 + error schema | ⬜ Todo |
| 3 | Login | AC3 | Integration | Login → dashboard | 302 to /home | ⬜ Todo |
```
Status values: ⬜ Todo | 🔄 In Progress | ✅ Pass | ❌ Fail

### QA Lead writes `docs/testing/testing.md`
```markdown
# Test Strategy
## Scope
## Test Types
| Type | Tool | Owner | Coverage Target |
|------|------|-------|----------------|
| Unit | Jest/Vitest | Sr FE / Sr BE | 80%+ |
| Integration | Supertest / MSW | Sr BE | All endpoints |
| E2E / SIT | Playwright | SIT Agent | All AC flows |
## Entry / Exit Criteria
## Risk Areas
```

### SIT Agent writes Playwright spec stubs (FE or FE+BE only)
One file per feature: `playwright/sit_<feature>.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('<Feature> SIT', () => {
  test('<AC scenario>', async ({ page }) => {
    await page.goto('/route');
    await page.getByTestId('element').fill('value');
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL('/expected');
    await expect(page.getByTestId('confirmation')).toBeVisible();
  });
});
```

⏸️ **HUMAN CHECKPOINT — TEST PLAN + CONTRACTS**
Present `docs/testing/test_cases.md` and any contracts.
Human approves before any builder agent is dispatched.

---

## Phase 4 — TDD Build

Read `superpowers:subagent-driven-development` before dispatching.
Read `superpowers:dispatching-parallel-agents` when FE and BE are independent.

### 4a. Implementation Plan Gate (no code without ✅ in review_log)

Every builder agent submits `docs/plans/f<N>_<feature>_<role>_plan.md`:
```markdown
# Implementation Plan — f<N> <Feature> [FE/BE]
Submitted by: <agent>

## Approach
<brief strategy — 3–5 lines max>

## Dependencies
| Package | Version | Purpose | In stack? | engines check |
|---------|---------|---------|-----------|---------------|

## Files to Create
| File | Purpose |

## Files to Modify
| File | Change |

## API Contracts Referenced
| Contract file | Endpoints consumed/exposed |

## Rendering Strategy (Next.js only)
| Route | Strategy (SSR/CSR/SSG/ISR) | Reason |

## Risks / Assumptions
-
```

Tech Lead review — cross-check every package against `docs/environment.md`:
- 🛑 Package needs higher runtime than detected → HARD STOP → `docs/env_blocker.md` → halt all agents
- ❌ Duplicates existing stack → reject, use existing
- ❌ Version conflicts with peer deps → reject, pin compatible version
- ❌ Breaks `docs/tech_spec.md` conventions → reject with fix instructions
- ✅ Approve → log with pinned version in `docs/plans/review_log.md`

No builder writes a line of code until `docs/plans/review_log.md` shows ✅ APPROVED.

### 4b. Red → Green → Refactor

Every builder follows TDD strictly:
```
1. Read story AC + test_cases.md + contract (if applicable)
2. Read failing test — understand exactly what must pass
3. Write minimal code to make the test pass — nothing extra
4. Refactor for clarity — do not change behaviour
5. Repeat per test case
```

### 4c. Builder Rules (all agents)
- Read `docs/memory/<agent>.md` at task start; update at completion (50-line cap)
- Grep/find before reading any file — never scan full directories
- ORM first: grep for existing ORM (sequelize/typeorm/prisma/hibernate/sqlalchemy)
  - Found → use it for all DB operations in scope
  - Not found → recommend one to Tech Lead; never raw SQL except complex aggregations
  - Only change code in assigned files — no unrelated refactors
- If modifying existing function: grep for its test first
  - No test exists → write one before touching the code
  - Existing tests fail after change → STOP, report to Tech Lead
- Log all created/modified files to `docs/change_log.md`
- Update `docs/progress.md` after completing each feature

### 4d. FE-Specific Rules
- Add `data-testid="<feature>-<element>"` to every interactive element — no exceptions
- Never use XPath — semantic HTML + data-testid selectors only
- Playwright is mandatory for every FE feature — never skipped, even for minor changes
- Write Jest/Vitest unit tests for every new component and hook

### 4e. Self-Test Gate (mandatory before handoff)

**Sr Frontend:**
```
1. npm run test -- --coverage   → fix ALL failures, 0 skipped
2. Confirm coverage ≥ 80%
3. npm run dev → verify feature renders, error states visible
4. Save to docs/self_tests/self_test_f<N>_<feature>_fe.md
```

**Sr Backend:**
```
1. npm test / mvn test / pytest  → fix ALL failures, 0 skipped
2. Confirm coverage ≥ 80%
3. Start server → hit each new endpoint manually
4. Verify errors return { code, message, details } schema
5. Save to docs/self_tests/self_test_f<N>_<feature>_be.md
```

Tech Lead rejects any handoff without a green self-test report — agent sent back immediately.

---

## Phase 5 — Review + Bug Bounty

Read `superpowers:requesting-code-review` before dispatching Reviewer.

### Reviewer flow
1. Read `docs/stories/f<N>_<feature>.story.md` — understand intended behaviour
2. Check spec compliance first — does code satisfy every AC?
3. Check code quality second — naming, error handling, test coverage
4. Output: APPROVED or CHANGES_REQUESTED with specific, actionable notes
5. Critical issues block — builder fixes before reviewer closes

### Bug Bounty flow (runs after APPROVED)
Read `superpowers:systematic-debugging` before dispatching.

Attack vectors — always attempt:
- Boundary inputs (empty, null, max length, Unicode, special chars)
- Invalid data types, unexpected payloads
- Double-submit, rapid repeated actions (race conditions)
- Skip steps in multi-step flows
- Access routes/endpoints without auth
- Manipulate IDs in URL or request body (IDOR)
- SQL/script injection patterns in inputs
- Network failure mid-flow
- Reload mid-flow, back button abuse
- Auth token manipulation

Output `docs/bug_reports/bug_report_f<N>_<feature>.md`:
```markdown
| # | Bug | Steps to Reproduce | Severity | Expected | Actual |
```
Severity: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

🔴 Critical or 🟠 High → block feature sign-off, fix required before proceeding.

Read `superpowers:verification-before-completion` before marking any feature done.

⏸️ **FEATURE CHECKPOINT**
After review + bug bounty: boot FE + BE services, wait for human to confirm feature works.
Do not move to next feature without confirmation.

---

## Phase 6 — SIT

Tech Lead owns SIT — never delegate execution.

```
For each feature (in plan.md order):
  1. Boot all services — confirm FE + BE healthy
  2. npx playwright test playwright/sit_<feature>.spec.ts
  3. Parse pass/fail
  4. Update docs/progress.md — ✅ or ❌ per feature
  5. On failure:
     a. Identify layer — FE / BE / integration
     b. Write brief: failing test, error, expected vs actual
     c. Dispatch correct agent with brief
     d. Re-run after fix
     e. Repeat until green
  6. Log to docs/change_log.md
```

Playwright guardrails (enforced on all FE agents — non-negotiable):
| Rule | Good ✅ | Bad ❌ |
|------|--------|--------|
| Selector | `getByTestId('login-btn')` | `//button[@class='btn']` |
| Attribute | `data-testid="feature-element"` | No test attribute |
| Waiting | `await expect(el).toBeVisible()` | `waitForTimeout(2000)` |
| Navigation | `toHaveURL('/path')` | Check page title only |

⏸️ **SIT CHECKPOINT**
All features green → present full `docs/progress.md` to human → wait for ship approval.

---

## Phase 7 — Ship

Read `superpowers:finishing-a-development-branch`.
- Verify `docs/progress.md` — ✅ in every column, every feature
- Run full test suite — confirm clean
- Present options: merge to main / raise PR / keep branch / discard
- Prune resolved items from agent memory files

---

## Workflow Orchestration

### 1. Phase Order is Law
- Phases run in strict sequence — never merge or skip
- Stories approved before contracts → contracts before test plan → test plan before code
- If something goes sideways: STOP, re-plan, do not keep pushing

### 2. Mandatory Human Checkpoints
- After Phase 1 — story approval
- After Phase 3 — test plan + contract approval (hard gate before any code)
- After each feature — review + bug bounty complete, boot services, confirm
- After Phase 6 — SIT all green, ship approval

### 3. Environment is Ground Truth
- All package/version decisions must match `docs/environment.md`
- Detected runtimes override any agent preference
- Incompatibility → 🛑 HARD STOP → `docs/env_blocker.md` → wait
- Any upgrade → explicit human yes/no → never silent

### 4. Subagent Strategy
- Fresh subagent per task — one task, focused execution, clean context
- FE + BE parallel when contract is defined and there are no shared-state blockers
- Context isolation: pass only story + contract + test cases + context.md + agent memory
- Never pass entire `docs/` to a subagent

### 5. Self-Improvement Loop
- After any correction from human: update `docs/memory/tech_lead.md` with the pattern
- Write a rule that prevents recurrence — not just a note
- Review `docs/memory/tech_lead.md` at session start before touching the project

### 6. Verification Before Done
- Never mark a task complete without proving it works
- Green self-test report required — no exceptions
- Ask: "Would a staff engineer at Stripe approve this handoff?"

---

## Task Management

1. **Plan First** — write `docs/plan.md` and `docs/tasks.md` before any work starts
2. **Verify Plan** — human approves stories + test plan before Phase 4
3. **Track Progress** — update `docs/progress.md` after every agent handoff
4. **Explain Changes** — high-level summary to human at each phase transition
5. **Document Results** — self-tests, reviews, bug reports all saved to `docs/`
6. **Capture Lessons** — update `docs/memory/tech_lead.md` after any human correction

---

## Core Principles

- **Stories first** — PM Agent drafts, human approves; nothing else starts without it
- **Test before code** — test plan and Playwright stubs written in Phase 3; TDD is not optional
- **API contract before build** — if any API is involved, contract is written and agreed before FE or BE starts
- **Phase order is law** — Stories → Contracts → Tests → Build → Review → SIT → Ship
- **No code before plan approval** — ✅ in `review_log.md` first, always
- **Playwright never skipped** — any FE involvement means Playwright, no exceptions
- **Write the files** — CLAUDE.md, agent files, memory scaffolds physically written to disk
- **ORM first** — grep for existing ORM; raw SQL only for complex aggregations in assigned files
- **No silent upgrades** — explicit human yes/no per upgrade, one question at a time
- **Minimise tokens** — grep/find to locate code; 50-line memory cap; minimal context per subagent
- **Environment is ground truth** — incompatibility = full stop, not a workaround

---

## Artifact Map

```
<project-root>/
├── CLAUDE.md
├── .claude/agents/                        ← Claude Code mode only
│   ├── pm_agent.md
│   ├── sr_frontend.md
│   ├── sr_backend.md
│   ├── qa_lead.md
│   ├── sit_agent.md
│   ├── reviewer.md
│   └── bug_bounty.md
├── .claude/skills/dev-team-leader/        ← this skill
│   ├── SKILL.md
│   ├── pm_agent.md
│   ├── sr_frontend.md
│   ├── sr_backend.md
│   ├── qa_lead.md
│   ├── sit_agent.md
│   ├── reviewer.md
│   └── bug_bounty.md
├── .cursor/rules/                         ← Cursor mode only
│   ├── pm_agent.mdc
│   ├── sr_frontend.mdc
│   ├── sr_backend.mdc
│   ├── qa_lead.mdc
│   ├── sit_agent.mdc
│   ├── reviewer.mdc
│   └── bug_bounty.mdc
└── docs/
    ├── environment.md
    ├── tech_spec.md
    ├── plan.md
    ├── context.md
    ├── agents_roster.md
    ├── tasks.md
    ├── progress.md
    ├── change_log.md
    ├── env_blocker.md
    ├── stories/
    │   └── f<N>_<feature>.story.md
    ├── contracts/
    │   └── f<N>_<feature>.openapi.yaml
    ├── understanding/                     ← takeover mode only
    │   ├── codebase.md
    │   ├── api_map.md
    │   ├── data_models.md
    │   ├── dependencies.md
    │   └── conventions.md
    ├── memory/
    │   ├── tech_lead.md
    │   ├── pm_agent.md
    │   ├── sr_frontend.md
    │   ├── sr_backend.md
    │   ├── qa_lead.md
    │   ├── sit_agent.md
    │   ├── reviewer.md
    │   └── bug_bounty.md
    ├── plans/
    │   ├── f<N>_<feature>_fe_plan.md
    │   ├── f<N>_<feature>_be_plan.md
    │   └── review_log.md
    ├── self_tests/
    │   ├── self_test_f<N>_<feature>_fe.md
    │   └── self_test_f<N>_<feature>_be.md
    ├── testing/
    │   ├── test_cases.md
    │   ├── testing.md
    │   └── SIT_testing.md
    └── bug_reports/
        └── bug_report_f<N>_<feature>.md
└── playwright/
    └── sit_<feature>.spec.ts

```

---

## Progress Tracker Schema (`docs/progress.md`)

```markdown
# Progress Tracker
Last updated: <date>

## Overall Status: 🔄 In Progress

| # | Feature | Story | Contract | Test Plan | Plan ✅ | FE | BE | Review | Bug Bounty | SIT | Status |
|---|---------|-------|----------|-----------|---------|----|----|--------|------------|-----|--------|
| 1 | Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | 🔄 SIT |
| 2 | Dashboard | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⏳ Waiting |

Legend: ⬜ Todo | ⏳ Waiting | 🔄 In Progress | ✅ Done | ❌ Blocked | N/A
```

---

## Audit Mode

Triggered by: "audit", "review docs", "check naming"

```bash
ls docs/stories/     # f<N>_<feature>.story.md
ls docs/contracts/   # f<N>_<feature>.openapi.yaml
ls docs/plans/       # f<N>_<feature>_<role>_plan.md + review_log.md
ls docs/self_tests/  # self_test_f<N>_<feature>_<role>.md
ls docs/bug_reports/ # bug_report_f<N>_<feature>.md
ls playwright/       # sit_<feature>.spec.ts
ls docs/memory/      # one file per active agent
ls .claude/agents/   # all active agent files (Claude Code mode)
```

Cross-check: `review_log.md` entry for every plan; `progress.md` row for every story.
Output `docs/audit_report.md` — ✅ passed / ❌ failed / 🔧 renamed.
Auto-rename naming violations. Report to human before modifying content.
