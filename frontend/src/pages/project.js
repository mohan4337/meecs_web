import React, { useState } from "react";
import "../styles/project.css";

// Image imports
import structuralImg from "../assests/images/structuralImg.webp";
import Thermodynamics from "../assests/images/Thermodynamics.jpg";

const topics = [
  "Structural Engineering",
  "Construction Management",
  "Thermodynamics",
  "Fluid Mechanics",
  "Geotechnical Engineering",
  "HVAC Systems",
  "Transportation Engineering",
  "Manufacturing Technology",
  "Materials Science",
  "Environmental Engineering"
];

const topicContent = {
  "Structural Engineering": {
    title: "Structural Engineering",
    image: structuralImg,
    text: `Structural engineering focuses on designing and analyzing structures like buildings, bridges, and towers to ensure they are safe and capable of withstanding loads and forces.`,

  },
  "Construction Management": {
    title: "Construction Management",
    image: structuralImg,
    text: `This involves planning, coordination, and control of construction projects from inception to completion while ensuring time, cost, and quality objectives are met.`

  },
  "Thermodynamics": {
    title: "Thermodynamics",
    image: Thermodynamics,
    text: `A core area of mechanical engineering, thermodynamics deals with heat, energy, and work. It forms the basis for designing engines, HVAC systems, and more.`
  },
  "Fluid Mechanics": {
    title: "Fluid Mechanics",
    image: Thermodynamics,
    text: `This subject involves the study of fluids (liquids and gases) and their behavior under various forces, crucial for hydraulic systems and aerodynamics.`
  },
  "Geotechnical Engineering": {
    title: "Geotechnical Engineering",
    image: Thermodynamics,
    text: `Geotechnical engineers investigate soil and rock behavior to design foundations, retaining walls, and underground structures.`
  },
  "HVAC Systems": {
    title: "HVAC Systems",
    image: Thermodynamics,
    text: `Heating, Ventilation, and Air Conditioning systems regulate indoor climates and are critical in both residential and industrial buildings.`
  },
  "Transportation Engineering": {
    title: "Transportation Engineering",
    image: Thermodynamics,
    text: `This field deals with the planning, design, and operation of transportation systems including roads, railways, airports, and traffic management.`
  },
  "Manufacturing Technology": {
    title: "Manufacturing Technology",
    image: Thermodynamics,
    text: `Involves processes and tools used in producing goods, including CNC machining, casting, welding, and robotics.`
  },
  "Materials Science": {
    title: "Materials Science",
    image: Thermodynamics,
    text: `Focuses on the properties, performance, and applications of materials like metals, polymers, ceramics, and composites used in construction and manufacturing.`
  },
  "Environmental Engineering": {
    title: "Environmental Engineering",
    image: Thermodynamics,
    text: `Applies engineering principles to improve the environment, addressing water treatment, waste management, and pollution control.`
  }
};

const ProjectSection = () => {
  const [selected, setSelected] = useState("Structural Engineering");

  return (
    <div className="project-section">
      <h1 className="project-title">MEE Project</h1>

      <div className="dt-container">
        <div className="sidebar">
          {topics.map((topic) => (
            <div
              key={topic}
              className={`sidebar-item ${selected === topic ? "active" : ""}`}
              onClick={() => setSelected(topic)}
            >
              {topic}
            </div>
          ))}
        </div>

        <div className="content">
          {topicContent[selected].image && (
            <img
              src={topicContent[selected].image}
              alt={selected}
              style={topicContent[selected].imageStyle}
              className="content-image"
            />
          )}
          <h2>{topicContent[selected].title}</h2>
          <p>{topicContent[selected].text}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectSection;
