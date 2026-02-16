import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>Unfortunately this page doesn't exist. Please see a sales associate for help.</p>
      <Link to="/" className="back-button">Back to Collections</Link>
    </div>
  );
}

export default NotFound;
