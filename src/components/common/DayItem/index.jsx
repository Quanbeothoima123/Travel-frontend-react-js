import React, { useState } from "react";
import "./DayItem.css";

const DayItem = ({ day, title, image, description, isOpen }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="day-item" onClick={() => setOpen(!open)}>
      <div className="day-header">
        {!open && !isOpen && (
          <img src={image} alt={`Day ${day}`} className="day-thumbnail" />
        )}
        <div className={`day-title ${open || isOpen ? "expanded" : ""}`}>
          <span>Ngày {day}</span>
          <h5>{title}</h5>
        </div>
        <span className={`dropdown-icon ${open || isOpen ? "open" : ""}`}>
          ▼
        </span>
      </div>
      {(open || isOpen) && (
        <div className="day-content">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      )}
    </div>
  );
};

export default DayItem;
