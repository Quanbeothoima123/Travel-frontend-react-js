// LoadingModal.js
import React from "react";
import * as FaIcons from "react-icons/fa";
import "./LoadingModal.css";

const LoadingModal = ({ open, message = "Đang xử lý...", icon }) => {
  if (!open) return null;

  const IconComponent = icon && FaIcons[icon] ? FaIcons[icon] : null;

  return (
    <div className="lm-overlay">
      <div className="lm-box">
        <div className="lm-spinner">
          {IconComponent && <IconComponent className="lm-icon" size={24} />}
          <div className="lm-ring"></div>
        </div>
        <p className="lm-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
