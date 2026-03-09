# Environment Scan Reference

Run these commands during Phase 0. Save all output to `docs/environment.md`.

---

## Scan Commands

### Runtime Versions
```bash
node --version
npm --version
npx --version
yarn --version 2>/dev/null || echo "yarn: not installed"
pnpm --version 2>/dev/null || echo "pnpm: not installed"
java --version 2>/dev/null || echo "java: not installed"
python3 --version 2>/dev/null || echo "python: not installed"
go version 2>/dev/null || echo "go: not installed"
ruby --version 2>/dev/null || echo "ruby: not installed"
```

### Package Managers & Lock Files
```bash
# Detect lock file (determines which package manager to use)
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null

# List all installed top-level FE packages + versions
cat package.json 2>/dev/null

# List all installed top-level BE packages
cat pom.xml 2>/dev/null        # Java/Maven
cat build.gradle 2>/dev/null   # Java/Gradle
cat requirements.txt 2>/dev/null  # Python
cat go.mod 2>/dev/null         # Go
```

### Framework Detection
```bash
# Check for common config files
ls next.config.* vite.config.* angular.json svelte.config.* 2>/dev/null
ls tsconfig.json .babelrc .eslintrc* jest.config.* 2>/dev/null
```

### Database & Services
```bash
psql --version 2>/dev/null || echo "postgres: not installed"
mysql --version 2>/dev/null || echo "mysql: not installed"
mongod --version 2>/dev/null || echo "mongo: not installed"
redis-cli --version 2>/dev/null || echo "redis: not installed"
docker --version 2>/dev/null || echo "docker: not installed"
docker-compose version 2>/dev/null || echo "docker-compose: not installed"
```

---

## `docs/environment.md` Output Schema

```markdown
# Environment Snapshot
Scanned: <date>

## Runtimes
| Runtime | Detected Version | Min Compatible | Notes |
|---------|-----------------|---------------|-------|
| Node.js | 20.11.0         | 18.x+         | LTS   |
| npm     | 10.2.4          | —             | —     |
| Java    | 17.0.9          | 17+           | LTS   |
| Python  | not installed   | —             | —     |

## Package Manager
| Tool | Detected | Lock File |
|------|----------|-----------|
| npm  | ✅       | package-lock.json |

## Frontend Stack (from package.json)
| Package | Installed Version | Latest Stable | Constraint |
|---------|------------------|--------------|------------|
| react   | 18.2.0           | 18.3.x       | Stay on 18.x |
| next    | 14.1.0           | 14.x         | Do not upgrade to 15 |
| typescript | 5.3.3         | 5.x          | OK to patch |

## Backend Stack
| Package | Installed Version | Notes |
|---------|-----------------|-------|
| spring-boot | 3.2.1     | Use 3.x compatible libs only |

## Services Available
| Service | Version | Status |
|---------|---------|--------|
| PostgreSQL | 15.4  | ✅ Running |
| Redis      | 7.2.3 | ✅ Running |
| Docker     | 24.x  | ✅ Available |

## Constraints (Tech Lead sets these after review)
| Rule | Reason |
|------|--------|
| Node must stay on 20.x | CI/CD pipeline pinned |
| Do NOT add React 19 | Breaking changes, not tested |
| Use npm only — no yarn/pnpm | Lock file is package-lock.json |
| Java libs must target JDK 17 | Production server is JDK 17 |
```

---

## How Tech Lead Uses This During Plan Review

When an agent submits their implementation plan (Phase 2a), cross-check every
declared package against `environment.md`:

| Check | Action if failed |
|-------|-----------------|
| Package requires Node version higher than detected | ❌ Reject — request alternative |
| Package duplicates one already in stack | ❌ Reject — use existing |
| Package version conflicts with peer deps of installed libs | ❌ Reject — specify compatible version |
| Package targets wrong JDK | ❌ Reject — request JDK-compatible version |
| Package manager differs from lock file | ❌ Reject — enforce detected package manager |
| Package is fine | ✅ Approve with version pinned in review_log.md |

**Always pin approved versions explicitly** in `review_log.md` so all agents use
the exact same version, not `latest` or a range.

---

## Minimum Version Check During Plan Review

When reviewing an agent's implementation plan, for every declared package look up
its `engines` field (Node.js) or documented minimum runtime and compare:

```bash
# Quick check — what does a package require?
npm info <package> engines
# e.g: npm info vite engines  →  { node: '>=18.0.0' }
```

| Scenario | Action |
|----------|--------|
| Package requires Node 18, system has Node 20 | ✅ Compatible — approve |
| Package requires Node 24, system has Node 20 | 🛑 HARD STOP — raise blocker |
| Package requires Java 21, system has Java 17 | 🛑 HARD STOP — raise blocker |
| Package requires Python 3.11, system has 3.10 | 🛑 HARD STOP — raise blocker |

**Never silently downgrade a package to fit the environment without checking
whether the older version still satisfies the feature requirements.**

---

## docs/env_blocker.md (Blocker Report Schema)

Created by Tech Lead when an environment incompatibility is detected.
All development halts until the human resolves this.

```markdown
# 🛑 Environment Blocker
Raised by: Tech Lead
Date: <date>
Status: BLOCKING — all development halted

## Incompatibility Detected

| | Required | Detected | Gap |
|-|----------|----------|-----|
| Runtime | Node.js 24.x | Node.js 20.x | +4 major versions |
| Triggered by | `some-package@3.x` in f2_dashboard_fe_plan.md | — | — |

## What Needs to Change

To unblock, ONE of the following must happen:
1. **Upgrade environment** — install Node.js 24.x on this machine / CI
2. **Use an alternative package** — replace `some-package` with `alternative-pkg`
   which supports Node.js 20.x (Tech Lead recommends: <suggestion>)
3. **Descope the requirement** — remove the dependency on this feature

## Impact
- Feature f2_dashboard is blocked
- Features f3, f4 (if dependent) are also blocked
- Features f1 (independent) can still proceed

## Awaiting human decision — do not resume blocked features until confirmed.
```
