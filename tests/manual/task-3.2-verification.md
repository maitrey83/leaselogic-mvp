# Task 3.2 Verification Checklist: Utah Rent Increase Document Definition

**Task:** 3.2 - Create Utah Rent Increase Document Definition
**Subtask:** 3.2.10 - Verify Document Loads Correctly
**Date:** _______________
**Tester:** _______________

---

## Prerequisites

1. Ensure the frontend is running:
   ```bash
   cd /Users/maitreypatel/Documents/LeaseLogic
   npm start
   ```

2. Open browser developer console (F12)

3. Ensure `.env.local` has:
   ```
   REACT_APP_USE_NEW_DOCUMENT_SYSTEM=false
   REACT_APP_RENT_INCREASE=false
   ```

---

## 1. Document Definition Verification

### 1.1 File Exists
| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 1.1.1 | File exists | `src/config/documents/utah-rent-increase.js` | [ ] |
| 1.1.2 | File exports default object | `export default { ... }` | [ ] |

### 1.2 Document Metadata
| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 1.2.1 | Document ID | `utah-rent-increase` | [ ] |
| 1.2.2 | Document Name | `Utah Rent Increase Notice` | [ ] |
| 1.2.3 | State | `UT` | [ ] |
| 1.2.4 | Version | `1.0` or higher | [ ] |
| 1.2.5 | Description | Non-empty string | [ ] |

### 1.3 Pricing
| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 1.3.1 | Preview price | `0` (free) | [ ] |
| 1.3.2 | Final PDF price | `7.99` | [ ] |

### 1.4 Templates
| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 1.4.1 | Preview template | Contains `rent-increase` | [ ] |
| 1.4.2 | Final template | Contains `rent-increase` | [ ] |

### 1.5 Legal References
| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 1.5.1 | Has legalReferences | Array with entries | [ ] |
| 1.5.2 | References Utah Code | Contains `57-22` | [ ] |

---

## 2. Fields Verification

### 2.1 Field Count
| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 2.1.1 | Total fields | At least 15 fields | [ ] |
| 2.1.2 | Required fields | At least 10 required | [ ] |
| 2.1.3 | Calculated fields | At least 3 calculated | [ ] |

### 2.2 Property Fields
| # | Field ID | Type | Required | Pass/Fail |
|---|----------|------|----------|-----------|
| 2.2.1 | street/propertyAddress | text | Yes | [ ] |
| 2.2.2 | city | text | Yes | [ ] |
| 2.2.3 | state | text | Yes (default: UT) | [ ] |
| 2.2.4 | zipCode | text | Yes | [ ] |
| 2.2.5 | unitNumber | text | No (optional) | [ ] |

### 2.3 Tenant Fields
| # | Field ID | Type | Required | Pass/Fail |
|---|----------|------|----------|-----------|
| 2.3.1 | tenantNames | text | Yes | [ ] |

### 2.4 Landlord Fields
| # | Field ID | Type | Required | Pass/Fail |
|---|----------|------|----------|-----------|
| 2.4.1 | landlordName | text | Yes | [ ] |
| 2.4.2 | landlordPhone | phone/tel | Yes | [ ] |
| 2.4.3 | landlordEmail | email | No (optional) | [ ] |

### 2.5 Lease/Financial Fields
| # | Field ID | Type | Required | Pass/Fail |
|---|----------|------|----------|-----------|
| 2.5.1 | leaseType | select | Yes | [ ] |
| 2.5.2 | currentRent | currency | Yes | [ ] |
| 2.5.3 | newRent | currency | Yes | [ ] |
| 2.5.4 | increaseAmount | calculated | N/A | [ ] |
| 2.5.5 | increasePercentage | calculated | N/A | [ ] |

### 2.6 Date Fields
| # | Field ID | Type | Required | Pass/Fail |
|---|----------|------|----------|-----------|
| 2.6.1 | noticeDate | date | Yes | [ ] |
| 2.6.2 | effectiveDate | date | Yes | [ ] |
| 2.6.3 | daysNotice | calculated | N/A | [ ] |

---

## 3. Validation Rules Verification

### 3.1 Required Field Validation
| # | Field | Validation | Pass/Fail |
|---|-------|------------|-----------|
| 3.1.1 | street | required: true | [ ] |
| 3.1.2 | city | required: true | [ ] |
| 3.1.3 | tenantNames | required: true | [ ] |
| 3.1.4 | landlordName | required: true | [ ] |
| 3.1.5 | landlordPhone | required: true | [ ] |
| 3.1.6 | currentRent | required: true | [ ] |
| 3.1.7 | newRent | required: true | [ ] |
| 3.1.8 | noticeDate | required: true | [ ] |
| 3.1.9 | effectiveDate | required: true | [ ] |

### 3.2 Pattern Validation
| # | Field | Pattern | Pass/Fail |
|---|-------|---------|-----------|
| 3.2.1 | zipCode | 5-digit Utah ZIP | [ ] |
| 3.2.2 | landlordPhone | (XXX) XXX-XXXX format | [ ] |

