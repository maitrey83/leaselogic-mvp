# Backend Tests

**Test Organization**

---

## 📁 Structure

```
tests/
└── integration/          Integration tests (API + Database)
    ├── sessions.test.js           (7 tests - Jest)
    ├── user-profiles.test.js      (7 tests - Script)
    └── api-endpoints.test.js      (12 tests - Script)

src/__tests__/            Unit tests (Jest - standard location)
├── TemplateEngine.test.js         (16 tests)
├── auth.test.js                   (skipped - needs Supabase)
└── legalDocuments.test.js         (skipped - needs Supabase)
```

**Note:** Unit tests are in `src/__tests__/` following Jest convention

---

## 🧪 Integration Tests

### Run all integration tests (single command):
```bash
cd /Users/mpatel/Documents/LeaseLogic/backend
npm run test:integration
```

### Run individual tests:
```bash
cd /Users/mpatel/Documents/LeaseLogic/backend

# Sessions test
node tests/integration/sessions.test.js

# User profiles test
node tests/integration/user-profiles.test.js

# API endpoints test
node tests/integration/api-endpoints.test.js
```

**Important:** Always run from backend directory (where .env is located)

---

## 🔬 Unit Tests

**Run unit tests:**
```bash
npm test              # or npm run test:unit
```

**Location:** `src/__tests__/` (Jest standard)

---

## 📊 Test Coverage

### Integration Tests (27 tests)

**sessions.test.js (8 tests - Node Script)**
- ✅ Create test user
- ✅ Create session
- ✅ Get session by token
- ✅ Get active sessions for user
- ✅ Update session activity
- ✅ Expired sessions not returned
- ✅ Cleanup expired sessions
- ✅ Delete session

**user-profiles.test.js (7 tests - Script)**
- ✅ Table exists
- ✅ Table structure correct
- ✅ Profile auto-created
- ✅ Usage incremented
- ✅ Usage limit check
- ✅ Subscription plan change
- ⚠️ Reset monthly usage (needs migration 006)

**api-endpoints.test.js (12 tests - Script)**
- ✅ User registration (with trigger verification)
- ✅ User login (JWT tokens)
- ✅ Get current user
- ✅ Update profile
- ✅ Get all legal documents
- ✅ Get specific document
- ✅ Get document history
- ✅ Log consent

### Unit Tests (16 tests)

**TemplateEngine.test.js (16 tests)**
- ✅ Template loading
- ✅ Template rendering
- ✅ PDF generation
- ✅ Error handling

---

## 🔧 Prerequisites

**Backend must be running:**
```bash
npm start
```

**Environment variables (.env in backend directory):**
- `REACT_APP_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## ⚠️ Common Issues

### "Missing Supabase environment variables"
**Cause:** Running test from wrong directory  
**Solution:** Always run from backend directory
```bash
cd /Users/mpatel/Documents/LeaseLogic/backend
node tests/integration/api-endpoints.test.js
```

### "Cannot find module"
**Cause:** Running from subdirectory  
**Solution:** Run from backend root
```bash
# Wrong:
cd tests/integration
node api-endpoints.test.js

# Correct:
cd /Users/mpatel/Documents/LeaseLogic/backend
node tests/integration/api-endpoints.test.js
```

---

## ✅ Expected Results

**All tests passing:**
- Integration: 25/26 ✅ (96%)
- Unit (Jest): 16/16 ✅
- **Total: 41/42 tests passing**

**Known issue:** user-profiles reset test (needs migration 006)

---

**Last Updated:** 2025-12-11
