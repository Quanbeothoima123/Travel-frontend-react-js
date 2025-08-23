import React from "react";
import "./ConfirmModal.css";
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Xác nhận đặt tour</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Từ chối
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
