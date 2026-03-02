Show current session progress and project status.

## Steps

1. Run `git log --oneline -10` to see recent work
2. Read `.claude/current-focus.md` for current sprint status
3. Read `.claude/quick-start.md` for overall project state
4. Check `git status` for uncommitted work

## Output format (keep under 60 seconds to read)

### Shipped (last 10 commits)
- [bullet list of recent commits]

### In Progress
- [from current-focus.md + uncommitted changes]

### Up Next
- [from current-focus.md next steps]

### Production Status
- Frontend: https://leaselogic-mvp.vercel.app
- Backend: https://leaselogic-backend.onrender.com
- Database: Supabase (12 tables, RLS enabled)
