# Task 3.1 Output Comparison Report

**Task:** 3.1 - Migrate 3-Day Notice to New System
**Subtask:** 3.1.9 - Compare Outputs
**Date:** _______________
**Tester:** _______________

---

## Objective

Compare OLD system (flag OFF) vs NEW system (flag ON) outputs.
**CRITICAL:** Outputs must be 100% identical.

---

## Test Data (Use for Both Systems)

| Field | Value |
|-------|-------|
| Street Address | 123 Main Street |
| City | Salt Lake City |
| State | UT |
| ZIP Code | 84101 |
| Tenant Name(s) | John Doe, Jane Doe |
| Landlord/Agent Name | ABC Property Management |
| Landlord Phone | (801) 555-1234 |
| Landlord Email | landlord@example.com |
| Past-Due Amount | 1500.00 |
| Original Due Date | 2024-01-01 |
| Notice Date | 2024-01-15 |

---

## Test Procedure

### Step 1: Generate Old System Output
1. Set `.env`: `REACT_APP_USE_NEW_DOCUMENT_SYSTEM=false`
2. Restart app: `npm start`
3. Fill form with test data above
4. Take screenshot of preview
5. Download preview PDF (save as `old-system-preview.pdf`)
6. Download final PDF (save as `old-system-final.pdf`)
7. Record validation error messages

### Step 2: Generate New System Output
1. Set `.env`: `REACT_APP_USE_NEW_DOCUMENT_SYSTEM=true`
2. Restart app: `npm start`
3. Fill form with IDENTICAL test data
4. Take screenshot of preview
5. Download preview PDF (save as `new-system-preview.pdf`)
6. Download final PDF (save as `new-system-final.pdf`)
7. Record validation error messages

### Step 3: Compare Outputs
Use the checklists below to verify identical output.

---

## Visual Comparison: Form

| Element | Old System | New System | Identical? |
|---------|------------|------------|------------|
| **Property Address Section** | | | |
| Section header text | | | [ ] |
| Street field label | | | [ ] |
| City field label | | | [ ] |
| State field (disabled) | | | [ ] |
| ZIP field label | | | [ ] |
| **Tenant/Landlord Section** | | | |
| Section header text | | | [ ] |
| Tenant Names label | | | [ ] |
| Landlord Name label | | | [ ] |
| Landlord Phone label | | | [ ] |
| Landlord Email label | | | [ ] |
| **Financial Section** | | | |
| Section header text | | | [ ] |
| Past-Due Amount label | | | [ ] |
| $ prefix visible | | | [ ] |
| Help text (Utah law) | | | [ ] |
| Original Due Date label | | | [ ] |
| **Notice Date Section** | | | |
| Section header text | | | [ ] |
| Date label | | | [ ] |
| **Buttons** | | | |
| Generate Preview button | | | [ ] |
| Download PDF Preview button | | | [ ] |
| Purchase button | | | [ ] |
| Test download button | | | [ ] |

---

## Visual Comparison: Preview

| Element | Old System | New System | Identical? |
|---------|------------|------------|------------|
| **Watermark** | | | |
| Text content | "DRAFT - NOT LEGAL" | | [ ] |
| Position (diagonal) | | | [ ] |
| Color (red, opacity) | | | [ ] |
| **Header** | | | |
| Landlord name | | | [ ] |
| Phone number | | | [ ] |
| Email address | | | [ ] |
| **Title** | | | |
| Main title text | | | [ ] |
| Utah Code reference | | | [ ] |
| **Recipient Info** | | | |
| "TO:" line | | | [ ] |
| "PROPERTY ADDRESS:" line | | | [ ] |
| "DATE OF NOTICE:" line | | | [ ] |
| **Demand for Payment** | | | |
| Header text | | | [ ] |
| Legal paragraph | | | [ ] |
| Amount (formatted) | "$1,500.00" | | [ ] |
| Amount (words) | | | [ ] |
| Original due date | | | [ ] |
| **Pay or Vacate** | | | |
| Header text | | | [ ] |
| Option 1 text | | | [ ] |
| Option 2 text | | | [ ] |
| Failure paragraph | | | [ ] |
| **Signature Section** | | | |
| Header text | | | [ ] |
| Landlord name | | | [ ] |
| Signature line | | | [ ] |
| Date line | | | [ ] |
| Phone line | | | [ ] |
| Email line | | | [ ] |
| **Certificate of Service** | | | |
| Header text | | | [ ] |
| Instructions | | | [ ] |
| Date Served line | | | [ ] |
| Method of Service line | | | [ ] |
| Signature line | | | [ ] |

