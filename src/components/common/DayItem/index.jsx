import React, { useState, useRef, useEffect } from "react";
import "./DayItem.css";
import SafeHTML from "../SafeHTML";

const DayItem = ({
  day,
  title,
  image,
  description,
  isOpen,
  onIndividualToggle,
}) => {
  const [open, setOpen] = useState(false);
  const expanded = open || isOpen;
  const contentRef = useRef(null);

  // Sync với isOpen từ parent khi "Xem tất cả/Thu gọn"
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

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

  // Handle click trên header (chỉ toggle khi click vào header, không phải icon)
  const handleHeaderClick = (e) => {
    // Nếu click vào icon thì không toggle ở đây
    if (!e.target.closest(".di-day-item__icon")) {
      setOpen(!open);
      // Thông báo parent về individual toggle
      if (onIndividualToggle) {
        onIndividualToggle();
      }
    }
  };

  // Handle click trên icon - luôn toggle (kể cả khi đang mở)
  const handleIconClick = (e) => {
    e.stopPropagation();
    setOpen(!open);
    // Thông báo parent về individual toggle
    if (onIndividualToggle) {
      onIndividualToggle();
    }
  };

  // Handle click trên content - ngăn đóng item
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="di-day-item">
      <div className="di-day-item__header" onClick={handleHeaderClick}>
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
          onClick={handleIconClick}
        >
          ▼
        </span>
      </div>

      <div
        ref={contentRef}
        className={`di-day-item__content-wrapper ${expanded ? "open" : ""}`}
        onClick={handleContentClick}
      >
        <SafeHTML html={description} className="di-day-item__content" />
      </div>
    </div>
  );
};

export default DayItem;
