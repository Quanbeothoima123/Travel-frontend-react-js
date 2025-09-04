import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
