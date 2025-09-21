import React, { useState, useMemo } from "react";
import DayItem from "../DayItem";
import "./TourSchedule.css";

const TourSchedule = ({ tour }) => {
  const description = useMemo(
    () => tour?.description || [],
    [tour?.description]
  );
  const [allOpen, setAllOpen] = useState(false);
  const [isToggleAllAction, setIsToggleAllAction] = useState(false);

  const toggleAll = () => {
    setIsToggleAllAction(true);
    setAllOpen(!allOpen);

    // Reset flag sau một thời gian ngắn
    setTimeout(() => {
      setIsToggleAllAction(false);
    }, 100);
  };

  // Callback khi user click individual item
  const onIndividualToggle = () => {
    // Chỉ reset allOpen nếu không phải từ toggle all action
    if (!isToggleAllAction && allOpen) {
      setAllOpen(false);
    }
  };

  return (
    <div className="tour-schedule">
      <div className="schedule-header">
        <h2>Chương trình tour</h2>
        <button className="toggle-btn" onClick={toggleAll}>
          {allOpen ? "Thu gọn" : "Xem tất cả"}
        </button>
      </div>

      {description.map((item, index) => (
        <DayItem
          key={index}
          {...item}
          isOpen={allOpen}
          onIndividualToggle={onIndividualToggle}
        />
      ))}
    </div>
  );
};

export default TourSchedule;
