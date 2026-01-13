# LeaseLogic Backend

**Node.js + Express + Supabase**

---

## 📁 Structure

```
backend/
├── src/
│   ├── api/               Business logic (register, login, sessions, etc.)
│   ├── middleware/        Request processing (auth, geoRestriction)
│   ├── routes/            Route definitions (endpoints)
│   ├── controllers/       Legacy MVP handlers
│   ├── services/          Reusable services (TemplateEngine)
│   ├── templates/         PDF templates
│   ├── config/            Configuration (Supabase)
│   ├── __tests__/         Unit tests (Jest)
│   └── server.js          Express app entry point
│
├── tests/integration/     Integration tests
├── migrations/            Database migrations (SQL)
└── run-migrations.js      Migration checker
```

**Key Distinction:**
- `api/` = Business logic (what to do)
- `middleware/` = Request processing (validate before route)
- `routes/` = Endpoint definitions (URL mapping)

---

## 🔑 Important Files

### middleware/auth.js
**Purpose:** Authenticates incoming requests  
**Exports:** `authenticateUser(req, res, next)`  
**Usage:** Validates JWT tokens on protected routes  
**Example:** `router.get('/', authenticateUser, handler)`

### api/auth.js
**Purpose:** Authentication business logic  
**Exports:** `register`, `login`, `logout`, `getCurrentUser`, `updateProfile`  
**Usage:** Called by route handlers to perform auth operations

**Both files are needed - they serve different purposes.**

---

## 🧪 Testing

**Run all integration tests:**
```bash
npm run test:integration        # All 3 test suites (26 tests)
```

**Run individual tests:**
```bash
node tests/integration/sessions.test.js        # Sessions (8 tests)
node tests/integration/user-profiles.test.js   # Profiles (7 tests)
node tests/integration/api-endpoints.test.js   # API flow (12 tests)
```

**Run unit tests:**
```bash
npm test                        # Jest unit tests
```

**Check migrations:**
```bash
node run-migrations.js
```

---

## 🗄️ Database

**Tables (7):**
- consent_logs ✅
- legal_documents ✅
- users ✅
- user_profiles ✅
- sessions ✅
- audit_logs ⬜
- data_requests ⬜

**Migrations:** Run SQL in Supabase SQL Editor (see `run-migrations.js` output)

---

## 🚀 Development

**Start server:**
```bash
npm start                # Port 5000
```

**Environment variables (.env):**
```
REACT_APP_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

---

## 📊 API Endpoints

**Auth:**
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile

**Sessions:**
- GET `/api/sessions` - Get active sessions
- DELETE `/api/sessions/:id` - Delete session
- DELETE `/api/sessions` - Logout all devices
- POST `/api/sessions/cleanup` - Manual cleanup

**User Profiles:**
- GET `/api/profiles/me` - Get profile
- PUT `/api/profiles/subscription` - Update subscription ⚠️ **TESTING ONLY**
- GET `/api/profiles/check-limit` - Check usage limit
- POST `/api/profiles/increment-usage` - Increment usage
- GET `/api/profiles/usage` - Get usage stats

**⚠️ Subscription Endpoint - Testing Only:**

The `PUT /api/profiles/subscription` endpoint is **for testing only** and will be replaced in Phase 4.

- **Current:** Allows direct subscription updates without payment verification
- **Purpose:** Test subscription tiers and usage limits during Phase 2
- **Response:** Includes `stripe_integration_pending: true`
- **Security:** NOT secure for production use
- **Phase 4:** Will be replaced with Stripe webhook integration
- **See:** `requirements/Phases/guides/TASK-4.6-stripe-webhooks.md`

**Legal Documents:**
- GET `/api/legal/active` - All active documents
- GET `/api/legal/:type/active` - Specific document
- GET `/api/legal/:type/history` - Document history

**Consent:**
- POST `/api/consent/log` - Log consent
- GET `/api/consent/history/:userId` - User consent history

**PDF:**
- POST `/api/pdf/preview` - Generate preview
- POST `/api/pdf/generate` - Generate final PDF

---

**Last Updated:** 2025-12-11
