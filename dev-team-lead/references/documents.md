# Document Templates & Schemas

## tech_spec.md
| Section | Content |
|---------|---------|
| Stack | Languages, frameworks, DB, cloud |
| Architecture | Monolith / microservices / serverless |
| Conventions | Naming, folder structure, code style |
| APIs | External integrations, auth method |
| Environments | Dev / staging / prod URLs |

---

## plan.md
```
# Project Plan

## Features
| # | Feature Name | Type | Priority | Agent |
|---|-------------|------|----------|-------|
| 1 | Feature A   | FE   | P0       | Sr FE |
| 2 | Feature B   | BE   | P0       | Sr BE |
| 3 | Feature C   | Both | P1       | FE+BE |
```

---

## `<feature>.prompt.md`
Two sections — always separate FE and BE:

```
## Frontend
- Screens involved:
- Components to build:
- State management:
- API endpoints to consume:
- Playwright testid requirements:
- Unit test scenarios:

## Backend
- Endpoints to create:
- Data models / schema changes:
- Business logic:
- Unit test scenarios:
- Error handling:
```

---

## context.md
Living document — updated after every phase.

```
# Shared Context
Last updated: <date> by <agent>

## Stack Summary
## Active Features
## API Contracts
## Decisions Log
| Date | Decision | Rationale |
```

---

## tasks.md
```
# Task Board
| Task | Feature | Agent | Status | Notes |
|------|---------|-------|--------|-------|
| Build login UI | Auth | Sr FE | In Progress | — |
| /auth/login endpoint | Auth | Sr BE | Todo | — |
```

---

## agents_roster.md
```
# Agent Roster
| Agent | Role | Responsibilities | Mandatory Outputs |
|-------|------|-----------------|-------------------|
| Sr Frontend | FE builder | UI, components, hooks | unit tests, playwright testids |
| Sr Backend | BE builder | APIs, DB, logic | unit tests, swagger/openapi |
| QA Lead | Test strategy | test_cases.md, testing.md | test matrix |
| SIT Agent | Integration tests | SIT_testing.md, playwright scripts | .spec.ts per feature |
| Reviewer | Code review | Review FE+BE per feature | review notes, approval |
```

---

## progress.md
Human-facing dashboard. Updated by each agent after completing work.

```
# Progress Tracker
Last updated: <date>

## Overall Status: 🔄 In Progress

| # | Feature | Prompt File | FE | BE | Review | Bug Bounty | Tests | SIT | Status |
|---|---------|------------|----|----|--------|------------|-------|-----|--------|
| 1 | Login   | f1_login.prompt.md | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | 🔄 SIT Pending |
| 2 | Dashboard | f2_dashboard.prompt.md | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⏳ Waiting |

**Status legend:** ⬜ Todo | ⏳ Waiting for human | 🔄 In Progress | ✅ Done | ❌ Blocked
```

---

## change_log.md
```
# Change Log
| Timestamp | Agent | Action | Files Affected |
|-----------|-------|--------|----------------|
| 2024-01-01 10:00 | Sr FE | Created LoginForm component | src/components/LoginForm.tsx |
```

---

## plans/f<N>_<feature>_<role>_plan.md (Implementation Plan)
Submitted by each builder agent to Tech Lead before coding begins.

```
# Implementation Plan — f<N> <Feature> [FE/BE]
Submitted by: <agent>
Feature: <name>

## Approach
<Brief description of implementation strategy>

## Dependencies
| Package | Version | Purpose | Already in stack? |
|---------|---------|---------|-------------------|
| react-query | 5.x | Server state mgmt | No — new |
| axios | 1.6.x | HTTP client | Yes |

## Files to Create
| File | Purpose |
|------|---------|

## Files to Modify
| File | Change |
|------|--------|

## API Contracts
| Method | Endpoint | Payload | Response |
|--------|----------|---------|----------|

## Risks / Assumptions
-

## Rendering Strategy (Next.js projects only — omit otherwise)
| Page / Route | Strategy | Reason |
|-------------|----------|--------|
| /example    | SSR      | Fresh data per request |

## Upgrades Required (yes/no confirmation needed from human)
| Package / Runtime | Current | Proposed | Reason | Human Confirmed? |
|-------------------|---------|----------|--------|-----------------|
| — | — | — | — | — |
```

---

## plans/review_log.md (Tech Lead Review Decisions)

```
# Plan Review Log

| Date | Feature | Agent | Decision | Notes |
|------|---------|-------|----------|-------|
| 2024-01-01 | f1_login | Sr FE | ✅ APPROVED | — |
| 2024-01-01 | f1_login | Sr BE | ❌ REJECTED | Do not use express-validator v7, use v6.x (peer dep conflict) |
| 2024-01-01 | f1_login | Sr BE | ✅ APPROVED | Revised plan accepted |
```

---

## docs/self_test_f<N>_<feature>_<role>.md (Agent Self-Test Report)
Saved by each builder agent after running their own tests. Required before handoff.

```
# Self-Test Report — f<N> <Feature> [FE/BE]
Agent: <role>
Date: <date>
Status: ✅ ALL PASS / ❌ FAILURES PRESENT

## Test Run
Command: npm run test -- --coverage
Result:  X passed, 0 failed, 0 skipped
Coverage: 84% statements | 79% branches | 91% functions

## Coverage Report (summary)
| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|

## Manual Verification
| Check | Result |
|-------|--------|
| App starts without errors | ✅ |
| Feature renders correctly | ✅ |
| Happy path works end-to-end | ✅ |
| Error states handled visibly | ✅ |
| [BE] All endpoints return correct status codes | ✅ |
| [BE] Error schema matches { code, message, details } | ✅ |

## Issues Found & Fixed
| Issue | Fix Applied |
|-------|------------|

## Handoff Declaration
All tests pass. No known failures. Ready for code review and QA.
```
