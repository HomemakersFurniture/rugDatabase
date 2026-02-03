import React from 'react';
import '../styles.css';

function Footer() {
  return (
    <footer className="site-footer">
      <img
        className="site-footer-logo"
        src={`${process.env.PUBLIC_URL || ''}/homemakersFullLogo.svg`}
        alt="Homemakers"
      />
      <p className="site-footer-text">
        © 2026 Homemakers Plaza, Inc. | A Berkshire Hathaway Company
      </p>
    </footer>
  );
}

export default Footer;


