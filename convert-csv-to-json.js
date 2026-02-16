#!/usr/bin/env node

/**
 * CSV to JSON Converter Script
 *
 * This script converts the CSV file (HM_Rug_Master.csv) to data.json
 *
 * Expected CSV columns:
 *   - Vendor
 *   - Collection (mapped to "Collection Name")
 *   - Size
 *   - Design ID
 *   - Long SKU - VPN (mapped to "VPN")
 *   - Primary Color
 *   - UPC
 *   - Retail (stripped of $ and commas, converted to number)
 *   - Product_Id (mapped to "product_id", optional)
 *
 * Usage:
 *   npm run convert-data
 *
 * Or directly:
 *   node convert-csv-to-json.js
 */

const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, 'HM_Rug_Master.csv');
const OUTPUT_FILE = path.join(__dirname, 'public', 'data.json');

// Column mapping: CSV header -> internal JSON key
const COLUMN_MAP = {
  'Vendor': 'Vendor',
  'Collection': 'Collection Name',
  'Size': 'Size',
  'Design ID': 'Design ID',
  'Long SKU - VPN': 'VPN',
  'Primary Color': 'Primary Color',
  'UPC': 'UPC',
  'Retail': 'Retail',
  'Product_Id': 'product_id',
};

// Required CSV columns (must exist)
const REQUIRED_CSV_COLUMNS = [
  'Vendor',
  'Collection',
  'Size',
  'Design ID',
  'Long SKU - VPN',
  'Primary Color',
  'UPC',
  'Retail'
];

// Optional CSV columns
const OPTIONAL_CSV_COLUMNS = [
  'Product_Id'
];

function parseRetail(value) {
  if (!value || value === '') return 0;
  const cleaned = String(value).replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function convertCsvToJson() {
  try {
    console.log('📖 Reading CSV file...');

    if (!fs.existsSync(CSV_FILE)) {
      throw new Error(`CSV file not found: ${CSV_FILE}`);
    }

    console.log(`📄 Using file: ${path.basename(CSV_FILE)}`);

    // Read and parse CSV
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      throw new Error('CSV file appears to be empty');
    }

    console.log(`✅ Found ${records.length} rows in CSV file`);

    // Validate required columns
    const actualColumns = Object.keys(records[0]);
    const missingRequired = REQUIRED_CSV_COLUMNS.filter(col => !actualColumns.includes(col));
    const missingOptional = OPTIONAL_CSV_COLUMNS.filter(col => !actualColumns.includes(col));

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

    // Map rows to internal JSON structure
    const data = records.map(row => {
      const mapped = {};
      for (const [csvCol, jsonKey] of Object.entries(COLUMN_MAP)) {
        let value = row[csvCol];
        if (value === undefined) value = '';

        // Special handling for Retail: strip $ and commas, convert to number
        if (csvCol === 'Retail') {
          value = parseRetail(value);
        }

        mapped[jsonKey] = value;
      }
      return mapped;
    });

    // Check product_id fill rate
    const rowsWithProductId = data.filter(row => row['product_id'] && String(row['product_id']).trim() !== '').length;
    const fillPercentage = ((rowsWithProductId / data.length) * 100).toFixed(1);
    console.log(`ℹ️  product_id column: ${rowsWithProductId} of ${data.length} rows have values (${fillPercentage}%)`);

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
    console.error('❌ Error converting CSV to JSON:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  convertCsvToJson();
}

module.exports = { convertCsvToJson };
