# Task 3.3 Field Verification Checklist

**Task:** 3.3.10 - Verify All Fields Display Correctly
**Document:** Utah Rent Increase Notice
**Date:** _______________
**Tester:** _______________

---

## Test Data Used

| Field | Value |
|-------|-------|
| street | 123 Main Street |
| city | Salt Lake City |
| state | UT |
| zipCode | 84101 |
| unitNumber | Apt 2B |
| tenantNames | John Doe, Jane Doe |
| landlordName | ABC Property Management |
| landlordPhone | (801) 555-1234 |
| landlordEmail | contact@abcproperty.com |
| leaseType | month-to-month |
| currentRent | $1,200.00 |
| newRent | $1,350.00 |
| noticeDate | December 1, 2025 |
| effectiveDate | December 20, 2025 |
| reasonForIncrease | Annual market rate adjustment... |
| paymentInstructions | Pay online at tenant.abcproperty.com... |

**Calculated Values:**
| Field | Expected Value |
|-------|----------------|
| increaseAmount | $150.00 |
| increasePercentage | 12.5% |
| daysNotice | 19 days |

---

## 1. Property Fields (5 fields)

| # | Field ID | Expected Display | Pass/Fail | Notes |
|---|----------|------------------|-----------|-------|
| 1.1 | street | 123 Main Street | [ ] | In address line |
| 1.2 | city | Salt Lake City | [ ] | In address line |
| 1.3 | state | UT | [ ] | In address line |
| 1.4 | zipCode | 84101 | [ ] | In address line |
| 1.5 | unitNumber | Unit Apt 2B | [ ] | Optional - displays when provided |

**Address Format Check:**
- [ ] Full address displays as: "123 Main Street, Unit Apt 2B, Salt Lake City, UT, 84101"
- [ ] Without unit: "789 Oak Ave, Provo, UT, 84601"

---

## 2. Tenant Fields (1 field)

| # | Field ID | Expected Display | Pass/Fail | Notes |
|---|----------|------------------|-----------|-------|
| 2.1 | tenantNames | John Doe, Jane Doe | [ ] | After "TO:" label |

---

## 3. Landlord Fields (3 fields)

| # | Field ID | Expected Display | Pass/Fail | Notes |
|---|----------|------------------|-----------|-------|
| 3.1 | landlordName | ABC Property Management | [ ] | Header & footer |
| 3.2 | landlordPhone | (801) 555-1234 | [ ] | Header & footer |
| 3.3 | landlordEmail | contact@abcproperty.com | [ ] | Optional - displays when provided |

---

## 4. Lease/Financial Fields (5 fields)

| # | Field ID | Expected Display | Format | Pass/Fail | Notes |
|---|----------|------------------|--------|-----------|-------|
| 4.1 | leaseType | month-to-month | text | [ ] | In notice period section |
| 4.2 | currentRent | $1,200.00 | currency | [ ] | In info box |
| 4.3 | newRent | $1,350.00 | currency | [ ] | In info box |
| 4.4 | increaseAmount | $150.00 | calculated | [ ] | Calculated: newRent - currentRent |
| 4.5 | increasePercentage | 12.5% | calculated | [ ] | Calculated: (increase/current)*100 |

**Currency Format Check:**
- [ ] Includes $ symbol
- [ ] Includes thousands separator (comma)
- [ ] Shows 2 decimal places
- [ ] Large amounts format correctly (e.g., $999,999.99)

---

## 5. Date Fields (3 fields)

| # | Field ID | Expected Display | Format | Pass/Fail | Notes |
|---|----------|------------------|--------|-----------|-------|
| 5.1 | noticeDate | December 1, 2025 | Month DD, YYYY | [ ] | After "DATE OF NOTICE:" |
| 5.2 | effectiveDate | December 20, 2025 | Month DD, YYYY | [ ] | In info box |
| 5.3 | daysNotice | 19 days | calculated | [ ] | In notice period section |

**Date Format Check:**
- [ ] Full month name (not abbreviated)
- [ ] Day without leading zero
- [ ] 4-digit year
- [ ] Days notice calculated correctly

