import fs from 'fs';
import path from 'path';
import readline from 'readline';

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
      throw new Error(`Skill not found: ${filePath}. Check that the repo has claude/${filePath.split('/')[1]}/`);
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

export async function installSkill({ skillName, destDir, repo, skillsPath }) {
  const contentPath = `${skillsPath}/${skillName}`;
  const cwd = process.cwd();
  const absoluteDest = path.resolve(cwd, destDir);

  if (fs.existsSync(absoluteDest)) {
    console.error(`Destination already exists: ${destDir}`);
    process.exit(1);
  }

  console.log(`Downloading skill "${skillName}" from ${repo}...`);
  await downloadDir(repo, contentPath, absoluteDest);
  console.log(`Installed to ${destDir}`);
}

export async function updateSkill({ skillName, destDir, repo, skillsPath, yes = false }) {
  const contentPath = `${skillsPath}/${skillName}`;
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
}
