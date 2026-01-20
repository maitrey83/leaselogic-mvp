# Task 3.1 Test Checklist: New System (Flag ON)

**Task:** 3.1 - Migrate 3-Day Notice to New System
**Subtask:** 3.1.8 - Test New System
**Date:** _______________
**Tester:** _______________

---

## Prerequisites

1. Update `.env` to enable new system:
   ```
   REACT_APP_USE_NEW_DOCUMENT_SYSTEM=true
   ```

2. Restart the React development server:
   ```bash
   npm start
   ```

3. Open browser console (F12) to verify:
   ```
   [Task 3.1] Using NEW document system
   [Task 3.1] NoticePreview: Using NEW template system
   ```

---

## Test Data

Use IDENTICAL test data as old system tests:

| Field | Value |
|-------|-------|
| Street Address | 123 Main Street |
| City | Salt Lake City |
| State | UT (disabled) |
| ZIP Code | 84101 |
| Tenant Name(s) | John Doe, Jane Doe |
| Landlord/Agent Name | ABC Property Management |
| Landlord Phone | (801) 555-1234 |
| Landlord Email | landlord@example.com |
| Past-Due Amount | 1500.00 |
| Original Due Date | 2024-01-01 |
| Notice Date | 2024-01-15 |

---

## Test Cases

### 1. Document Definition Loading

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1.1 | Check console on page load | "[Task 3.1] Using NEW document system" | [ ] |
| 1.2 | No errors loading document | No "Failed to load document definition" error | [ ] |
| 1.3 | NoticePreview console log | "[Task 3.1] NoticePreview: Using NEW template system" | [ ] |

### 2. Form Rendering (Must Match Old System)

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 2.1 | Load form page | Form displays identical to old system | [ ] |
| 2.2 | Property Address section | Identical layout and labels | [ ] |
| 2.3 | Tenant & Landlord section | Identical layout and labels | [ ] |
| 2.4 | Financial section | Identical layout and labels | [ ] |
| 2.5 | Notice Date section | Identical layout and labels | [ ] |
| 2.6 | State field disabled | Shows "UT", cannot edit | [ ] |
| 2.7 | Submit button styling | Same disabled/enabled states | [ ] |

### 3. ValidationService - Required Fields

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 3.1 | Leave Street empty | Error: "Street address is required" | [ ] |
| 3.2 | Leave City empty | Error: "City is required" | [ ] |
| 3.3 | Leave ZIP empty | Error: "Invalid ZIP code format" or required msg | [ ] |
| 3.4 | Leave Tenant Names empty | Error: "Tenant name(s) required" | [ ] |
| 3.5 | Leave Landlord Name empty | Error: "Landlord name is required" | [ ] |
| 3.6 | Leave Landlord Phone empty | Error: "Invalid phone format" or required msg | [ ] |
| 3.7 | Leave Landlord Email empty | Error: "Invalid email format" or required msg | [ ] |
| 3.8 | Leave Past-Due Amount empty | Error: "Amount must be greater than $0" | [ ] |
| 3.9 | Leave Original Due Date empty | Error: "Original due date is required" | [ ] |
| 3.10 | Leave Notice Date empty | Error: "Notice date is required" | [ ] |

### 4. ValidationService - Pattern Validation

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 4.1 | Enter invalid ZIP "1234" | Error: "Invalid ZIP code format" | [ ] |
| 4.2 | Enter valid ZIP "84101" | No error | [ ] |
| 4.3 | Enter valid ZIP "84101-1234" | No error | [ ] |
| 4.4 | Enter invalid email "test" | Error: "Invalid email format" | [ ] |
| 4.5 | Enter valid email "test@test.com" | No error | [ ] |
| 4.6 | Enter invalid phone "abc" | Error: "Invalid phone format" | [ ] |
| 4.7 | Enter valid phone "(801) 555-1234" | No error | [ ] |

