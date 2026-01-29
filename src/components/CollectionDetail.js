import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles.css';

function CollectionDetail() {
  const { collectionName } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const dataPath = `${process.env.PUBLIC_URL || ''}/data.json`;
    fetch(dataPath)
      .then(response => response.json())
      .then(jsonData => {
        const collectionData = jsonData.filter(
          item => item['Collection Name'] === decodeURIComponent(collectionName)
        );
        setData(collectionData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, [collectionName]);

  // Get unique colors and calculate size counts
  const colorData = useMemo(() => {
    const colorMap = {};
    
    data.forEach(item => {
      const color = item['Primary Color'] || 'Unknown';
      if (!colorMap[color]) {
        colorMap[color] = {
          color,
          sizeCount: 0,
          sizes: new Set()
        };
      }
      if (item['Size']) {
        colorMap[color].sizes.add(item['Size']);
        colorMap[color].sizeCount = colorMap[color].sizes.size;
      }
    });

    return Object.values(colorMap).sort((a, b) => b.sizeCount - a.sizeCount);
  }, [data]);

  // Set default color to the one with most sizes
  useEffect(() => {
    if (colorData.length > 0 && !selectedColor) {
      setSelectedColor(colorData[0].color);
    }
  }, [colorData, selectedColor]);

  // Filter data by selected color
  const filteredData = useMemo(() => {
    if (!selectedColor) return [];
    return data.filter(item => item['Primary Color'] === selectedColor);
  }, [data, selectedColor]);

  // Get collection info
  const collectionInfo = useMemo(() => {
    if (data.length === 0) return { vendor: '', collectionName: '' };
    return {
      vendor: data[0]['Vendor'] || 'Unknown',
      collectionName: data[0]['Collection Name'] || 'Unknown'
    };
  }, [data]);

  if (loading) {
    return <div className="loading">Loading collection details...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="detail-container">
        <Link to="/" className="back-button">← Back to Master List</Link>
        <div className="error">Collection not found.</div>
      </div>
    );
  }

  // Determine which 3 columns to display (can be customized later)
  // For now, using: Size, Design ID, and Retail Price
  const tableColumns = ['Size', 'Design ID', 'Retail Price'];

  return (
    <div className="detail-container">
      <Link to="/" className="back-button">← Back to Master List</Link>
      
      <div className="detail-header">
        <h1>{collectionInfo.collectionName}</h1>
        <h2>{collectionInfo.vendor}</h2>
      </div>

      <div className="color-selector-container">
        <label htmlFor="color-select">Select Color:</label>
        <select
          id="color-select"
          className="color-dropdown"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        >
          {colorData.map((colorInfo, index) => (
            <option key={index} value={colorInfo.color}>
              {colorInfo.color} ({colorInfo.sizeCount} sizes)
            </option>
          ))}
        </select>
      </div>

      <table className="detail-table">
        <thead>
          <tr>
            {tableColumns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              {tableColumns.map((column, colIndex) => (
                <td key={colIndex}>
                  {item[column] !== undefined && item[column] !== null && item[column] !== ''
                    ? (typeof item[column] === 'number' 
                        ? (column === 'Retail Price' ? `$${item[column].toFixed(2)}` : item[column])
                        : item[column])
                    : 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData.length === 0 && (
        <div className="error">No items found for the selected color.</div>
      )}
    </div>
  );
}

export default CollectionDetail;

