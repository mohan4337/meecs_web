import React, { useState, useEffect } from 'react';
import '../styles/hero.css';

// SVG Icons as React components
const HelmetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C10.5 2 9 2.5 7.8 3.5C6.8 4.4 6 5.7 6 7.2C6 8.8 7.2 10.2 9 10.5V12H7C5.9 12 5 12.9 5 14V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V14C19 12.9 18.1 12 17 12H15V10.5C16.8 10.2 18 8.8 18 7.2C18 5.7 17.2 4.4 16.2 3.5C15 2.5 13.5 2 12 2Z"/>
    <path d="M9 12V7.2C9 6.6 9.5 6.2 10 6.2C10.5 6.2 11 6.6 11 7.2V12"/>
    <path d="M13 12V7.2C13 6.6 13.5 6.2 14 6.2C14.5 6.2 15 6.6 15 7.2V12"/>
    <path d="M10 15H14"/>
    <path d="M11 15V18"/>
  </svg>
);

const CalculatorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="7" y1="7" x2="7" y2="7"/>
    <line x1="11" y1="7" x2="11" y2="7"/>
    <line x1="15" y1="7" x2="15" y2="7"/>
    <line x1="7" y1="11" x2="7" y2="11"/>
    <line x1="11" y1="11" x2="11" y2="11"/>
    <line x1="15" y1="11" x2="15" y2="11"/>
    <line x1="7" y1="15" x2="7" y2="15"/>
    <line x1="11" y1="15" x2="11" y2="15"/>
    <line x1="15" y1="15" x2="15" y2="15"/>
    <line x1="7" y1="19" x2="7" y2="19"/>
    <line x1="11" y1="19" x2="11" y2="19"/>
    <line x1="15" y1="19" x2="15" y2="19"/>
  </svg>
);

const BlueprintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
    <line x1="7" y1="9" x2="7" y2="9"/>
    <line x1="11" y1="9" x2="11" y2="9"/>
    <line x1="15" y1="9" x2="15" y2="9"/>
    <line x1="19" y1="9" x2="19" y2="9"/>
    <path d="M9 3H7C6.4 3 6 3.4 6 4V14C6 14.6 6.4 15 7 15H9"/>
    <circle cx="16" cy="15" r="2"/>
    <line x1="18" y1="17" x2="21" y2="21"/>
  </svg>
);

const ToolsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4H20C20.5 4 21 4.5 21 5V8.5L15.5 3C15 2.5 14.5 2.5 14 3L9 8C8.5 8.5 8.5 9 9 9.5L11 11.5"/>
    <path d="M18.4 6.6L21 4.1C21.6 3.5 22.5 3.5 23.1 4.1L23.9 4.9C24.5 5.5 24.5 6.4 23.9 7L21.4 9.6"/>
    <path d="M22 16.92V21a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h4.08"/>
    <path d="M8 12H16"/>
    <path d="M8 16H12"/>
  </svg>
);

const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4H20C20.5 4 21 4.5 21 5V8.5L15.5 3C15 2.5 14.5 2.5 14 3L9 8C8.5 8.5 8.5 9 9 9.5L11 11.5M18.4 6.6L21 4.1C21.6 3.5 22.5 3.5 23.1 4.1L23.9 4.9C24.5 5.5 24.5 6.4 23.9 7L21.4 9.6"/>
    <path d="M22 16.92V21a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h4.08"/>
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <path d="M3 3H21V5H3z"/>
  </svg>
);

const HomeHero = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="hero-container">
      {/* Navigation Bar */}
      <nav className={`hero-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <a href="/home" className="navbar-logo">
            <span className="navbar-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
            </span>
            Middle East Engineering Construction SPC
          </a>
          <ul className="navbar-menu">
            <li className="navbar-menu-item">
              <a href="/home" className="navbar-menu-link active">Home</a>
            </li>
            <li className="navbar-menu-item">
              <a href="/whatwedo" className="navbar-menu-link">What we do</a>
            </li>
            <li className="navbar-menu-item">
              <a href="/project" className="navbar-menu-link">Projects</a>
            </li>
            <li className="navbar-menu-item">
              <a href="/contact" className="navbar-menu-link">Contact us</a>
            </li>
          </ul>
          <button className="mobile-menu-btn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-pattern"></div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content-wrapper">
          <div className="hero-content">
            {/* Left Side - Text Content */}
            <div className="hero-text-section">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                Engineering Excellence Since 2024
              </div>
              
              <h1 className="hero-title">
                Challenging today.<br />
                <span className="hero-title-highlight">Reinventing tomorrow.</span>
              </h1>
              
              <p className="hero-description">
                At MEE Construction SPC, we're challenging today to reinvent tomorrow — delivering outcome and solutions for the world's most complex challenges. We provide end-to-end engineering and consulting services across critical infrastructure and industrial sectors.
              </p>
              
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-value">50+</span>
                  <span className="hero-stat-label">Projects Completed</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value">15</span>
                  <span className="hero-stat-label">Countries Served</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-value">500+</span>
                  <span className="hero-stat-label">Expert Engineers</span>
                </div>
              </div>
              
              <div className="hero-cta">
                <a href="/contact" className="btn btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  Start Your Project
                </a>
                <a href="/whatwedo" className="btn btn-secondary">
                  Learn More
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Side - Visual Elements */}
            <div className="hero-visual-section">
              <div className="hero-tools-grid">
                <div className="hero-tool-card">
                  <div className="hero-tool-icon helmet">
                    <HelmetIcon />
                  </div>
                  <span className="hero-tool-name">Safety First</span>
                </div>
                
                <div className="hero-tool-card">
                  <div className="hero-tool-icon calculator">
                    <CalculatorIcon />
                  </div>
                  <span className="hero-tool-name">Precision</span>
                </div>
                
                <div className="hero-tool-card">
                  <div className="hero-tool-icon blueprint">
                    <BlueprintIcon />
                  </div>
                  <span className="hero-tool-name">Blueprints</span>
                </div>
                
                <div className="hero-tool-card">
                  <div className="hero-tool-icon tools">
                    <ToolsIcon />
                  </div>
                  <span className="hero-tool-name">Engineering</span>
                </div>
                
                <div className="hero-tool-card">
                  <div className="hero-tool-icon wrench">
                    <WrenchIcon />
                  </div>
                  <span className="hero-tool-name">Construction</span>
                </div>
                
                <div className="hero-tool-card">
                  <div className="hero-tool-icon chart">
                    <ChartIcon />
                  </div>
                  <span className="hero-tool-name">Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeHero;