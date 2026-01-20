#!/usr/bin/env node
/**
 * Utah Rent Increase PDF Generation Test
 * Task 3.3.9: Test PDF Generation
 *
 * Tests:
 * 1. Generate preview PDF (with watermark)
 * 2. Generate final PDF (no watermark)
 * 3. Verify PDF file size reasonable (<500KB)
 * 4. Verify PDF files created successfully
 *
 * Usage:
 *   node test-rent-increase-pdf.js
 *
 * Output:
 *   - backend/test-output/utah-rent-increase-preview.pdf
 *   - backend/test-output/utah-rent-increase-final.pdf
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Import templates
const utahRentIncreaseV1 = require('./src/templates/utah-rent-increase-v1');
const utahRentIncreasePreviewV1 = require('./src/templates/utah-rent-increase-preview-v1');

// Test data
const testData = {
  // Property fields
  street: '123 Main Street',
  city: 'Salt Lake City',
  state: 'UT',
  zipCode: '84101',
  unitNumber: 'Apt 2B',

  // Tenant fields
  tenantNames: 'John Doe, Jane Doe',

  // Landlord fields
  landlordName: 'ABC Property Management',
  landlordPhone: '(801) 555-1234',
  landlordEmail: 'contact@abcproperty.com',

  // Lease/Financial fields
  leaseType: 'month-to-month',
  currentRent: 1200.00,
  newRent: 1350.00,

  // Date fields
  noticeDate: '2025-12-01',
  effectiveDate: '2025-12-20',

  // Optional fields
  reasonForIncrease: 'Annual market rate adjustment to align with comparable properties in the area.',
  paymentInstructions: 'Pay online at tenant.abcproperty.com or mail check to 456 Office Blvd, Salt Lake City, UT 84102.'
};

const outputDir = path.join(__dirname, 'test-output');

async function generatePDF(html, outputPath, label) {
  console.log(`\nGenerating ${label}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    });

    // Ensure pdfBuffer is a proper Buffer
    const buffer = Buffer.from(pdfBuffer);
    fs.writeFileSync(outputPath, buffer);

    const fileSizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`  ✓ ${label} created: ${outputPath}`);
    console.log(`  ✓ File size: ${fileSizeKB} KB`);

    return {
      success: true,
      path: outputPath,
      size: buffer.length,
      sizeKB: parseFloat(fileSizeKB)
    };
  } catch (error) {
    console.error(`  ✗ Error generating ${label}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Utah Rent Increase PDF Generation Test');
  console.log('Task 3.3.9: Test PDF Generation');
  console.log('='.repeat(60));

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`\nCreated output directory: ${outputDir}`);
  }

  const results = {
    preview: null,
    final: null
  };

  // Test 1: Generate preview HTML
  console.log('\n--- Test 1: Render Preview Template ---');
  let previewHtml;
  try {
    previewHtml = utahRentIncreasePreviewV1.render(testData);
    console.log('  ✓ Preview template rendered successfully');
    console.log(`  ✓ HTML length: ${previewHtml.length} characters`);

    if (previewHtml.includes('PREVIEW') && previewHtml.includes('NOT FOR LEGAL USE')) {
      console.log('  ✓ Watermark text present');
    } else {
      console.log('  ✗ Watermark text missing!');
    }
  } catch (error) {
    console.error(`  ✗ Error rendering preview: ${error.message}`);
    process.exit(1);
  }

  // Test 2: Generate final HTML
  console.log('\n--- Test 2: Render Final Template ---');
  let finalHtml;
  try {
    finalHtml = utahRentIncreaseV1.render(testData);
    console.log('  ✓ Final template rendered successfully');
    console.log(`  ✓ HTML length: ${finalHtml.length} characters`);

    // Verify key content
    const checks = [
      ['NOTICE OF RENT INCREASE', 'Title'],
      ['$1,200.00', 'Current rent'],
      ['$1,350.00', 'New rent'],
      ['$150.00', 'Increase amount'],
      ['12.5%', 'Increase percentage'],
      ['John Doe, Jane Doe', 'Tenant names'],
      ['§57-22-4', 'Utah Code reference'],
      ['Non-Retaliation Protection', 'Retaliation clause']
    ];

    for (const [content, label] of checks) {
      if (finalHtml.includes(content)) {
        console.log(`  ✓ ${label}: ${content}`);
      } else {
        console.log(`  ✗ ${label} missing: ${content}`);
      }
    }
  } catch (error) {
    console.error(`  ✗ Error rendering final: ${error.message}`);
    process.exit(1);
  }

  // Test 3: Generate Preview PDF
  console.log('\n--- Test 3: Generate Preview PDF ---');
  const previewPath = path.join(outputDir, 'utah-rent-increase-preview.pdf');
  results.preview = await generatePDF(previewHtml, previewPath, 'Preview PDF');

  // Test 4: Generate Final PDF
  console.log('\n--- Test 4: Generate Final PDF ---');
  const finalPath = path.join(outputDir, 'utah-rent-increase-final.pdf');
  results.final = await generatePDF(finalHtml, finalPath, 'Final PDF');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  let allPassed = true;

  // Preview PDF checks
  console.log('\nPreview PDF:');
  if (results.preview.success) {
    console.log('  ✓ Generated successfully');
    if (results.preview.sizeKB < 500) {
      console.log(`  ✓ File size OK (${results.preview.sizeKB} KB < 500 KB)`);
    } else {
      console.log(`  ✗ File size too large (${results.preview.sizeKB} KB >= 500 KB)`);
      allPassed = false;
    }
  } else {
    console.log(`  ✗ Failed: ${results.preview.error}`);
    allPassed = false;
  }

  // Final PDF checks
  console.log('\nFinal PDF:');
  if (results.final.success) {
    console.log('  ✓ Generated successfully');
    if (results.final.sizeKB < 500) {
      console.log(`  ✓ File size OK (${results.final.sizeKB} KB < 500 KB)`);
    } else {
      console.log(`  ✗ File size too large (${results.final.sizeKB} KB >= 500 KB)`);
      allPassed = false;
    }
  } else {
    console.log(`  ✗ Failed: ${results.final.error}`);
    allPassed = false;
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('ALL TESTS PASSED ✓');
    console.log('='.repeat(60));
    console.log('\nOutput files:');
    console.log(`  Preview: ${previewPath}`);
    console.log(`  Final:   ${finalPath}`);
    console.log('\nOpen these files to visually verify:');
    console.log('  - Preview has "PREVIEW - NOT FOR LEGAL USE" watermark');
    console.log('  - Final has no watermark');
    console.log('  - All 19 fields display correctly');
    console.log('  - Legal language is present');
    process.exit(0);
  } else {
    console.log('SOME TESTS FAILED ✗');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
