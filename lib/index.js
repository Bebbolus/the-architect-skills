import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const SKILLS_DIR = join(ROOT_DIR, "skills");

const PROVIDER_NAME = "the-architect-skills";
const BUNDLED_RANK = 400;

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

/**
 * DeepSeek Harness (DSH) Cordis Plugin metadata
 */
export const name = "the-architect-skills";
export const inject = ["skills"];

/**
 * Mount the operative skills provider onto ctx.skills
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  let cachedCandidates = null;

  const provider = {
    name: PROVIDER_NAME,
    async list() {
      if (cachedCandidates) return cachedCandidates;
      try {
        const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
        const candidates = [];
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const skillPath = join(SKILLS_DIR, entry.name, "SKILL.md");
          if (!existsSync(skillPath)) continue;
          try {
            const raw = await readFile(skillPath, "utf8");
            const { name, description } = parseFrontmatter(raw);
            candidates.push({
              name: name || entry.name,
              description: description || `The Architect operative skill: ${entry.name}`,
              invocation: {
                modelInvocable: true,
                userInvocable: true,
              },
              provider: PROVIDER_NAME,
              source: "bundled",
              rank: BUNDLED_RANK,
              locator: skillPath,
              path: skillPath,
            });
          } catch {
            // Ignore unreadable skill
          }
        }
        cachedCandidates = candidates;
        return candidates;
      } catch (err) {
        return [];
      }
    },
    async get(candidate) {
      const skillPath = candidate.locator || candidate.path;
      const raw = await readFile(skillPath, "utf8");
      const { content } = parseFrontmatter(raw);
      return {
        name: candidate.name,
        description: candidate.description,
        invocation: candidate.invocation,
        provider: candidate.provider,
        source: candidate.source,
        path: skillPath,
        content,
      };
    },
  };

  ctx.skills.registerProvider(() => provider);
}
