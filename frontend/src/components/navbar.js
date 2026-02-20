import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="logo">𝙈𝙞𝙙𝙙𝙡𝙚 𝙀𝙖𝙨𝙩 𝙀𝙣𝙜𝙞𝙣𝙚𝙚𝙧𝙞𝙣𝙜 𝘾𝙤𝙣𝙨𝙩𝙧𝙪𝙘𝙩𝙞𝙤𝙣 𝙎𝙋𝘾</div>

        {/* Menu icon for mobile */}
        <div
          className="menu-icon"
          onClick={toggleMenu}
        >
          ☰
        </div>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/whatwedo">What we do</Link></li>
          <li><Link to="/project">Projects</Link></li>
          <li><Link to="/contact">Contact us</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
