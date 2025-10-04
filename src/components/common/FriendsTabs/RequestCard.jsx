// components/FriendsTabs/RequestCard.jsx
import React, { useState } from "react";
import { FaCheck, FaTimes, FaBan, FaEllipsisV, FaUser } from "react-icons/fa";
import ConfirmModal from "../../../admin/components/common/ConfirmModal";
import ViewMessageModal from "../ViewMessageModal";
import "./RequestCard.css";

const RequestCard = ({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
  onViewProfile,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const displayName = request.customName || request.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const truncateMessage = (msg, maxLength = 60) => {
    if (!msg) return "";
    return msg.length > maxLength ? msg.substring(0, maxLength) + "..." : msg;
  };

  const handleActionClick = (action, actionFn) => {
    setConfirmAction({ type: action, fn: actionFn });
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction && confirmAction.fn) {
      confirmAction.fn(request._id);
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const getConfirmMessage = () => {
    if (!confirmAction) return "";
    switch (confirmAction.type) {
      case "reject":
        return `Bạn có chắc muốn từ chối lời mời kết bạn từ ${displayName}?`;
      case "cancel":
        return `Bạn có chắc muốn hủy lời mời kết bạn đã gửi đến ${displayName}?`;
      default:
        return "Bạn có chắc chắn?";
    }
  };

  return (
    <>
      <div className="friends-request-card">
        <div className="friends-request-header">
          {/* Avatar */}
          <div className="friends-request-avatar-wrapper">
            {request.avatar ? (
              <img
                src={request.avatar}
                alt={displayName}
                className="friends-request-avatar-img"
              />
            ) : (
              <div className="friends-request-avatar-placeholder">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="friends-request-info">
            <h4 className="friends-request-name">{displayName}</h4>
            <p className="friends-request-username">@{request.userName}</p>
          </div>

          {/* Menu */}
          <div className="friends-request-menu-wrapper">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="friends-request-btn-more"
            >
              <FaEllipsisV />
            </button>

            {showMenu && (
              <>
                <div
                  className="friends-menu-backdrop"
                  onClick={() => setShowMenu(false)}
                />
                <div className="friends-request-menu">
                  <button
                    onClick={() => {
                      onViewProfile(request._id);
                      setShowMenu(false);
                    }}
                    className="friends-menu-item"
                  >
                    <FaUser />
                    Xem trang cá nhân
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Message */}
        {request.message && (
          <div className="friends-request-message">
            <p className="friends-request-message-text">
              {truncateMessage(request.message)}
            </p>
            {request.message.length > 60 && (
              <button
                onClick={() => setShowMessageModal(true)}
                className="friends-request-message-more"
              >
                Xem thêm
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="friends-request-actions">
          {type === "received" ? (
            <>
              <button
                onClick={() => onAccept(request._id)}
                className="friends-request-btn friends-request-btn-accept"
              >
                <FaCheck />
                Chấp nhận
              </button>
              <button
                onClick={() => handleActionClick("reject", onReject)}
                className="friends-request-btn friends-request-btn-reject"
              >
                <FaTimes />
                Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => handleActionClick("cancel", onCancel)}
              className="friends-request-btn friends-request-btn-cancel"
            >
              <FaBan />
              Hủy lời mời
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirm}
        title={
          confirmAction?.type === "reject" ? "Từ chối lời mời" : "Hủy lời mời"
        }
        message={getConfirmMessage()}
      />

      <ViewMessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        message={request.message}
        userName={displayName}
      />
    </>
  );
};

export default RequestCard;
