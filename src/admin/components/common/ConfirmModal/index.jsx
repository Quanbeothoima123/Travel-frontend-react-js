// ConfirmModal.js
import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;

  return (
    <div className="cm-overlay">
      <div className="cm-box">
        <h3 className="cm-title">{title}</h3>
        <p className="cm-message">{message}</p>
        <div className="cm-actions">
          <button className="cm-btn cm-btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="cm-btn cm-btn-confirm" onClick={onConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
