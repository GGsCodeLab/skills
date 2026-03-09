# ggscodelab

Install AI agent skills from [GGsCodeLab/skills](https://github.com/GGsCodeLab/skills) into your project.

## Usage

**Install** (fails if the skill folder already exists):

```bash
npx ggscodelab install-skill <skill-name> --cursor | --claude | --copilot
```

**Update** (overwrites existing skill after confirmation, or use `--yes` to skip prompt):

```bash
npx ggscodelab update-skill <skill-name> --cursor | --claude | --copilot [--yes]
```

**Examples:**

```bash
# Cursor (.cursor/skills/dev-team-lead/)
npx ggscodelab install-skill dev-team-lead --cursor

# Claude (claude/dev-team-lead/)
npx ggscodelab install-skill dev-team-lead --claude

# GitHub Copilot (.github/skills/dev-team-lead/)
npx ggscodelab install-skill dev-team-lead --copilot

# Update existing skill (prompts: Overwrite existing skill at ...? (y/N))
npx ggscodelab update-skill dev-team-lead --cursor

# Update without prompt (e.g. in scripts)
npx ggscodelab update-skill dev-team-lead --cursor --yes
```

Skills are downloaded from the public repo. Use `update-skill` to replace an existing installation; you will be asked to confirm unless you pass `--yes`.

## Publishing

From this directory:

```bash
npm publish
```

Then anyone can run `npx ggscodelab install-skill dev-team-lead --cursor` without cloning the repo.