### 5. ValidationService - Min Value

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 5.1 | Enter amount "0" | Error: "Amount must be greater than $0" | [ ] |
| 5.2 | Enter amount "0.001" | Error (below min 0.01) | [ ] |
| 5.3 | Enter amount "0.01" | No error (meets minimum) | [ ] |
| 5.4 | Enter amount "1500.00" | No error | [ ] |

### 6. Real-Time Validation (Must Match Old System)

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 6.1 | Type in fields | Validation runs on each keystroke | [ ] |
| 6.2 | Fix an error | Error disappears immediately | [ ] |
| 6.3 | Fill all required fields | Submit button enables | [ ] |
| 6.4 | Validation timing | Same responsiveness as old system | [ ] |

### 7. Input Formatting (Unchanged)

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 7.1 | Phone auto-format | "8015551234" -> "(801) 555-1234" | [ ] |
| 7.2 | Currency cleaning | "$1,500" -> "1500" | [ ] |
| 7.3 | $ prefix visible | Shows $ before amount input | [ ] |

### 8. Preview Generation (Must Be Identical)

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 8.1 | Generate preview | Preview appears | [ ] |
| 8.2 | Watermark present | "DRAFT - NOT LEGAL" visible | [ ] |
| 8.3 | Header section | Identical to old system | [ ] |
| 8.4 | Title section | Identical to old system | [ ] |
| 8.5 | Recipient info | Identical to old system | [ ] |
| 8.6 | Demand for Payment | Identical to old system | [ ] |
| 8.7 | Pay or Vacate section | Identical to old system | [ ] |
| 8.8 | Signature section | Identical to old system | [ ] |
| 8.9 | Certificate of Service | Identical to old system | [ ] |
| 8.10 | Amount formatting | "$1,500.00" | [ ] |
| 8.11 | Amount in words | Correct conversion | [ ] |
| 8.12 | Date formatting | "January 1, 2024" format | [ ] |

### 9. PDF Generation (Must Be Identical)

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 9.1 | Preview PDF downloads | File downloads successfully | [ ] |
| 9.2 | Preview PDF filename | "utah-3day-notice-preview.pdf" | [ ] |
| 9.3 | Preview PDF content | Matches old system exactly | [ ] |
| 9.4 | Final PDF downloads | File downloads successfully | [ ] |
| 9.5 | Final PDF filename | "utah-3day-notice-final.pdf" | [ ] |
| 9.6 | Final PDF content | Matches old system exactly | [ ] |

### 10. Error Handling

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 10.1 | No console errors | Clean console (except Task 3.1 logs) | [ ] |
| 10.2 | DocumentService loads | No "Document not found" errors | [ ] |
| 10.3 | ValidationService works | No "validateForm undefined" errors | [ ] |
| 10.4 | Graceful degradation | If service fails, no crash | [ ] |

---

## Comparison with Old System

After running tests, compare with old system results:

| Feature | Old System | New System | Match? |
|---------|------------|------------|--------|
| Form layout | | | [ ] |
| Field labels | | | [ ] |
| Validation messages | | | [ ] |
| Error styling | | | [ ] |
| Preview layout | | | [ ] |
| Preview content | | | [ ] |
| PDF output | | | [ ] |

---

## Test Summary

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| Document Loading | 3 | | |
| Form Rendering | 7 | | |
| Required Validation | 10 | | |
| Pattern Validation | 7 | | |
| Min Value Validation | 4 | | |
| Real-Time Validation | 4 | | |
| Input Formatting | 3 | | |
| Preview Generation | 12 | | |
| PDF Generation | 6 | | |
| Error Handling | 4 | | |
| **TOTAL** | **60** | | |

---

## Issues Found

| # | Description | Severity | Matches Old? | Status |
|---|-------------|----------|--------------|--------|
| | | | | |
| | | | | |
| | | | | |

---

## Sign-Off

- [ ] All tests passed
- [ ] Output matches old system
- [ ] No new errors introduced
- [ ] Ready for comparison testing

**Tester Signature:** _______________
**Date:** _______________
