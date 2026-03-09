#!/usr/bin/env node

const REPO = 'GGsCodeLab/skills';
const SKILLS_PATH = ''; // skills are at repo root, e.g. dev-team-lead/

async function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  if (subcommand !== 'install-skill' && subcommand !== 'update-skill') {
    console.error('Usage: npx ggscodelab install-skill <skill-name> --cursor | --claude | --copilot');
    console.error('       npx ggscodelab update-skill <skill-name> --cursor | --claude | --copilot [--yes]');
    process.exit(1);
  }

  const yes = args.includes('--yes') || args.includes('-y');
  const rest = args.filter((a) => a !== '--yes' && a !== '-y');
  const skillName = rest[1];
  const flag = rest[2];

  if (!skillName || !flag) {
    console.error(`Usage: npx ggscodelab ${subcommand} <skill-name> --cursor | --claude | --copilot${subcommand === 'update-skill' ? ' [--yes]' : ''}`);
    console.error(`Example: npx ggscodelab ${subcommand} dev-team-lead --cursor`);
    process.exit(1);
  }

  let destDir;
  if (flag === '--cursor') {
    destDir = '.cursor/skills/' + skillName;
  } else if (flag === '--claude') {
    destDir = 'claude/' + skillName;
  } else if (flag === '--copilot') {
    destDir = '.github/skills/' + skillName;
  } else {
    console.error('Specify --cursor, --claude, or --copilot');
    process.exit(1);
  }

  const { installSkill, updateSkill } = await import('../lib/install.js');
  if (subcommand === 'install-skill') {
    await installSkill({ skillName, destDir, repo: REPO, skillsPath: SKILLS_PATH });
  } else {
    await updateSkill({ skillName, destDir, repo: REPO, skillsPath: SKILLS_PATH, yes });
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
