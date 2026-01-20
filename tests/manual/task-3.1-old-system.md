# Task 3.1 Test Checklist: Old System (Flag OFF)

**Task:** 3.1 - Migrate 3-Day Notice to New System
**Subtask:** 3.1.7 - Test Old System
**Date:** _______________
**Tester:** _______________

---

## Prerequisites

1. Ensure `.env` has:
   ```
   REACT_APP_USE_NEW_DOCUMENT_SYSTEM=false
   ```

2. Restart the React development server:
   ```bash
   npm start
   ```

3. Open browser console (F12) to verify:
   ```
   [Task 3.1] Using LEGACY hardcoded system
   ```

---

## Test Data

Use this consistent test data for all tests:

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

### 1. Form Rendering

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1.1 | Load form page | Form displays with all sections | [ ] |
| 1.2 | Property Address section visible | Street, City, State, ZIP fields shown | [ ] |
| 1.3 | Tenant & Landlord section visible | All 4 fields shown | [ ] |
| 1.4 | Financial section visible | Amount and Due Date fields shown | [ ] |
| 1.5 | Notice Date section visible | Date picker shown | [ ] |
| 1.6 | State field disabled | Shows "UT", cannot edit | [ ] |
| 1.7 | Submit button initially disabled | Gray, cursor-not-allowed | [ ] |

### 2. Field Validation - Required Fields

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 2.1 | Leave Street empty, blur | Error: "Street address is required" | [ ] |
| 2.2 | Leave City empty, blur | Error: "City is required" | [ ] |
| 2.3 | Leave ZIP empty, blur | Error: "ZIP code is required" | [ ] |
| 2.4 | Leave Tenant Names empty | Error: "Tenant name(s) required" | [ ] |
| 2.5 | Leave Landlord Name empty | Error: "Landlord name is required" | [ ] |
| 2.6 | Leave Landlord Phone empty | Error: "Landlord phone is required" | [ ] |
| 2.7 | Leave Landlord Email empty | Error: "Landlord email is required" | [ ] |
| 2.8 | Leave Past-Due Amount empty | Error: "Past-due amount is required" | [ ] |
| 2.9 | Leave Original Due Date empty | Error: "Original due date is required" | [ ] |
| 2.10 | Leave Notice Date empty | Error: "Notice date is required" | [ ] |

### 3. Field Validation - Format Validation

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 3.1 | Enter invalid ZIP "1234" | Error: "Invalid ZIP code format" | [ ] |
| 3.2 | Enter valid ZIP "84101" | No error, field accepted | [ ] |
| 3.3 | Enter valid ZIP "84101-1234" | No error, field accepted | [ ] |
| 3.4 | Enter invalid email "test" | Error: "Invalid email format" | [ ] |
| 3.5 | Enter valid email "test@test.com" | No error, field accepted | [ ] |
| 3.6 | Enter invalid phone "abc" | Error: "Invalid phone format" | [ ] |
| 3.7 | Enter valid phone "(801) 555-1234" | No error, phone formatted | [ ] |
| 3.8 | Enter amount "0" | Error: "Amount must be greater than $0" | [ ] |
| 3.9 | Enter amount "-100" | Error: "Amount must be greater than $0" | [ ] |
| 3.10 | Enter amount "1500.00" | No error, field accepted | [ ] |

### 4. Real-Time Validation

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 4.1 | Type in Street field | Validation runs on each keystroke | [ ] |
| 4.2 | Fix an error | Error message disappears immediately | [ ] |
| 4.3 | Fill all required fields | Submit button becomes enabled (blue) | [ ] |
| 4.4 | Clear a required field | Submit button becomes disabled (gray) | [ ] |

### 5. Phone Formatting

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 5.1 | Type "8015551234" | Auto-formats to "(801) 555-1234" | [ ] |
| 5.2 | Type partial "801555" | Partial format applied | [ ] |

### 6. Currency Input

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 6.1 | Type "$1,500" | Cleaned to "1500" (digits only) | [ ] |
| 6.2 | Type "1500.50" | Accepted as-is | [ ] |
| 6.3 | $ prefix visible | Shows $ before input | [ ] |

### 7. Preview Generation

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 7.1 | Fill all fields, click "Generate Preview" | Preview appears below form | [ ] |
| 7.2 | Preview has watermark | "DRAFT - NOT LEGAL" diagonal text | [ ] |
| 7.3 | Preview shows landlord header | Name, phone, email at top | [ ] |
| 7.4 | Preview shows legal title | "NOTICE TO PAY RENT OR VACATE PREMISES" | [ ] |
| 7.5 | Preview shows Utah Code reference | "(Utah Code § 78B-6-802)" | [ ] |
| 7.6 | Preview shows tenant info | TO: [tenant names] | [ ] |
| 7.7 | Preview shows property address | Full formatted address | [ ] |
| 7.8 | Preview shows amount | "$1,500.00" formatted | [ ] |
| 7.9 | Preview shows amount in words | "one thousand five hundred dollars" | [ ] |
| 7.10 | Preview shows dates | Formatted as "January 1, 2024" | [ ] |
| 7.11 | Preview shows signature lines | Blank lines for signatures | [ ] |
| 7.12 | Preview shows Certificate of Service | Service section at bottom | [ ] |

### 8. PDF Download - Preview

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 8.1 | Click "Download PDF Preview" | Disclaimer modal appears | [ ] |
| 8.2 | Accept disclaimer | PDF downloads | [ ] |
| 8.3 | PDF filename | "utah-3day-notice-preview.pdf" | [ ] |
| 8.4 | PDF has watermark | "DRAFT" watermark visible | [ ] |
| 8.5 | PDF content matches preview | All fields correct | [ ] |

### 9. PDF Download - Final (Test Mode)

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 9.1 | Click "TEST: Download Final PDF" | Disclaimer modal appears | [ ] |
| 9.2 | Accept disclaimer | PDF downloads | [ ] |
| 9.3 | PDF filename | "utah-3day-notice-final.pdf" | [ ] |
| 9.4 | PDF has NO watermark | Clean, official document | [ ] |
| 9.5 | PDF content complete | All fields correct | [ ] |

### 10. Console Output

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 10.1 | Open browser console | No JavaScript errors | [ ] |
| 10.2 | Check for Task 3.1 log | "[Task 3.1] Using LEGACY hardcoded system" | [ ] |
| 10.3 | Submit valid form | "Form is valid, preview is live!" logged | [ ] |

---

## Test Summary

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| Form Rendering | 7 | | |
| Required Validation | 10 | | |
| Format Validation | 10 | | |
| Real-Time Validation | 4 | | |
| Phone Formatting | 2 | | |
| Currency Input | 3 | | |
| Preview Generation | 12 | | |
| PDF Preview | 5 | | |
| PDF Final | 5 | | |
| Console Output | 3 | | |
| **TOTAL** | **61** | | |

---

## Issues Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| | | | |
| | | | |
| | | | |

---

## Sign-Off

- [ ] All tests passed
- [ ] No blocking issues
- [ ] Ready for new system testing

**Tester Signature:** _______________
**Date:** _______________
