import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MasterList from './components/MasterList';
import CollectionDetail from './components/CollectionDetail';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MasterList />} />
        <Route path="/collection/:collectionName" element={<CollectionDetail />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

