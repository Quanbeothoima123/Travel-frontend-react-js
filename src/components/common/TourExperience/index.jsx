import React from "react";
import SafeHTML from "../SafeHTML";
import "./TourExperience.css";

const TourExperience = ({ tour }) => {
  const specialExperience = tour?.specialExperience || "";

  return (
    <div className="tex-wrapper">
      <h2 className="tex-heading">Trải nghiệm thú vị trong tour</h2>
      <SafeHTML html={specialExperience} className="tex-content" />
    </div>
  );
};

export default TourExperience;
