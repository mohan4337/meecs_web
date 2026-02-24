import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import slide1Img from "../assests/images/slide1.jpg";
import slide2Img from "../assests/images/slide2.jpeg";
import slide3Img from "../assests/images/slide3.jpg";
import slide4Img from "../assests/images/slide4.jpeg";

import card1Img from "../assests/images/card1.jpg";
import card2Img from "../assests/images/card2.webp";
import card3Img from "../assests/images/card3.jpg";
import card4Img from "../assests/images/card4.jpeg";

import projectImg from "../assests/images/project.jpeg";

import "../styles/home.css";

const slides = [
  { id: 1, image: slide1Img, alt: "PowerPlantation", caption: "PowerPlantation" },
  { id: 2, image: slide2Img, alt: "Structural", caption: "Structural" },
  { id: 3, image: slide3Img, alt: "Construction", caption: "Construction" },
  { id: 4, image: slide4Img, alt: "Operations", caption: "Operations" },
];

const AboutPage = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section>
      {/* Mission Section */}
      <div className="mission-container">
        <div className="mission-left">
          <h1>
            Challenging today. <br />
            Reinventing tomorrow.
          </h1>
        </div>

        <div className="mission-right">
          <p>
            At MEE Construction SPC, we’re challenging today to reinvent tomorrow –
            delivering outcome and solutions for the world’s most complex challenges.
            We provide end-to-end engineering and consulting services across critical
            infrastructure and industrial sectors.
          </p>
        </div>
      </div>

      {/* Who We Are Section */}
      <section className="about-section">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <h2 className="about-title">Who We Are</h2>

          <p className="aboutp-title">
            At MEE Construction SPC, we specialize in delivering comprehensive
            solutions across civil, mechanical, and electrical engineering
            disciplines.

            With a skilled workforce and modern infrastructure, we deliver
            projects on time, within budget, and with high quality standards.
          </p>
        </motion.div>
      </section>

      {/* Slideshow Section */}
      <div className="slideshow">
        <div className="slide-container">
          <div className="slide-content">
            <img
              src={slides[current].image}
              alt={slides[current].alt}
              className="slide-image"
            />

            <div className="slide-caption">
              {slides[current].caption}
            </div>
          </div>

          <button className="nav-button left" onClick={prevSlide}>
            ←
          </button>

          <button className="nav-button right" onClick={nextSlide}>
            →
          </button>
        </div>

        <div className="dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === current ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>

      {/* Headline */}
      <h2 className="headline">
        Securing the UK’s Energy Future
      </h2>

      {/* Info Sections */}
      <div className="info-sections">
        <div className="info-card">
          <h4>RECENT WIN</h4>
          <p>Lorem ipsum dolor sit amet.</p>
        </div>

        <div className="info-card">
          <h4>CHALLENGE ACCEPTED</h4>
          <p>Curabitur blandit tempus porttitor.</p>
        </div>

        <div className="info-card">
          <h4>INVESTORS</h4>
          <p>Praesent commodo cursus magna.</p>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="content-wrapper">
        <div className="intro">
          <h2>What we do</h2>

          <p>
            We’re focused on building a connected and sustainable future.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <img src={card1Img} alt="Civil" />
            <h3>Civil Engineering</h3>
          </div>

          <div className="service-card">
            <img src={card2Img} alt="Mechanical" />
            <h3>Mechanical Engineering</h3>
          </div>

          <div className="service-card">
            <img src={card3Img} alt="Electrical" />
            <h3>Electrical Engineering</h3>
          </div>

          <div className="service-card">
            <img src={card4Img} alt="Communication" />
            <h3>Communication System</h3>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <section className="project-section">
        <div className="project-left">
          <img src={projectImg} alt="Team meeting" />
        </div>

        <div className="project-right">
          <h2>Our projects</h2>

          <p className="project-bold">
            Our teams collaborate to solve tough challenges.
          </p>

          <p>
            We use modern technology and expertise to deliver results.
          </p>

          <center>
            <button>
              <Link to="/project">Find out more</Link>
            </button>
          </center>
        </div>
      </section>
    </section>
  );
};

export default AboutPage;