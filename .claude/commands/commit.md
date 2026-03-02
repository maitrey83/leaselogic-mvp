Create a commit with a well-formatted message matching project conventions.

## Steps

1. Run `git status` to see what's changed (never use `-uall` flag)
2. Run `git diff --staged` to see staged changes
3. If nothing is staged, list the modified files and ask what to stage
4. Run `git log --oneline -5` to match the commit message style
5. Draft a commit message following this project's format:
   - Prefix: `feat(scope):`, `fix(scope):`, `refactor(scope):`, `docs(scope):`
   - Scope examples: `pdf`, `auth`, `security`, `Phase 4.5`, `deployment`
   - First line: imperative, under 72 chars, describes the "why"
   - Body (if needed): bullet points explaining what changed
6. Show the proposed message and ask for confirmation before committing

## Rules from CLAUDE.md
- Never use `git add .` or `git add -A` — stage specific files by name
- Never commit `.env`, `.mcp.json`, or files with secrets
- Do NOT add `Co-Authored-By` lines
- Never force push to main without explicit approval
- If pre-commit hook fails, create a NEW commit (never amend previous)
