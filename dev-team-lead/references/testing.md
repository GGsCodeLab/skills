# Testing Reference

## test_cases.md Schema
```
# Test Cases
| # | Feature | Type | Scenario | Expected Result | Status |
|---|---------|------|----------|-----------------|--------|
| 1 | Login | Unit | Valid credentials | 200 + token | ✅ Pass |
| 2 | Login | Unit | Wrong password | 401 error | ⬜ Todo |
| 3 | Login | Integration | Login → dashboard redirect | 302 to /home | ⬜ Todo |
```

**Status values:** ⬜ Todo | 🔄 In Progress | ✅ Pass | ❌ Fail

---

## testing.md Schema
```
# Test Strategy
## Scope
## Test Types
| Type | Tool | Owner | Coverage Target |
|------|------|-------|----------------|
| Unit | Jest/Vitest | Sr FE / Sr BE | 80%+ |
| Integration | Supertest / MSW | Sr BE | All endpoints |
| E2E / SIT | Playwright | SIT Agent | All user flows |

## Test Environments
## Entry / Exit Criteria
## Risk Areas
```

---

## SIT_testing.md Schema
```
# System Integration Tests
| # | Flow | Steps | Expected | Playwright Script |
|---|------|-------|----------|-------------------|
| 1 | User Login | 1. Open /login 2. Enter creds 3. Submit | Redirect to /home | sit_login.spec.ts |
```

---

## Playwright Script Template
Every SIT feature generates a file: `playwright/sit_<feature>.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('<Feature> SIT', () => {
  test('<scenario description>', async ({ page }) => {
    await page.goto('/route');

    // Use data-testid selectors — NEVER XPath
    await page.getByTestId('email-input').fill('user@example.com');
    await page.getByTestId('password-input').fill('secret');
    await page.getByTestId('login-submit-btn').click();

    await expect(page).toHaveURL('/home');
    await expect(page.getByTestId('dashboard-header')).toBeVisible();
  });
});
```

---

## Playwright Guardrails (enforced by all FE agents)

| Rule | Good ✅ | Bad ❌ |
|------|---------|--------|
| Selector type | `getByTestId('login-btn')` | `//button[@class='btn']` |
| Attribute | `data-testid="login-btn"` | No test attribute |
| IDs | Semantic: `<feature>-<element>` | `btn1`, `div3` |
| Waiting | `await expect(el).toBeVisible()` | `page.waitForTimeout(2000)` |
| Navigation | `toHaveURL('/path')` | Check page title only |

---

## Running Tests

```bash
# Unit tests
npm run test

# Playwright SIT (all)
npx playwright test

# Playwright SIT (single feature)
npx playwright test playwright/sit_<feature>.spec.ts

# With UI
npx playwright test --ui
```
