#!/usr/bin/env node

/**
 * Excel to JSON Converter Script
 * 
 * This script converts the Excel file (HM_Rug_Master_Complete.xlsx) to data.json
 * 
 * Usage:
 *   npm run convert-data
 * 
 * Or directly:
 *   node convert-excel-to-json.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, 'HM_Rug_Master_Complete.xlsx');
const OUTPUT_FILE = path.join(__dirname, 'public', 'data.json');

// Required columns (must exist)
const REQUIRED_COLUMNS = [
  'Vendor',
  'Collection Name',
  'Design ID',
  'Size',
  'Primary Color',
  'UPC',
  'Retail Price'
];

// Optional columns (nice to have, but not required)
const OPTIONAL_COLUMNS = [
  'HM SKU'  // Can be empty for many rows
];

function convertExcelToJson() {
  try {
    console.log('📖 Reading Excel file...');
    
    // Check if Excel file exists
    if (!fs.existsSync(EXCEL_FILE)) {
      throw new Error(`Excel file not found: ${EXCEL_FILE}`);
    }

    // Read the Excel file
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get column headers from the worksheet directly (first row of Excel)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const headerRow = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        headerRow.push(cell.v.toString().trim());
      }
    }

    // Convert to JSON (defval ensures empty cells become empty strings, not undefined)
    // This preserves all columns even if they're empty
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      defval: ''  // Empty cells become empty strings, preserving column structure
    });

    if (data.length === 0) {
      throw new Error('Excel file appears to be empty');
    }

    console.log(`✅ Found ${data.length} rows in Excel file`);

    // Check for required columns
    const actualColumns = headerRow.length > 0 ? headerRow : Object.keys(data[0] || {});
    const missingRequired = REQUIRED_COLUMNS.filter(col => !actualColumns.includes(col));
    const missingOptional = OPTIONAL_COLUMNS.filter(col => !actualColumns.includes(col));
    
    if (missingRequired.length > 0) {
      console.error('❌ Error: Required columns are missing:', missingRequired);
      console.error('   Actual columns found:', actualColumns);
      throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
    }
    
    if (missingOptional.length > 0) {
      console.log(`ℹ️  Note: Optional column(s) not found: ${missingOptional.join(', ')}`);
      console.log('   This is okay - the column may be empty or not present');
    }
    
    console.log('✅ All required columns found');
    
    // Check if HM SKU column exists but is mostly empty (which is expected)
    if (actualColumns.includes('HM SKU')) {
      const rowsWithHM_SKU = data.filter(row => row['HM SKU'] && row['HM SKU'].toString().trim() !== '').length;
      const fillPercentage = ((rowsWithHM_SKU / data.length) * 100).toFixed(1);
      console.log(`ℹ️  HM SKU column: ${rowsWithHM_SKU} of ${data.length} rows have values (${fillPercentage}%)`);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');

    console.log(`✅ Successfully converted ${data.length} rows to ${OUTPUT_FILE}`);
    console.log(`📊 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);

    return true;
  } catch (error) {
    console.error('❌ Error converting Excel to JSON:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  convertExcelToJson();
}

module.exports = { convertExcelToJson };

