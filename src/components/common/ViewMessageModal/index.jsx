// components/ViewMessageModal/ViewMessageModal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";
import "./ViewMessageModal.css";

const ViewMessageModal = ({ open, onClose, message, userName }) => {
  if (!open) return null;

  return (
    <div className="friends-message-modal-overlay">
      <div className="friends-message-modal-box">
        <div className="friends-message-modal-header">
          <h3 className="friends-message-modal-title">
            Lời nhắn từ {userName}
          </h3>
          <button onClick={onClose} className="friends-message-modal-close">
            <FaTimes />
          </button>
        </div>
        <div className="friends-message-modal-content">
          <p className="friends-message-modal-text">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewMessageModal;
