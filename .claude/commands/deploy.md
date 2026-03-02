Check deployment status and guide through deploy steps.

## Steps

1. Run `git log --oneline -3` to confirm latest commits
2. Run `git status` to check for uncommitted changes
3. Check if current branch is pushed: `git log origin/main..HEAD --oneline`

### If there are unpushed commits:
- Warn: "There are unpushed commits. Push to main first — Vercel and Render auto-deploy from main."

### If everything is pushed:
4. Check backend health: `curl -s https://leaselogic-backend.onrender.com/api/health`
5. Check frontend is reachable: `curl -s -o /dev/null -w "%{http_code}" https://leaselogic-mvp.vercel.app`
6. Report status:

```
## Deployment Status

### Git
- Latest commit: [hash] [message]
- Pushed to origin: Yes/No

### Backend (Render)
- URL: https://leaselogic-backend.onrender.com
- Health check: OK / Error [details]
- Note: Render free tier spins down after 15min inactivity. First request may take 30-60s.

### Frontend (Vercel)
- URL: https://leaselogic-mvp.vercel.app
- Status: [http code]
- Auto-deploys from main branch

### Action needed
- [any issues found]
```

## Rules
- Never trigger a manual deploy — both services auto-deploy from main
- If health check fails, check Render dashboard logs before assuming code issue
- Render free tier cold starts are normal, not errors
