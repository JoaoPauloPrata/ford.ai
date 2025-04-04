import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <h1>Creator</h1>
      </div>
      <nav className="nav-menu">
        <ul>
          <li><a href="#register">REGISTER</a></li>
          <li><a href="#fullscreen">FULLSCREEN</a></li>
          <li><a href="#signin">SIGN IN</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 