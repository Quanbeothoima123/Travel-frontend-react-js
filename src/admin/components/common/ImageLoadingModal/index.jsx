import React from "react";
import "./ImageLoadingModal.css";

const ImageLoadingModal = () => {
  return (
    <div className="loading-modal">
      <div className="loading-content">
        <div className="spinner"></div>
        <p>Đang tải ảnh...</p>
      </div>
    </div>
  );
};

export default ImageLoadingModal;
