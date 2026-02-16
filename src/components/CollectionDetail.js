import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles.css';

function CollectionDetail() {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  // Get collection info
  const collectionInfo = useMemo(() => {
    if (data.length === 0) return { vendor: '', collectionName: '' };
    return {
      vendor: data[0]['Vendor'] || 'Unknown',
      collectionName: data[0]['Collection Name'] || 'Unknown'
    };
  }, [data]);

  // Group by Design ID
  const designData = useMemo(() => {
    const grouped = {};
    data.forEach(item => {
      const designId = item['Design ID'] || 'Unknown';
      if (!grouped[designId]) {
        grouped[designId] = {
          designId,
          count: 0,
        };
      }
      grouped[designId].count++;
    });
    return Object.values(grouped);
  }, [data]);

  // Filter and sort designs
  const filteredAndSortedDesigns = useMemo(() => {
    let result = designData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.designId.toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'designId') {
          aValue = a.designId;
          bValue = b.designId;
        } else if (sortConfig.key === 'count') {
          aValue = a.count;
          bValue = b.count;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [designData, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowClick = (designId) => {
    navigate(`/collection/${encodeURIComponent(collectionName)}/${encodeURIComponent(designId)}`);
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

  return (
    <div className="detail-container">
      <Link to="/" className="back-button">← Back to Master List</Link>

      <div className="detail-header">
        <h1>{collectionInfo.collectionName}</h1>
        <h2>{collectionInfo.vendor}</h2>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Design ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="collections-table">
        <thead>
          <tr>
            <th
              className={sortConfig.key === 'designId' ? `sortable sort-${sortConfig.direction}` : 'sortable'}
              onClick={() => handleSort('designId')}
              style={{ cursor: 'pointer' }}
            >
              Design ID
            </th>
            <th
              className={sortConfig.key === 'count' ? `sortable sort-${sortConfig.direction}` : 'sortable'}
              onClick={() => handleSort('count')}
              style={{ cursor: 'pointer' }}
            >
              # of Rugs
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedDesigns.map((design) => (
            <tr
              key={design.designId}
              onClick={() => handleRowClick(design.designId)}
            >
              <td>{design.designId}</td>
              <td>{design.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredAndSortedDesigns.length === 0 && (
        <div className="error">No designs found matching your search.</div>
      )}
    </div>
  );
}

export default CollectionDetail;
