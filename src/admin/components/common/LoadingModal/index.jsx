import React from "react";
import "./LoadingModal.css";

const LoadingModal = ({ open, message = "Đang xử lý..." }) => {
  if (!open) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