---

## 6. Optional Fields (2 fields)

| # | Field ID | When Provided | When Missing | Pass/Fail |
|---|----------|---------------|--------------|-----------|
| 6.1 | reasonForIncrease | Shows "Reason for Increase" section | Section hidden | [ ] |
| 6.2 | paymentInstructions | Shows "Payment Instructions" section | Section hidden | [ ] |

**Optional Field Tests:**
- [ ] With all optional fields: All sections visible
- [ ] With no optional fields: Sections hidden cleanly (no empty headers)
- [ ] No "undefined" or "null" displayed anywhere

---

## 7. Legal Language Verification

| # | Requirement | Present | Pass/Fail |
|---|-------------|---------|-----------|
| 7.1 | Utah Code §57-22-4 (Notice Requirements) | [ ] | [ ] |
| 7.2 | Utah Code §57-22-5 (Rent Increases) | [ ] | [ ] |
| 7.3 | Utah Code §57-22-6 (Retaliatory Conduct) | [ ] | [ ] |
| 7.4 | Tenant rights section | [ ] | [ ] |
| 7.5 | Non-retaliation statement | [ ] | [ ] |
| 7.6 | Continue tenancy option | [ ] | [ ] |
| 7.7 | Terminate tenancy option | [ ] | [ ] |
| 7.8 | Notice period requirement (15 days) | [ ] | [ ] |
| 7.9 | LeaseLogic legal disclaimer | [ ] | [ ] |

---

## 8. Preview Template Verification

| # | Check | Pass/Fail | Notes |
|---|-------|-----------|-------|
| 8.1 | Watermark text: "PREVIEW" | [ ] | |
| 8.2 | Watermark text: "NOT FOR LEGAL USE" | [ ] | |
| 8.3 | Watermark diagonal (-45deg rotation) | [ ] | |
| 8.4 | Watermark semi-transparent | [ ] | |
| 8.5 | Watermark doesn't obstruct content | [ ] | |
| 8.6 | All content same as final template | [ ] | |

---

## 9. PDF Generation Verification

| # | Check | Preview PDF | Final PDF |
|---|-------|-------------|-----------|
| 9.1 | PDF generates successfully | [ ] | [ ] |
| 9.2 | PDF opens without errors | [ ] | [ ] |
| 9.3 | File size < 500KB | [ ] | [ ] |
| 9.4 | All fields visible | [ ] | [ ] |
| 9.5 | Formatting preserved | [ ] | [ ] |
| 9.6 | Watermark present | [ ] | N/A |
| 9.7 | No watermark | N/A | [ ] |

---

## Summary

### Field Count
| Category | Count | Verified |
|----------|-------|----------|
| Property Fields | 5 | [ ] / 5 |
| Tenant Fields | 1 | [ ] / 1 |
| Landlord Fields | 3 | [ ] / 3 |
| Lease/Financial Fields | 5 | [ ] / 5 |
| Date Fields | 3 | [ ] / 3 |
| Optional Fields | 2 | [ ] / 2 |
| **Total** | **19** | **[ ] / 19** |

### Overall Results
| Test Category | Pass | Fail |
|---------------|------|------|
| Required Fields | | |
| Optional Fields | | |
| Currency Formatting | | |
| Date Formatting | | |
| Calculated Fields | | |
| Legal Language | | |
| Preview Watermark | | |
| PDF Generation | | |

---

## Issues Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| | | | |
| | | | |
| | | | |

---

## Sign-Off

- [ ] All 19 fields verified
- [ ] All formatting correct
- [ ] Legal language complete
- [ ] Preview watermark working
- [ ] PDF generation successful

**Verification Complete:** [ ] Yes / [ ] No

**Tester Signature:** _______________
**Date:** _______________

---

## Next Steps

After verification complete:
1. Document any issues in PROJECT-STATUS.md
2. Create legal review document (Task 3.3.11)
3. Proceed to Task 3.4: Document Selector UI
