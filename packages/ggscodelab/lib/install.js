import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

const GITHUB_API = 'https://api.github.com/repos';

function askOverwrite(destDir) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`Overwrite existing skill at ${destDir}? (y/N) `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

/**
 * Fetch repo contents (file or directory listing) from GitHub API.
 * No auth required for public repos.
 */
async function getContents(repo, filePath) {
  const url = `${GITHUB_API}/${repo}/contents/${filePath}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Skill not found: ${filePath}. Check that the repo has this skill at the root.`);
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Recursively download a directory from GitHub and write to destDir.
 * @param {string} repo - e.g. 'GGsCodeLab/skills'
 * @param {string} contentPath - e.g. 'claude/dev-team-lead'
 * @param {string} destDir - e.g. '.cursor/skills/dev-team-lead'
 */
async function downloadDir(repo, contentPath, destDir) {
  const items = await getContents(repo, contentPath);
  const list = Array.isArray(items) ? items : [items];

  for (const item of list) {
    const destPath = path.join(destDir, item.name);
    if (item.type === 'dir') {
      fs.mkdirSync(destPath, { recursive: true });
      await downloadDir(repo, `${contentPath}/${item.name}`, destPath);
    } else if (item.type === 'file') {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      const fileRes = await fetch(item.download_url || `${GITHUB_API}/${repo}/contents/${contentPath}/${item.name}`, {
        headers: { Accept: 'application/vnd.github.v3.raw' },
      });
      if (!fileRes.ok) throw new Error(`Failed to download ${item.name}: ${fileRes.status}`);
      const buf = Buffer.from(await fileRes.arrayBuffer());
      fs.writeFileSync(destPath, buf);
    }
  }
}

/**
 * Ensure the superpowers skill repo is present alongside the target skill.
 * - For Cursor installs:   .cursor/skills/superpowers
 * - For Claude installs:   .claude/skills/superpowers
 */
async function ensureSuperpowers(destDir) {
  const cwd = process.cwd();
  const skillsRoot = path.resolve(cwd, path.dirname(destDir));
  const superpowersDir = path.join(skillsRoot, 'superpowers');

  // Only act when destDir is under a skills directory (cursor/claude modes)
  if (!skillsRoot.endsWith(path.join('skills'))) {
    return;
  }

  const repoUrl = 'https://github.com/obra/superpowers.git';

  try {
    if (fs.existsSync(superpowersDir)) {
      // Update existing clone
      execSync('git pull', { cwd: superpowersDir, stdio: 'ignore' });
    } else {
      // Fresh clone
      fs.mkdirSync(skillsRoot, { recursive: true });
      execSync(`git clone ${repoUrl} "${superpowersDir}"`, { stdio: 'ignore' });
    }
  } catch {
    // Best-effort; do not fail the main install/update if superpowers clone fails
  }
}

export async function installSkill({ skillName, destDir, repo, skillsPath }) {
  const contentPath = skillsPath ? `${skillsPath}/${skillName}` : skillName;
  const cwd = process.cwd();
  const absoluteDest = path.resolve(cwd, destDir);

  if (fs.existsSync(absoluteDest)) {
    console.error(`Destination already exists: ${destDir}`);
    process.exit(1);
  }

  console.log(`Downloading skill "${skillName}" from ${repo}...`);
  await downloadDir(repo, contentPath, absoluteDest);
  console.log(`Installed to ${destDir}`);
  await ensureSuperpowers(destDir);
}

export async function updateSkill({ skillName, destDir, repo, skillsPath, yes = false }) {
  const contentPath = skillsPath ? `${skillsPath}/${skillName}` : skillName;
  const cwd = process.cwd();
  const absoluteDest = path.resolve(cwd, destDir);

  if (fs.existsSync(absoluteDest)) {
    if (!yes) {
      const allowed = await askOverwrite(destDir);
      if (!allowed) {
        console.log('Update cancelled.');
        process.exit(0);
      }
    }
    fs.rmSync(absoluteDest, { recursive: true });
  }

  console.log(`Downloading skill "${skillName}" from ${repo}...`);
  await downloadDir(repo, contentPath, absoluteDest);
  console.log(`Updated ${destDir}`);
  await runSkillDoctor();
  await ensureSuperpowers(destDir);
}

/**
 * Run skill doctor (diagnostics). Only invoked after update-skill.
 */
export async function runSkillDoctor() {
  const cwd = process.cwd();
  const dirs = ['.cursor/skills', '.claude/skills'];
  console.log('Skill doctor:');
  for (const dir of dirs) {
    const full = path.join(cwd, dir);
    if (fs.existsSync(full)) {
      const entries = fs.readdirSync(full);
      console.log(`  ${dir}: ${entries.length} skill(s) (${entries.join(', ')})`);
    } else {
      console.log(`  ${dir}: (none)`);
    }
  }
}
