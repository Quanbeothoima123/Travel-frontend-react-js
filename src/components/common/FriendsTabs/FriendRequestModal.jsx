import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./FriendRequestModal.css";

// Modal Component
const FriendRequestModal = ({
  isOpen,
  onClose,
  onSend,
  userName,
  isLoading,
}) => {
  const [message, setMessage] = useState("Chào bạn, hãy kết bạn với mình nhé!");

  // Reset message when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessage("Chào bạn, hãy kết bạn với mình nhé!");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      console.log("Sending message:", trimmedMessage); // Debug log
      onSend(trimmedMessage);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey && !isLoading && message.trim()) {
      handleSend();
    }
  };

  return (
    <div className="friend-request-modal-overlay" onClick={handleOverlayClick}>
      <div className="friend-request-modal">
        <div className="friend-request-modal-header">
          <h3>Gửi lời mời kết bạn</h3>
          <button
            onClick={onClose}
            className="friend-request-modal-close"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        <div className="friend-request-modal-body">
          <p className="friend-request-modal-to">
            Đến: <strong>{userName}</strong>
          </p>
          <textarea
            className="friend-request-modal-textarea"
            placeholder="Nhập tin nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            maxLength={200}
            disabled={isLoading}
            autoFocus
          />
          <div className="friend-request-modal-char-count">
            {message.length}/200 ký tự
          </div>
          <p className="friend-request-modal-hint">
            Nhấn Ctrl + Enter để gửi nhanh
          </p>
        </div>

        <div className="friend-request-modal-footer">
          <button
            onClick={onClose}
            className="friend-request-modal-btn-cancel"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleSend}
            className="friend-request-modal-btn-send"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? "Đang gửi..." : "Gửi lời mời"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestModal;
