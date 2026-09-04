# 🏛️ The Architect Skills: Universal Agent Archetypes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Standard: Agent Skills](https://img.shields.io/badge/Standard-Agentic%20Skills-green.svg)](https://github.com/Bebbolus/the-architect-skills)

**Autonomous, State-Reducing Agent Archetypes powered by the Model Workspace Protocol (MWP) & Interpretable Context Methodology (ICM).**

Standard LLM skills are frequently brittle, conversational, and suffer from context drift. **The Architect Skills** introduce a deterministic, role-constrained approach where each agent operates as a **state compiler**, strictly consuming structured inputs and compiling verifiable Markdown deliverables.

Compatible natively with **DeepSeek Harness (DSH)**, **Antigravity**, **Claude Code**, **Cursor**, **Goose**, and **OpenCode**.

---

## 🧭 The 6 Universal Archetypes

| Archetype | Core Role | Primary Input | Output Deliverable | Context Formula |
| :--- | :--- | :--- | :--- | :--- |
| **`curator` (Maker)** | Encyclopedic Wiki compilation | Raw sources, notes | `note.md` with OKF frontmatter | Definition-first, zero anecdotes, bidirectional wikilinks |
| **`auditor` (Checker)** | Adversarial review & ontological consistency | Drafts, theses | `audit_report.md` | Reverse steel-manning, bias & unproven claim hunting |
| **`explorer` (Recon)** | Territory scanning & OSINT intelligence | Research queries | `recon_dossier.md` | Multi-source corroboration, temporal verification, real URLs |
| **`synthesizer` (McKinsey)** | Strategic breakdown & decision structuring | Heterogeneous data | `executive_summary.md` | MECE, SCQA framework, Minto inverted pyramid, action trees |
| **`quiz-master` (Didact)** | Deep understanding & Active recall | Manuals, books | `quiz.md` & `flashcards.md` | Karpathy low-level demystification, `Q::A`, Cloze `{}` |
| **`builder` (Coder)** | Software engineering & surgical bugfixes | Specs, issues | Minimal diffs, green tests | Intent gate, minimal diffs, containerized runners |

---

## 🔒 The 5 Invariant Clauses (C1–C5)

Every archetype is bound by 5 inviolable operational clauses:

1. **C1 (Routing Fallback)**: *"If the assigned task requires external or unplanned information, stop immediately and fall back to the central project map."*
2. **C2 (Handoff State Protocol)**: *"At task completion, consolidate all relevant state into the assigned Markdown deliverable. On startup, hydrate context solely by reading the brief file."*
3. **C3 (Code-as-Action & Active Oblivion)**: *"For complex data processing or text transforms, generate disposable scripts in temporary folders (`tmp/`), run them, and destroy them immediately after use."*
4. **C4 (Territorial Confinement)**: *"Strictly respect assigned directory boundaries; never read or write outside your task scope."*
5. **C5 (Iterative Guardrails)**: *"Maximum 3 consecutive self-correction attempts. On the third failure, log the roadblock in `_errors/` and request human intervention."*

---

## 🚀 Installation & Usage Across Harnesses

### 1. DeepSeek Harness (DSH)
Symlink or copy the `skills/` directory into your project's `.dsh/skills` or global `~/.dsh/skills`:
```bash
mkdir -p ~/.dsh/skills
cp -r skills/* ~/.dsh/skills/
```
The DSH filesystem discovery provider (`@deepseek-ai/dsh-skill-filesystem`) will automatically register `curator`, `auditor`, `explorer`, `synthesizer`, `quiz-master`, and `builder` in the tool catalog.

### 2. Antigravity & Claude Code / Goose
Copy or symlink into `.agents/skills`:
```bash
mkdir -p .agents/skills
cp -r skills/* .agents/skills/
```

---

## 📄 License

MIT © [Bebbolus](https://github.com/Bebbolus)
