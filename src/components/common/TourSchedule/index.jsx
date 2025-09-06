import React, { useState } from "react";
import DayItem from "../DayItem";
import "./TourSchedule.css";

const TourSchedule = ({ tour }) => {
  const description = tour?.description || [];
  const [allOpen, setAllOpen] = useState(false);

  const toggleAll = () => {
    setAllOpen(!allOpen);
  };

  return (
    <div className="tour-schedule">
      <div className="schedule-header">
        <h2>Chương trình tour</h2>
        <button
          onClick={(e) => {
            toggleAll();
          }}
          style={{
            backgroundColor: "#e56f2c",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {allOpen ? "Rút gọn" : "Xem tất cả"}
        </button>
      </div>
      {description.map((item, index) => (
        <DayItem key={index} {...item} isOpen={allOpen} />
      ))}
    </div>
  );
};

export default TourSchedule;
