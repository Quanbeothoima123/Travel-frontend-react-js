// src/components/common/TourExperience/index.jsx
import React from "react";
import "./TourExperience.css";

const TourExperience = ({ tour }) => {
  const specialExperience = tour?.specialExperience || ""; // Fallback thành chuỗi rỗng nếu undefined/null

  return (
    <div className="tour-experience">
      <h2>Trải nghiệm thú vị trong tour</h2>
      <div
        className="experience-content"
        dangerouslySetInnerHTML={{ __html: specialExperience }}
      />
    </div>
  );
};

export default TourExperience;
