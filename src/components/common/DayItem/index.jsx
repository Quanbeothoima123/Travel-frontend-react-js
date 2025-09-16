import React, { useState, useRef, useEffect } from "react";
import "./DayItem.css";
import SafeHTML from "../SafeHTML";
const DayItem = ({ day, title, image, description, isOpen }) => {
  const [open, setOpen] = useState(false);
  const expanded = open || isOpen;
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      if (expanded) {
        contentRef.current.style.maxHeight =
          contentRef.current.scrollHeight + "px";
      } else {
        contentRef.current.style.maxHeight = "0px";
      }
    }
  }, [expanded]);

  return (
    <div className="di-day-item" onClick={() => setOpen(!open)}>
      <div className="di-day-item__header">
        {!expanded && (
          <img
            src={image}
            alt={`Day ${day}`}
            className="di-day-item__thumbnail"
          />
        )}
        <div
          className={`di-day-item__title ${
            expanded ? "di-day-item__title--expanded" : ""
          }`}
        >
          <span className="di-day-item__day">Ngày {day}</span>
          <h5 className="di-day-item__heading">{title}</h5>
        </div>
        <span
          className={`di-day-item__icon ${
            expanded ? "di-day-item__icon--open" : ""
          }`}
        >
          ▼
        </span>
      </div>

      <div
        ref={contentRef}
        className={`di-day-item__content-wrapper ${expanded ? "open" : ""}`}
      >
        <SafeHTML html={description} className="di-day-item__content" />
      </div>
    </div>
  );
};

export default DayItem;
