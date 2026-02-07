# LeaseLogic Deployment Guide

## Architecture Overview

```
                  ┌─────────────┐
   Users ──────>  │   Vercel    │  (Frontend - React)
                  │   :443      │
                  └──────┬──────┘
                         │ REACT_APP_API_URL
                         v
                  ┌─────────────┐
                  │   Render    │  (Backend - Express/Node.js)
                  │   :10000    │
                  └──────┬──────┘
                         │
                         v
                  ┌─────────────┐
                  │  Supabase   │  (PostgreSQL + Auth)
                  └─────────────┘
```

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | https://leaselogic-mvp.vercel.app |
| Backend | Render | https://leaselogic-backend.onrender.com |
| Database | Supabase | https://wxqzfhtaojpufyaxeurt.supabase.co |
| Payments | Stripe | Dashboard at https://dashboard.stripe.com |

---

## Production Deployment

### Backend (Render)

**Service:** Web Service (Node.js)
**Root Directory:** `backend`
**Region:** Oregon
**Plan:** Free (spins down after 15 min inactivity, ~30s cold start)

#### Render Environment Variables

Set these in **Render Dashboard > Environment > Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `NODE_VERSION` | `20.20.0` | Required |
| `REACT_APP_SUPABASE_URL` | `https://wxqzfhtaojpufyaxeurt.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `(secret)` | From Supabase dashboard > Settings > API |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | From Stripe dashboard |
| `PUPPETEER_EXECUTABLE_PATH` | _(see below)_ | Only if Chrome not auto-detected |
| `CORS_ALLOWED_ORIGINS` | _(optional)_ | Additional origins, comma-separated |

**Build Command:** `npm install && npx puppeteer browsers install chrome`
**Start Command:** `npm start`
**Health Check Path:** `/api/health`

#### Deploy Steps

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New > Web Service**
3. Connect your GitHub repo: `maitrey83/leaselogic-mvp`
4. Set **Root Directory** to `backend`
5. Set **Build Command** to `npm install && npx puppeteer browsers install chrome`
6. Set **Start Command** to `npm start`
7. Add all environment variables from the table above
8. Click **Create Web Service**
9. Wait for build to complete (~3-5 min)
10. Verify: `curl https://leaselogic-backend.onrender.com/api/health`

**Alternative:** Push to `main` and Render auto-deploys (if auto-deploy enabled and `render.yaml` is present).

#### Puppeteer / Chrome on Render

Puppeteer needs Chromium for PDF generation. The build command installs it:
```bash
npx puppeteer browsers install chrome
```

If Chrome is not auto-detected, set `PUPPETEER_EXECUTABLE_PATH` to the installed path. Check Render build logs for the exact path.

---

### Frontend (Vercel)

**URL:** https://leaselogic-mvp.vercel.app
**Repository:** https://github.com/maitrey83/leaselogic-mvp
**Auto-deploy:** Enabled from `main` branch

#### Vercel Environment Variables

Set these in **Vercel Dashboard > Settings > Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `REACT_APP_API_URL` | `https://leaselogic-backend.onrender.com` | Render backend URL |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | Stripe publishable key |
| `REACT_APP_SUPABASE_URL` | `https://wxqzfhtaojpufyaxeurt.supabase.co` | Supabase URL |
| `REACT_APP_SUPABASE_ANON_KEY` | `(key)` | Supabase anon key |
| `REACT_APP_USE_NEW_DOCUMENT_SYSTEM` | `false` | Feature flag - OFF for initial deploy |
| `REACT_APP_DOCUMENT_SELECTOR_ENABLED` | `false` | Feature flag - OFF for initial deploy |
| `REACT_APP_RENT_INCREASE` | `false` | Feature flag - OFF for initial deploy |
| `REACT_APP_BYPASS_GEO` | `false` | Must be false in production |
| `REACT_APP_BYPASS_PAYMENT` | `false` | Must be false in production |

**CRITICAL:** After updating `REACT_APP_API_URL` to the Render backend URL, trigger a Vercel redeploy (Deployments > Redeploy) for the change to take effect.

---

### Database (Supabase)

**URL:** https://wxqzfhtaojpufyaxeurt.supabase.co
**Region:** Shared across all environments (dev and production)

No deployment steps needed - Supabase is already live and shared.

---

## Feature Flags (Production Defaults)

