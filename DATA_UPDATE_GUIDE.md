# Data Update Guide

This guide explains how to update the rug database when you have new data (e.g., 3,000 new rugs, updated prices).

## Quick Update Process

### Option 1: Automated (Recommended)

1. **Replace the Excel file**
   - Replace `HM_Rug_Master.xlsx` (or `HM_Rug_Master_Complete.xlsx` for backwards compatibility) with your updated Excel file
   - Make sure it has the same column structure:
     - Vendor
     - Collection Name
     - VPN (replaces Design ID)
     - Size
     - Primary Color
     - UPC
     - Retail (replaces Retail Price)
     - product_id (replaces HM SKU, optional)

2. **Run the conversion script**
   ```bash
   npm run convert-data
   ```
   This will automatically:
   - Convert the Excel file to JSON
   - Validate column names
   - Generate `public/data.json`
   - Show you how many rows were converted

3. **Test locally** (optional but recommended)
   ```bash
   npm start
   ```
   Open http://localhost:3000 and verify the data looks correct

4. **Build and deploy**
   ```bash
   npm run build
   git add .
   git commit -m "Update rug database with new data"
   git push
   ```
   GitHub Actions will automatically deploy the updated site.

### Option 2: One-Command Update

If you want to convert and build in one step:
```bash
npm run update-data
```

Then commit and push:
```bash
git add .
git commit -m "Update rug database"
git push
```

## What the Script Does

The `convert-excel-to-json.js` script:
- ✅ Reads your Excel file
- ✅ Validates that expected columns exist
- ✅ Converts to JSON format
- ✅ Saves to `public/data.json`
- ✅ Shows you statistics (row count, file size)
- ✅ Warns if columns are missing

## Troubleshooting

### "Excel file not found"
- Make sure `HM_Rug_Master_Complete.xlsx` is in the root directory
- Check the filename matches exactly (case-sensitive)

### "Some expected columns are missing"
- The script will still work, but you may need to update the code if you're using those columns
- Check that your Excel file has the same column headers

### Large files (3k+ rugs)
- The script handles large files efficiently
- JSON file size will be larger, but the site will still load fine
- If the JSON file is very large (>10MB), consider data pagination in the future

## Column Requirements

Your Excel file must have these columns (exact names):
- `Vendor` - Brand name
- `Collection Name` - Collection identifier
- `VPN` - Vendor Product Number (replaces Design ID)
- `Size` - Rug size
- `Primary Color` - Color name
- `UPC` - Universal Product Code
- `Retail` - Price (number, replaces Retail Price)
- `product_id` - Product identifier (optional, can be empty, replaces HM SKU)

## Notes

- The Excel file is **not** deployed to the website (only the JSON is)
- You can keep the Excel file in the repository or add it to `.gitignore` if it's too large
- The conversion script preserves all data types (numbers stay numbers, strings stay strings)
- Empty cells become `null` or empty strings in JSON

## Future Improvements

If you need to update data frequently, consider:
- Setting up a scheduled job to auto-update
- Using a database instead of JSON for very large datasets
- Adding data validation rules
- Creating a web interface for updates

