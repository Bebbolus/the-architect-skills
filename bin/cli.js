#!/usr/bin/env node

import { readdir, readFile, mkdir, cp, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const SKILLS_DIR = join(ROOT_DIR, "skills");

// ANSI color formatting
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const color = {
  reset: useColor ? "\x1b[0m" : "",
  bold: useColor ? "\x1b[1m" : "",
  dim: useColor ? "\x1b[2m" : "",
  cyan: useColor ? "\x1b[36m" : "",
  green: useColor ? "\x1b[32m" : "",
  yellow: useColor ? "\x1b[33m" : "",
  blue: useColor ? "\x1b[34m" : "",
  magenta: useColor ? "\x1b[35m" : "",
  red: useColor ? "\x1b[31m" : "",
};

function log(msg = "") {
  console.log(msg);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { name: "", description: "", content: raw };
  const yaml = match[1];
  const content = match[2].trim();
  let name = "";
  let description = "";
  for (const line of yaml.split(/\r?\n/)) {
    if (line.startsWith("name:")) {
      name = line.replace("name:", "").trim().replace(/^["']|["']$/g, "");
    } else if (line.startsWith("description:")) {
      description = line.replace("description:", "").trim().replace(/^["']|["']$/g, "");
    }
  }
  return { name, description, content };
}

async function getAvailableSkills() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillPath = join(SKILLS_DIR, entry.name, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    try {
      const raw = await readFile(skillPath, "utf8");
      const { name, description } = parseFrontmatter(raw);
      skills.push({
        id: entry.name,
        name: name || entry.name,
        description: description || "No description provided",
        dir: join(SKILLS_DIR, entry.name),
        skillPath,
      });
    } catch {
      // skip unreadable
    }
  }
  return skills.sort((a, b) => a.id.localeCompare(b.id));
}

function showHelp() {
  log(`
${color.bold}${color.cyan}The Architect Skills${color.reset} ${color.dim}— Cognitive Operatives Suite${color.reset}

${color.bold}USAGE:${color.reset}
  npx @bebbolus/the-architect-skills <command> [options]
  architect-skills <command> [options]

${color.bold}COMMANDS:${color.reset}
  ${color.green}install${color.reset}       Install skills into your agent harness (default command)
  ${color.green}list${color.reset}          List all 45 available skills and descriptions
  ${color.green}info <name>${color.reset}   Show detailed instructions for a specific skill
  ${color.green}help${color.reset}          Show this help message

${color.bold}INSTALL TARGET OPTIONS:${color.reset}
  ${color.cyan}--dsh${color.reset}         Install into DeepSeek Harness (~/.dsh/skills) ${color.dim}[DEFAULT]${color.reset}
  ${color.cyan}--claude${color.reset}      Install into Claude Code (~/.claude/skills)
  ${color.cyan}--cursor${color.reset}      Install into Cursor (~/.cursor/skills)
  ${color.cyan}--opencode${color.reset}    Install into OpenCode (~/.config/opencode/skills)
  ${color.cyan}--project, -p${color.reset} Install into current project (./.dsh/skills)
  ${color.cyan}--dest <path>${color.reset} Install into a custom destination directory
  ${color.cyan}--all${color.reset}         Install into all detected harness directories

${color.bold}FILTER & BEHAVIOR OPTIONS:${color.reset}
  ${color.cyan}--only <a,b>${color.reset}  Install only specific skills (e.g. --only auditor,critic,oracle)
  ${color.cyan}--dry-run${color.reset}     Simulate installation without copying files
  ${color.cyan}--force, -f${color.reset}   Force overwrite existing skills without prompt

${color.bold}EXAMPLES:${color.reset}
  ${color.dim}# Install all 45 skills into DSH:~/.dsh/skills${color.reset}
  npx @bebbolus/the-architect-skills install

  ${color.dim}# Install into Claude Code${color.reset}
  npx @bebbolus/the-architect-skills install --claude

  ${color.dim}# Install into your local project workspace${color.reset}
  npx @bebbolus/the-architect-skills install --project

  ${color.dim}# List all available skills${color.reset}
  npx @bebbolus/the-architect-skills list

  ${color.dim}# View details of a specific skill${color.reset}
  npx @bebbolus/the-architect-skills info threat-modeler
`);
}

async function listSkills() {
  const skills = await getAvailableSkills();
  log(`\n${color.bold}${color.cyan}⚡ The Architect — Available Operative Skills (${skills.length})${color.reset}\n`);
  
  for (const s of skills) {
    const nameStr = `${color.bold}${color.green}/${s.name}${color.reset}`.padEnd(28);
    const desc = s.description.length > 75 ? s.description.slice(0, 72) + "..." : s.description;
    log(`  ${nameStr} ${color.dim}${desc}${color.reset}`);
  }
  log(`\n${color.dim}Use "info <name>" to read the full skill instructions.${color.reset}\n`);
}

async function infoSkill(skillName) {
  if (!skillName) {
    log(`${color.red}Error:${color.reset} Please provide a skill name (e.g. architect-skills info auditor)`);
    process.exit(1);
  }
  const cleanName = skillName.replace(/^\//, "").toLowerCase();
  const skills = await getAvailableSkills();
  const skill = skills.find((s) => s.name.toLowerCase() === cleanName || s.id.toLowerCase() === cleanName);
  
  if (!skill) {
    log(`${color.red}Error:${color.reset} Skill "${skillName}" not found. Run "list" to see available skills.`);
    process.exit(1);
  }

  const raw = await readFile(skill.skillPath, "utf8");
  const { name, description, content } = parseFrontmatter(raw);

  log(`\n${color.bold}${color.cyan}Operative Skill: ${color.green}/${name}${color.reset}`);
  log(`${color.yellow}Description:${color.reset} ${description}\n`);
  log(`${color.dim}--- Instructions Preview ---${color.reset}`);
  log(content.slice(0, 1500) + (content.length > 1500 ? `\n${color.dim}... [truncated, ${content.length} bytes total]${color.reset}` : ""));
  log(`\n${color.dim}File: ${skill.skillPath}${color.reset}\n`);
}

async function installSkills(args) {
  const destinations = [];
  const home = os.homedir();

  // Parse destinations
  if (args.includes("--dest")) {
    const idx = args.indexOf("--dest");
    if (args[idx + 1]) destinations.push(resolve(process.cwd(), args[idx + 1]));
  }
  if (args.includes("--project") || args.includes("-p")) {
    destinations.push(resolve(process.cwd(), ".dsh", "skills"));
  }
  if (args.includes("--claude")) {
    destinations.push(join(home, ".claude", "skills"));
  }
  if (args.includes("--cursor")) {
    destinations.push(join(home, ".cursor", "skills"));
  }
  if (args.includes("--opencode")) {
    destinations.push(join(home, ".config", "opencode", "skills"));
  }
  if (args.includes("--dsh")) {
    const dshHome = process.env.DSH_HOME || join(home, ".dsh");
    destinations.push(join(dshHome, "skills"));
  }
  if (args.includes("--all")) {
    const candidates = [
      process.env.DSH_HOME ? join(process.env.DSH_HOME, "skills") : join(home, ".dsh", "skills"),
      join(home, ".claude", "skills"),
      join(home, ".cursor", "skills"),
      join(home, ".config", "opencode", "skills"),
    ];
    for (const c of candidates) {
      if (!destinations.includes(c)) destinations.push(c);
    }
  }

  // Default destination: ~/.dsh/skills
  if (destinations.length === 0) {
    const dshHome = process.env.DSH_HOME || join(home, ".dsh");
    destinations.push(join(dshHome, "skills"));
  }

  // Parse filter options
  let targetSkills = await getAvailableSkills();
  if (args.includes("--only")) {
    const idx = args.indexOf("--only");
    if (args[idx + 1]) {
      const allowed = args[idx + 1].split(",").map((s) => s.trim().toLowerCase().replace(/^\//, ""));
      targetSkills = targetSkills.filter((s) => allowed.includes(s.name.toLowerCase()) || allowed.includes(s.id.toLowerCase()));
    }
  }

  const isDryRun = args.includes("--dry-run");

  log(`\n${color.bold}${color.cyan}⚡ The Architect Skills Installer${color.reset}`);
  log(`Skills to install: ${color.green}${targetSkills.length}${color.reset} operatives`);
  if (isDryRun) log(`${color.yellow}[DRY-RUN MODE — No files will be modified]${color.reset}`);

  for (const dest of destinations) {
    log(`\nTarget: ${color.bold}${color.magenta}${dest}${color.reset}`);
    
    if (!isDryRun) {
      await mkdir(dest, { recursive: true });
    }

    let count = 0;
    for (const skill of targetSkills) {
      const targetDir = join(dest, skill.id);
      if (!isDryRun) {
        await cp(skill.dir, targetDir, { recursive: true });
      }
      count++;
    }
    log(`  ${color.green}✓${color.reset} Installed ${color.bold}${count}/${targetSkills.length}${color.reset} skills into ${dest}`);
  }

  log(`\n${color.bold}${color.green}Done!${color.reset} Your agent can now invoke these skills via ${color.cyan}/<skill-name>${color.reset}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] && !args[0].startsWith("-") ? args[0] : "install";

  if (args.includes("--help") || args.includes("-h") || command === "help") {
    showHelp();
    return;
  }

  if (args.includes("--version") || args.includes("-v")) {
    const pkg = JSON.parse(await readFile(join(ROOT_DIR, "package.json"), "utf8"));
    log(pkg.version);
    return;
  }

  switch (command) {
    case "install":
      await installSkills(args);
      break;
    case "list":
      await listSkills();
      break;
    case "info":
      await infoSkill(args[1]);
      break;
    default:
      log(`${color.red}Unknown command:${color.reset} "${command}"`);
      showHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n${color.red}Error:${color.reset}`, err);
  process.exit(1);
});
