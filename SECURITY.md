# Security Notes

## Vulnerability Assessment

This project has some known vulnerabilities in development dependencies. Here's the breakdown:

### Production Risk: **LOW** ✅

**None of these vulnerabilities affect the production website** because:
- Vulnerable packages are **dev dependencies only**
- They are **not included** in the production build
- The production site only serves static files (HTML, CSS, JS, JSON)

### Development Dependencies with Vulnerabilities

#### 1. `xlsx` (High Severity)
- **Used for**: Converting Excel files to JSON (local script only)
- **Risk**: Prototype Pollution and ReDoS vulnerabilities
- **Impact**: Only affects local development when running `npm run convert-data`
- **Mitigation**: 
  - Only run conversion script with trusted Excel files
  - Script runs locally, not on the server
  - Not included in production build
- **Status**: Acceptable risk for dev-only tool

#### 2. `react-scripts` Dependencies (Moderate/High)
- **Used for**: Development server and build process
- **Affected packages**: 
  - `nth-check` (high) - in svgo
  - `postcss` (moderate) - in resolve-url-loader  
  - `webpack-dev-server` (moderate) - dev server only
- **Impact**: Only affects local development
- **Mitigation**: 
  - These are build tools, not runtime dependencies
  - Production build is static files only
  - Vulnerabilities don't affect end users
- **Status**: Acceptable risk for dev-only tools

## Risk Acceptance

These vulnerabilities are **acceptable** because:
1. ✅ All vulnerable packages are **dev dependencies**
2. ✅ They are **not bundled** into production code
3. ✅ The production site is **static files only**
4. ✅ End users are **not exposed** to these vulnerabilities
5. ✅ Only developers running local scripts are affected

## Best Practices

1. **Only run `npm run convert-data` with trusted Excel files**
2. **Keep dependencies updated** when security patches are available
3. **Review npm audit reports** periodically
4. **Don't commit untrusted Excel files** to the repository

## Future Considerations

If you want to reduce vulnerabilities further:
- Consider alternative Excel parsing libraries (e.g., `exceljs`) when they become available
- Monitor for security updates to `react-scripts` and related packages
- Consider migrating to a newer build tool (Vite, etc.) in the future if vulnerabilities persist

## Production Deployment

The production website deployed to GitHub Pages contains:
- ✅ Static HTML, CSS, and JavaScript
- ✅ JSON data file
- ✅ No Node.js dependencies
- ✅ No vulnerable packages

**The production site is safe for end users.**

