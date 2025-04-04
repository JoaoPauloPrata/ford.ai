import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-links">
        <a href="#facebook"><i className="fab fa-facebook-f"></i></a>
        <a href="#twitter"><i className="fab fa-twitter"></i></a>
      </div>
      <div className="footer-links">
        <a href="#terms">Terms</a>
        <a href="#privacy">Privacy</a>
        <a href="#ribbet-lab">Ribbet Lab</a>
        <a href="#blog">The Blog</a>
        <a href="#contact">Contact Us</a>
        <a href="#forum">Forum</a>
      </div>
      <div className="copyright">
        <p>Ribbet © 2023</p>
      </div>
    </footer>
  );
};

export default Footer; 