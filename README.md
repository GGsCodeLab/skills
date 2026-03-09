# GGsCodeLab Skills

Collections of skills for AI agents (Claude, Cursor). Public repo: [github.com/GGsCodeLab/skills](https://github.com/GGsCodeLab/skills).

## Install or update a skill

From any project directory:

```bash
# Install (fails if folder exists)
npx ggscodelab install-skill dev-team-lead --cursor
npx ggscodelab install-skill dev-team-lead --claude
npx ggscodelab install-skill dev-team-lead --copilot

# Update (overwrites after confirmation; use --yes to skip prompt)
npx ggscodelab update-skill dev-team-lead --cursor
npx ggscodelab update-skill dev-team-lead --claude --yes
npx ggscodelab update-skill dev-team-lead --copilot --yes
```

The skill is downloaded from this repo. Skills live at the repo root (e.g. `dev-team-lead/`); only the install destination changes (`.cursor/skills/` or `claude/`).

## Publish the npx package

To publish or update the `ggscodelab` package so others can use the command above:

```bash
cd packages/ggscodelab
npm publish
```

You need an npm account and to be logged in (`npm login`). To reserve the name `ggscodelab` on npm, publish once; if the name is taken, use a scoped name like `@ggscodelab/cli` and document the command as `npx @ggscodelab/cli install-skill dev-team-lead --cursor`.
