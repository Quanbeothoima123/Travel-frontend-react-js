import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="cm-modal__overlay">
      <div className="cm-modal__content">
        <h3 className="cm-modal__title">Xác nhận đặt tour</h3>
        <p className="cm-modal__message">{message}</p>
        <div className="cm-modal__actions">
          <button
            className="cm-modal__btn cm-modal__btn--cancel"
            onClick={onClose}
          >
            Từ chối
          </button>
          <button
            className="cm-modal__btn cm-modal__btn--confirm"
            onClick={onConfirm}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
