<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Skills

### `impeccable`
- **Path:** `.agents/skills/impeccable/SKILL.md`
- **When to use:** Designing, redesigning, shaping, critiquing, auditing, polishing, simplifying, hardening, animating, or otherwise improving frontend interfaces (dashboards, admin UI, product UI, components, forms, settings, onboarding, empty states). Covers UX review, hierarchy, layout, typography, color, motion, UX copy, accessibility, responsive behavior, edge cases, and design system documentation (`DESIGN.md`, tokens). Not for backend-only or non-UI tasks.
- **Setup & Usage:** Read `.agents/skills/impeccable/SKILL.md` before starting UI work. Run `.agents/skills/impeccable/scripts/impeccable context` (or `.agents/skills/impeccable/scripts/impeccable.cmd context` on Windows without `sh`) once per session with cwd at the project root, then load the matching playbook in `.agents/skills/impeccable/reference/` and read `.agents/skills/impeccable/reference/craft-floor.md` immediately before any UI edit.
- **Available commands:** `shape`, `init`, `document`, `extract`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard`, `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive`, `clarify`, `adapt`, `optimize`, `live`, `generate`.

### `hallmark`
- **Path:** `.agents/skills/hallmark/SKILL.md`
- **When to use:** Building or designing websites and new pages that look designed, not generated, or when the user explicitly names Hallmark. Never use it on an existing design unless the user names Hallmark (e.g., `/hallmark redesign <path>` or `audit <path>`).
- **Setup & Usage:** Read `.agents/skills/hallmark/SKILL.md` before building a new page. Follow the Floor rules and Flow (`Pre-flight` -> `Ask once` -> `Shape` -> `Direction` -> `Build` -> `Sweep` with `node .agents/skills/hallmark/scripts/sloplint.mjs <output> --render`).
- **Available verbs:** `<prompt>` (new page/component), `redesign <path>`, `audit <path>`.
