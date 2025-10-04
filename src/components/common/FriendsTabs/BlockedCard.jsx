// components/FriendsTabs/BlockedCard.jsx
import React, { useState } from "react";
import { FaUnlock, FaEllipsisV, FaUser } from "react-icons/fa";
import ConfirmModal from "../../../admin/components/common/ConfirmModal";
import "./BlockedCard.css";

const BlockedCard = ({ blocked, onUnblock, onViewProfile }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayName = blocked.customName || blocked.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const handleUnblockClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onUnblock(blocked._id);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="friends-blocked-card">
        <div className="friends-blocked-header">
          {/* Avatar */}
          <div className="friends-blocked-avatar-wrapper">
            {blocked.avatar ? (
              <img
                src={blocked.avatar}
                alt={displayName}
                className="friends-blocked-avatar-img"
              />
            ) : (
              <div className="friends-blocked-avatar-placeholder">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="friends-blocked-info">
            <h4 className="friends-blocked-name">{displayName}</h4>
            <p className="friends-blocked-username">@{blocked.userName}</p>
            {blocked.reason && (
              <p className="friends-blocked-reason">Lý do: {blocked.reason}</p>
            )}
          </div>

          {/* Menu */}
          <div className="friends-blocked-menu-wrapper">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="friends-blocked-btn-more"
            >
              <FaEllipsisV />
            </button>

            {showMenu && (
              <>
                <div
                  className="friends-menu-backdrop"
                  onClick={() => setShowMenu(false)}
                />
                <div className="friends-blocked-menu">
                  <button
                    onClick={() => {
                      onViewProfile(blocked._id);
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

        {/* Actions */}
        <div className="friends-blocked-actions">
          <button
            onClick={handleUnblockClick}
            className="friends-blocked-btn-unblock"
          >
            <FaUnlock />
            Bỏ chặn
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Bỏ chặn người dùng"
        message={`Bạn có chắc muốn bỏ chặn ${displayName}?`}
      />
    </>
  );
};

export default BlockedCard;
