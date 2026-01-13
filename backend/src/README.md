# Backend Source Code Structure

**Two Development Phases Coexist**

---

## 📁 Directory Structure

```
src/
├── api/                  Business logic (Phase 2)
├── middleware/           Request processing (Shared)
├── routes/               Route definitions (Both)
├── controllers/          Legacy handlers (MVP)
├── services/             Reusable services (Shared)
├── templates/            PDF templates (Both)
├── config/               Configuration (Shared)
└── __tests__/            Unit tests
```

---

## 🔑 Key Directories

### api/ - Business Logic (Phase 2)
**Purpose:** Core business operations  
**Pattern:** Functions that handle specific operations  
**Example:** `auth.js` exports `register`, `login`, `logout`

### middleware/ - Request Processing
**Purpose:** Process requests before they reach routes  
**Pattern:** Express middleware functions  
**Example:** `auth.js` exports `authenticateUser(req, res, next)`

**Important:** `middleware/auth.js` ≠ `api/auth.js`
- `middleware/auth.js` = Validates JWT tokens (middleware)
- `api/auth.js` = Handles login/register (business logic)

### routes/ - Route Definitions
**Purpose:** Define API endpoints  
**Pattern:** Express routers  
**Example:** `routes/auth.js` maps `/api/auth/login` to `api/auth.login()`

---

## 🔒 MVP Code (November 2025)

**Status:** Production Ready, Protected  
**Purpose:** Utah 3-Day Notice + Payment  
**DO NOT MODIFY** without testing

### Files:
```
controllers/
├── pdfController.js          [MVP] PDF generation
└── paymentController.js      [MVP] Payment processing

routes/
├── pdf.js                    [MVP] PDF endpoints
└── payment.js                [MVP] Payment endpoints

templates/
└── noticeTemplate.js         [MVP] Old template

middleware/
└── geoRestriction.js         [MVP] Geo-restriction
```

---

## 🚀 Phase 2 Code (December 2025)

**Status:** 70% Complete  
**Purpose:** Multi-document + Database + Auth

### Files:
```
api/
├── auth.js                   Authentication logic
├── sessions.js               Session management
├── userProfiles.js           User profiles
├── legalDocuments.js         Legal documents
└── consent.js                Consent logging

middleware/
└── auth.js                   JWT authentication

routes/
├── auth.js                   Auth endpoints
├── sessions.js               Session endpoints
├── userProfiles.js           Profile endpoints
├── legalDocuments.js         Legal endpoints
└── consent.js                Consent endpoints

services/
└── TemplateEngine.js         Template rendering

templates/
├── utah-3day-notice-v1.js           Final PDF
├── utah-3day-notice-preview-v1.js   Preview
├── utah-rent-increase-v1.js         Final PDF
└── utah-rent-increase-preview-v1.js Preview
```

---

## ⚠️ Naming Pattern Difference

**MVP Pattern (Old):**
```
routes/pdf.js → controllers/pdfController.js
```

**Phase 2 Pattern (New):**
```
routes/auth.js → api/auth.js
```

**Reason:** Historical evolution  
**Impact:** None - only affects organization  
**Future:** Will consolidate in Phase 3

---

## 🎯 Important Rules

1. **DO NOT** modify MVP code without testing
2. **DO NOT** remove `controllers/` folder
3. **DO** add new features to `api/` folder
4. **DO** test both MVP and Phase 2 after changes

---

## 📊 Quick Reference

| Feature | MVP | Phase 2 |
|---------|-----|---------|
| PDF Generation | controllers/pdfController.js | Uses TemplateEngine |
| Payment | controllers/paymentController.js | Phase 4 |
| Auth | N/A | api/auth.js + middleware/auth.js |
| Sessions | N/A | api/sessions.js |
| Profiles | N/A | api/userProfiles.js |
| Legal Docs | N/A | api/legalDocuments.js |

---

**Last Updated:** 2025-12-11  
**Phase:** 2 (70% complete)  
**MVP Status:** Protected & Stable
