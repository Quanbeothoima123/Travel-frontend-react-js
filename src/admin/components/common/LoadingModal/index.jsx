import React from "react";
import * as FaIcons from "react-icons/fa";
import "./LoadingModal.css";

const LoadingModal = ({ open, message = "Đang xử lý...", icon }) => {
  if (!open) return null;

  const IconComponent = icon && FaIcons[icon] ? FaIcons[icon] : null;

  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner-wrapper">
          {IconComponent && <IconComponent className="center-icon" size={24} />}
          <div className="spinner-ring"></div>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