All feature flags start **OFF** for safe deployment:

| Flag | Default | Description |
|------|---------|-------------|
| `REACT_APP_USE_NEW_DOCUMENT_SYSTEM` | `false` | Config-driven document system |
| `REACT_APP_DOCUMENT_SELECTOR_ENABLED` | `false` | Document type selector UI |
| `REACT_APP_RENT_INCREASE` | `false` | Rent increase notice feature |
| `REACT_APP_BYPASS_GEO` | `false` | Geo-restriction bypass (NEVER true in prod) |
| `REACT_APP_BYPASS_PAYMENT` | `false` | Payment bypass (NEVER true in prod) |

**Rollout Strategy:**
1. Deploy with all flags OFF
2. Verify existing 3-Day Notice works
3. Enable `REACT_APP_DOCUMENT_SELECTOR_ENABLED=true`
4. Enable `REACT_APP_USE_NEW_DOCUMENT_SYSTEM=true`
5. Enable `REACT_APP_RENT_INCREASE=true`
6. Monitor after each flag change

---

## Local Development

### Start Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5001
```

### Start Frontend
```bash
npm install
npm start
# App opens on http://localhost:3000
```

### Verify Setup
```bash
curl http://localhost:5001/api/health
# {"status":"OK","message":"LeaseLogic API is running","environment":"development"}
```

### Run Integration Tests
```bash
cd backend
npm run test:integration
# Expected: 52/52 passing
```

---

## Post-Deployment Verification

After deploying backend to Render:

```bash
# 1. Health check
curl https://leaselogic-backend.onrender.com/api/health

# 2. Root endpoint (lists all routes)
curl https://leaselogic-backend.onrender.com/

# 3. Test auth endpoint is reachable
curl -X POST https://leaselogic-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# Should return JSON error, NOT HTML (confirms Express is handling the route)
```

After updating Vercel `REACT_APP_API_URL` and redeploying:
1. Visit https://leaselogic-mvp.vercel.app
2. Open browser DevTools > Network tab
3. Try to login - API calls should go to `leaselogic-backend.onrender.com`
4. Verify no CORS errors in console

---

## Rollback Plan

### Backend Rollback (Render)
1. Go to Render Dashboard > leaselogic-backend > Events
2. Find the previous successful deploy
3. Click **Rollback to this deploy**
4. Verify health check passes

### Frontend Rollback (Vercel)
1. Go to Vercel Dashboard > Deployments
2. Find the previous successful deployment
3. Click **...** > **Promote to Production**
4. Verify site loads correctly

### Emergency: Disable Backend
If backend is causing issues and rollback isn't working:
1. Set `REACT_APP_API_URL` in Vercel to empty or localhost
2. Redeploy Vercel - frontend will work in "offline" mode (no auth/API)
3. Fix backend issue
4. Restore `REACT_APP_API_URL` and redeploy

---

## Render Free Tier Notes

- **Cold starts:** ~30 seconds after 15 min of inactivity
- **Spin down:** Service stops after 15 min with no requests
- **750 hours/month:** Free tier limit (plenty for a single service)
- **Outbound bandwidth:** 100 GB/month

To keep the service warm, you can set up an external cron (e.g., UptimeRobot) to ping `/api/health` every 14 minutes.

---

## Troubleshooting

### Backend Won't Start on Render
- Check Render build logs for errors
- Verify all env vars are set (especially `REACT_APP_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`)
- Ensure Node.js version is 20+ (set `NODE_VERSION=20.20.0`)

### Puppeteer/Chrome Errors on Render
- Check that build command includes `npx puppeteer browsers install chrome`
- Look in build logs for Chrome installation path
- Set `PUPPETEER_EXECUTABLE_PATH` if auto-detection fails

### CORS Errors in Production
- Verify `https://leaselogic-mvp.vercel.app` is in the allowed origins
- Check browser console for the exact blocked origin
- If using a custom domain, add it to `CORS_ALLOWED_ORIGINS` env var on Render

### Frontend Can't Reach Backend
- Verify `REACT_APP_API_URL` in Vercel points to the Render URL (with `https://`)
- Redeploy Vercel after changing env vars (React bakes env vars at build time)
- Check if Render service is running (not spun down)

### Port Already in Use (Local)
```bash
lsof -i :5001
kill -9 <PID>
```

---

Last Updated: 2026-02-07