---

## Validation Message Comparison

| Validation | Old System Message | New System Message | Identical? |
|------------|-------------------|-------------------|------------|
| Empty street | | | [ ] |
| Empty city | | | [ ] |
| Invalid ZIP | | | [ ] |
| Empty tenant | | | [ ] |
| Empty landlord name | | | [ ] |
| Invalid phone | | | [ ] |
| Invalid email | | | [ ] |
| Amount = 0 | | | [ ] |
| Empty due date | | | [ ] |
| Empty notice date | | | [ ] |

---

## PDF Comparison

### File Size Comparison

| PDF | Old System | New System | Difference |
|-----|------------|------------|------------|
| Preview PDF | _____ KB | _____ KB | _____ % |
| Final PDF | _____ KB | _____ KB | _____ % |

**Acceptable:** Within 5% difference

### Visual Comparison (Side-by-Side)

Open both PDFs side-by-side and compare:

| Element | Old System | New System | Identical? |
|---------|------------|------------|------------|
| Page layout | | | [ ] |
| Font styles | | | [ ] |
| Text alignment | | | [ ] |
| Watermark (preview) | | | [ ] |
| All text content | | | [ ] |
| Line spacing | | | [ ] |
| Margins | | | [ ] |

### Content Verification

| Content | Old PDF Value | New PDF Value | Match? |
|---------|---------------|---------------|--------|
| Tenant names | | | [ ] |
| Property address | | | [ ] |
| Landlord name | | | [ ] |
| Landlord phone | | | [ ] |
| Landlord email | | | [ ] |
| Past due amount | | | [ ] |
| Amount in words | | | [ ] |
| Original due date | | | [ ] |
| Notice date | | | [ ] |

---

## Behavioral Comparison

| Behavior | Old System | New System | Identical? |
|----------|------------|------------|------------|
| Real-time validation speed | | | [ ] |
| Phone auto-formatting | | | [ ] |
| Currency input cleaning | | | [ ] |
| Button enable/disable | | | [ ] |
| Error message display | | | [ ] |
| Error message clearing | | | [ ] |
| Preview generation | | | [ ] |
| PDF download | | | [ ] |

---

## Summary

### Comparison Results

| Category | Total Items | Identical | Different |
|----------|-------------|-----------|-----------|
| Form Elements | | | |
| Preview Elements | | | |
| Validation Messages | | | |
| PDF Content | | | |
| Behavior | | | |
| **TOTAL** | | | |

### Differences Found

| # | Element | Old System | New System | Severity | Action |
|---|---------|------------|------------|----------|--------|
| | | | | | |
| | | | | | |
| | | | | | |

**Severity Levels:**
- **Critical:** Blocks release, must fix
- **Major:** Noticeable difference, should fix
- **Minor:** Small difference, can defer
- **None:** Acceptable variation

---

## Conclusion

- [ ] **PASS:** All outputs are 100% identical
- [ ] **FAIL:** Differences found (see above)

### If FAIL:
List required fixes before proceeding:
1. _______________
2. _______________
3. _______________

---

## Attachments

- [ ] old-system-preview.pdf
- [ ] new-system-preview.pdf
- [ ] old-system-final.pdf
- [ ] new-system-final.pdf
- [ ] Screenshot: Old system preview
- [ ] Screenshot: New system preview
- [ ] Screenshot: Old system form
- [ ] Screenshot: New system form

---

## Sign-Off

- [ ] All comparisons complete
- [ ] Outputs are identical (or differences documented)
- [ ] Ready for regression testing

**Tester Signature:** _______________
**Date:** _______________
