import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles.css';

function CollectionDetail() {
  const { collectionName } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const timeoutRef = useRef(null);

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

  // Get unique colors and calculate rug counts
  const colorData = useMemo(() => {
    const colorMap = {};
    
    data.forEach(item => {
      const color = item['Primary Color'] || 'Unknown';
      if (!colorMap[color]) {
        colorMap[color] = {
          color,
          rugCount: 0
        };
      }
      colorMap[color].rugCount++;
    });

    return Object.values(colorMap).sort((a, b) => b.rugCount - a.rugCount);
  }, [data]);

  // Set default color to the one with most rugs
  useEffect(() => {
    if (colorData.length > 0 && !selectedColor) {
      setSelectedColor(colorData[0].color);
    }
  }, [colorData, selectedColor]);

  // Filter data by selected color and apply sorting
  const filteredData = useMemo(() => {
    if (!selectedColor) return [];
    let filtered = data.filter(item => item['Primary Color'] === selectedColor);

    // Apply sorting if a column is selected
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'Size') {
          aValue = a['Size'] || '';
          bValue = b['Size'] || '';
        } else if (sortConfig.key === 'Retail Price') {
          aValue = a['Retail'] || 0;
          bValue = b['Retail'] || 0;
        }

        // For numeric values (Retail Price)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // For string values (Size) - use localeCompare for natural sorting
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, selectedColor, sortConfig]);

  // Get collection info
  const collectionInfo = useMemo(() => {
    if (data.length === 0) return { vendor: '', collectionName: '' };
    return {
      vendor: data[0]['Vendor'] || 'Unknown',
      collectionName: data[0]['Collection Name'] || 'Unknown'
    };
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Copy to clipboard function
  const copyToClipboard = async (text, uniqueId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(uniqueId);
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Reset the copied state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setCopiedId(null);
        timeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e, displayValue, uniqueId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (displayValue !== 'N/A') {
        copyToClipboard(displayValue, uniqueId);
      }
    }
  };

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
  // For now, using: Order ID, Size, and Retail Price
  // Note: 'Retail Price' is the display name, but the actual data column is 'Retail'
  // Note: 'Order ID' displays product_id when available, otherwise VPN
  const tableColumns = ['Order ID', 'Size', 'Retail Price'];

  return (
    <div className="detail-container">
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
              {colorInfo.color} ({colorInfo.rugCount} {colorInfo.rugCount === 1 ? 'rug' : 'rugs'})
            </option>
          ))}
        </select>
      </div>

      <p className="order-instruction">Make note of or show the <span className="order-id-highlight">Order ID</span> to a sales associate to order.</p>
      <table className="detail-table">
        <thead>
          <tr>
            {tableColumns.map((column, index) => {
              const isSortable = column === 'Size' || column === 'Retail Price';
              const isSorted = sortConfig.key === column;
              const sortClass = isSorted ? `sortable sort-${sortConfig.direction}` : 'sortable';

              return (
                <th
                  key={index}
                  className={isSortable ? sortClass : ''}
                  onClick={isSortable ? () => handleSort(column) : undefined}
                  style={isSortable ? { cursor: 'pointer' } : {}}
                >
                  {column}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => {
            // Create a more stable key using VPN, Size, and Primary Color
            const rowKey = `${item['VPN'] || 'unknown'}-${item['Size'] || 'unknown'}-${item['Primary Color'] || 'unknown'}-${index}`;
            return (
              <tr key={rowKey}>
                {tableColumns.map((column, colIndex) => {
                  // Special-case: display product_id when present; otherwise VPN
                  if (column === 'Order ID') {
                    const productId = item['product_id'];
                    const vpn = item['VPN'];
                    const value = productId !== undefined && productId !== null && productId !== '' ? productId : vpn;
                    const displayValue = value !== undefined && value !== null && value !== '' ? value : 'N/A';
                    const uniqueId = `${rowKey}-${colIndex}-${displayValue}`;
                    const isCopied = copiedId === uniqueId;
                  
                  return (
                    <td 
                      key={colIndex}
                      className="copyable-cell"
                      onClick={() => {
                        if (displayValue !== 'N/A') {
                          copyToClipboard(displayValue, uniqueId);
                        }
                      }}
                      onKeyDown={(e) => handleKeyDown(e, displayValue, uniqueId)}
                      tabIndex={displayValue !== 'N/A' ? 0 : -1}
                      role={displayValue !== 'N/A' ? 'button' : undefined}
                      aria-label={displayValue !== 'N/A' ? `Copy Order ID ${displayValue} to clipboard` : undefined}
                    >
                      {displayValue !== 'N/A' ? (
                        <div className={`order-id-button ${isCopied ? 'copied' : ''}`}>
                          <span className="order-id-text" data-text={displayValue}>{displayValue}</span>
                          <svg 
                            width="15" 
                            height="15" 
                            viewBox="0 0 15 15" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="order-id-icon"
                          >
                            <g clipPath={`url(#clip_${uniqueId.replace(/[^a-zA-Z0-9]/g, '_')})`}>
                              <path 
                                d="M11.5 0.625C12.3975 0.625 13.125 1.35254 13.125 2.25V6.40625C13.125 6.75143 12.8452 7.03125 12.5 7.03125C12.1548 7.03125 11.875 6.75143 11.875 6.40625V2.25C11.875 2.04289 11.7071 1.875 11.5 1.875H6.625C6.41789 1.875 6.25 2.04289 6.25 2.25V2.8125H8.375C9.27246 2.8125 10 3.54004 10 4.4375V10.9375H11.5C11.7071 10.9375 11.875 10.7696 11.875 10.5625V8.98438C11.875 8.6392 12.1548 8.35938 12.5 8.35938C12.8452 8.35938 13.125 8.6392 13.125 8.98438V10.5625C13.125 11.46 12.3975 12.1875 11.5 12.1875H10V12.75C10 13.6475 9.27246 14.375 8.375 14.375H3.5C2.60254 14.375 1.875 13.6475 1.875 12.75V8.59375C1.875 8.24857 2.15482 7.96875 2.5 7.96875C2.84518 7.96875 3.125 8.24857 3.125 8.59375V12.75C3.125 12.9571 3.29289 13.125 3.5 13.125H8.375C8.58211 13.125 8.75 12.9571 8.75 12.75V4.4375C8.75 4.23039 8.58211 4.0625 8.375 4.0625H3.5C3.29289 4.0625 3.125 4.23039 3.125 4.4375V6.01562C3.125 6.3608 2.84518 6.64062 2.5 6.64062C2.15482 6.64062 1.875 6.3608 1.875 6.01562V4.4375C1.875 3.54004 2.60254 2.8125 3.5 2.8125H5V2.25C5 1.35254 5.72754 0.625 6.625 0.625H11.5Z" 
                                className="icon-path"
                              />
                            </g>
                            <defs>
                              <clipPath id={`clip_${uniqueId.replace(/[^a-zA-Z0-9]/g, '_')}`}>
                                <rect width="15" height="15" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                          {isCopied && (
                            <span className="copied-tooltip">Copied</span>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  );
                }
                
                return (
                  <td key={colIndex}>
                    {(() => {
                      // Map display column names to actual data column names
                      let actualColumn = column;
                      if (column === 'Retail Price') {
                        actualColumn = 'Retail';
                      }
                      
                      const value = item[actualColumn];
                      if (value === undefined || value === null || value === '') return 'N/A';
                      if (typeof value === 'number' && column === 'Retail Price') return `$${value.toFixed(2)}`;
                      return value;
                    })()}
                  </td>
                );
              })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredData.length === 0 && (
        <div className="error">No items found for the selected color.</div>
      )}
    </div>
  );
}

export default CollectionDetail;

