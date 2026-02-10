# Homemakers Rug Database

A React-based database website built to facilitate custom orders for rugs. This application displays rug collections from an Excel database, allowing users to browse collections, search, and view detailed information about each collection.

## Features

- **Master List View**: Displays all rug collections grouped by collection name
  - Shows # of rugs per collection
  - Collection name and brand information
  - Sortable by number of rugs
  - Search functionality to filter collections

- **Collection Detail View**: Detailed view for each collection
  - Brand and collection name header
  - Color dropdown (defaults to color with most sizes)
  - Three-column table displaying collection details
  - Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Data Source

The application uses `HM_Rug_Master_Complete.xlsx` which has been converted to `public/data.json`. The Excel file contains the following columns:
- Vendor (Brand)
- Collection Name
- Design ID
- Size
- Primary Color
- UPC
- Retail Price
- HM SKU

### Updating the Data

To update the database with new rugs or price changes:

1. Replace `HM_Rug_Master_Complete.xlsx` with your updated Excel file
2. Run: `npm run convert-data`
3. Test locally: `npm start`
4. Build and deploy: `npm run build` then commit and push

**See [DATA_UPDATE_GUIDE.md](DATA_UPDATE_GUIDE.md) for detailed instructions.**

## Deployment to GitHub Pages

The app is configured for GitHub Pages deployment. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy the app when you push to the `main` branch.

To enable GitHub Pages:
1. Go to your repository settings
2. Navigate to Pages
3. Select "GitHub Actions" as the source

The app will be available at: `https://[your-username].github.io/homemakersRugDatabase`

## Project Structure

```
homemakersRugDatabase/
├── public/
│   ├── index.html
│   └── data.json          # Converted Excel data
├── src/
│   ├── components/
│   │   ├── MasterList.js   # Main collection list view
│   │   └── CollectionDetail.js  # Individual collection detail view
│   ├── App.js              # Main app component with routing
│   ├── App.css
│   ├── index.js            # React entry point
│   ├── index.css
│   └── styles.css          # Global styles
├── package.json
└── README.md
```

## Customization

### Changing Table Columns in Detail View

The detail view table columns are defined in `src/components/CollectionDetail.js`. To change which columns are displayed, modify the `tableColumns` array:

```javascript
const tableColumns = ['Size', 'Design ID', 'Retail Price'];
```

You can replace these with any column names from your Excel file (e.g., 'UPC', 'HM SKU', etc.).

## Technologies Used

- React 18
- React Router DOM 6
- CSS3 (Modern styling with gradients and responsive design)
