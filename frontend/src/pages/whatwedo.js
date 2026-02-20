import React from "react";
import "../styles/whatwedo.css";

// Import images from your local assests folder
import content1Img from '../assests/images/content1.jpg';
import content2Img from '../assests/images/card1.jpg';
import energyImg from '../assests/images/card2.webp';
import environmentalImg from '../assests/images/card3.jpg';
import defenseImg from '../assests/images/card4.jpeg';
import content5Img from '../assests/images/slide1.jpg';
import transportationImg from '../assests/images/slide2.jpeg';
import waterImg from '../assests/images/slide3.jpg';
import powerplantImg from '../assests/images/powerplant.jpg';

// Market data array
const markets = [
  { title: 'Advanced Manufacturing', image: content1Img },
  { title: 'Cities & Places', image: content2Img },
  { title: 'Energy', image: energyImg },
  { title: 'Environmental', image: environmentalImg },
  { title: 'National Security & Defense', image: defenseImg },
  { title: 'Life Sciences', image: content5Img },
  { title: 'Transportation', image: transportationImg },
  { title: 'Water', image: waterImg },
];

// Powerplant features array
const features = [
  {
    title: "Real-Time Monitoring",
    description: "Track plant performance and energy output live from any device.",
  },
  {
    title: "Remote Control Access",
    description: "Manage operations remotely with secure access controls.",
  },
  {
    title: "Predictive Maintenance",
    description: "AI-driven insights to reduce downtime and extend equipment life.",
  },
  {
    title: "Emission Monitoring",
    description: "Stay compliant with real-time emissions and pollution tracking.",
  },
  {
    title: "Energy Optimization",
    description: "Optimize fuel usage and power distribution automatically.",
  },
  {
    title: "Safety Alerts & Logs",
    description: "Automated alerts and detailed logs to enhance safety standards.",
  },
];



// Main component
const ProductSection = () => {
  return (
    <>
      <div className="markets">
        <h2>Our Markets</h2>
        <div className="market-grid">
          {markets.map((market, index) => (
            <div className="market-card" key={index}>
              <img src={market.image} alt={market.title} />
              <h3>{market.title}</h3>
              <a href="/project">EXPLORE MORE</a>
            </div>
          ))}
        </div>
      </div>

      <div className="power-generation-section">
        <img src={powerplantImg} alt="Power Generation Facility" className="background-image" />
        <div className="overlay-text">
          <span className="icon">⚡</span>
          <span className="text">POWER PLANTATION</span>
        </div>
      </div>

      <div className="powerplant">
        <section className="hero">
          <h1>Powerplant Control & Monitoring</h1>
          <p>Discover advanced features that power the future of energy management.</p>
        </section>

        <section className="features-grid">
          {features.map((feat, idx) => (
            <div className="feature-card" key={idx}>
              <h3>{feat.title}</h3>
              <p>{feat.description}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default ProductSection;
