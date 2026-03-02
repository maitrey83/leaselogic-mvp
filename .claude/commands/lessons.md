Record or review lessons learned: $ARGUMENTS

## Steps

### If $ARGUMENTS is empty — summarize existing lessons:
1. Read `/Users/maitreypatel/.claude/projects/-Users-maitreypatel-Documents-LeaseLogic/memory/MEMORY.md`
2. Read `.claude/session-log.md` for decision history
3. Output a concise summary grouped by:
   - Architecture decisions and why
   - Deployment gotchas (Render, Vercel, Supabase)
   - Bugs that taught us something
   - Security lessons

### If $ARGUMENTS contains a lesson — record it:
1. Read the current MEMORY.md
2. Determine the right section (Project Overview, Architecture Rules, Deployment, Key Learnings, Current State)
3. Add the lesson in concise bullet-point form
4. If the lesson is detailed, create or append to a topic file in the memory directory (e.g., `debugging.md`, `patterns.md`) and link from MEMORY.md
5. Write the updated file

## Memory file location
`/Users/maitreypatel/.claude/projects/-Users-maitreypatel-Documents-LeaseLogic/memory/MEMORY.md`