### 3.3 Custom Validation
| # | Field | Rule | Pass/Fail |
|---|-------|------|-----------|
| 3.3.1 | newRent | Must be > currentRent | [ ] |
| 3.3.2 | effectiveDate | Must be 15+ days from noticeDate | [ ] |

### 3.4 Currency Validation
| # | Field | Rule | Pass/Fail |
|---|-------|------|-----------|
| 3.4.1 | currentRent | min: 0.01 | [ ] |
| 3.4.2 | newRent | min: 0.01 | [ ] |

---

## 4. Registry Integration Verification

### 4.1 Document Registry
Run in browser console:
```javascript
// Import or access the registry
const doc = documentRegistry.getDocument('utah-rent-increase');
console.log(doc);
```

| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 4.1.1 | Document loads | No error thrown | [ ] |
| 4.1.2 | Document ID correct | `utah-rent-increase` | [ ] |
| 4.1.3 | Fields accessible | `doc.fields` is array | [ ] |

### 4.2 State Filtering
Run in browser console:
```javascript
const utahDocs = documentRegistry.getDocumentsByState('UT');
console.log(utahDocs.map(d => d.id));
```

| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 4.2.1 | Returns array | Array of documents | [ ] |
| 4.2.2 | Contains rent increase | Includes `utah-rent-increase` | [ ] |
| 4.2.3 | Contains 3-day notice | Includes `utah-3day-notice` | [ ] |
| 4.2.4 | At least 2 documents | Length >= 2 | [ ] |

---

## 5. State Configuration Verification

### 5.1 Utah State Config
Check file: `src/config/states/utah.js`

| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 5.1.1 | documents.available | Contains `utah-rent-increase` | [ ] |
| 5.1.2 | rentIncrease config | Has minimumNoticeDays | [ ] |
| 5.1.3 | Month-to-month notice | 15 days | [ ] |
| 5.1.4 | Week-to-week notice | 5 days | [ ] |

---

## 6. Console Verification

### 6.1 No Errors
| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 6.1.1 | Load page | No JavaScript errors | [ ] |
| 6.1.2 | Access document | No undefined errors | [ ] |
| 6.1.3 | Registry operations | No exceptions | [ ] |

---

## 7. Unit Tests

### 7.1 Run Tests
```bash
cd /Users/maitreypatel/Documents/LeaseLogic
npm test -- --testPathPattern="utah-rent-increase.test.js"
```

| # | Check | Expected | Pass/Fail |
|---|-------|----------|-----------|
| 7.1.1 | Tests run | No test errors | [ ] |
| 7.1.2 | Tests pass | All tests green | [ ] |
| 7.1.3 | No skipped tests | 0 skipped | [ ] |

### 7.2 Test Coverage
| # | Category | Tests | Passing |
|---|----------|-------|---------|
| 7.2.1 | Document Loading | 4 | [ ] / 4 |
| 7.2.2 | Document Metadata | 9 | [ ] / 9 |
| 7.2.3 | Pricing | 3 | [ ] / 3 |
| 7.2.4 | Templates | 3 | [ ] / 3 |
| 7.2.5 | Fields | 20+ | [ ] / 20+ |
| 7.2.6 | Validation Rules | 12 | [ ] / 12 |
| 7.2.7 | Field Groups | 5 | [ ] / 5 |
| 7.2.8 | State Integration | 2 | [ ] / 2 |
| 7.2.9 | Consistency | 6 | [ ] / 6 |

---

## Test Summary

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| Document Definition | 5 | | |
| Fields | 17 | | |
| Validation Rules | 13 | | |
| Registry Integration | 7 | | |
| State Configuration | 4 | | |
| Console | 3 | | |
| Unit Tests | 64+ | | |
| **TOTAL** | **113+** | | |

---

## Issues Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| | | | |
| | | | |
| | | | |

---

## Sign-Off

### Verification Complete
- [ ] All manual checks passed
- [ ] All unit tests passing
- [ ] No console errors
- [ ] Document loads correctly in registry
- [ ] State config includes document

### Task 3.2 Status
- [ ] Subtask 3.2.1: Create file ✅
- [ ] Subtask 3.2.2: Define fields ✅
- [ ] Subtask 3.2.3: Validation rules ✅
- [ ] Subtask 3.2.4: Optional fields ✅
- [ ] Subtask 3.2.5: Set pricing ✅
- [ ] Subtask 3.2.6: Reference templates ✅
- [ ] Subtask 3.2.7: Add to registry ✅
- [ ] Subtask 3.2.8: Update state config ✅
- [ ] Subtask 3.2.9: Unit tests ✅
- [ ] Subtask 3.2.10: Verification ✅

**Task 3.2 Complete:** [ ] Yes / [ ] No

**Tester Signature:** _______________
**Date:** _______________

---

## Next Steps

After Task 3.2 is complete:
1. Update PROJECT-STATUS.md
2. Proceed to Task 3.3: Rent Increase Templates (if not already done)
3. Proceed to Task 3.4: Document Selector UI
