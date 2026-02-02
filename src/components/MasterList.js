import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

function MasterList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const navigate = useNavigate();

  useEffect(() => {
    const dataPath = `${process.env.PUBLIC_URL || ''}/data.json`;
    fetch(dataPath)
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  // Group data by collection and calculate statistics
  const collectionData = useMemo(() => {
    const grouped = {};
    
    data.forEach(item => {
      const collectionName = item['Collection Name'] || 'Unknown';
      const vendor = item['Vendor'] || 'Unknown';
      
      if (!grouped[collectionName]) {
        grouped[collectionName] = {
          collectionName,
          vendor,
          count: 0,
          items: []
        };
      }
      
      grouped[collectionName].count++;
      grouped[collectionName].items.push(item);
    });

    return Object.values(grouped);
  }, [data]);

  // Filter and sort collections
  const filteredAndSortedCollections = useMemo(() => {
    let filtered = collectionData.filter(collection =>
      collection.collectionName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'count') {
          aValue = a.count;
          bValue = b.count;
        }

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
  }, [collectionData, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowClick = (collectionName) => {
    navigate(`/collection/${encodeURIComponent(collectionName)}`);
  };

  if (loading) {
    return <div className="loading">Loading database...</div>;
  }

  return (
    <div className="master-list-container">
      <div className="master-list-header">
        <h1>Homemakers Rug Database</h1>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="collections-table">
        <thead>
          <tr>
            <th>Collection Name</th>
            <th>Brand</th>
            <th
              className={sortConfig.key === 'count' ? `sortable sort-${sortConfig.direction}` : 'sortable'}
              onClick={() => handleSort('count')}
            >
              # of Rugs
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedCollections.map((collection, index) => (
            <tr
              key={index}
              onClick={() => handleRowClick(collection.collectionName)}
            >
              <td>{collection.collectionName}</td>
              <td>{collection.vendor}</td>
              <td>{collection.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredAndSortedCollections.length === 0 && (
        <div className="error">No collections found matching your search.</div>
      )}
    </div>
  );
}

export default MasterList;

