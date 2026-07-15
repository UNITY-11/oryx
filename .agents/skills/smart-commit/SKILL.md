---
name: smart-commit
description: Commit staged or unstaged changes following industry-standard Conventional Commits. Use when the user says "commit", "commit changes", "commit the changes", "smart commit", or "save my work". Automatically groups related changes, writes professional commit messages, and commits one logical unit at a time.
---

# Smart Commit Skill

## Purpose
Commit code changes like a highly skilled, industry-experienced developer. Each commit should be atomic, well-described, and follow the **Conventional Commits** specification.

## Workflow

### Step 1: Discover Changes
Run `git status` and `git diff --stat` to see all modified, added, and deleted files.

### Step 2: Group Changes Logically
Analyse the changed files and group them into **logical, atomic commits**. Each commit should represent ONE coherent unit of work. Grouping rules:

- **Same feature/fix across multiple files** → ONE commit (e.g., a component + its styles + its tests)
- **Unrelated changes in different areas** → SEPARATE commits
- **Refactors mixed with features** → SEPARATE commits
- **Config/dependency changes** → SEPARATE commit from feature code

### Step 3: Write Commit Messages (Conventional Commits Format)
Every commit message MUST follow this format:

```
<type>(<scope>): <short description>
```

**Types** (use the most specific one):
- `feat` — A new feature or user-facing addition
- `fix` — A bug fix
- `style` — CSS/UI/formatting changes (no logic change)
- `refactor` — Code restructuring without changing behaviour
- `perf` — Performance improvements
- `docs` — Documentation only
- `test` — Adding or updating tests
- `chore` — Build, tooling, config, dependencies
- `ci` — CI/CD pipeline changes
- `revert` — Reverting a previous commit

**Scope** — The area of the codebase affected. Use the app name or feature area:
- For monorepos: `admin`, `web`, `ui`, `config`
- For features: `auth`, `booking`, `analytics`, `sidebar`, `dashboard`
- For infra: `deps`, `eslint`, `docker`, `ci`

**Short description rules:**
- Use imperative mood ("add", "fix", "update" — NOT "added", "fixes", "updated")
- Lowercase first letter after the colon
- No period at the end
- Maximum 72 characters
- Be specific — describe WHAT changed, not just WHERE

**Good examples:**
```
feat(admin): add revenue trend chart to analytics dashboard
fix(booking): prevent double-submit on confirmation button
style(sidebar): reduce gap between sidebar and main content
refactor(auth): extract token refresh logic into shared hook
chore(deps): upgrade recharts to v2.12.0
```

**Bad examples (NEVER do this):**
```
update files
fix bug
changes
WIP
misc updates
```

### Step 4: Commit One by One
For each logical group:
1. Stage ONLY the files belonging to that group: `git add <file1> <file2> ...`
2. Commit with the crafted message: `git commit --no-verify -m "<message>"`
3. Report the commit hash and message to the user
4. Move to the next group

> **Note:** Always use `--no-verify` flag because the project's pre-commit hooks have an ESLint configuration issue that blocks commits.

### Step 5: Summary
After all commits are made, present a clean summary table:

| # | Commit Hash | Message |
|---|-------------|---------|
| 1 | `abc1234`   | feat(admin): add revenue chart |
| 2 | `def5678`   | style(sidebar): adjust padding |

## Important Rules

- **NEVER combine unrelated changes into a single commit.**
- **NEVER use vague commit messages** like "update", "fix", "changes", "misc".
- **NEVER commit everything in one big commit** unless all changes are truly part of the same logical unit.
- **ALWAYS use `--no-verify`** to bypass the broken pre-commit hook in this project.
- **ALWAYS use PowerShell-compatible syntax** (use `;` instead of `&&` to chain commands).
- If there are NO changes to commit, inform the user: "Working tree is clean — nothing to commit."
